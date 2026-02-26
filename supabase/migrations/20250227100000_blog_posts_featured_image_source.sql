-- Add open-source image attribution link (e.g. Pixabay page URL)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS featured_image_source TEXT DEFAULT '';
