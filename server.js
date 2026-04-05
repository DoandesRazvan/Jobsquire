import {ejobsScraper} from "./ejobs-scraper.js";
import {hipoScraper} from "./hipo-scraper.js";
import {bestjobsScraper} from "./bestjobs-scraper.js";
import {undelucramScraper} from "./undelucram-scraper.js";
import {joobleScraper} from "./jooble-scraper.js";
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {GoogleGenAI, ThinkingLevel} from "@google/genai";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.json({limit: "10mb"}));
app.use(express.static(path.join(__dirname, "/public")));

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

function updateJobsDoc(results) {
  fs.writeFile(
    "./public/jobs.json",
    results,
    err => {
        if (err) throw err;

        console.log("Successfully updated the jobs document");
    }
  )
}

app.post("/aifilters", async (req, res) => {
  let newJobs = JSON.stringify(req.body);

  console.log(newJobs);

  updateJobsDoc(newJobs);

  res.json({
    response: "Function ran successfully"
  });
});

app.post("/api/generate", async (req, res) => {
  const { prompt } = req.body;
  let response;

  console.log(prompt);

  try {
    response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.MINIMAL,
        },
      },
      tools: [
        {
          name: "google_search",
          description: "A tool that uses Google Search to get up-to-date information from the web.",
        },
      ],
    });
  } catch(err) {
    res.json({
      text: err,
      error: true
    });

    return;
  }

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
          try {
            results = await ejobsScraper(wantedRole, wantedLocations, wantedExperience);
          } catch (error) {
            console.log(error);
            results = [];
          }
          console.log(results);
          break;
        case "bestjobs":
          try {
            results = await bestjobsScraper(wantedRole, wantedLocations, wantedExperience);
          } catch (error) {
            console.log(error);
            results = [];
          }
          console.log(results);
          break;
        case "hipo":
          try {
            results = await hipoScraper(wantedRole, wantedLocations, wantedExperience);
          } catch (error) {
            console.log(error);
            results = [];
          }
          console.log(results);
          break;
        case "undelucram":
          try {
            results = await undelucramScraper(wantedRole, wantedLocations, wantedExperience);
          } catch (error) {
            console.log(error);
            results = [];
          }
          console.log(results);
          break;
        case "jooble":
          try {
            results = await joobleScraper(wantedRole, wantedLocations, wantedExperience);
          } catch (error) {
            console.log(error);
            results = [];
          }
          console.log(results);
          break;
      }

      allJobResults = allJobResults.concat(results);
    }
  }

  await runScrapers();

  let parsedResults = JSON.stringify(allJobResults);

  updateJobsDoc(parsedResults);

  res.json({
      jobs: allJobResults
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});