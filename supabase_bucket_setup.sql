BEGIN;

-- Create the public bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('heeman-bucket', 'heeman-bucket', true)
ON CONFLICT (id) DO NOTHING;

-- 1. Policy to allow public reads (everyone can view the images)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'heeman-bucket' );

-- 2. Policy to allow uploads (inserts)
CREATE POLICY "Allow Uploads"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'heeman-bucket' );

-- 3. Policy to allow updates to existing files
CREATE POLICY "Allow Updates"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'heeman-bucket' );

-- 4. Policy to allow deletions
CREATE POLICY "Allow Deletes"
ON storage.objects FOR DELETE
USING ( bucket_id = 'heeman-bucket' );

COMMIT;
