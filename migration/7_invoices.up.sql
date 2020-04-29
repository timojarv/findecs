CREATE TABLE purchase_invoices (
	id VARCHAR(64) PRIMARY KEY,
	sender VARCHAR(64) NOT NULL,
	description VARCHAR(255) NOT NULL,
	due_date DATE NOT NULL,
	status enum('created','approved','paid','rejected') NOT NULL DEFAULT 'created',
	created DATETIME DEFAULT CURRENT_TIMESTAMP,
	modified DATETIME ON UPDATE CURRENT_TIMESTAMP,
	details TEXT, -- When creating
	note TEXT, -- When accepting
	FOREIGN KEY (sender) REFERENCES contacts (id)
);

CREATE TABLE sales_invoices (
	id VARCHAR(64) PRIMARY KEY,
	running_number INT NOT NULL,
	recipient VARCHAR(64) NOT NULL,
	date DATE NOT NULL,
	due_date DATE NOT NULL,
	status enum('created', 'paid') NOT NULL DEFAULT 'created',
	details TEXT, -- When creating
	payer_reference TEXT,
	contact_person TEXT,
	FOREIGN KEY (recipient) REFERENCES contacts (id)
);

CREATE TABLE sales_invoice_rows (
	id VARCHAR(64) PRIMARY KEY,
	invoice VARCHAR(64) NOT NULL,
	cost_pool VARCHAR(64) NOT NULL,
	description VARCHAR(255) NOT NULL,
	amount DECIMAL(18, 2) NOT NULL,
	FOREIGN KEY (invoice) REFERENCES sales_invoices (id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE purchase_invoice_rows (
	id VARCHAR(64) PRIMARY KEY,
	invoice VARCHAR(64) NOT NULL,
	cost_pool VARCHAR(64) NOT NULL,
	description VARCHAR(255) NOT NULL,
	amount DECIMAL(18, 2) NOT NULL,
	FOREIGN KEY (invoice) REFERENCES purchase_invoices (id)
    ON DELETE CASCADE ON UPDATE CASCADE
);