CREATE TABLE cost_claim_events (
    id VARCHAR(64) PRIMARY KEY,
    cost_claim VARCHAR(64) NOT NULL,
    status ENUM('created', 'approved', 'rejected', 'paid') NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    comment TEXT,
    author VARCHAR(64) NOT NULL,
    FOREIGN KEY (author) REFERENCES users (id),
    FOREIGN KEY (cost_claim) REFERENCES cost_claims (id)
    ON DELETE CASCADE ON UPDATE CASCADE
); 