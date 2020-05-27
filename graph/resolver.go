package graph

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
	log "github.com/sirupsen/logrus"
	"github.com/teris-io/shortid"
	"github.com/timojarv/findecs/graph/model"
	"github.com/timojarv/findecs/storage"
	"golang.org/x/crypto/bcrypt"
)

//go:generate go run github.com/99designs/gqlgen generate

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

// Resolver is the root resolver
type Resolver struct {
	DB            *sqlx.DB
	ShortID       *shortid.Shortid
	ServerVersion string
}

var errNotAuthenticated = errors.New("not authenticated")

func (r *Resolver) createReceipt(ctx context.Context, receipt *model.ReceiptInput, costClaimID string, tx *sqlx.Tx) error {
	// Form a file name for the attachment
	newReceipt := model.Receipt{
		ID:     r.ShortID.MustGenerate(),
		Amount: receipt.Amount,
		Date:   receipt.Date,
	}

	log.Infof("File upload for receipt (%s): %s (%s %d bytes)", newReceipt.ID, receipt.File.Filename, receipt.File.ContentType, receipt.File.Size)

	parts := strings.Split(receipt.File.Filename, ".")
	extension := "." + parts[len(parts)-1]
	receiptFileName := newReceipt.ID + extension

	err := storage.SaveReceipt(receipt.File.File, receiptFileName)
	if err != nil {
		return err
	}

	newReceipt.Attachment = receiptFileName

	_, err = tx.ExecContext(ctx, `
		INSERT INTO receipts (id, date, amount, attachment, cost_claim) VALUES (?, ?, ?, ?, ?)
	`, newReceipt.ID, newReceipt.Date, newReceipt.Amount, newReceipt.Attachment, costClaimID)
	return err
}

// MakeUser creates a user bypassing authority checks
func (r *Resolver) MakeUser(ctx context.Context, user model.UserInput) (*model.User, error) {
	newUser := model.User{
		ID:    r.ShortID.MustGenerate(),
		Name:  user.Name,
		Email: user.Email,
		Role:  user.Role,
	}

	_, err := r.DB.ExecContext(ctx, `
		INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)
	`, newUser.ID, newUser.Name, newUser.Email, newUser.Role)

	if err == nil && user.Password != nil && *user.Password != "" {
		err = r.setUserPassword(ctx, newUser.ID, *user.Password)
	}

	return &newUser, err
}

var hashingCost = 13

func (r *Resolver) setUserPassword(ctx context.Context, userID, password string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), hashingCost)
	if err != nil {
		return err
	}

	_, err = r.DB.ExecContext(ctx, `
		UPDATE users SET pw_hash = ? WHERE id = ?
	`, hash, userID)

	return err
}

func (r *Resolver) createInvoiceRow(ctx context.Context, row *model.InvoiceRowInput, invoiceID, invoiceType string, tx *sqlx.Tx) error {
	_, err := tx.ExecContext(ctx, fmt.Sprintf(`
		INSERT INTO %s_invoice_rows (id, invoice, cost_pool, description, amount)
		VALUES (?, ?, ?, ?, ?)
	`, invoiceType), r.ShortID.MustGenerate(), invoiceID, row.CostPool, row.Description, row.Amount)

	return err
}
