-- seed.sql
-- Database schema and seed data for subscription cancellation flow
-- Hybrid approach: Core business fields as individual columns + detailed data as JSONB

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table with offer tracking
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  monthly_price INTEGER NOT NULL, -- Price in USD cents
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_cancellation', 'cancelled')),
  
  -- Offer tracking fields
  offer_percent INTEGER DEFAULT 50 CHECK (offer_percent >= 0 AND offer_percent <= 100),
  offer_accepted BOOLEAN DEFAULT FALSE,
  offer_accepted_at TIMESTAMP WITH TIME ZONE,
  offer_declined_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cancellations table with hybrid approach
CREATE TABLE IF NOT EXISTS cancellations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  downsell_variant TEXT NOT NULL CHECK (downsell_variant IN ('A', 'B')),
  
  -- Core Business Fields (Individual Columns)
  got_job TEXT CHECK (got_job IN ('yes', 'no')),
  cancel_reason TEXT CHECK (cancel_reason IN ('too-expensive', 'platform-not-helpful', 'not-enough-jobs', 'decided-not-to-move', 'other')),
  company_visa_support TEXT CHECK (company_visa_support IN ('yes', 'no')),
  accepted_downsell BOOLEAN DEFAULT FALSE,
  final_decision TEXT CHECK (final_decision IN ('cancelled', 'kept')),
  
  -- Detailed Responses (JSONB for flexibility)
  flow_data JSONB,
  
  -- Flow Progress
  current_step INTEGER DEFAULT 1,
  completed BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Business Logic Constraints
  CONSTRAINT check_visa_support_logic CHECK (
    (got_job = 'yes' AND company_visa_support IS NOT NULL) OR
    (got_job = 'no' AND company_visa_support IS NULL)
  ),
  
  CONSTRAINT check_final_decision_logic CHECK (
    (completed = true AND final_decision IS NOT NULL) OR
    (completed = false AND final_decision IS NULL)
  )
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cancellations ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Cancellation policies - allow service role operations
CREATE POLICY "Service role can manage cancellations" ON cancellations
  FOR ALL USING (true);

-- Alternative: More restrictive policy for production
-- CREATE POLICY "Users can insert own cancellations" ON cancellations
--   FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- CREATE POLICY "Users can view own cancellations" ON cancellations
--   FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- CREATE POLICY "Users can update own cancellations" ON cancellations
--   FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Performance indexes
CREATE INDEX idx_cancellations_user_subscription ON cancellations(user_id, subscription_id);
CREATE INDEX idx_cancellations_final_decision ON cancellations(final_decision);
CREATE INDEX idx_cancellations_downsell_variant ON cancellations(downsell_variant);
CREATE INDEX idx_cancellations_got_job ON cancellations(got_job);
CREATE INDEX idx_cancellations_company_visa_support ON cancellations(company_visa_support) WHERE company_visa_support IS NOT NULL;
CREATE INDEX idx_cancellations_completed ON cancellations(completed);

-- Add unique constraint for upsert operations
ALTER TABLE cancellations ADD CONSTRAINT unique_user_subscription UNIQUE (user_id, subscription_id);

CREATE INDEX idx_subscriptions_offer_status ON subscriptions(offer_accepted, status);
CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status);

-- Seed data
INSERT INTO users (id, email) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'user1@example.com'),
  ('550e8400-e29b-41d4-a716-446655440002', 'user2@example.com'),
  ('550e8400-e29b-41d4-a716-446655440003', 'user3@example.com')
ON CONFLICT (email) DO NOTHING;

-- Seed subscriptions with offer tracking
INSERT INTO subscriptions (id, user_id, monthly_price, status, offer_percent) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 2500, 'active', 0), -- $25.00, $10 off
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 2900, 'active', 0), -- $29.00, $10 off
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 2500, 'active', 0)  -- $25.00, $10 off
ON CONFLICT (id) DO NOTHING; 