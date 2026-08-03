ALTER TABLE public.generated_arts
  ADD COLUMN IF NOT EXISTS text_align text NOT NULL DEFAULT 'center',
  ADD COLUMN IF NOT EXISTS text_color text NOT NULL DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS format_shape text NOT NULL DEFAULT 'vertical',
  ADD COLUMN IF NOT EXISTS image_shape text NOT NULL DEFAULT 'rounded';

ALTER TABLE public.generated_arts
  ADD CONSTRAINT generated_arts_text_align_check CHECK (text_align IN ('left','center','right')),
  ADD CONSTRAINT generated_arts_format_shape_check CHECK (format_shape IN ('square','vertical','story','landscape')),
  ADD CONSTRAINT generated_arts_image_shape_check CHECK (image_shape IN ('square','rounded','circle'));