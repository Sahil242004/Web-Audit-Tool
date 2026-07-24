# Web Audit Tool

A lightweight web auditor tool that fetches any URL, parses key SEO and structural HTML metrics, and returns a clean report.

---

## Setup & Running Locally

### Prerequisites

- Node.js (v18+)
- npm

### 1. Backend Setup

```bash
cd backend
npm install
npm start
```

The server runs on `http://localhost:8080`.

To run tests:

```bash
npm test
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## API Contract

### Endpoint: `POST /api/audit`

**Request Body:**

```json
{
  "url": "[https://example.com](https://example.com)"
}
```

**Success Response (`200 OK`):**

```json
{
  "success": true,
  "data": {
    "url": "[https://example.com/](https://example.com/)",
    "statusCode": 200,
    "responseTimeMs": 245,
    "title": "Example Domain",
    "metaDescription": "No meta description found",
    "h1Count": 1,
    "imagesMissingAlt": 0,
    "wordCount": 24
  }
}
```

**Error Responses:**

- `400 Bad Request`: Missing/invalid URL or non-HTML response content type.
- `502 Bad Gateway`: Domain lookup failure (`ENOTFOUND`).
- `504 Gateway Timeout`: Target server took longer than 8 seconds to respond.

---

## 3 Key Design Decisions & Reasoning

1. **Lightweight Cheerio Parser over Headless Browsers (Puppeteer/Playwright):**
   - _Reasoning:_ Cheerio parses static HTML strings directly in-memory without starting an entire browser instance. This keeps response times fast (<300ms) and keeps server memory usage minimal on free hosting tiers (e.g., Vercel/Render).

2. **Server-Side Scraping & CORS Avoidance:**
   - _Reasoning:_ Browsers enforce strict CORS policy when attempting to `fetch` third-party HTML directly. Performing the request server-side allows bypassing client CORS restrictions while controlling request timeouts, `User-Agent` headers, and content-type validation safely.

3. **Validation Strategy with Axios `validateStatus: () => true`:**
   - _Reasoning:_ Rather than treating non-200 HTTP codes (like 404 or 500) as backend request crashes, `validateStatus: () => true` lets Axios fetch the page body normally so the audit report can accurately capture and return the target site's HTTP status code in the audit report.

---

## Submission Credit Line

> Built for [Digital Heroes Training Task](https://digitalheroesco.com)
