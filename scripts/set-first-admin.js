#!/usr/bin/env node
/**
 * One-time script to set the first admin.
 * Usage: node scripts/set-first-admin.js <email>
 * Requires: dev server running (pnpm dev), SET_FIRST_ADMIN_SECRET and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
const fs = require("fs");
const http = require("http");

const envPath = require("path").join(__dirname, "..", ".env.local");
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .forEach((line) => {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    });
}

const email = process.argv[2] || process.env.FIRST_ADMIN_EMAIL || "";
if (!email) {
  console.error("Usage: node scripts/set-first-admin.js <email>");
  console.error("   or: FIRST_ADMIN_EMAIL=you@example.com node scripts/set-first-admin.js");
  process.exit(1);
}

const secret = env.SET_FIRST_ADMIN_SECRET;
if (!secret) {
  console.error("SET_FIRST_ADMIN_SECRET not found in .env.local");
  process.exit(1);
}

const port = process.env.PORT || 3000;
const data = JSON.stringify({ email });
const req = http.request(
  {
    hostname: "localhost",
    port,
    path: "/api/set-first-admin",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-set-first-admin-secret": secret,
      "Content-Length": Buffer.byteLength(data),
    },
  },
  (res) => {
    let body = "";
    res.on("data", (c) => (body += c));
    res.on("end", () => {
      try {
        const json = JSON.parse(body);
        if (json.success) {
          console.log(json.message);
        } else {
          console.error(json.error || body);
          process.exit(1);
        }
      } catch {
        console.log("Status:", res.statusCode);
        console.log(body);
        process.exit(res.statusCode >= 400 ? 1 : 0);
      }
    });
  }
);
req.on("error", (e) => {
  if (e.code === "ECONNREFUSED") {
    console.error("Cannot connect to localhost:" + port + ". Start the dev server first: pnpm dev");
  } else {
    console.error(e.message);
  }
  process.exit(1);
});
req.write(data);
req.end();
