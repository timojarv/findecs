package model

type Event struct {
	ID        string  `json:"id"`
	Status    Status  `json:"status"`
	Timestamp string  `json:"timestamp"`
	Comment   *string `json:"comment"`
	AuthorID  string  `json:"author" db:"author"`
}
