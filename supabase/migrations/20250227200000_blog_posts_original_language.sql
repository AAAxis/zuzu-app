-- Ensure original_language exists (if blog_posts was created without it)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS original_language TEXT DEFAULT 'en';
