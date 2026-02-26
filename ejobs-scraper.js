import puppeteer from "puppeteer";

const ejobsScraper = async (role, locations, experience) => {
    const browser = await puppeteer.launch();
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
                    experiencePart = experiencePart.concat("no-experience,");
                    break;
                case "Entry":
                    experiencePart = experiencePart.concat("entry-level,");
                    break;
                case "Medium":
                    experiencePart = experiencePart.concat("mid-level,");
                    break;
                case "Senior":
                    experiencePart = experiencePart.concat("senior-level,");
                    break;
                case "Management":
                    experiencePart = experiencePart.concat("manager-executive,");
                    break;
            }
        }

        // removes last comma so the URL is correct
        experiencePart = experiencePart.slice(0, experiencePart.length - 1);

        return "https://www.ejobs.ro/locuri-de-munca/" + locationsPart + "/" + experiencePart + "/" + rolePart;
    }

    const url = await createUrl();
    let dynamicUrl = url;
    let pageCounter = 1;

    async function scrollPage() {
        page.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                let distance = 100; // Step size
                let timer = setInterval(() => {
                    let scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    if(totalHeight >= scrollHeight){
                        clearInterval(timer);
                        resolve();
                    }
                }, 100); // Delay in ms
            });
        });
    }

    async function cookieConsenter() {
        if (pageCounter == 1) {
            // Waiting for the cookie consent popup to appear
            await page.waitForSelector(".ejobs-modal");
    
            // Clicking the "Accept" button to accept cookies
            await page.click(".shared-elements-cookies-popup__accept-button");
        }
    }

    // scraping website for results, repeating if next page is available and closing when no new pages are present
    // have a way of handling error if only one page is available.
    while (newPageAvailable) {
        console.log(pageCounter);

        console.log(dynamicUrl);

        await page.goto(dynamicUrl);

        // closing cookie pop up the first time the site is opened
        await cookieConsenter();

        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                let distance = 100; // Step size
                let timer = setInterval(() => {
                    let scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    if(totalHeight >= scrollHeight){
                        clearInterval(timer);
                        resolve();
                    }
                }, 100); // Delay in ms
            });
        });

        const searchResults = await page.evaluate(() => {
            let jobs = document.querySelectorAll(".job-card-wrapper--visible");
            let currentUrl = window.location.href;
            let company = "eJobs";
            let isNextPage = document.querySelector(".jobs-list-paginator__button--next") != null ? true : false;

            // return Array.from(jobs).map(child => {
            //     let title = child.querySelector(".job-card-content-middle__title")?.innerText || null;
            //     let link = child.querySelector(".job-card-content-middle__title > a")?.href || null;

            //     return {title, link, currentUrl, company};
            // });

            let jobsFound = Array.from(jobs).map(child => {
                let title = child.querySelector(".job-card-content-middle__title")?.innerText || null;
                let link = child.querySelector(".job-card-content-middle__title > a")?.href || null;

                return {title, link, currentUrl, company};
            });

            return {jobsFound, isNextPage}
        });

        console.log(searchResults.isNextPage);

        // pass results into main job array
        searchResults.jobsFound.forEach((jobObj) => jobsList.push(jobObj));

        // check if next page is available
        if (searchResults.isNextPage) {
            pageCounter++;

            dynamicUrl = url + "/pagina" + pageCounter;
        } else {
            newPageAvailable = false;
        }
    }

    return jobsList;
};

export {ejobsScraper};