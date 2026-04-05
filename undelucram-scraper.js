import puppeteer from "puppeteer";

const undelucramScraper = async (role, locations, experience) => {
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    let jobsList = [];
    let newPageAvailable = true;

    // creating the url used for the scraper
    async function createUrl() {
        // creating variables for user data that will be used for URL creation
        let rolePart = role.split(" ").join("-");
        let locationsPart = locations.split(" ").join("-");
        let experiencePart = "";

        // creating the experiences part of the URL
        for (let i = 0; i < experience.length; i++) {
            switch (experience[i]) {
                case "Internship":
                    experiencePart = experiencePart.concat("student-internship,");
                    break;
                case "Entry":
                    experiencePart = experiencePart.concat("entry-level-2-ani,");
                    break;
                case "Medium":
                    experiencePart = experiencePart.concat("medium-level-2-5-ani,");
                    break;
                case "Senior":
                    experiencePart = experiencePart.concat("senior-level-5-ani,");
                    break;
                case "Management":
                    experiencePart = experiencePart.concat("management,");
                    break;
            }
        }

        // removes last comma so the URL is correct
        experiencePart = experiencePart.slice(0, experiencePart.length - 1);

        return "https://www.undelucram.ro/ro/locuri-de-munca/" + experiencePart + "/" + locationsPart + "/" + rolePart;
    }

    const url = await createUrl();
    let dynamicUrl = url;
    let pageCounter = 1;

    async function cookieConsenter() {
        if (pageCounter == 1) {
            // Waiting for the cookie consent popup to appear
            await page.waitForSelector(".cookies-content");
    
            // Clicking the "Accept" button to accept cookies
            await page.locator("button[name=save-cookies]").click(); // need to figure out why this isn't working. it worked a couple a times then it stopped.
        }
    }

    // assign the no of pages value to said variable only the first time the page is opened
    await page.goto(dynamicUrl);

    let noOfPages = await page.evaluate(() => {
        let pageItems = document.querySelectorAll(".page-item");

        if (pageItems.length === 0) {
            return 0;
        } else {
            pageItems = Array.from(document.querySelectorAll(".page-item"));

            return Number(pageItems[pageItems.length - 2].querySelector(".page-link").innerText);
        }
    });

    console.log(noOfPages);

    // scraping website for results, repeating if next page is available and closing when no new pages are present
    while (newPageAvailable) {
        await page.goto(dynamicUrl);

        await cookieConsenter();

        console.log(dynamicUrl);

        const searchResults = await page.evaluate(() => {
            let jobs = document.querySelectorAll(".jobs-item");
            let currentUrl = window.location.href;
            let company = "UndeLucram";

            let jobsFound = Array.from(jobs).map(child => {
                let title = child.querySelector("h4")?.innerText || null;
                let link = child.querySelector("a")?.href || null;

                return {title, link, currentUrl, company};
            });

            return jobsFound;
        });

        // pass results into main job array
        searchResults.forEach((jobObj) => jobsList.push(jobObj));

        // check if next page is available
        if (pageCounter < noOfPages) {
            pageCounter++;

            dynamicUrl = url + "?page=" + pageCounter;
        } else {
            newPageAvailable = false;
        }
    }

    return jobsList;
};

export {undelucramScraper};