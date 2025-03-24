import Parser from "rss-parser";
import dotenv from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";
import { writeToFile } from "../tools";
import { GoogleGenerativeAI } from "@google/generative-ai";
dotenv.config({ path: "../.env" });

console.log(process.env.OPENAI_API_KEY);

const RSS_URL =
  "https://www.google.com/alerts/feeds/06624190208855597219/4227859361160068116";
async function one() {
  const parser = new Parser();
  try {
    const feed = await parser.parseURL(RSS_URL);

    for (const entry of feed.items) {
      const payload = {
        title: entry.title,
        link: entry.link,
        published: entry.pubDate,
      };

      console.log("Parsed:", payload);
    }
  } catch (error) {
    console.error("Error fetching alerts:", error);
  }
}

async function two() {
  // const TARGET_URL =
  //   "https://www.wiproud.com/business/press-releases/cision/20250323LN47618/av-comparatives-launches-groundbreaking-edr-detection-validation-test-kaspersky-next-edr-expert-achieves-certification-in-inaugural-assessment/";
  const TARGET_URL = "https://deiahri.github.io/darwin-effect/";
  const page = await axios.get(TARGET_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      Referer: "https://www.google.com/", // Example referer
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  const bodyStart = page.data.indexOf("<body");
  if (bodyStart == -1) {
    console.log("No body found.");
    return;
  }

  const bodyEnd = page.data.indexOf("</body>");
  if (bodyEnd == -1) {
    console.log("No body end tag found.");
    return;
  }

  const bodyTrimmed = page.data.substring(bodyStart, bodyEnd);
  writeToFile("./outRaw.txt", bodyTrimmed);
  const parsedText = parseTextFromHTML(bodyTrimmed);
  writeToFile("./out.txt", parsedText);
  // console.log(parsedText);

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('ENV GEMINI_API_KEY Not set.');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Describe what's going on on this page given the text contents: ${parsedText}`;

  const result = await model.generateContent(prompt);
  writeToFile("./outGPT.txt", result.response.text());
}



function parseTextFromHTML(markup: string) {
  // Load the HTML into cheerio
  const $ = cheerio.load(markup);

  // Remove script and style elements that shouldn't be in the text output
  $("script, style, noscript, iframe, object").remove();

  // Get the text content
  const text = $("body").text().trim();

  let textProcessed = [];
  let current = "";
  let lastWasSpace = false;
  for (let char of text) {
    if (!char.trim() && char != " ") {
      if (current.trim()) {
        textProcessed.push(current.trim());
        current = "";
      }
      lastWasSpace = true;
      continue;
    } else if (char == " ") {
      if (lastWasSpace) {
        continue;
      }
      lastWasSpace = true;
    } else {
      lastWasSpace = false;
    }
    current += char;
  }
  return textProcessed.join("\n");
}



two();
