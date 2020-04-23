package model

// CostPool is a cost pool
type CostPool struct {
	ID     string  `json:"id"`
	Name   string  `json:"name"`
	Budget float64 `json:"budget"`
}
