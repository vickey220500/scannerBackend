const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const path = require('path');
const credentials = {
    "type": "service_account",
    "project_id": "peppy-glyph-443015-r1",
    "private_key_id": "b4e4ef4200456e41e74a4c8074b9e7d69f73debc",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDciNIdA2p8ZCf4\ntBo70SWGBwknI+7Jxue3yiXmSgKXvdVdD8eYuXqPQBm3PPmXVKhXM9O4teq8fr1S\ncxUkfNE4Ym93XXFRNIiRW1GXf3jJbyjYYX5XJtzRY7ZLpTAXuYphWIMH4nIXZex/\nn2fl68NcKL6+XNbrGlYdVQa8lDbec5VZcMeEc00EkM1V4ne8oXNH2Q+xGESx88Cm\nZbw/U4ZtXa1iRO0zadHpxkq8iSWPObTUr2NYdFSQ+wwcZnn4SiupdgG2a+aR0gSZ\ncnm7NKpd57ZSqaP2Jg2n8m722BbqqXwqGAxgXtxFfMvAPJSjL25k3TBt9EAjqbdz\nBYFYfldFAgMBAAECggEAJJ0AiTmWdcVpD3TTQCgWezxyzBE+pThFIzHH/gY+jPPC\n1xr2D8iHbP3+5vmUFIhFFIkxtuJY8Od3xhb+JRsl3x8Uk3QriohWvg8zqhvLMWIn\nnVj+UTjOA2NzEfcAV4gBzeyUgHwbZgARdhTAep8cRZIsLM2cDtdGAcOqhSd0PpUS\nBawmfEJa+wHugBy42z5Qh18ZfncIeoUE+0pL3KXVjAgQN8pbyODVn3IQRzLw9Atv\nHtzJFKP4XLFQ0NDEt4YZ+3URZfeXOWXuQDyMS9nfNcNVw78PwedOtjtg55TScsz0\nH0CLppDKg9GfFQ+wYvpp/5c1YqjPf73s+rs0Y420EQKBgQDy6P3uOqMt8rl/pTu1\nTG+7N93Lg6hMrYuu4k0fwV+4pZrllz4vd1/9uqdXX7CW2HNqPmk9Tirri2j6gGJJ\nDAbJM7DuFifbsoXx6HvAl5qwFGM4elcyld6fR8/YyzMDKAKVFARXBOtkWc+4JcCm\nI8rfV1SmGZ/4cTLpcd2CJIYITQKBgQDoayaT9tgUfzbsI/tnR09Jpr9+6hlBqN6d\n6r8kKF0KnbCKRRntPpId3kLrkZFYbDRFSUGY4jqESYoswg9IsP/nvCFPpV8nhKyV\nLOptyr4mq5IgJz16oqOfy71jVqY3tXFvtd2efC4p8fR2v17B+mRP8yQ3UxbhELho\ngukgWS2G2QKBgQCPtO+lpOMtJ9A+iA6O762aYS7CXB2RX4qn6BIgm1J59t9wvM15\nX3JWtbqSonXiiCOf01SHhFs4Br4QlSuQc6EAH6io8kqaWz+LIjM0eXx2d1lL7HTx\n5GBUczOv2mdPkrgUYkc/BBYOxGNzWkJjCAHZp9zYd4iAftfT7B1UBS+WcQKBgQCM\nRe9YqkirxkPdrbHUGYPPDebRsHRh3ovNf5qxNfNBrv6X1TDasUL65+Q3zPmOBnBd\nyOLgZNmwcboFXXJgCwPIVxE7wrF1ZmvK9PrgHNc6+54L7eL7GyHqFctOI0Pap5W5\nOGhzeLtb8X38FXAZXwggAL1A7tMGL1M9MJWHQotpsQKBgFYkqpIjXY01//Au/otZ\nsqjwh//2eHSF2niAooWc5KoSb0wZPoJg7uvFNj/mYpy2XHOtk54g+mWXJKnrY0zd\nfXBg8zqGSYPHZeqYaYNVef84FZynmfelcbR9xIBe3rG8MnP1UPxbrz+6DzNZY08W\nnaozQHUcjfiQP5IULIIqe2hT\n-----END PRIVATE KEY-----\n",
    "client_email": "access-google-sheets-api@peppy-glyph-443015-r1.iam.gserviceaccount.com",
    "client_id": "106331052335472202105",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/access-google-sheets-api%40peppy-glyph-443015-r1.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  }

// const credentials = require(path.join(__dirname, '../config/peppy-glyph-443015-r1-b4e4ef420045.json')); // Path to your Service Account JSON file

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