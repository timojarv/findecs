package graph

import (
	"github.com/jmoiron/sqlx"
	"github.com/teris-io/shortid"
)

//go:generate go run github.com/99designs/gqlgen generate

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

// Resolver is the root resolver
type Resolver struct {
	DB      *sqlx.DB
	ShortID *shortid.Shortid
	JWTKey  []byte
}
