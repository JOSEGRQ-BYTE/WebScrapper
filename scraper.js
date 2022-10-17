const puppeteer = require('puppeteer');
const axios = require('axios');
require('dotenv').config();

const scrapeTheWeb = async () =>
{
    const Fortune500URL = 'https://content.fortune.com/wp-json/irving/v1/data/franchise-search-results?list_id=2814606&token=Zm9ydHVuZTpCcHNyZmtNZCN5SndjWkkhNHFqMndEOTM='; //'https://fortune.com/fortune500/2022/search/';

    const html = await axios.get(Fortune500URL);
    const companies = html.data[1]['items']; 

    const fortune500 = companies.filter(company => 
    {
        const rank = company.fields.find(field => field.key === 'rank');
        if(!!rank)
        {
            if(rank.value <= 500)
                return true;
            else
                return false;
        }
        return false;

    }).map(company => 
    {
        let companyInfo = 
        {
            name: '',
            rank: '',
            link: '',
            sector: '',
        }

        companyInfo.link = company.permalink;
        company.fields.forEach(company => 
        {
            if(company.key in companyInfo)
                companyInfo[company.key] = company.value;
        })

        companyInfo.rank = parseInt(companyInfo.rank);
        return companyInfo;

    });

    fortune500.sort((a, b) => (a.rank > b.rank) ? 1 : -1)

    const interestedSectors = ['Technology', 'Retailing', 'Telecommunications', 'Media', 'Apparel'];
    const interestedCompanies = fortune500.filter(company => interestedSectors.includes(company.sector));
    const CompanyNames = interestedCompanies.map(company => company.name.toLowerCase());

    
    let BaseIndeedURL = 'https://www.indeed.com/jobs?q=front+end+web+developer&l=Denver%2C+CO&start=';
    let currentStartIndex = 0;
    let nextStartIndex = 0;

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 900 });
    page.setDefaultNavigationTimeout(0);
    await page.goto(BaseIndeedURL + currentStartIndex, { waitUntil: "networkidle2" });  

    let content = [];
    let allCards = [];

    let previousJobCount = 0;
    let currentJobCount = 0;

    do 
    {
        previousJobCount = currentJobCount;
        if(nextStartIndex > 0)
        {
            await page.goto(BaseIndeedURL + nextStartIndex, { waitUntil: "networkidle2" });
        }

        //await page.screenshot({path: `page-${nextStartIndex}.png`, fullPage: true});
        
        // Scrape current page
        content = await page.evaluate(() => 
        {
            // Get Cards & Generate Cards
            let cards = [...document?.querySelectorAll('td.resultContent')];
            cards = cards.map(card => {
                return  {
                    key: card.querySelector('h2.jobTitle > a').dataset.jk,
                    link: card.querySelector('h2.jobTitle > a').href,
                    title: card.querySelector('h2.jobTitle').textContent.trim(),
                    company: card.querySelector('span.companyName').textContent.trim(),
                    rating: card.querySelector('span.ratingNumber')?.textContent.trim() || null,
                    location: card.querySelector('div.companyLocation')?.textContent.trim() || null,
                    salary: card.querySelector('div.salary-snippet-container > div.attribute_snippet')?.textContent.trim()
                }
            });
    
            // Get Pagination and Get Next Page
            let nav = document.querySelectorAll('nav[role="navigation"]')[0];
            let links = [...nav.querySelectorAll('a')];

            let nextPageLink = links[links.length - 1];
            let tokens = nextPageLink.href.split('=');
            nextLink = nextPageLink;
            moreContent = !!document.querySelector('a.jobsearch-JapanPagination--button')

            return {
                cards: cards,
                nextIndex: parseInt(tokens[tokens.length - 1]),
            }
        });

        let currentJobs = [];
        currentJobs = allCards.map(j => j.key);
        allCards = [...allCards, ...content.cards.filter(c => !currentJobs.includes(c.key))];
        nextStartIndex = content.nextIndex;

        //console.log('Loading...');
        currentJobCount = allCards.length;

    }
    //while(false)
    while(currentJobCount != previousJobCount)

    const possibleOpportunities = allCards.filter(job => {

        // Perfect Match
        if(CompanyNames.includes(job.company.toLowerCase()))
            return true;
        
        // Check if any keywords found in the Company posted are in the top companies
        const currentJobCompanyKeywords = job.company.split(' ');
        let matchFound = false;
        currentJobCompanyKeywords.every((keyword, index) => {

            CompanyNames.every(topCompany => {

                if(topCompany.split(' ').includes(keyword.toLowerCase()))
                {
                    matchFound = true;
                    return false;
                }
                else {
                    matchFound = false;
                    return true;
                }

            });

            if(matchFound)
                return false;
            else
                return true;

        });
        // If match found return treu otherwise continue looking
        if(matchFound)
            return true;


        // Split top company name by keyword and look for similarities in posted companies
        matchFound = false;
        CompanyNames.every(company => 
        {
            const companyKeywords = company.split(' ');
            companyKeywords.every(keyword => {
                if(job.company.includes(keyword))
                {
                    matchFound = true;
                    return false;
                }
                else {
                    matchFound = false;
                    return true;
                }
            });

            if(matchFound)
                return false;
            else
                return true;

        });
        if(matchFound)
            return true;

        // Return false if no Match
        return false;

    });



    // turn findings into excel file
    await browser.close();


    return possibleOpportunities || [];

};

module.exports = {
    scrapeTheWeb,
}