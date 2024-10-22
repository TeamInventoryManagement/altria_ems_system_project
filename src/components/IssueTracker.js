import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, Stack, TextField, Autocomplete, ButtonGroup, Typography, CardContent, Card, Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { toast, ToastContainer } from 'react-toastify';
import ColorChips from './Chips';

function DeviceSearch() {
  const [searchParams, setSearchParams] = useState({
    AssetID: '',
    Device: '',
    DeviceBrand: '',
    Model: '',
    ConditionStatus:'Condition-Status',
    CurrentStatus:'Current-Status',
  });
  const [inputValue, setInputValue] = useState(''); 
  const [results, setResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [assetIds, setAssetIds] = useState([]);
  const inputRef = useRef(null); 


  const fetchAssetIds = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/AssetIds`);
      if (!response.ok) {
        throw new Error(`Failed to fetch device details: ${response.statusText}`);
      }
      const data = await response.json();
      setAssetIds(data); // Assuming data is an array of asset IDs
    } catch (error) {
      console.error('Error fetching device details:', error);
    }
  };

  useEffect(() => {
    fetchAssetIds();
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputValue]); 

  const handleChange = async (event, newValue) => {
    const assetID = newValue || event.target.value;
    setSearchParams({ ...searchParams, AssetID: assetID });

    if (assetID) {
      try {
        const response = await axios.get(`http://localhost:3000/api/fetchDeviceDetailsByID/${assetID}`);
        if (response.data) {
          const { Device, DeviceBrand, Model, CurrentStatus, ConditionStatus } = response.data;
          setSearchParams(prevState => ({
            ...prevState,
            Device: Device || '',
            DeviceBrand: DeviceBrand || '',
            Model: Model || '',
            CurrentStatus:CurrentStatus || '',
            ConditionStatus:ConditionStatus || '',
          }));
        } else {
          setErrorMessage('No data found for this Asset ID');
        }
      } catch (error) {
        console.error('Error fetching device details:', error);
        setErrorMessage('Error fetching device details');
      }
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setResults([]);

    try {
      const response = await axios.get(`http://localhost:3000/api/searchIssuesByAssetID/${searchParams.AssetID}`);
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching issues:', error.response ? error.response.data : error.message);
      if (error.response && error.response.status === 404) {
        setErrorMessage('No records found for this Asset ID');
      } else {
        setErrorMessage('Error fetching data');
      }
    }
  };

  const columns = [
    { field: 'AssetID', headerName: 'Asset ID', width: 300 },
    { field: 'IssueID', headerName: 'IssueID', width: 300 },
    { field: 'Issue', headerName: 'Issue', width: 300 },
    { field: 'RepairStatus', headerName: 'Repair Status', width: 300 ,
      renderCell: (params) => {
        let statuslabel = 'default';
          if (params.value === 'Good-Condition' || params.value === 'Resolved') {
            statuslabel = 'success';
          } else if (params.value === 'Issue-Identified') {
            statuslabel = 'warning';
          }  else if (params.value === 'Send-to-Repair') {
            statuslabel = 'secondary';
          } else if (params.value === 'Disposal') {
            statuslabel = 'error';
          } 
          return (
              <Chip variant="outlined" size="small" color={statuslabel} label={params.value} />
          );
        }  
    },

  ];

  const handleResolve = (assetId) => {
    console.log(`Resolve clicked for Asset ID: ${assetId}`);
  };

  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const devicecomponents = [
    { component: 'RAM' },
    { component: 'Hard Disk' },
    { component: 'Web Camera' },
    { component: 'Display' },
    { component: 'Speaker' },
    { component: 'Touch Pad' },
    { component: 'Keyboard' },
  ];

  const IssueForm = () => {
    const [openIssue, setIssueOpen] = useState(false);
    const [openRepair, setRepairOpen] = useState(false);
    const [openReceived, setReceivedOpen] = useState(false);
  
    const handleOpen = (labels) => {
      if (labels === 'issue') {
        setIssueOpen(true);
      } else if (labels === 'send'){
        setRepairOpen(true);
      } else{
        setReceivedOpen(true);
      }
    };
  
    const handleClose = () => {
      setIssueOpen(false);
      setRepairOpen(false);
      setReceivedOpen(false);
    };
    const handleInsertIssue = async () => {
      try {
          // Prepare data to be sent to the API
          const issueData = {
              AssetID: searchParams.AssetID,
              Issue: FormData.Issue,
              IssueNote: FormData.IssueNote,
              EffectComponents: FormData.EffectComponents.join(', ')
          };
  
          const response = await fetch('http://localhost:3000/api/insertIssue', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(issueData),
          });
  
          const result = await response.json(); // Parse JSON response
  
          if (response.ok) {
              toast.success("Issue logged successfully", {position: "top-center"});
              handleClose(); 
          } else {
              toast.error(result.error, {position: "top-center"});
          }
      } catch (error) {
          toast.error('Error during issue logging:', {position: "top-center"});
      }
  };


  const handlestr = async () => {
    try {
        // Prepare data to be sent to the API
        const issueData = {
            AssetID: searchParams.AssetID,
            Issue: FormData.Issue,
            Vendor: FormData.Vendor,
            VendorAddress: FormData.VendorAddress,
            IssueDateToVendor: FormData.IssueDateToVendor,
            IssueNote: FormData.IssueNote,
        };

        const response = await fetch('http://localhost:3000/api/str', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(issueData),
        });

        const result = await response.json(); 

        if (response.ok) {
            toast.success("Sent to Repair successful!", {position: "top-center"});
            handleClose(); 
        } else {
            toast.error("Sent to Repair Failed!", {position: "top-center"});
        }
    } catch (error) {
      toast.error("Sent to Repair Failed!", {position: "top-center"});
    }
};




const handleRecived = async () => {
  try {
      // Prepare data to be sent to the API
      const issueData = {
          AssetID: searchParams.AssetID,
          ReceivedDate: FormData.ReceivedDate,
          RepairInvoiceNumber: FormData.RepairInvoiceNumber,
          RepairCost: FormData.RepairCost,
          Invoice: FormData.Invoice,
          FixedComponents: FormData.FixedComponents.join(', '),
          ReplacedComponents: FormData.ReplacedComponents.join(', '),
          RepairNote: FormData.RepairNote
      };

      const response = await fetch('http://localhost:3000/api/Recived', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(issueData),
      });

      const result = await response.json(); // Parse JSON response

      if (response.ok) {
         toast.success("Received successfully", {position: "top-center"});
          handleClose(); // Close the dialog after success
      } else {
          alert('Error: ' + result.error);
      }
  } catch (error) {
      console.error('Error during Recieving:', error);
      alert('An error occurred: ' + error.message);
  }
};


  const [FormData, setFormData] = useState({
    AssetID: '',
    Issue: '',
    IssueNote: '',
    EffectComponents: [],
    Vendor: '',
    VendorAddress:'',
    IssueDateToVendor: '',
    ReceivedDate: '',
    RepairInvoiceNumber: '',
    RepairCost: '',
    FixedComponents: [],
    ReplacedComponents: [],
    RepairNote: '',
  });

    const handleUpdate = async (assetId) => {
      try {
        const response = await axios.put(`http://localhost:3000/api/resolveIssue/${assetId}`);
        if (response.status === 200) {
          toast.success("Issue resolved successfully", {position: "top-center"});
          
          setResults((prevResults) => prevResults.filter((item) => item.AssetID !== assetId));
        } else {
          toast.error("Failed to resolve the issue", {position: "top-center"});
        }
      } catch (error) {
        toast.error("Error resolving the issue", {position: "top-center"});
      }
    };
    

  
    return (
      <div style={{ width: '100%' }}>
        <Stack spacing={2} sx={{ width: 250 }}>
          <Autocomplete
            freeSolo
            id="free-solo-2-demo"
            disableClearable
            options={assetIds.map((option) => option.AssetID)} // Mapping fetched asset IDs
            inputValue={inputValue} // Separate controlled input value
            onInputChange={(event, newInputValue) => setInputValue(newInputValue)} // Set the typed input value
            onChange={(event, newValue) => handleChange(event, newValue)} // Handle selection
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Asset Id"
                variant="standard"
                inputRef={inputRef}
                slotProps={{
                  input: {
                    ...params.InputProps,
                    type: 'search',
                  },
                }}
              />
            )}
          />         
        </Stack>    
        <Card variant="outlined" style={{ marginTop: '10px', marginBottom: '10px' }} sx={{ width: '100%' }}>
          <CardContent>
            <Typography component="h2" variant="subtitle2" gutterBottom value={FormData.AssetID}>
              Asset ID : {searchParams.AssetID}
            </Typography>
            <Typography component="h2" variant="subtitle2" gutterBottom>
              Device : {searchParams.Device}
            </Typography>
            <Typography component="h2" variant="subtitle2" gutterBottom>
              Device Brand : {searchParams.DeviceBrand}
            </Typography>
            <Typography component="h2" variant="subtitle2" gutterBottom>
              Model : {searchParams.Model}
            </Typography>
          <div className="status-group">
          <div>
            <ColorChips label={searchParams.ConditionStatus} />
          </div>
          <div>
          <ColorChips label={searchParams.CurrentStatus} />
          </div>
            <ButtonGroup variant="outlined" aria-label="Loading button group"  style={{ marginTop: '-5px', marginLeft:'150px' }}>
              <Button onClick={handleSearch} size="large">
                Search for Issues
              </Button>              
              <Button onClick={() => handleOpen('issue')} size="large">
                Log Issue
              </Button>
              <Button onClick={() => handleOpen('send')} size="large">
                Send to Repair
              </Button>
              <Button onClick={() => handleOpen('received')} size="large">
                Received
              </Button>
              <Button onClick={() => handleUpdate(searchParams.AssetID)} size="large">
              Resolved
              </Button>
            </ButtonGroup> 
            </div>  
          </CardContent>
        </Card>
  
        {errorMessage && <p>{errorMessage}</p>}
  
        {results.length > 0 && (
          <div style={{ width: '100%' }}>
            <DataGrid
              rows={results}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              getRowId={(row) => row.IssueID}
            />
          </div>
        )}
        <Dialog open={openIssue} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle>Log Issue
            <IconButton onClick={handleClose} style={{ float: 'right' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} margin={1}>
              <label>Device Id: {searchParams.AssetID}</label>
              <TextField
            variant="outlined"
            label="Issue"
            multiline
            rows={2}
            value={FormData.Issue}
            onChange={(e) => setFormData({ ...FormData, Issue: e.target.value })}
          />
          <TextField
            variant="outlined"
            label="IssueNote"
            multiline
            rows={4}
            value={FormData.IssueNote}
            onChange={(e) => setFormData({ ...FormData, IssueNote: e.target.value })}
          />
           <Autocomplete
              multiple
              id="checkboxes-issues"
              options={devicecomponents}
              disableCloseOnSelect
              getOptionLabel={(option) => option.component}
              onChange={(event, newValue) => {
                setFormData({...FormData, EffectComponents: newValue.map((item) => item.component)});
              }}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option.component}
                </li>
              )}
              style={{ width: '100%' }}
              renderInput={(params) => (
                <TextField {...params} label="Effect Components" placeholder="Components affected" />
              )}
              /> 
              <Button color="primary" variant="contained" onClick={handleInsertIssue}>Log Issue</Button>
           
            </Stack>
          </DialogContent>
        </Dialog>
        <Dialog open={openRepair} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle>Send to Repair
            <IconButton onClick={handleClose} style={{ float: 'right' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} margin={1}>
              <label>Device Id: {searchParams.AssetID}</label>
              <TextField
                variant="outlined"
                label="Vendor"
                value={FormData.Vendor}
                onChange={(e) => setFormData({ ...FormData, Vendor: e.target.value })}
            />

            <TextField
                variant="outlined"
                type='date'
                label="IssueDateToVendor"
                value={FormData.IssueDateToVendor}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setFormData({ ...FormData, IssueDateToVendor: e.target.value })}
            />

            <TextField
                variant="outlined"
                label="VendorAddress"
                multiline
                rows={4}
                value={FormData.VendorAddress}
                onChange={(e) => setFormData({ ...FormData, VendorAddress: e.target.value })}
            />
          <TextField
              type="file"
              label="Invoice"
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setFormData({ ...FormData, Invoice: e.target.files[0] })}
          />
             
              <Button color="primary" variant="contained" onClick={handlestr}>Send To Repair</Button>
            </Stack>
          </DialogContent>
        </Dialog>
        <Dialog open={openReceived} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle> Received after Repair
            <IconButton onClick={handleClose} style={{ float: 'right' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} margin={1}>
              <label>Device Id: {searchParams.AssetID}</label>
              <TextField
                variant="outlined"
                label="RepairInvoiceNumber"
                value={FormData.RepairInvoiceNumber}
                onChange={(e) => setFormData({ ...FormData, RepairInvoiceNumber: e.target.value })}
            />


            <TextField
                variant="outlined"
                type='date'
                label="ReceivedDate"
                value={FormData.ReceivedDate}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setFormData({ ...FormData, ReceivedDate: e.target.value  }) }
            />

            <TextField
                variant="outlined"
                label="RepairCost"
                value={FormData.RepairCost}
                onChange={(e) => setFormData({ ...FormData, RepairCost: e.target.value })}
            />
                        <Autocomplete
              multiple
              id="FixedComponents"
              options={devicecomponents}
              disableCloseOnSelect
              getOptionLabel={(option) => option.component}
              onChange={(event, newValue) => {
                setFormData({...FormData, FixedComponents: newValue.map((item) => item.component)});
              }}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option.component}
                </li>
              )}
              style={{ width: '100%' }}
              renderInput={(params) => (
                <TextField {...params} label="Fixed Components" placeholder="Fixed affected" />
              )}
            />

            <Autocomplete
              multiple
              id="ReplacedComponents"
              options={devicecomponents}
              disableCloseOnSelect
              getOptionLabel={(option) => option.component}
              onChange={(event, newValue) => {
                setFormData({...FormData, ReplacedComponents: newValue.map((item) => item.component)});
              }}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option.component}
                </li>
              )}
              style={{ width: '100%' }}
              renderInput={(params) => (
                <TextField {...params} label="Replaced Components" placeholder="Replaced affected" />
              )}
            />

          <TextField
            variant="outlined"
            label="RepairNote"
            multiline
            rows={4}
            value={FormData.RepairNote}
            onChange={(e) => setFormData({ ...FormData, RepairNote: e.target.value })}
          />
              
              <TextField
              type="file"
              label="Invoice"
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setFormData({ ...FormData, Invoice: e.target.files[0] })}
            />
              <Button color="primary" variant="contained" onClick={handleRecived}>Recieved</Button>
            </Stack>
          </DialogContent>
        </Dialog>
        <ToastContainer/>
      </div>
    );
  };

  return <IssueForm />;
}

export default DeviceSearch;