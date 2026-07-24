import express from "express";
import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Allow requests from any origin with JSON headers
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(express.json());

// Helper function to extract audit metrics from HTML
export const parseHtmlContent = (html) => {
  const $ = cheerio.load(html);

  // 1. Page Title
  const title = $("head title").text().trim() || "No title found";

  // 2. Meta Description
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    "No meta description found";

  // 3. H1 Count
  const h1Count = $("h1").length;

  // 4. Images Missing Alt Text
  // Checks images without an 'alt' attribute or with an empty/whitespace-only 'alt'
  const imagesMissingAlt = $("img").filter((_, img) => {
    const alt = $(img).attr("alt");
    return alt === undefined || alt.trim() === "";
  }).length;

  // 5. Approximate Word Count
  // Remove scripts, styles, and non-visible tags before extracting text
  $("script, style, noscript, svg, iframe").remove();
  const visibleText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = visibleText ? visibleText.split(/\s+/).length : 0;

  return {
    title,
    metaDescription,
    h1Count,
    imagesMissingAlt,
    wordCount,
  };
};

app.get("/", (req, res) => {
  res.send("Audit Tool API is running!");
});

app.post("/api/audit", async (req, res) => {
  const { url } = req.body;

  // 1. Validate input URL presence and structure
  if (!url) {
    return res.status(400).json({
      success: false,
      error: "URL is required in the request body.",
    });
  }

  let parsedUrl;
  console.log(`Received URL for audit: ${url}`);
  try {
    parsedUrl = new URL(url);
    console.log(`Parsed URL: ${parsedUrl}`);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("Invalid protocol");
    }
  } catch {
    return res.status(400).json({
      success: false,
      error:
        "Invalid URL format. Please enter a valid URL starting with http:// or https://",
    });
  }

  const startTime = Date.now();

  try {
    // 2. Fetch the URL with timeout and custom User-Agent
    const response = await axios.get(parsedUrl.href, {
      timeout: 8000, // 8-second timeout
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AuditTool/1.0",
        Accept: "text/html,application/xhtml+xml,application/xml",
      },
      maxRedirects: 5,
      validateStatus: () => true, // Don't throw error on 4xx/5xx HTTP status codes
    });

    const responseTimeMs = Date.now() - startTime;
    const contentType = response.headers["content-type"] || "";
    console.log("contentType:", contentType);

    // 3. Check for non-HTML response
    if (!contentType.includes("text/html")) {
      return res.status(400).json({
        success: false,
        error: `URL returned non-HTML content type: '${contentType}'. Only HTML pages can be audited.`,
      });
    }

    // 4. Parse HTML and compile report
    const auditData = parseHtmlContent(response.data);

    return res.status(200).json({
      success: true,
      data: {
        url: parsedUrl.href,
        statusCode: response.status,
        responseTimeMs,
        ...auditData,
      },
    });
  } catch (err) {
    const responseTimeMs = Date.now() - startTime;

    // Handle standard request failure states (timeout, network error, etc.)
    if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
      return res.status(504).json({
        success: false,
        error:
          "Request timed out after 8 seconds. The server took too long to respond.",
      });
    }

    if (err.code === "ENOTFOUND" || err.code === "EAI_AGAIN") {
      return res.status(502).json({
        success: false,
        error:
          "Domain name could not be resolved. Check if the URL/domain exists.",
      });
    }

    return res.status(500).json({
      success: false,
      error: `Failed to fetch page: ${err.message}`,
      responseTimeMs,
    });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// https://dummyjson.com/products/1    return application/json data
// https://raw.githubusercontent.com/octocat/Spoon-Knife/main/README.md    return text/plain data
// https://picsum.photos/200/300  return image/jpeg data

// https://news.ycombinator.com    return html response
// https://github.com      returns rich html with rich data

// https://mock.httpstatus.io/200?delay=12000      gives response after 10 seconds, useful for testing timeout handling
