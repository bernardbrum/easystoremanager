ALTER TABLE public.generated_arts
  ADD COLUMN IF NOT EXISTS text_scale numeric NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS image_scale numeric NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS text_outline boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS image_border boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS image_border_color text NOT NULL DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS image_border_width numeric NOT NULL DEFAULT 4;

ALTER TABLE public.generated_arts ALTER COLUMN image_shape DROP NOT NULL;