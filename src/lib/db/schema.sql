CREATE TABLE wallets (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users NOT NULL, name text NOT NULL, type text CHECK (type IN ('bank','ewallet','cash','credit','saving')), balance numeric DEFAULT 0, icon text, color text, is_default boolean DEFAULT false, created_at timestamptz DEFAULT now());

CREATE TABLE transactions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users NOT NULL, wallet_id uuid REFERENCES wallets, to_wallet_id uuid REFERENCES wallets, type text CHECK (type IN ('expense','income','transfer')), amount numeric NOT NULL, category text, subcategory text, merchant text, note text, date date DEFAULT CURRENT_DATE, confidence numeric, metadata jsonb DEFAULT '{}', created_at timestamptz DEFAULT now());

CREATE TABLE goals (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users NOT NULL, name text, target_amount numeric, current_amount numeric DEFAULT 0, deadline date, created_at timestamptz DEFAULT now());

CREATE TABLE debts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users NOT NULL, person text, direction text CHECK (direction IN ('owe','owed')), amount numeric, paid_amount numeric DEFAULT 0, due_date date, note text, created_at timestamptz DEFAULT now());

CREATE TABLE split_bills (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users NOT NULL, description text, total numeric, data jsonb, created_at timestamptz DEFAULT now());

CREATE TABLE user_progress (user_id uuid PRIMARY KEY REFERENCES auth.users, xp integer DEFAULT 0, level integer DEFAULT 1, streak integer DEFAULT 0, last_transaction_date date, freeze_count integer DEFAULT 2, achievements jsonb DEFAULT '[]');

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_data" ON wallets FOR ALL USING (auth.uid() = user_id);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_data" ON transactions FOR ALL USING (auth.uid() = user_id);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_data" ON goals FOR ALL USING (auth.uid() = user_id);

ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_data" ON debts FOR ALL USING (auth.uid() = user_id);

ALTER TABLE split_bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_data" ON split_bills FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_data" ON user_progress FOR ALL USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_wallet_balance() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.type='expense' THEN UPDATE wallets SET balance=balance-NEW.amount WHERE id=NEW.wallet_id;
  ELSIF NEW.type='income' THEN UPDATE wallets SET balance=balance+NEW.amount WHERE id=NEW.wallet_id;
  ELSIF NEW.type='transfer' THEN
    UPDATE wallets SET balance=balance-NEW.amount WHERE id=NEW.wallet_id;
    UPDATE wallets SET balance=balance+NEW.amount WHERE id=NEW.to_wallet_id;
  END IF; RETURN NEW;
END; $$;
CREATE TRIGGER trg_balance AFTER INSERT ON transactions FOR EACH ROW EXECUTE FUNCTION update_wallet_balance();
