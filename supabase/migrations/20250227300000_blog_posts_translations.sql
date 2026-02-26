-- Ensure translations column exists (JSONB: { he: { title, excerpt, content }, en: { ... } })
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}';
