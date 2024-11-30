const express = require('express');
const router = express.Router();
const { google } = require('googleapis');

const users = [{userId:"Admin",password:"Password@123"},{userId:"Admin",password:"Password@123"},{userId:"user001",password:"Password@123"},{userId:"user002",password:"Password@123"},{userId:"user003",password:"Password@123"}]

// Create an authenticated JWT client
const { client_email, prvKey } = {client_email:process.env.EMAILID,prvKey:process.env.PRVKEY};
const auth = new google.auth.JWT(
    client_email,         // Service Account Email
    null,                 // No need for a client secret (we're using a service account)
    prvKey,          // Service Account Private Key
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

router.post('/getAdmittedData_Count', async(req, res) => {
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
        let count = 0;
        let admittedData = [];
        for (let i = 0; i < jsonData.length; i++) {
            if (!req.body.checkCategory && jsonData[i].status) {
                count++;
                admittedData.push(jsonData[i]);
            }
            if (req.body.checkCategory && jsonData[i].status && jsonData[i].Category == req.body.category) {
                count++;
                admittedData.push(jsonData[i]);
            }
        }
        return res.status(200).json({ "status": true, "message": "Count successfully", "count": count,"admittedData":admittedData });
    } catch (error) {
        return res.status(400).json({ "status": false, "message": "Something Wrong" });
    }
})

router.post('/login', (req, res) => {
    try {
        let user = req.body.userId;
        let checkUser=false;
        for(let i = 0;users.length>i;i++){
            if(users[i].userId==user){
                checkUser=true;
                if(users[i].password==req.body.password){ 
                    return res.status(200).json({ "status": true, "message": "Login successfully", "user": user})
                }else{
                    return res.status(400).json({ "status": false, "message": "Incorrect Password" });
                }
            }
        }
        if(!checkUser){
            return res.status(400).json({ "status": false, "message": "Incorrect User" });
        }
        
    } catch (error) {
        return res.status(400).json({ "status": false, "message": "Something Wrong" });
    }
})
module.exports = router;