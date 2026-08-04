ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_rating_range CHECK (rating >= 1 AND rating <= 5),
  ADD CONSTRAINT reviews_feedback_length CHECK (char_length(feedback) <= 1000);

DROP POLICY IF EXISTS "Anyone can submit a review" ON public.reviews;

CREATE POLICY "Anyone can submit a review"
ON public.reviews
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.stores s WHERE s.id = reviews.store_id)
  AND rating BETWEEN 1 AND 5
  AND char_length(feedback) <= 1000
);