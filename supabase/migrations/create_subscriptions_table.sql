/*
# Create subscriptions table

## Purpose
Tracks all payment transactions per user. A user can purchase multiple
subscription tiers and switch between them. This table is the source of
truth for which plans a user has ever paid for.

## Tables

### subscriptions
- id: UUID primary key
- user_id: references auth.users (DEFAULT auth.uid())
- tier: which plan was purchased ('premium' | 'ai')
- transaction_id: unique simulated transaction reference
- amount: amount charged in FCFA
- payment_method: 'mtn' | 'orange' | 'paypal' | 'card'
- payment_details: JSONB with masked payment info (last4 digits etc.)
- status: 'success' | 'pending' | 'failed'
- paid_at: timestamp of successful payment

## Security
- RLS enabled, users can only read/write their own subscriptions.
*/

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  tier text NOT NULL CHECK (tier IN ('premium', 'ai')),
  transaction_id text NOT NULL,
  amount integer NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('mtn', 'orange', 'paypal', 'card')),
  payment_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'pending', 'failed')),
  paid_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_tier_idx ON subscriptions(tier);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_subscriptions" ON subscriptions;
CREATE POLICY "select_own_subscriptions" ON subscriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_subscriptions" ON subscriptions;
CREATE POLICY "insert_own_subscriptions" ON subscriptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_subscriptions" ON subscriptions;
CREATE POLICY "update_own_subscriptions" ON subscriptions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_subscriptions" ON subscriptions;
CREATE POLICY "delete_own_subscriptions" ON subscriptions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
