package model

// CostClaim is a single cost claim
type CostClaim struct {
	ID            string        `json:"id"`
	RunningNumber int           `json:"runningNumber" db:"running_number"`
	Description   string        `json:"description"`
	AuthorID      string        `json:"author" db:"author"`
	CostPoolID    string        `json:"costPool" db:"cost_pool"`
	Status        Status        `json:"status"`
	Details       *string       `json:"details"`
	Created       string        `json:"created"`
	Modified      *string       `json:"modified"`
	ApprovedByID  *string       `json:"approvedBy" db:"approved_by"`
	SourceOfMoney SourceOfMoney `json:"sourceOfMoney" db:"source_of_money"`
	OtherIBAN     *string       `json:"otherIban" db:"other_iban"`
}

// CostClaimInput is the input type for cost claims
type CostClaimInput struct {
	Description   string        `json:"description"`
	CostPool      string        `json:"costPool"`
	Details       *string       `json:"details"`
	SourceOfMoney SourceOfMoney `json:"sourceOfMoney"`
	OtherIBAN     *string       `json:"otherIban"`
}
