-- TAB 5: INVESTOR WATCH (Automated Tracking)
CREATE TABLE IF NOT EXISTS "public"."saham_tab_investor_watch" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "type" TEXT NOT NULL CHECK (type IN ('LKH', 'Fund')),
    "investor_name" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "percentage" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY ("id"),
    UNIQUE ("investor_name", "ticker")
);

-- Enable RLS
ALTER TABLE "public"."saham_tab_investor_watch" ENABLE ROW LEVEL SECURITY;

-- Unrestricted read access for everyone
CREATE POLICY "Enable read access for all users" ON "public"."saham_tab_investor_watch" FOR SELECT USING (true);

-- Grant select to anon/authenticated
GRANT SELECT ON "public"."saham_tab_investor_watch" TO anon, authenticated;
