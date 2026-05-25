-- Create the expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    photo_url TEXT,
    spend_by TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT false,
    edit_reason TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the expense_history table
CREATE TABLE expense_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    photo_url TEXT,
    spend_by TEXT NOT NULL,
    edit_reason TEXT,
    date DATE,
    version_number INTEGER NOT NULL,
    edited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) - we will allow public access for simplicity as requested, but in a real app this would be restricted
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to expenses" ON expenses FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to expenses" ON expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to expenses" ON expenses FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to expense_history" ON expense_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to expense_history" ON expense_history FOR INSERT WITH CHECK (true);

-- Create storage bucket for expense receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('expense_receipts', 'expense_receipts', true);

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'expense_receipts');
CREATE POLICY "Public Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'expense_receipts');
CREATE POLICY "Public Updates" ON storage.objects FOR UPDATE USING (bucket_id = 'expense_receipts');
CREATE POLICY "Public Deletes" ON storage.objects FOR DELETE USING (bucket_id = 'expense_receipts');
