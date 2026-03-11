-- Create table for KSEI Investor Classifications
CREATE TABLE IF NOT EXISTS "public"."saham_investor_types" (
    code text PRIMARY KEY,
    type text NOT NULL,
    classification text NOT NULL,
    rationale text NOT NULL,
    active_holdings text NOT NULL
);

-- Turn on RLS
ALTER TABLE "public"."saham_investor_types" ENABLE ROW LEVEL SECURITY;

-- Allow read access
CREATE POLICY "Enable read access for all users" ON "public"."saham_investor_types"
FOR SELECT USING (true);

-- Insert Official KSEI Types
INSERT INTO "public"."saham_investor_types" (code, type, classification, rationale, active_holdings) VALUES
('CP', 'Corporate', 'STRATEGIC', 'Companies holding stakes for operational, rather than purely financial, reasons.', '4,642'),
('IB', 'Investment Banking', 'STRATEGIC', 'Proprietary trading desks or long-term holdings by banks.', '10,211'),
('IS', 'Insurance', 'STRATEGIC', 'Holdings backing insurance liabilities, often long-term.', '3,300'),
('ID', 'Individual', 'STRATEGIC', 'Often founders, families, or key executives with significant control or influence.', '6,647'),
('PF', 'Pension Fund', 'FREE FLOAT', 'Portfolio investments held for beneficiaries, trading actively based on valuations.', '3,281'),
('MF', 'Mutual Fund', 'FREE FLOAT', 'Pooled investments traded actively by managers, not seeking control.', '32,900'),
('SC', 'Securities Company', 'FREE FLOAT', 'Brokerage holdings, market making, or client facilitation items.', '2,050'),
('FD', 'Foundation', 'FREE FLOAT', 'Endowments managing portfolios for financial returns to fund operations.', '3,005')
ON CONFLICT (code) DO NOTHING;
