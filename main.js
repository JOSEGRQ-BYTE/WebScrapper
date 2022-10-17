const puppeteer = require('puppeteer');
const axios = require('axios');
require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const scheduler = require('./task-scheduler');
const scraper = require('./scraper');
const excelConverter = require('./excel-converter');

// Create our server
const app = express();
app.set("port", process.env.PORT || 3000);


// Schedule Tasks HERE
scheduler.scheduleJobEmailer();

app.listen(app.get("port"), () => {
    console.log("Express server listening on port " + app.get("port"));
});

