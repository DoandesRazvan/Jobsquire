import {ejobsScraper} from "./ejobs-scraper.js";
import {hipoScraper} from "./hipo-scraper.js";
import {bestjobsScraper} from "./bestjobs-scraper.js";
import {undelucramScraper} from "./undelucram-scraper.js";
import {joobleScraper} from "./jooble-scraper.js";
import express from "express";
import {GoogleGenAI} from "@google/genai";
import fs from "fs";

const app = express();
const router = express.Router();

app.use(express.json({limit: "10mb"}));
app.use("/", express.static("public"));

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

  try {
    response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // might need to change ai model due to rate limits (gemma 3 27b is dumb, just tried it)
      contents: prompt,
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
        default: "No company selected"; // default might need to be removed
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

export const server = app;
