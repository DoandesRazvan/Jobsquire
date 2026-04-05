// using puppeteer extra with the stealth plugin due to the fact that jooble has bot detection
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const joobleScraper = async (role, locations, experience) => {
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        protocolTimeout: "12000"
    });
    const page = await browser.newPage();

    // creating the URL based on the user search criteria
    async function createUrl() {
        let rolePart = "ukw=" + role.split(" ").join("%20");
        let locationsPart = "rgns=" + locations.split(" ").join("-");

        return "https://ro.jooble.org/SearchResult?" + locationsPart + "&" + rolePart;
    }
    
    const url = await createUrl();

    console.log(url);

    await page.goto(url);

    // Waiting for the cookie consent popup to appear
    await page.waitForSelector("#cookiescript_reject");

    // Clicking the "Accept" button to accept cookies and dismiss specific site pop-up.
    await page.locator("#cookiescript_reject").click();

    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            let distance = 150; // Step size
            let timer = setInterval(() => {
                let scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if(totalHeight >= scrollHeight){
                    let moreButton = document.querySelector(".load_more_jobs_button");

                    if (moreButton) {
                        moreButton.click();
                    } else {
                        clearInterval(timer);
                        resolve();
                    }
                }
            }, 100); // Delay in ms
        });
    });

    const jobsList = await page.evaluate(() => {
        let jobs = document.querySelectorAll(".job_card_link");
        let currentUrl = window.location.href;
        let company = "Jooble";

        return Array.from(jobs).map(child => {
            let title = child?.innerText || null;
            let link = child?.href || null;

            return {title, link, currentUrl, company};
        });
    });

    return jobsList;
};

export {joobleScraper};