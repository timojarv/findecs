package models

import (
	"time"
)

// FileID is an id for a file
type FileID string

// User is a single user
type User struct {
	ID        string
	FirstName string
	LastName  string
	Email     string
	IBAN      string
	Phone     string
	Position  string
	Admin     bool
	Signature FileID
}

// Status is a status of claim or similar
type Status string

// Possible statuses
const (
	Created   Status = "created"
	Approved  Status = "approved"
	Fulfilled Status = "paid"
	Rejected  Status = "rejected"
)

// CostPool is a cost pool
type CostPool struct {
	ID   string
	Name string
}

// MoneySource is a source of money
type MoneySource string

// Different money sources
const (
	OwnAccount   MoneySource = "own_account"
	OtherAccount MoneySource = "other_account"
	Cash         MoneySource = "cash"
)

// Receipt is a single receipt
type Receipt struct {
	Date    time.Time
	Amount  float64
	Picture FileID
}

// Receipts is a collection of receipts
type Receipts []*Receipt

// CostClaim is a cost claim
type CostClaim struct {
	ID          string
	Description string
	Status      Status
	Comment     string
	Details     string
	AcceptedBy  string
	CostPool    CostPool
	MoneySource MoneySource
	Receipts    Receipts
	Author      *User
	CreatedAt   time.Time
	ModifiedAt  time.Time
}
