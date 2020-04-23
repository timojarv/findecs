CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    signature VARCHAR(64),
    pw_hash VARCHAR(64) NOT NULL
);

CREATE TABLE cost_pools (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(64) NOT NULL
);

CREATE TABLE cost_claims (
    id VARCHAR(64) PRIMARY KEY,
    running_number INT NOT NULL,
    description TEXT NOT NULL,
    author VARCHAR(64) NOT NULL,
    cost_pool VARCHAR(64) NOT NULL,
    status ENUM('created', 'approved', 'rejected', 'paid') NOT NULL,
    status_reason TEXT,
    source_of_money ENUM('ownAccount', 'otherAccount', 'cash') NOT NULL,
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME ON UPDATE CURRENT_TIMESTAMP,
    year INT DEFAULT YEAR(CURRENT_TIMESTAMP),
    accepted_by VARCHAR(64),
    FOREIGN KEY (author) REFERENCES users (id),
    FOREIGN KEY (accepted_by) REFERENCES users (id),
    FOREIGN KEY (cost_pool) REFERENCES cost_pools (id)
);

CREATE TABLE receipts (
    id VARCHAR(64) PRIMARY KEY,
    date DATETIME NOT NULL,
    amount FLOAT NOT NULL,
    attachment VARCHAR(256) NOT NULL,
    cost_claim VARCHAR(64) NOT NULL,
    FOREIGN KEY (cost_claim) REFERENCES cost_claims (id)
);
