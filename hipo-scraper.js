import puppeteer from "puppeteer";

const hipoScraper = async (role, locations, experience) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // creating the URL based on the user search criteria
    async function createUrl() {
        let rolePart = role.split(" ").join("-");
        let locationsPart = locations.split(" ").map((word) => word[0].toUpperCase() + word.slice(1)).join("-");
        let experiencePart = "";

        // "bucuresti" needs to be uppercase in order for the link to work for that location.
        if (locationsPart.localeCompare("bucuresti")) {
            locationsPart = locationsPart.toUpperCase();
        } // need to also remove empty spaces

        // creating the experiences part of the URL
        for (let i = 0; i < experience.length; i++) {
            switch (experience[i]) {
                case "Internship":
                    experiencePart = experiencePart.concat("Student--Absolvent,");
                    break;
                case "Entry":
                    experiencePart = experiencePart.concat("0-1-an-experienta,");
                    break;
                case "Medium":
                    experiencePart = experiencePart.concat("1-5-ani-experienta,");
                    break;
                case "Senior":
                    experiencePart = experiencePart.concat("peste-5-ani-experienta,");
                    break;
                case "Management":
                    experiencePart = experiencePart.concat("Manager,");
                    break;
            }
        }

        // removes last comma so the URL is correct
        experiencePart = experiencePart.slice(0, experiencePart.length - 1);

        return "https://www.hipo.ro/locuri-de-munca/cautajobfiltre/Toate-Domeniile/" + locationsPart + "/" + experiencePart + "/" + rolePart;
    }

    const url = await createUrl();

    console.log(url);

    await page.goto(url);

    // Waiting for the cookie consent popup to appear
    await page.waitForSelector(".cc-bottom");

    // Clicking the "Accept" button to accept cookies
    await page.click(".cc-btn");

    const jobsList = await page.evaluate(() => {
        let jobs = document.querySelectorAll(".text-start");
        let currentUrl = window.location.href;
        let company = "Hipo";

        return Array.from(jobs).map(child => {
            let title = child.querySelector(".job-title")?.title || null;
            let link = child.querySelector(".job-title")?.href || null;

            return {title, link, currentUrl, company};
        });
    });

    return jobsList;
};

export {hipoScraper};