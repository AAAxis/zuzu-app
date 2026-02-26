#!/usr/bin/env node
/**
 * Set the first admin by updating Supabase Auth app_metadata.
 * No dev server needed — uses SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL from .env.local.
 *
 * Usage: node scripts/set-first-admin.js <email>
 */
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env.local");
if (!fs.existsSync(envPath)) {
  console.error(".env.local not found");
  process.exit(1);
}

const env = {};
fs.readFileSync(envPath, "utf8")
  .split("\n")
  .forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  });

const email = (process.argv[2] || process.env.FIRST_ADMIN_EMAIL || "").trim().toLowerCase();
if (!email) {
  console.error("Usage: node scripts/set-first-admin.js <email>");
  process.exit(1);
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const { createClient } = require("@supabase/supabase-js");
const adminClient = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("Setting first admin for", email + "...");

  const { data: listData, error: listError } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listError) {
    console.error("Supabase error:", listError.message);
    process.exit(1);
  }

  const admins = listData.users.filter((u) => u.app_metadata?.role === "admin");
  if (admins.length > 0) {
    console.error("An admin already exists. Add more via Supabase Dashboard → Authentication → Users → app_metadata.role = admin");
    process.exit(1);
  }

  const user = listData.users.find((u) => (u.email || "").toLowerCase() === email);
  if (!user) {
    console.error("No user with email", email);
    console.error("Sign up first at /login with that email, then run this script again.");
    process.exit(1);
  }

  const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
    app_metadata: { ...user.app_metadata, role: "admin" },
  });

  if (updateError) {
    console.error("Update failed:", updateError.message);
    process.exit(1);
  }

  console.log("Done. " + email + " is now an admin. Log in at /login to access the dashboard.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
