// getting DOM elements
const content = document.getElementById("content");
const askButton = document.getElementById("ask-btn");
const infoBtn = document.getElementById("info-btn");
const infoContentWrapper = document.getElementById("info-content-wrapper");
const searchJobsButton = document.getElementById("search-btn");
const scraperComms = document.getElementById("scraper-comms");
const aiComms = document.getElementById("ai-comms");
const jobsFoundDiv = document.getElementById("jobs-found");
const companies = document.querySelectorAll(".company-logo");
const roleFilterButton = document.getElementById("filter-role");
const wfhremoteFilterButton = document.getElementById("filter-wfhremote");
const resetButton = document.querySelector(".reset-button");
const wfoFilterButton = document.getElementById("filter-wfo");
const aiFilters = document.querySelectorAll('.ai-filters');

// initializing job variables
let jobList = [];
let filteredJobs = [];

// object that holds the style values used to change some scraper content divs' appearance
let styleColors = {commsBackgroundColor: "", commsBorderColor: "", commsTextColor: "", resultsBackgroundColor: "",resultsBorderColor: ""};

// add event listeners to each company logo
companies.forEach(company => {
    company.addEventListener("click", () => {
        company.classList.toggle("selected");
    });
});

// enable or disable ai prompts buttons function
function aiBtnsControl(value, updateResetButton) {
    if (value == "disable") {
        [...aiFilters].forEach((filter) => {
            filter.setAttribute("disabled", true);
        });

        if (updateResetButton == "yes") {resetButton.setAttribute("disabled", true)};
    } else if (value == "enable") {
        [...aiFilters].forEach((filter) => {
            filter.removeAttribute("disabled");
        });

        if (updateResetButton == "yes") {resetButton.removeAttribute("disabled")};
    }
}

// function that collects the job sites selected by the user
function selectedCompanies() {
    let list = [];

    companies.forEach(company => {
        if (company.classList.contains("selected")) {list.push(company.getAttribute("id"))};
    });

    return list;
}

// function that changes appearance of jobs found div and ai comms based on what button was pressed
function changeResultsStyle(buttonPressed) {
    switch (buttonPressed) { // can change the comms colors to hex values to keep the original format
        case "ai-filter":
            styleColors.commsBackgroundColor = "rgba(27, 30, 35, 1)";
            styleColors.commsBorderColor = "rgba(161, 68, 111, 1)";
            styleColors.commsTextColor = "rgba(255, 46, 136, 1)";
            styleColors.resultsBackgroundColor = "rgba(255, 46, 136, 0.05)";
            styleColors.resultsBorderColor = "rgba(255, 46, 136, 0.5)";
            break;
        case "reset":
            styleColors.commsBackgroundColor = "rgba(13, 43, 30, 1)";
            styleColors.commsBorderColor = "rgba(47, 163, 107, 1)";
            styleColors.commsTextColor = "rgba(0, 255, 127, 1)";
            styleColors.resultsBackgroundColor = "rgba(0, 255, 127, 0.05)";
            styleColors.resultsBorderColor = "rgba(0, 255, 127, 0.5)";
            break;
        case "search": 
            styleColors.commsBackgroundColor = "rgba(47, 22, 13, 1)";
            styleColors.commsBorderColor = "rgba(154, 63, 40, 1)";
            styleColors.commsTextColor = "rgba(255, 106, 61, 1)";
            styleColors.resultsBackgroundColor = "rgba(255, 106, 61, 0.05)";
            styleColors.resultsBorderColor = "rgba(255, 106, 61, 0.5)";
            break;
    }

    aiComms.style.backgroundColor = styleColors.commsBackgroundColor;
    aiComms.style.borderColor = styleColors.commsBorderColor;
    aiComms.style.color = styleColors.commsTextColor;

    jobsFoundDiv.style.backgroundColor = styleColors.resultsBackgroundColor;
    jobsFoundDiv.style.borderColor = styleColors.resultsBorderColor;
};

async function runAiFilter(filterName) {
    const jobsFoundHTML = document.getElementById("jobs-found").innerHTML;
    let prompt = "";

    // updating UI after a filter starts running
    aiBtnsControl("disable");
    resetButton.setAttribute("disabled", true);

    changeResultsStyle("ai-filter");
    jobsFoundDiv.classList.toggle("filters-running");

    // updating ai comms and prompt based on button pressed
    switch(filterName) {
        case "role":
            let desiredRole = document.getElementById("role").value;
            
            aiComms.textContent = "Filtering results to only include " + desiredRole + " roles...";

            prompt = "You have the following HTML code consisting of divs with the class of 'job', each having a job title (a tag's text value) and link (a tag's href property): " + jobsFoundHTML + " . Please look through each of these jobs and return only the jobs that are relevant to the " + desiredRole + " position and exclude the ones that don't fit the criteria. Once you did that, please only give a response with the results you filtered formatted as HTML code following the format of the code I sent you. If there are no results that meet the criteria, please respond with only the text 'No jobs matching the criteria found'";
            
            break;

        case "wfhremote":
            aiComms.textContent = "Filtering results to only include WFH/Remote positions...";

            prompt = "You have the following HTML code consisting of divs with the class of 'job', each having a job title (a tag's text value) and link (a tag's href property): " + jobsFoundHTML + " . Please look through each of these jobs and return only the jobs that are WFH/Remote positions and exclude the ones that don't fit the criteria. Once you did that, please only give a response with the results you filtered formatted as HTML code following the format of the code I sent you. If there are no results that meet the criteria, please respond with only the text 'No jobs matching the criteria found'";
            
            break;

        case "wfo":
            aiComms.textContent = "Filtering results to only include WFO positions...";

            prompt = "You have the following HTML code consisting of divs with the class of 'job', each having a job title (a tag's text value) and link (a tag's href property): " + jobsFoundHTML + " . Please look through each of these jobs and return only the jobs that are WFO positions and exclude the ones that don't fit the criteria. Once you did that, please only give a response with the results you filtered formatted as HTML code following the format of the code I sent you.If there are no results that meet the criteria, please respond with only the text 'No jobs matching the criteria found'";

            break;
    }

    // fetching Gemini API and passing it the prompt
    const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({prompt})
    });

    // if AI model fails to respond, reset the UI so the user can try filtering again and pass the error message
    if (res.error) {
        aiComms.textContent = res.text;

        aiBtnsControl("enable");
        resetButton.removeAttribute("disabled", true);
        jobsFoundDiv.classList.toggle("filters-running");

        return;
    }

    const data = await res.json();

    // updating app based on Gemini result
    if (data.text == "No jobs matching the criteria found") {
        aiComms.textContent = data.text;
        jobsFoundDiv.innerHTML = "";
        jobsFoundDiv.style.display = "none";
        filteredJobs = [];
    } else {
        jobsFoundDiv.innerHTML = data.text;// replacing the jobs-found div content with the filtered results from AI, which it already parsed as the HTML following the same format

        filteredJobs = Array.from(jobsFoundDiv.querySelectorAll(".job")).map(element => {
            return {
                title: element.querySelector("a:first-child").innerText,
                link: element.querySelector("a:first-child").href,
                currentUrl: element.querySelector("a:last-of-type").href,
                company: element.querySelector("a:last-of-type").innerText
            }
        });

        aiComms.textContent = jobsFoundDiv.childElementCount + " jobs matching the criteria found";

        aiBtnsControl("enable");
    }

    // updating jobs.json file with the filtered results
    await fetch("/aifilters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filteredJobs)
    });

    // making the reset button visible and functional and removing overlay from jobs-found div
    resetButton.style.display = "initial";
    resetButton.removeAttribute("disabled");
    jobsFoundDiv.classList.toggle("filters-running");
}

// prompt gemini to filter jobs found by desired role when pressing the button
roleFilterButton.addEventListener("click", () => {runAiFilter("role")});

// prompt gemini to filter jobs found to only include wfh/remote positions when pressing the button
wfhremoteFilterButton.addEventListener("click", () => {runAiFilter("wfhremote")});

// prompt gemini to filter jobs found to only include wfo positions when pressing the button
wfoFilterButton.addEventListener("click", () => {runAiFilter("wfo")});

resetButton.addEventListener("click", async () => {
    jobsFoundDiv.innerHTML = "";

    // kinda duplicate loop of the scraper one, see if it can be turned into a function that can be recycled
    jobList.forEach((job) => {
        let plusOrMinus = Math.random() < 0.5 ? -1 : 1;
        let randomNum = plusOrMinus * Math.floor(Math.random() * 91);
        let backgroundStyle = "linear-gradient(" + randomNum + "deg,rgba(154, 31, 69, 1) 0%, rgba(179, 58, 58, 1) 50%, rgba(199, 90, 26, 1) 100%)"; // change this to have 3 randomnums for all variables

        let jobDiv = document.createElement("div");
        jobDiv.classList.add("job");

        jobDiv.innerHTML = `<a target=_blank" href="${job.link}">${job.title}</a>
        <span>From: </span>
        <a target="_blank" href="${job.currentUrl}">${job.company}</a>`;

        jobDiv.style.background = backgroundStyle;

        jobsFoundDiv.appendChild(jobDiv);
    });

    changeResultsStyle("reset");

    await fetch("/aifilters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({jobs: jobsFoundDiv.innerHTML})
    });

    jobsFoundDiv.style.display = "grid";
    resetButton.style.display = "none";
    aiComms.textContent = "Initial job search results restored (" + jobList.length + ")";
    
    if(jobList.length > 1) {aiBtnsControl("enable");} // only enable the filter buttons if there are any results to filter
});

// activate scraper and fetch jobs
searchJobsButton.addEventListener("click", async () => {
    document.getElementById("results").style.display = "flex";
    scraperComms.textContent = "Fetching jobs..."; // updating DOM informing the user that the script is running

    // resetting stored job results every time a new search is issued
    jobList = [];
    filteredJobs = [];

    changeResultsStyle("search");

    // getting user's search parameters
    const selectedCompaniesList = selectedCompanies();
    const role = document.getElementById("role").value;
    const locations = document.getElementById("location").value;
    const experience = Array.from(document.querySelectorAll("input[type=checkbox]"))
                                 .map((element) => {if (element.checked) {return element.value}})
                                 .filter((arrValue) => arrValue != undefined);

    
    // fetching backend to run the scraper functions                             
    const res = await fetch("/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            companies: selectedCompaniesList,
            role: role,
            locations: locations,
            experience: experience
        })
    });

    // adding scraper results to a variable for parsing
    const jobData = await res.json();
    const jobResults = Array.from(jobData.jobs);

    // just before the results are added to the DOM, split the grid into two even columns (and check how to split it based on window width)
    if (window.innerWidth > 1350) {
        content.style.gridTemplateColumns = "1fr 1fr";
        content.style.gap = "0 15px";
        content.style.placeItems = "start";
    }

    // going through each job result and adding it to the DOM as well as storing it in a variable on this file
    jobResults.forEach((job) => {
        let plusOrMinus = Math.random() < 0.5 ? -1 : 1;
        let randomNum = plusOrMinus * Math.floor(Math.random() * 91);
        let backgroundStyle = "linear-gradient(" + randomNum + "deg,rgba(154, 31, 69, 1) 0%, rgba(179, 58, 58, 1) 50%, rgba(199, 90, 26, 1) 100%)"; // change this to have 3 randomnums for all variables

        let jobDiv = document.createElement("div");
        jobDiv.classList.add("job");

        jobDiv.innerHTML = `<a target=_blank" href="${job.link}">${job.title}</a>
        <span>From: </span>
        <a target="_blank" href="${job.currentUrl}">${job.company}</a>`;
        
        jobDiv.style.background = backgroundStyle;

        // adding the job JSON element to the array to store job results in case user wants to refresh after AI prompts
        jobList.push(job);

        jobsFoundDiv.appendChild(jobDiv);
    }); 

    // updating DOM that search is complete
    scraperComms.textContent = "Search complete";
    aiComms.textContent = jobResults.length + " jobs found using selected criteria"

    // have the download job buttons appear only if at least 1 job was found
    if (jobResults.length > 0) {
        document.getElementById("download-button").style.display = "initial";
        document.getElementById("ai-prompts").style.display = "flex";
        jobsFoundDiv.style.display = "grid";
    }
})

// toggle animation on click for info-btn 
infoBtn.addEventListener("click", () => {
    infoContentWrapper.classList.toggle("info-content-show");
});