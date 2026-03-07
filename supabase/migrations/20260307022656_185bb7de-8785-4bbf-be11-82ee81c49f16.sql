
-- Allow authors to also insert/update/delete categories
CREATE POLICY "Authors can manage categories" ON public.categories
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Allow authors to also insert/update/delete tags  
CREATE POLICY "Authors can manage tags" ON public.tags
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Create storage bucket for post covers
INSERT INTO storage.buckets (id, name, public) VALUES ('post-covers', 'post-covers', true);

-- Storage policies
CREATE POLICY "Anyone can view post covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-covers');

CREATE POLICY "Authenticated users can upload post covers" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'post-covers' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own post covers" ON storage.objects
  FOR UPDATE USING (bucket_id = 'post-covers' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own post covers" ON storage.objects
  FOR DELETE USING (bucket_id = 'post-covers' AND auth.uid() IS NOT NULL);
