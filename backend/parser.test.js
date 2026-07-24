import { describe, it, expect } from "vitest";
import { parseHtmlContent } from "./app.js"; // adjust path if your server file has a different name

describe("parseHtmlContent - HTML Parsing Logic", () => {
  // Test Case 1: Happy Path
  it("should correctly parse valid HTML with all metrics present", () => {
    const mockHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Page Title</title>
          <meta name="description" content="This is a test page meta description.">
        </head>
        <body>
          <h1>Main Heading 1</h1>
          <h1>Second Heading 1</h1>
          <img src="pic1.jpg" alt="Valid alt text" />
          <img src="pic2.jpg" alt="" />
          <img src="pic3.jpg" />
          <p>Hello world, this is a test document with several words.</p>
        </body>
      </html>
    `;

    const result = parseHtmlContent(mockHtml);

    expect(result.title).toBe("Test Page Title");
    expect(result.metaDescription).toBe(
      "This is a test page meta description.",
    );
    expect(result.h1Count).toBe(2);
    expect(result.imagesMissingAlt).toBe(2); // One empty alt="", one missing alt tag
    expect(result.wordCount).toBeGreaterThan(0);
  });

  // Test Case 2: Missing Title, Meta Description, and Headings (Edge/Failure Case)
  it("should handle missing title, meta description, and images gracefully", () => {
    const mockHtml = `
      <!DOCTYPE html>
      <html>
        <head></head>
        <body>
          <p>Just a simple body tag with no headings or metadata.</p>
        </body>
      </html>
    `;

    const result = parseHtmlContent(mockHtml);

    expect(result.title).toBe("No title found");
    expect(result.metaDescription).toBe("No meta description found");
    expect(result.h1Count).toBe(0);
    expect(result.imagesMissingAlt).toBe(0);
  });

  // Test Case 3: Malformed/Empty HTML (Failure Case)
  it("should handle empty or broken HTML string without throwing an error", () => {
    const mockHtml = "";

    const result = parseHtmlContent(mockHtml);

    expect(result.title).toBe("No title found");
    expect(result.metaDescription).toBe("No meta description found");
    expect(result.h1Count).toBe(0);
    expect(result.imagesMissingAlt).toBe(0);
    expect(result.wordCount).toBe(0);
  });
});
