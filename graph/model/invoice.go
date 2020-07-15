package model

type PurchaseInvoice struct {
	ID           string  `json:"id"`
	AuthorID     string  `db:"author"`
	SenderID     string  `json:"sender" db:"sender"`
	Description  string  `json:"description"`
	DueDate      string  `json:"dueDate" db:"due_date"`
	Status       Status  `json:"status"`
	ApprovedByID *string `db:"approved_by"`
	Created      string  `json:"created"`
	Modified     *string `json:"modified"`
	Details      *string `json:"details"`
	Note         *string `json:"note"`
	SenderName   *string `db:"sender_name"`
	Total        float64 `json:"total" db:"total"`
}

type SalesInvoice struct {
	ID                  string  `json:"id"`
	AuthorID            string  `db:"author"`
	RunningNumberSuffix int     `db:"running_number"`
	RecipientID         string  `json:"recipient" db:"recipient"`
	Date                string  `json:"date"`
	DueDate             string  `json:"dueDate" db:"due_date"`
	Status              Status  `json:"status"`
	Created             string  `json:"created"`
	Modified            *string `json:"modified"`
	Details             *string `json:"details"`
	PayerReference      *string `json:"payerReference" db:"payer_reference"`
	ContactPerson       *string `json:"contactPerson" db:"contact_person"`
	RecipientName       *string `db:"recipient_name"`
	Total               float64 `json:"total" db:"total"`
}

type InvoiceRow struct {
	ID          string  `json:"id"`
	InvoiceID   string  `json:"invoice" db:"invoice"`
	CostPoolID  string  `json:"costPool" db:"cost_pool"`
	Description string  `json:"description"`
	Amount      float64 `json:"amount"`
}

type SalesInvoiceRow struct {
	InvoiceRow
}

type PurchaseInvoiceRow struct {
	InvoiceRow
}
