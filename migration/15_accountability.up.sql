ALTER TABLE purchase_invoices ADD COLUMN author VARCHAR(64) NOT NULL;
ALTER TABLE purchase_invoices ADD FOREIGN KEY (author) REFERENCES users (id);

ALTER TABLE purchase_invoices ADD COLUMN approved_by VARCHAR(64);
ALTER TABLE purchase_invoices ADD FOREIGN KEY (approved_by) REFERENCES users (id);

ALTER TABLE sales_invoices ADD COLUMN author VARCHAR(64) NOT NULL;
ALTER TABLE sales_invoices ADD FOREIGN KEY (author) REFERENCES users (id);
