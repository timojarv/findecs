package session

import (
	"context"
	"database/sql"
	"net/http"
	"time"

	"github.com/alexedwards/scs/mysqlstore"
	"github.com/alexedwards/scs/v2"
)

var sessionManager *scs.SessionManager

var key = "findecs-user"

func init() {
	sessionManager = scs.New()
	sessionManager.Lifetime = 24 * time.Hour
	sessionManager.Cookie.HttpOnly = false
}

// Middleware is the session middleware
func Middleware(db *sql.DB) func(http.Handler) http.Handler {
	sessionManager.Store = mysqlstore.New(db)
	return func(handler http.Handler) http.Handler {
		return sessionManager.LoadAndSave(handler)
	}
}

// Set sets the session user
func Set(ctx context.Context, userID string) {
	sessionManager.Put(ctx, key, userID)
}

// Get retrieves the session user
func Get(ctx context.Context) *string {
	user := sessionManager.GetString(ctx, key)
	if user == "" {
		return nil
	}

	return &user
}

// Clear clears the session
func Clear(ctx context.Context) error {
	return sessionManager.Clear(ctx)
}
