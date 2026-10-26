import { useState } from "react";
import { useJwtContext } from "../context/JwtContext";

export default function SnippetGeneratorModal({ token, isOpen, onClose }) {
  const { addToast } = useJwtContext();
  const [activeTab, setActiveTab] = useState("curl");
  const [apiUrl, setApiUrl] = useState("https://api.yourdomain.com/v1/user");
  const [httpMethod, setHttpMethod] = useState("GET");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const cleanToken = (token || "").trim();

  const snippets = {
    curl: {
      title: "cURL Terminal",
      filename: "request.sh",
      code: `curl -X ${httpMethod} "${apiUrl}" \\
  -H "Authorization: Bearer ${cleanToken}" \\
  -H "Accept: application/json"${httpMethod !== "GET" ? ' \\\n  -H "Content-Type: application/json" \\\n  -d \'{"sample": "data"}\'' : ""}`,
    },
    postman: {
      title: "Postman Variable",
      filename: "postman_env.json",
      code: `// Set in Postman Pre-request Script or Environment Variables:
pm.environment.set("jwt_token", "${cleanToken}");

// Or in Request Headers:
// Key: Authorization
// Value: Bearer {{jwt_token}}`,
    },
    fetch: {
      title: "JavaScript (Fetch API)",
      filename: "api.js",
      code: `async function fetchProtectedResource() {
  const response = await fetch("${apiUrl}", {
    method: "${httpMethod}",
    headers: {
      "Authorization": "Bearer ${cleanToken}",
      "Accept": "application/json"${httpMethod !== "GET" ? ',\n      "Content-Type": "application/json"' : ""}
    }${httpMethod !== "GET" ? ',\n    body: JSON.stringify({ sample: "data" })' : ""}
  });

  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }
  const data = await response.json();
  console.log("Response:", data);
  return data;
}`,
    },
    axios: {
      title: "Node.js / Axios",
      filename: "request.ts",
      code: `import axios from 'axios';

const api = axios.create({
  baseURL: '${apiUrl}',
  headers: {
    Authorization: \`Bearer ${cleanToken}\`,
  },
});

export async function getResource() {
  const response = await api.${httpMethod.toLowerCase()}('');
  return response.data;
}`,
    },
    python: {
      title: "Python (Requests / HTTPX)",
      filename: "client.py",
      code: `import requests

url = "${apiUrl}"
headers = {
    "Authorization": "Bearer ${cleanToken}",
    "Accept": "application/json"
}

response = requests.${httpMethod.toLowerCase()}(
    url,
    headers=headers${httpMethod !== "GET" ? ',\n    json={"sample": "data"}' : ""}
)

if response.status_code == 200:
    print("Success:", response.json())
else:
    print(f"Error {response.status_code}:", response.text)`,
    },
    go: {
      title: "Go (net/http)",
      filename: "main.go",
      code: `package main

import (
    "fmt"
    "io"
    "net/http"
)

func main() {
    client := &http.Client{}
    req, err := http.NewRequest("${httpMethod}", "${apiUrl}", nil)
    if err != nil {
        panic(err)
    }

    req.Header.Set("Authorization", "Bearer ${cleanToken}")
    req.Header.Set("Accept", "application/json")

    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := io.ReadAll(resp.Body)
    fmt.Printf("Status: %s\\nResponse: %s\\n", resp.Status, body)
}`,
    },
  };

  const currentSnippet = snippets[activeTab] || snippets.curl;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    if (addToast) addToast(`${currentSnippet.title} snippet copied ✓`, "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-up">
      <div className="w-full max-w-3xl glass-panel bg-white/95 rounded-3xl border border-main shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-main bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl badge-indigo-outline flex items-center justify-center text-primary-color font-bold shadow-xs">
              🚀
            </div>
            <div>
              <h3 className="font-display-custom font-bold text-base text-main">
                Developer Integration Snippet Generator
              </h3>
              <p className="text-[11px] text-muted-custom font-mono-custom">
                Export bearer token as ready-to-run API calls and SDK templates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-main flex items-center justify-center text-muted-custom hover:text-main hover:bg-slate-100 transition-all cursor-pointer font-bold"
          >
            ×
          </button>
        </div>

        {/* Configuration Bar: URL and Method */}
        <div className="p-4 sm:p-5 bg-secondary-custom/50 border-b border-main space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
            {/* Method Select */}
            <select
              value={httpMethod}
              onChange={(e) => setHttpMethod(e.target.value)}
              className="px-3 py-2 rounded-xl border border-main bg-white font-mono-custom text-xs font-bold text-primary-color shadow-xs focus:ring-2 focus:ring-primary-color"
            >
              {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {/* Target URL Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.yourdomain.com/v1/resource"
                className="w-full px-3.5 py-2 rounded-xl border border-main bg-white font-mono-custom text-xs text-main shadow-xs focus:ring-2 focus:ring-primary-color"
              />
            </div>
          </div>

          {/* Language Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {Object.keys(snippets).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider font-mono-custom transition-all cursor-pointer whitespace-nowrap ${activeTab === key
                  ? "badge-indigo-outline shadow-xs text-primary-color font-semibold"
                  : "text-muted-custom hover:text-main hover:bg-white/60"
                  }`}
              >
                {key === "curl" ? "cURL" : key === "postman" ? "Postman" : key}
              </button>
            ))}
          </div>
        </div>

        {/* Code Preview Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner font-mono-custom text-xs">
            {/* Top Editor Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-[11px]">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{currentSnippet.filename}</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer text-[10px] uppercase font-bold"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>{copied ? "Copied ✓" : "Copy"}</span>
              </button>
            </div>

            {/* Code Content */}
            <pre className="p-4 text-slate-200 overflow-x-auto text-[11px] leading-relaxed whitespace-pre selection:bg-indigo-500/30">
              <code>{currentSnippet.code}</code>
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-main bg-slate-50/70 flex items-center justify-between text-xs">
          <span className="text-muted-custom font-mono-custom text-[11px]">
            Bearer token securely injected client-side
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="px-5 py-2 rounded-xl btn-primary-custom font-bold text-xs uppercase tracking-wider cursor-pointer shadow-sm hover:scale-[1.02] transition-all"
            >
              {copied ? "Copied to Clipboard ✓" : "Copy Snippet"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-main text-muted-custom hover:text-main text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
