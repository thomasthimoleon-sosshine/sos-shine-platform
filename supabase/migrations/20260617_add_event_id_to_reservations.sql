-- Link reservations to physical_events for per-event tracking
ALTER TABLE public.ceremonie_reservations
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.physical_events(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_ceremonie_event_id ON public.ceremonie_reservations(event_id);

NOTIFY pgrst, 'reload schema';
