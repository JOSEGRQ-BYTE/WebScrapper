const cron = require('node-cron');
const emailHandler = require('./job-emailer');
const scraper = require('./scraper');
const excelConverter = require('./excel-converter');


const scheduleJobEmailer = () =>
{
  const scheduler = cron.schedule("0 0 0 * * *", async () => 
  {
    console.log(`Task Started - ${(new Date).toLocaleTimeString()}`);
    console.log(`Scraping the Web - ${(new Date).toLocaleTimeString()}`);
    const cards = await scraper.scrapeTheWeb();


    console.log(`Generating Execel File - ${(new Date).toLocaleTimeString()}`);
    excelConverter.generateExcelSpreadSheetFromJSON(cards);

    console.log(`Send Email - ${(new Date).toLocaleTimeString()}`);
    emailHandler.sendEmail('Good Morning!');
    
    console.log(`Task Completed - ${(new Date).toLocaleTimeString()}`);
});

  scheduler.start();
};


module.exports = { scheduleJobEmailer };