
-- Messages table: supports direct (recipient_id set) and broadcast (recipient_id null)
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  recipient_id UUID DEFAULT NULL, -- null = broadcast to all users
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage all messages"
ON public.messages
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Users can view messages sent TO them or broadcast messages
CREATE POLICY "Users can view their messages"
ON public.messages
FOR SELECT
USING (
  auth.uid() = recipient_id
  OR recipient_id IS NULL
  OR auth.uid() = sender_id
);

-- Users can send messages (replies to admin)
CREATE POLICY "Users can send messages"
ON public.messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Users can mark their own received messages as read
CREATE POLICY "Users can update read status"
ON public.messages
FOR UPDATE
USING (auth.uid() = recipient_id OR (recipient_id IS NULL AND auth.uid() != sender_id))
WITH CHECK (auth.uid() = recipient_id OR (recipient_id IS NULL AND auth.uid() != sender_id));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Index for fast lookups
CREATE INDEX idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_created ON public.messages(created_at DESC);
