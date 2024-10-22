import React, { useState } from 'react';
import './StyleSheet.css';
import searchIcon from './images/Search_icon.png';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LaptopDetails = () => {
    const [formData, setFormData] = useState({
        device: 'Laptop',
        deviceBrand: '',
        model: '',
        assetId: '',
        processor: '',
        laptopId: '',
        installedRam: '',
        serialNumber: '',
        systemType: '',
        invoiceNumber: '',
        screenSize: '',
        purchasedDate: '',
        resolution: '',
        purchasedAmount: '',
        warentyMonths: '',
        purchaseCompany: ''
    });

    const [searchAssetId, setSearchAssetId] = useState('');
    const [assetIdSearched, setAssetIdSearched] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSearchChange = (e) => {
        setSearchAssetId(e.target.value);
        setAssetIdSearched(false);
        if (e.target.value === '') {
            resetFormData();
            // resetBulkFormData(); chec this point
        }
    };

    const handleSearchClick = async () => {
        if (!searchAssetId) {
            toast.info("Please enter an Asset ID to search", {position: "top-center"});
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/laptop/${searchAssetId}`);
            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("text/html")) {
                    throw new Error('Received HTML instead of JSON');
                }
                const errorData = await response.json();
                throw new Error(errorData.error || 'Unknown error occurred');
            }
            const data = await response.json();
            setFormData({
                ...formData,
                device: data.Device || '',
                deviceBrand: data.DeviceBrand || '',
                model: data.Model || '',
                assetId: data.AssetID || '',
                processor: data.Processor || '',
                laptopId: data.LaptopId || '',
                installedRam: data.InstalledRAM || '',
                serialNumber: data.SerialNumber || '',
                systemType: data.SystemType || '',
                invoiceNumber: data.InvoiceNumber || '',
                screenSize: data.ScreenSize || '',
                purchasedDate: data.PurchaseDate ? data.PurchaseDate.split('T')[0] : '',
                resolution: data.Resolution || '',
                purchasedAmount: data.PurchaseAmount || '',
                warentyMonths: data.WarentyMonths || '',
                purchaseCompany: data.PurchaseCompany || '',
            });
            setAssetIdSearched(true);
        } catch (error) {
            toast.error("An error occurred while fetching the device details", {position: "top-center"});        }
    };

    const resetFormData = () => {
        setFormData({
            device: 'Laptop',
            deviceBrand: '',
            model: '',
            assetId: '',
            processor: '',
            laptopId: '',
            installedRam: '',
            serialNumber: '',
            systemType: '',
            invoiceNumber: '',
            screenSize: '',
            purchasedDate: '',
            resolution: '',
            purchasedAmount: '',
            warentyMonths: '',
            purchaseCompany: ''
        });
        setSearchAssetId('');
        setAssetIdSearched(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log('check :', formData);
            const response = await fetch('http://localhost:3000/api/LaptopDetails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (response.ok) {
                toast.success("Device Added successfully", {position: "top-center"});
                resetFormData();
            } else {
                toast.error(data.error, {position: "top-center"});
            }
        } catch (error) {
            toast.error('An error occurred. Please try again', {position: "top-center"});
        }
    };


    const resetBulkFormData = (excludeFields = []) => {
        const defaultData = {
            device: 'Laptop',
            deviceBrand: formData.deviceBrand,
            model: formData.model,
            assetId: '',
            processor: formData.processor,
            laptopId: '',
            installedRam: formData.installedRam,
            serialNumber: '', // Keep the serial number unchanged
            systemType: formData.systemType,
            invoiceNumber: formData.invoiceNumber,
            screenSize: formData.screenSize,
            purchasedDate: formData.purchasedDate,
            resolution: formData.resolution,
            purchasedAmount: formData.purchasedAmount,
            warentyMonths: formData.warentyMonths,
            purchaseCompany: formData.purchaseCompany
        };
    
        // Only reset fields that are not in the excludeFields array
        const newFormData = { ...formData };
        for (const key in defaultData) {
            if (!excludeFields.includes(key)) {
                newFormData[key] = defaultData[key];
            }
        }
        setFormData(newFormData);
        setSearchAssetId('');
        setAssetIdSearched(false);
    };
    
    const handleBulkData = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/api/LaptopDetails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (response.ok) {
                toast.success("Device Added successfully", {position: "top-center"});
                resetBulkFormData(['serialNumber']); 
            } else {
                toast.error(data.error, {position: "top-center"});
            }
        } catch (error) {
            toast.error('An error occurred. Please try again', {position: "top-center"});
        }
    };
    
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('https://altriaassestwebapp-e8gbbbdyc8ghhzdf.southeastasia-01.azurewebsites.net/api/LaptopUpdate', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();

             const toastId = toast.loading("Checking Info...", { position: "top-center" });
    
             setTimeout(() => {
                 if (response.ok) {
                     toast.update(toastId, {
                         render: "Device Updated successfully", 
                         type: "success", 
                         isLoading: false, 
                         autoClose: 5000, 
                         closeOnClick: true
                     });
                     resetFormData();
                 } else {
                     toast.update(toastId, {
                         render: data.error || "Failed to update device", 
                         type: "error", 
                         isLoading: false, 
                         autoClose: 5000,
                         closeOnClick: true
                     });
                 }
             }, 1000); 
     
        } catch (error) {
            toast.error('An error occurred. Please try again', {position: "top-center"});
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('https://altriaassestwebapp-e8gbbbdyc8ghhzdf.southeastasia-01.azurewebsites.net/api/LaptopDelete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assetId: formData.assetId })
            });
            const data = await response.json();
            if (response.ok) {
                toast.success("Device Deleted successfully", {position: "top-center"});
                resetFormData();
            } else {
                toast.error(data.error, {position: "top-center"});
            }
        } catch (error) {
            toast.error('An error occurred. Please try again', {position: "top-center"});
        }
    };



    return (
        <div>
        
            <div className="form-container">
                <div className="header">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search by Asset ID"
                            className="search-bar"
                            value={searchAssetId}
                            onChange={handleSearchChange}
                        />
                        <button type="button" className="search-button" onClick={handleSearchClick}>
                            <img src={searchIcon} alt="Search" style={{ width: '20px', height: '20px' }} />
                        </button>
                </div>
                <ButtonGroup variant="outlined" aria-label="Loading button group">
                    <Button onClick={handleSubmit}>+ Add</Button>
                    <Button onClick={handleBulkData}>++ Add Bulk</Button>
                    <Button onClick={handleUpdate}>! Update</Button>
                    <Button onClick={handleDelete}>- Delete</Button>
                    <LoadingButton loading loadingPosition="start" startIcon={<SaveIcon />}>Save</LoadingButton>
                </ButtonGroup>
            </div>

            <h2>Device Specifications</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label>Asset ID</label>
                        <input type="text" name="assetId" placeholder="Asset ID"
                            onChange={handleChange} value={formData.assetId} disabled={assetIdSearched} />
                    </div>
                </div>
               
                <div className="form-row">
                    <div className="form-group">
                        <label>Brand</label>
                        <input type="text" name="deviceBrand" placeholder="Device Brand" onChange={handleChange} value={formData.deviceBrand} />
                    </div>
                    <div className="form-group">
                        <label>Model</label>
                        <input type="text" name="model" placeholder="Model" onChange={handleChange} value={formData.model} />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Screen Size</label>
                        <input type="text" name="screenSize" placeholder="Screen Size" onChange={handleChange} value={formData.screenSize} />
                    </div>
                    <div className="form-group">
                        <label>Resolution</label>
                        <input type="text" name="resolution" placeholder="Resolution" onChange={handleChange} value={formData.resolution} />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Processor</label>
                        <input type="text" name="processor" placeholder="Processor" onChange={handleChange} value={formData.processor} />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Laptop ID (Device ID)</label>
                        <input type="text" name="laptopId" placeholder="Laptop ID" onChange={handleChange} value={formData.laptopId} />
                    </div>
                    <div className="form-group">
                        <label>Installed RAM</label>
                        <input type="text" name="installedRam" placeholder="Installed RAM" onChange={handleChange} value={formData.installedRam} />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Serial Number</label>
                        <input type="text" name="serialNumber" placeholder="Serial Number" onChange={handleChange} value={formData.serialNumber} />
                    </div>
                    <div className="form-group">
                        <label>System type (OS)</label>
                        <input type="text" name="systemType" placeholder="System type (OS)" onChange={handleChange} value={formData.systemType} />
                    </div>
                </div>

                <h2>Billing Details</h2>

                <div className="form-row">
                    <div className="form-group">
                        <label>Invoice Number</label>
                        <input type="text" name="invoiceNumber" placeholder="Invoice Number" onChange={handleChange} value={formData.invoiceNumber} />
                    </div>

                    <div className="form-group">
                        <label>Purchased Date</label>
                        <input type="date" name="purchasedDate" onChange={handleChange} value={formData.purchasedDate} />
                    </div>
                </div>



                <div className="form-row">
                    <div className="form-group">
                        <label>Purchased Amount</label>
                        <input type="text" name="purchasedAmount" placeholder="Purchased Amount" onChange={handleChange} value={formData.purchasedAmount} />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Purchased Compnay</label>
                        <input type="text" name="purchaseCompany" placeholder="Purchased Compnay" className="full-width" onChange={handleChange} value={formData.purchaseCompany} />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Warranty Period (Months)</label>
                        <input type="number" name="warentyMonths" placeholder="Warranty Months" onChange={handleChange} value={formData.warentyMonths} />
                    </div>
                </div>
                
                <ToastContainer />

            </form>
        </div>
    </div>
    );
};

export default LaptopDetails;