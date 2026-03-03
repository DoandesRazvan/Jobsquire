const askButton = document.getElementById("ask-btn");
const searchJobsFieldTrigger = document.getElementById("search-jobs-btn");
const test = document.getElementById("assistance-btn");
const searchJobsButton = document.getElementById("search-btn");
const scraperComms = document.getElementById("scraper-comms");
const aiComms = document.getElementById("ai-comms");
const jobsFoundDiv = document.getElementById("jobs-found");
const companies = document.querySelectorAll(".company-logo");
const roleFilterButton = document.getElementById("filter-role");
const wfhremoteFilterButton = document.getElementById("filter-wfhremote");
const resetButton = document.getElementById("reset-button");
const wfoFilterButton = document.getElementById("filter-wfo");
const aiFilters = document.querySelectorAll('.ai-filters');
let jobList = [];

// function that animates job card backgrounds based on the user's cursor location
// function cursorBackgroundAnimator() {
//     let jobCards = document.querySelectorAll(".job");

//     jobCards.forEach((card) => {
//         card.addEventListener('mousemove', (e) => {
//             card.style.backgroundPositionX = -e.offsetX + "px";
//             card.style.backgroundPositionY = -e.offsetY + "px";
//         })
//     })
// }

function changeResultsStyle(buttonPressed) {
    let styleColors = {commsBackgroundColor: "", commsBorderColor: "", commsTextColor: "", resultsBackgroundColor: "",resultsBorderColor: ""};

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

// prompt gemini to filter jobs found by desired role when pressing the button
roleFilterButton.addEventListener("click", async () => {
    const desiredRole = document.getElementById("role").value; // getting the job role the user searched for
    const jobsFoundHTML = document.getElementById("jobs-found").innerHTML;

    changeResultsStyle("ai-filter");

    aiComms.textContent = "Filtering results to only include " + desiredRole + " roles...";

    // can improve this prompt so it filters results more accurately
    const prompt = "You have the following HTML code consisting of divs with the class of 'job', each having a job title (a tag's text value) and link (a tag's href property): " + jobsFoundHTML + " . Please look through each of these jobs and return only the jobs that are relevant to the " + desiredRole + " position and exclude the ones that don't fit the criteria. Once you did that, please only give a response with the results you filtered formatted as HTML code following the format of the code I sent you. If there are no results that meet the criteria, please respond with only the text 'No jobs matching the criteria found'" ;

    console.log(prompt);

    const res = await fetch("/api/generate", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({prompt})
    });

    const data = await res.json();
    
    if (data.text == "No jobs matching the criteria found") {
        aiComms.textContent = data.text;
        jobsFoundDiv.innerHTML = "";
        jobsFoundDiv.style.display = "none";
        aiFilters.forEach((filter) => {
            filter.setAttribute("disabled", true);
        });
    } else {
        jobsFoundDiv.innerHTML = data.text;// replacing the jobs-found div content with the filtered results from AI, which it already parsed as the HTML following the same format
        aiComms.textContent = jobsFoundDiv.childElementCount + " jobs matching the criteria found";
    }

    resetButton.style.display = "initial";
});

// prompt gemini to filter jobs found to only include wfh/remote positions when pressing the button
wfhremoteFilterButton.addEventListener("click", async () => {
    const jobsFoundHTML = document.getElementById("jobs-found").innerHTML;

    changeResultsStyle("ai-filter");

    aiComms.textContent = "Filtering results to only include WFH/Remote positions...";

    // can improve this prompt so it filters results more accurately
    const prompt = "You have the following HTML code consisting of divs with the class of 'job', each having a job title (a tag's text value) and link (a tag's href property): " + jobsFoundHTML + " . Please look through each of these jobs and return only the jobs that are WFH/Remote positions and exclude the ones that don't fit the criteria. Once you did that, please only give a response with the results you filtered formatted as HTML code following the format of the code I sent you. If there are no results that meet the criteria, please respond with only the text 'No jobs matching the criteria found'";

    console.log(prompt);

    const res = await fetch("/api/generate", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({prompt})
    });

    const data = await res.json();
    
    if (data.text == "No jobs matching the criteria found") {
        aiComms.textContent = data.text;
        jobsFoundDiv.innerHTML = "";
        jobsFoundDiv.style.display = "none";
        aiFilters.setAttribute("disabled", true);
    } else {
        jobsFoundDiv.innerHTML = data.text;// replacing the jobs-found div content with the filtered results from AI, which it already parsed as the HTML following the same format

        aiComms.textContent = jobsFoundDiv.childElementCount + " jobs matching the criteria found";
    }

    resetButton.style.display = "initial";
});

// prompt gemini to filter jobs found to only include wfo positions when pressing the button
wfoFilterButton.addEventListener("click", async () => {
    const jobsFoundHTML = document.getElementById("jobs-found").innerHTML;

    changeResultsStyle("ai-filter");

    aiComms.textContent = "Filtering results to only include WFO positions...";

    // can improve this prompt so it filters results more accurately
    const prompt = "You have the following HTML code consisting of divs with the class of 'job', each having a job title (a tag's text value) and link (a tag's href property): " + jobsFoundHTML + " . Please look through each of these jobs and return only the jobs that are WFO positions and exclude the ones that don't fit the criteria. Once you did that, please only give a response with the results you filtered formatted as HTML code following the format of the code I sent you.If there are no results that meet the criteria, please respond with only the text 'No jobs matching the criteria found'" ;

    console.log(prompt);

    const res = await fetch("/api/generate", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({prompt})
    });

    const data = await res.json();
    
    if (data.text == "No jobs matching the criteria found") {
        aiComms.textContent = data.text;
        jobsFoundDiv.innerHTML = "";
        jobsFoundDiv.style.display = "none";
        aiFilters.forEach((filter) => {
            filter.setAttribute("disabled", true);
        });
    } else {
        jobsFoundDiv.innerHTML = data.text;// replacing the jobs-found div content with the filtered results from AI, which it already parsed as the HTML following the same format

        aiComms.textContent = jobsFoundDiv.childElementCount + " jobs matching the criteria found";
    }

    resetButton.style.display = "initial";
});

resetButton.addEventListener("click", () => {
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

    jobsFoundDiv.style.display = "grid";
    aiFilters.forEach((filter) => {
            filter.removeAttribute("disabled");
    });
    resetButton.style.display = "none";
    aiComms.textContent = "Initial job search results regenerated";
});

// activate scraper and fetch jobs
searchJobsButton.addEventListener("click", async () => {
    document.getElementById("results").style.display = "flex";
    scraperComms.textContent = "Fetching jobs..."; // updating DOM informing the user that the script is running

    const selectedCompaniesList = selectedCompanies();
    const role = document.getElementById("role").value;
    const locations = document.getElementById("location").value;
    const experience = Array.from(document.querySelectorAll("input[type=checkbox]"))
                                 .map((element) => {if (element.checked) {return element.value}})
                                 .filter((arrValue) => arrValue != undefined);

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

    const jobData = await res.json();
    const jobResults = Array.from(jobData.jobs);

    // resetting stored job results every time a new search is issued
    jobList = [];

    changeResultsStyle("search");

    jobResults.forEach((job) => {
        let plusOrMinus = Math.random() < 0.5 ? -1 : 1;
        let randomNum = plusOrMinus * Math.floor(Math.random() * 91);
        let backgroundStyle = "linear-gradient(" + randomNum + "deg,rgba(154, 31, 69, 1) 0%, rgba(179, 58, 58, 1) 50%, rgba(199, 90, 26, 1) 100%)"; // change this to have 3 randomnums for all variables
        
        // let backgroundStyle = "linear-gradient(at calc(var--mouse--x) * 100)deg,rgba(154, 31, 69, 1) 0%, rgba(179, 58, 58, 1) 50%, rgba(199, 90, 26, 1) 100%)";

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

    scraperComms.textContent = "Search complete";
    aiComms.textContent = jobResults.length + " jobs found using selected criteria"

    // have the download job buttons appear only if at least 1 job was found
    if (jobResults.length > 0) {
        document.getElementById("download-button").style.display = "initial";
        document.getElementById("ai-prompts").style.display = "flex";
        jobsFoundDiv.style.display = "grid";
    }
})

// // trigger job search field UI
// searchJobsFieldTrigger.addEventListener("click", () => {
//     const paramElement = document.getElementById("jobs-search");

//     paramElement.classList.toggle("show");

//     if (paramElement.classList.contains("show")) {
//         for (let child of paramElement.children) {
//             child.style = "opacity: 1";
//             searchJobsFieldTrigger.style.textShadow = "1px 1px 15px #FF004D";
//             searchJobsFieldTrigger.style.fontSize = "14px";
//         }
//     } else {
//         for (let child of paramElement.children) {
//             child.style = "opacity: 0";
//             searchJobsFieldTrigger.style.textShadow = "1px 1px 15px #B14A2E";
//             searchJobsFieldTrigger.style.fontSize = "13px";
//         }
//     }
// });

// add event listeners to each company logo
companies.forEach(company => {
    company.addEventListener("click", () => {
        company.classList.toggle(".selected")
    });
})

// function that collects the job sites selected by the user
function selectedCompanies() {
    let list = [];

    companies.forEach(company => {
        if (company.classList.contains(".selected")) {list.push(company.getAttribute("id"))};
    });

    return list;
}


// searchJobsFieldTrigger.addEventListener("click", () => {
//     const paramElement = document.getElementById("jobs-search");

//     paramElement.classList.toggle("show");

//     if (paramElement.classList.contains("show")) {
//         for (let child of paramElement.children) {
//             child.style = "opacity: 1";
//         }
//     } else {
//         for (let child of paramElement.children) {
//             child.style = "opacity: 0";
//         }
//     }
// })


// searchJobsFieldTrigger.addEventListener("click", () => {
//     const paramElement = document.getElementById("jobs-news");

//     paramElement.classList.toggle("show");

//     if (paramElement.classList.contains("show")) {
//         for (let child of paramElement.children) {
//             child.style = "opacity: 1";
//         }
//     } else {
//         for (let child of paramElement.children) {
//             child.style = "opacity: 0";
//         }
//     }
// })
