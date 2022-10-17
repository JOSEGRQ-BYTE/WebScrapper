const XLSX = require('xlsx')

const generateExcelSpreadSheetFromJSON = (cards) =>
{
    let workBook = XLSX.utils.book_new();
    let workSheet = XLSX.utils.json_to_sheet(cards);
    workSheet["A"] = [ { wch: 50 } ];
    workSheet["B"] = [ { wch: 200 } ];

    workSheet["C"] = [ { wch: 100 } ];

    XLSX.utils.book_append_sheet(workBook, workSheet, `Current Job Posts`);
    const fileName = `JobReport.xlsx`;
    XLSX.writeFile(workBook, fileName);
}

module.exports = {
    generateExcelSpreadSheetFromJSON,
}