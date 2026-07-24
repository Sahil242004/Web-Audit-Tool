import parseHtmlContent from "../utils/parseHtml.js";
import axios from "axios";
import * as cheerio from "cheerio";

const auditController = async (req, res) => {
  const { url } = req.body;

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
    const response = await axios.get(parsedUrl.href, {
      timeout: 8000, // 8-second timeout
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AuditTool/1.0",
        Accept: "text/html,application/xhtml+xml,application/xml",
      },
      maxRedirects: 5,
      validateStatus: () => true,
    });

    const responseTimeMs = Date.now() - startTime;
    const contentType = response.headers["content-type"] || "";
    console.log("contentType:", contentType);

    if (!contentType.includes("text/html")) {
      return res.status(400).json({
        success: false,
        error: `URL returned non-HTML content type: '${contentType}'. Only HTML pages can be audited.`,
      });
    }

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
};

export default auditController;
