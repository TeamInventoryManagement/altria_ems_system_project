const express = require('express');
const cors = require('cors');
const { sql, poolPromise } = require('./db');
const path = require('path');
const port = process.env.PORT || 3000;  // Use the environment's PORT if available


const app = express();

// CORS options to allow requests from frontend running on port 5500
const corsOptions = {
    origin: 'https://altriaassestwebapp-e8gbbbdyc8ghhzdf.southeastasia-01.azurewebsites.net', // Allow only requests from this origin
    methods: 'GET,POST', // Allow only these methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allow only these headers
};

// Use CORS middleware with specified options
app.use(cors(corsOptions));
app.use(express.json());


// Serve static files from the React app in production
//if (process.env.NODE_ENV === 'production') {
//    app.use(express.static(path.join(__dirname, '../build')));
//}

// Basic route to check if the server is running
app.get('/check', (req, res) => {
  res.json('Server is running!');
});

// Function to calculate warranty expiry date
    function calculateWarrantyExpiryDate(purchaseDate, warentyMonths) {
        const date = new Date(purchaseDate);
        date.setMonth(date.getMonth() + parseInt(warentyMonths, 10));
        return date.toISOString().split('T')[0];
    }


// Route to get laptop details by Asset ID from LaptopDetails1 table
app.get('/api/laptop/:assetId', async (req, res) => {
    try {
        const pool = await poolPromise;
        const assetId = req.params.assetId;

        console.log(`Fetching laptop details for Asset ID: ${assetId}`);

        const query = `
            SELECT Device, AssetID, DeviceBrand, LaptopId, Model, SerialNumber,
                   Processor, InstalledRAM, SystemType, InvoiceNumber, ScreenSize, Resolution, PurchaseDate,
                   PurchaseAmount, PurchaseCompany, WarentyMonths, WarrentyExpieryDate, SysDate
            FROM LaptopDetails1
            WHERE AssetID = @AssetID
        `;

        const result = await pool.request()
            .input('AssetID', sql.VarChar(50), assetId)
            .query(query);

        if (result.recordset.length > 0) {
            console.log('Laptop details found:', result.recordset[0]);
            res.status(200).json(result.recordset[0]);
        } else {
            console.log('Laptop not found.');
            res.status(404).send({ message: 'Laptop not found' });
        }
    } catch (err) {
        console.error('Error fetching laptop details:', err.message);
        res.status(500).send({ error: 'Server error: ' + err.message });
    }
});


// Route to handle device addition (inserts into both LaptopDetails and DeviceDetails)
app.post('/api/LaptopDetails', async (req, res) => {
    try {
        const pool = await poolPromise;
        const {
            device, model, deviceBrand, assetId, processor, laptopId, installedRam,
            serialNumber, systemType, invoiceNumber, screenSize, purchasedDate, resolution, purchaseCompany,
            purchasedAmount, warentyMonths
        } = req.body;

        console.log('Received form data:', req.body);

        if (!device || !model || !deviceBrand || !laptopId || !serialNumber || !assetId || !warentyMonths || !purchasedDate || !purchaseCompany || !screenSize || !resolution) {
            return res.status(400).send({ error: 'All required fields must be provided' });
        }

        // Calculate the warranty expiry date
        const warrentyExpieryDate = calculateWarrantyExpiryDate(purchasedDate, warentyMonths);

        // Query to insert data into LaptopDetails table
        const laptopDetailsQuery = `
            INSERT INTO LaptopDetails1 (
                Device, Model, DeviceBrand, AssetID, Processor, LaptopId, InstalledRAM, SerialNumber,
                SystemType, InvoiceNumber, ScreenSize, PurchaseDate, Resolution, PurchaseAmount, PurchaseCompany,
                WarentyMonths, WarrentyExpieryDate, SysDate
            ) VALUES (
                @Device, @Model, @DeviceBrand, @AssetID, @Processor, @LaptopId, @InstalledRAM, @SerialNumber,
                @SystemType, @InvoiceNumber, @ScreenSize, @PurchaseDate, @Resolution, @PurchaseAmount, @PurchaseCompany,
                @WarentyMonths, @WarrentyExpieryDate, GETDATE()
            )
        `;


        // Query to insert data into DeviceDetails table
        const deviceDetailsQuery = `
            INSERT INTO DeviceDetails1 (
                Device, AssetID, DeviceBrand, DeviceID, Model, SerialNumber, SystemType, InvoiceNumber,
                PurchaseDate, PurchaseAmount, PurchaseCompany, WarentyMonths, WarrentyExpieryDate, CurrentStatus,
                ConditionStatus, SysDate
            ) VALUES (
                @Device, @AssetID, @DeviceBrand, @LaptopId, @Model, @SerialNumber, @SystemType, @InvoiceNumber,
                @PurchaseDate, @PurchaseAmount, @PurchaseCompany, @WarentyMonths, @WarrentyExpieryDate, 'In-Stock',
                'Brand-New', GETDATE()
            )
        `;
        // Execute the queries within a transaction
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Insert into LaptopDetails
            await transaction.request()
                .input('Device', sql.VarChar(50), device)
                .input('Model', sql.VarChar(50), model)
                .input('DeviceBrand', sql.VarChar(50), deviceBrand)
                .input('AssetID', sql.VarChar(50), assetId)
                .input('Processor', sql.VarChar(50), processor)
                .input('LaptopId', sql.VarChar(50), laptopId)
                .input('InstalledRAM', sql.VarChar(50), installedRam)
                .input('SerialNumber', sql.VarChar(50), serialNumber)
                .input('SystemType', sql.VarChar(50), systemType)
                .input('InvoiceNumber', sql.VarChar(50), invoiceNumber)
                .input('ScreenSize', sql.VarChar(50), screenSize)
                .input('PurchaseDate', sql.Date, purchasedDate)
                .input('Resolution', sql.VarChar(50), resolution)
                .input('PurchaseAmount', sql.Decimal(10, 2), purchasedAmount)
                .input('PurchaseCompany', sql.VarChar(50), purchaseCompany)
                .input('WarentyMonths', sql.Int, warentyMonths)
                .input('WarrentyExpieryDate', sql.Date, warrentyExpieryDate)
                .query(laptopDetailsQuery);

            console.log('Inserted into LaptopDetails table');

            // Insert into DeviceDetails
            await transaction.request()
                .input('Device', sql.VarChar(50), device)
                .input('Model', sql.VarChar(50), model)
                .input('DeviceBrand', sql.VarChar(50), deviceBrand)
                .input('AssetID', sql.VarChar(50), assetId)
                .input('LaptopId', sql.VarChar(50), laptopId)
                .input('SerialNumber', sql.VarChar(50), serialNumber)
                .input('SystemType', sql.VarChar(50), systemType)
                .input('InvoiceNumber', sql.VarChar(50), invoiceNumber)
                .input('PurchaseDate', sql.Date, purchasedDate)
                .input('PurchaseAmount', sql.Decimal(10, 2), purchasedAmount)
                .input('PurchaseCompany', sql.VarChar(50), purchaseCompany)
                .input('WarentyMonths', sql.Int, warentyMonths)
                .input('WarrentyExpieryDate', sql.Date, warrentyExpieryDate)
                .query(deviceDetailsQuery);

            console.log('Inserted into DeviceDetails table');

            await transaction.commit();

            res.status(201).send({ message: 'Device added successfully to both tables' });
        } catch (error) {
            console.error('Error during transaction, rolling back:', error.message);
            await transaction.rollback();
            res.status(500).send({ error: 'Error inserting data: ' + error.message });
        }
    } catch (err) {
        console.error('Error establishing connection or starting transaction:', err.message);
        res.status(500).send({ error: 'Server error: ' + err.message });
    }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
