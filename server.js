import {ejobsScraper} from "./ejobs-scraper.js";
import {hipoScraper} from "./hipo-scraper.js";
import {bestjobsScraper} from "./bestjobs-scraper.js";
import {undelucramScraper} from "./undelucram-scraper.js";
import {joobleScraper} from "./jooble-scraper.js";
import express from "express";
import {GoogleGenAI} from "@google/genai";
import fs from "fs";

const app = express();

app.use(express.json({limit: "10mb"}));
app.use(express.static("public"));

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY,});

app.post("/api/generate", async (req, res) => {
  const { prompt } = req.body;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  console.log(response.text);

  res.json({
    text: response.text
  });
});

app.post("/jobs", async (req, res) => {
  let companyList = req.body.companies;
  let wantedRole = req.body.role;
  let wantedLocations = req.body.locations;
  let wantedExperience = req.body.experience;
  let allJobResults = [];

  // run scrapers function
  async function runScrapers(){
    for(const company of companyList) {
      let results;

      switch (company) {
        case "ejobs":
          results = await ejobsScraper(wantedRole, wantedLocations, wantedExperience);
          console.log(results);
          break;
        case "bestjobs":
          results = await bestjobsScraper(wantedRole, wantedLocations, wantedExperience);
          console.log(results);
          break;
        case "hipo":
          results = await hipoScraper(wantedRole, wantedLocations, wantedExperience);
          console.log(results);
          break;
        case "undelucram":
          results = await undelucramScraper(wantedRole, wantedLocations, wantedExperience);
          console.log(results);
          break;
        case "jooble":
          results = await joobleScraper(wantedRole, wantedLocations, wantedExperience);
          console.log(results);
          break;
        default: "No company selected"; // default might need to be removed
      }

      allJobResults = allJobResults.concat(results);
    }
  }

  await runScrapers();

  let parsedResults = JSON.stringify(allJobResults);

  fs.writeFile(
    "./public/jobs.json",
    parsedResults,
    err => {
        if (err) throw err;

        console.log("Successfully found and added " + allJobResults.length + " new jobs to the document");
    }
  )

  res.json({
      jobs: allJobResults
  });
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});

// scraper();