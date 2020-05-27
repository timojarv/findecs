CREATE INDEX cost_claim_year_idx ON cost_claims (year);

ALTER TABLE purchase_invoices ADD COLUMN year INT DEFAULT (YEAR(CURRENT_TIMESTAMP));
CREATE INDEX purchase_invoice_year_idx ON purchase_invoices (year);

ALTER TABLE sales_invoices ADD COLUMN created DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE sales_invoices ADD COLUMN modified DATETIME ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE sales_invoices ADD COLUMN year INT DEFAULT (YEAR(CURRENT_TIMESTAMP));
CREATE INDEX sales_invoice_year_idx ON sales_invoices (year);