import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import parseHtmlContent from "./utils/parseHtml.js";
import auditController from "./controller/auditController.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Audit Tool API is running!");
});

app.post("/api/audit", auditController);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// https://dummyjson.com/products/1    return application/json data
// https://raw.githubusercontent.com/octocat/Spoon-Knife/main/README.md    return text/plain data
// https://picsum.photos/200/300  return image/jpeg data

// https://news.ycombinator.com    return html response
// https://github.com      returns rich html with rich data

// https://mock.httpstatus.io/200?delay=12000      gives response after 10 seconds, useful for testing timeout handling
