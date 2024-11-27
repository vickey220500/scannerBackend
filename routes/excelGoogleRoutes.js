const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const path = require('path');

const credentials = require(path.join(__dirname, '../config/peppy-glyph-443015-r1-b4e4ef420045.json')); // Path to your Service Account JSON file

// Create an authenticated JWT client
const { client_email, private_key } = credentials;
const auth = new google.auth.JWT(
    client_email,         // Service Account Email
    null,                 // No need for a client secret (we're using a service account)
    private_key,          // Service Account Private Key
    ['https://www.googleapis.com/auth/spreadsheets'], // Scopes needed for Google Sheets API
    null                  // Audience (optional)
);

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = '1MIDx73xetKEvJJ9d8H55K1s2Lq0w4uQGOO-_ofp9JK0';
const range = 'Sheet1';


router.post('/getBarcodeValue', async (req, res) => {
    const result = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });
    const rows = result.data.values;
    // First row is the header (column names)
    const headers = rows[0];

    // Convert the rest of the rows into an array of objects
    const jsonData = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = row[index]; // If there is no value, set it as null
        });
        return obj;
    });
    console.log(jsonData, 'jsonData');
    let scannedBarcode = req.body.scannedBarcode;
    let barcodeData = jsonData.filter((e) => {
        return e.BarcodeText == scannedBarcode
    });
    if (barcodeData.length > 0 && barcodeData.length == 1 && !barcodeData[0].status) {
        return res.status(200).json({ "status": true, "message": "Matched successfully", "barcodeData": barcodeData[0] });
    }
    else if (barcodeData.length > 0 && barcodeData.length == 1 && barcodeData[0].status) {
        return res.status(200).json({ "status": false, "message": "Already Admitted", "barcodeData": barcodeData[0] });
    } else {
        return res.status(400).json({ "status": false, "message": "Data not matched" });
    }
});
router.post('/validateBarcodeValue', async (req, res) => {
    try {
        const result = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });
        const rows = result.data.values;
        // First row is the header (column names)
        const headers = rows[0];

        // Convert the rest of the rows into an array of objects
        const jsonData = rows.slice(1).map(row => {
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = row[index]; // If there is no value, set it as null
            });
            return obj;
        });
        let scannedBarcode = req.body.scannedBarcode;
        let admit = req.body.admitted;
        jsonData.map((e, index) => {
            if (e.BarcodeText == scannedBarcode && admit) { jsonData[index]['status'] = admit };
        });
        let values = jsonData.map(row => [
            row.BarcodeText,
            row.Category,
            row['Ticket no'],
            row['Seat No'],
            row.status || null // Ensure empty status fields are handled
        ]);
        values.unshift(headers);     
        const response = await sheets.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption: 'RAW', // Use 'RAW' for unformatted data
            resource: {
              values: values, // The 2D array of new data
            },
          });   
        // console.log(response, 'response');
        if(response.status===200){
            return res.status(200).json({ "status": true, "message": "Admitted successfully" });
        }
        return res.status(400).json({ "status": true, "message": "Not Admitted" });
    } catch (error) {
        return res.status(400).json({ "status": false, "message": error });
    }

});
module.exports = router;