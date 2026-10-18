/*
# Create public short links

1. New Tables
- `short_links` stores the original destination URL, the public slug, click count, and creation time.
- `id` is the stable UUID primary key.
- `slug` is the unique path users share.
- `target_url` is the validated destination URL.
- `clicks` records redirect usage.
- `created_at` records when the link was created.

2. Security
- Row level security is enabled.
- This is an intentionally shared, no-sign-in shortener: anonymous and authenticated visitors may read, create, update, and delete links through the public app.
- The unique slug constraint prevents collisions.

3. Important Notes
- No user accounts are added; the current product has no sign-in flow.
- Redirect lookup is performed by slug and the destination is validated again in the browser before navigation.
*/

CREATE TABLE IF NOT EXISTS public.short_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  target_url text NOT NULL,
  clicks integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read short links" ON public.short_links;
CREATE POLICY "Public can read short links" ON public.short_links
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public can create short links" ON public.short_links;
CREATE POLICY "Public can create short links" ON public.short_links
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update short links" ON public.short_links;
CREATE POLICY "Public can update short links" ON public.short_links
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete short links" ON public.short_links;
CREATE POLICY "Public can delete short links" ON public.short_links
  FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS short_links_slug_idx ON public.short_links (slug);
