import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { supabaseUrl } from "@/lib/supabase"

const BUCKET_NAME = "training-media"

/**
 * One-time setup: create the storage bucket required for Gallery uploads.
 *
 * 1. Add to .env.local (optional but recommended):
 *    SETUP_STORAGE_SECRET=your-secret-string
 *
 * 2. Run once (from your machine or CI):
 *    curl -X POST https://your-app.vercel.app/api/setup-storage \
 *      -H "x-setup-storage-secret: your-secret-string"
 *
 * Or create the bucket manually in Supabase Dashboard:
 *   Storage → New bucket → Name: "training-media" → Public: ON → Create.
 *   Then add a policy: "Allow authenticated users to upload" (INSERT) for bucket training-media.
 */
export async function POST(request: Request) {
  const secret = process.env.SETUP_STORAGE_SECRET ?? process.env.SET_FIRST_ADMIN_SECRET
  if (secret) {
    const headerSecret = request.headers.get("x-setup-storage-secret")
    if (headerSecret !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not set" },
      { status: 500 }
    )
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: buckets } = await adminClient.storage.listBuckets()
  const exists = buckets?.some((b) => b.name === BUCKET_NAME)

  if (exists) {
    return NextResponse.json({
      success: true,
      message: `Bucket "${BUCKET_NAME}" already exists.`,
    })
  }

  const { error } = await adminClient.storage.createBucket(BUCKET_NAME, {
    public: true,
    fileSizeLimit: "50MB",
    allowedMimeTypes: ["image/*", "video/*"],
  })

  if (error) {
    return NextResponse.json(
      { error: error.message, hint: "Create the bucket manually in Supabase Dashboard → Storage → New bucket" },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    message: `Bucket "${BUCKET_NAME}" created. If uploads still fail, add a Storage policy in Supabase: Storage → ${BUCKET_NAME} → Policies → New policy → "Allow authenticated users to INSERT".`,
  })
}
