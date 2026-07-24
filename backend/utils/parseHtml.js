import * as cheerio from "cheerio";

const parseHtmlContent = (html) => {
  const $ = cheerio.load(html);

  const title = $("head title").text().trim() || "No title found";

  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    "No meta description found";

  const h1Count = $("h1").length;

  const imagesMissingAlt = $("img").filter((_, img) => {
    const alt = $(img).attr("alt");
    return alt === undefined || alt.trim() === "";
  }).length;

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

export default parseHtmlContent;
