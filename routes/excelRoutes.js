const express = require('express');
const router = express.Router();
const xlsx = require('xlsx');

const path = require('path');

// Define file path for Excel file
const filePath = path.join(__dirname, '../assets/barcodes.xlsx');

router.post('/saveBarcodeValue', (req, res) => {

    // Load the workbook or create a new one if the file doesn't exist
    let workbook;
    try {
        workbook = xlsx.readFile(filePath);
    } catch (error) {
        workbook = xlsx.utils.book_new();
    }

    // Access the first sheet or create a new one
    let sheet = workbook.Sheets['Sheet1'];
    if (!sheet) {
        sheet = xlsx.utils.aoa_to_sheet([['BarcodeText']]); // Add header row if creating new
        xlsx.utils.book_append_sheet(workbook, sheet, 'Sheet1');
    }

    // Add the new data
    const existingData = xlsx.utils.sheet_to_json(sheet);
    existingData.push({ BarcodeText: req.body.generatedBarcodeText });
    const updatedSheet = xlsx.utils.json_to_sheet(existingData);

    // Update the workbook with new data and save
    workbook.Sheets['Sheet1'] = updatedSheet;
    xlsx.writeFile(workbook, filePath);
    return res.json({ "stauts": true })
});

router.post('/getBarcodeValue', (req, res) => {
    workbook = xlsx.readFile(filePath);
    let sheet = workbook.Sheets['Sheet1'];
    const jsonData = xlsx.utils.sheet_to_json(sheet);
    let scannedBarcode = req.body.scannedBarcode
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

router.post('/validateBarcodeValue', (req, res) => {
    try {
        workbook = xlsx.readFile(filePath);
        let sheet = workbook.Sheets['Sheet1'];
        const jsonData = xlsx.utils.sheet_to_json(sheet);
        let scannedBarcode = req.body.scannedBarcode;
        let admit = req.body.admitted;
        jsonData.map((e, index) => {
            if (e.BarcodeText == scannedBarcode && admit) { jsonData[index]['status'] = admit };
        });
        const updatedSheet = xlsx.utils.json_to_sheet(jsonData);
        workbook.Sheets['Sheet1'] = updatedSheet;
        xlsx.writeFile(workbook, filePath);
        return res.status(200).json({ "status": true, "message": "Admitted successfully" });
    } catch (error) {
        return res.status(400).json({ "status": false, "message": "Not Admitted " });
    }

});

router.post('/getAdmittedData_Count', (req, res) => {
    try {
        workbook = xlsx.readFile(filePath);
        let sheet = workbook.Sheets['Sheet1'];
        const jsonData = xlsx.utils.sheet_to_json(sheet);
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
module.exports = router;