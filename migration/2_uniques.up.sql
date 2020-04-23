ALTER TABLE users ADD UNIQUE(email);
ALTER TABLE cost_pools ADD UNIQUE(name);
ALTER TABLE receipts ADD UNIQUE(attachment);