
-- Add payment gateway fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_id text,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS customer_email text;

-- Create index for webhook lookups by payment_id
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON public.orders(payment_id);

-- Create index for payment_status queries  
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
