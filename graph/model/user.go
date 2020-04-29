package model

type User struct {
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	Email        string   `json:"email"`
	Signature    *string  `json:"signature"`
	Role         UserRole `json:"role"`
	PasswordHash string   `db:"pw_hash"`
}
