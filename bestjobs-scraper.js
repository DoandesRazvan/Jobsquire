// this side doesn't have pagination - need to figure out how to get all the possible results (page can be scrolled down then "Incarca mai mult" button appears);

import puppeteer from "puppeteer";

const bestjobsScraper = async (role, locations, experience) => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    // creating the URL based on the user search criteria
    async function createUrl() {
        let rolePart = role.split(" ").join("-");
        let locationsPart = locations.split(" ").join("-");
        let experiencePart = "";

        // creating the experiences part of the URL
        for (let i = 0; i < experience.length; i++) {
            switch (experience[i]) {
                case "Internship":
                    experiencePart = experiencePart.concat("fara-experienta,");
                    break;
                case "Entry":
                    experiencePart = experiencePart.concat("entry-0-2-ani,");
                    break;
                case "Medium":
                    experiencePart = experiencePart.concat("middle-2-5-ani,");
                    break;
                case "Senior":
                    experiencePart = experiencePart.concat("senior-5-10-ani,");
                    break;
                case "Management":
                    experiencePart = experiencePart.concat("executive-10-ani,");
                    break;
            }
        }

        // removes last comma so the URL is correct
        experiencePart = experiencePart.slice(0, experiencePart.length - 1);

        return "https://www.bestjobs.eu/locuri-de-munca-in-" + locationsPart + "/" + experiencePart + "/" + rolePart;
    }

    const url = await createUrl();

    console.log(url);

    await page.goto(url);

    // Waiting for the cookie consent popup to appear
    await page.waitForSelector(".w-full");

    // Clicking the "Accept" button to accept cookies
    await page.click("button[data-test-id=cookie-consent-accept]");

    // scrolling naturally to bottom
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            let distance = 100; // Step size
            let timer = setInterval(() => {
                let scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if(totalHeight >= scrollHeight){
                    let moreButton = document.querySelector("button.px-5");

                    console.log(moreButton);

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
        let jobs = document.querySelectorAll("a.inset-0");
        let currentUrl = window.location.href;
        let company = "Bestjobs";

        console.log(jobs);

        return Array.from(jobs).map(child => {
            let title = child?.ariaLabel || null;
            let link = child?.href || null;

            return {title, link, currentUrl, company};
        });
    });

    return jobsList;
};

export {bestjobsScraper};