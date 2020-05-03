package graph

import (
	"context"
	"errors"
	"strings"

	"github.com/jmoiron/sqlx"
	log "github.com/sirupsen/logrus"
	"github.com/teris-io/shortid"
	"github.com/timojarv/findecs/graph/model"
	"github.com/timojarv/findecs/storage"
)

//go:generate go run github.com/99designs/gqlgen generate

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

// Resolver is the root resolver
type Resolver struct {
	DB      *sqlx.DB
	ShortID *shortid.Shortid
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

/* func (r *Resolver) createInvoiceRow(ctx context.Context, row *model.InvoiceRow, table string, tx *sqlx.Tx) error {
	_, err := tx.ExecContext(ctx, `
		INSERT INTO
	`)
} */
