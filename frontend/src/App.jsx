import React, { useState } from "react";

function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
  ).replace(/\/$/, "");

  const handleAudit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to audit the provided URL.");
      }

      setReport(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-4 md:p-8">
      {/* Container */}
      <div className="max-w-3xl mx-auto w-full flex-1">
        {/* Header */}
        <header className="text-center my-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Web Audit Tool
          </h1>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">
            Analyze any web page for basic SEO, structure, and performance
            metrics.
          </p>
        </header>

        {/* Input Form */}
        <form
          onSubmit={handleAudit}
          className="flex flex-col sm:flex-row gap-3 mb-8"
        >
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            required
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-800 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {loading ? "Auditing..." : "Audit URL"}
          </button>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8">
            <h3 className="font-semibold text-red-800 flex items-center gap-2">
              ⚠️ Audit Failed
            </h3>
            <p className="text-sm mt-1 text-red-600">{error}</p>
          </div>
        )}

        {/* Audit Results Report */}
        {report && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-8 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Audit Results
              </h2>
              <div className="bg-slate-100 p-3 rounded-md text-sm break-all">
                <span className="font-semibold text-slate-600">URL: </span>
                <a
                  href={report.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  {report.url}
                </a>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  HTTP Status
                </span>
                <span
                  className={`text-lg font-bold ${
                    report.statusCode < 400
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {report.statusCode}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Response
                </span>
                <span className="text-lg font-bold text-slate-800">
                  {report.responseTimeMs} ms
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  H1 Count
                </span>
                <span className="text-lg font-bold text-slate-800">
                  {report.h1Count}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Missing Alt
                </span>
                <span
                  className={`text-lg font-bold ${
                    report.imagesMissingAlt > 0
                      ? "text-amber-600"
                      : "text-slate-800"
                  }`}
                >
                  {report.imagesMissingAlt}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center col-span-2 sm:col-span-1">
                <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Words
                </span>
                <span className="text-lg font-bold text-slate-800">
                  ~{report.wordCount}
                </span>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-4 pt-2">
              <div>
                <span className="block text-sm font-semibold text-slate-700">
                  Page Title
                </span>
                <p className="mt-1 p-3 bg-slate-50 rounded-md text-sm text-slate-700 border border-slate-200">
                  {report.title}
                </p>
              </div>

              <div>
                <span className="block text-sm font-semibold text-slate-700">
                  Meta Description
                </span>
                <p className="mt-1 p-3 bg-slate-50 rounded-md text-sm text-slate-700 border border-slate-200">
                  {report.metaDescription}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mandatory Credit Line Footer */}
      <footer className="text-center py-6 border-t border-slate-200 text-xs sm:text-sm text-slate-500">
        <p>
          Built for{" "}
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-medium"
          >
            Digital Heroes Training Task
          </a>{" "}
          by Sahil Bhagwat
        </p>
      </footer>
    </div>
  );
}

export default App;
