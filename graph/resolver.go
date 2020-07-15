package graph

import (
	"context"
	"crypto/rand"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
	"github.com/mailgun/mailgun-go"
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
	Mailgun       *mailgun.MailgunImpl
	URL           string
}

var errNotAuthenticated = errors.New("not authenticated")
var errUnauthorized = errors.New("unauthorized")
var errInvalidResetToken = errors.New("invalid reset token")

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
	} else if err == nil {
		err = r.sendPasswordResetEmail(ctx, user.Email)
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
		UPDATE users SET pw_hash = ?, reset_token = NULL, reset_expiry = NULL WHERE id = ?
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

// Generate a password reset token and send it to users email
func (r *Resolver) sendPasswordResetEmail(ctx context.Context, email string) error {
	b := make([]byte, 16)
	rand.Read(b)
	token := fmt.Sprintf("%x", b)

	// Insert token into DB, see if email exists
	res, err := r.DB.ExecContext(ctx, `
		UPDATE users SET reset_token = ?, reset_expiry = (CURRENT_TIMESTAMP + INTERVAL 24 HOUR) WHERE email = ?
	`, token, email)

	if err != nil {
		return err
	}

	exists, _ := res.RowsAffected()

	// Be opaque of whether this succeeded
	if exists == 0 {
		log.WithField("email", email).Printf("Password reset requested for nonexistent email")
		return nil
	}

	from := fmt.Sprintf("Findecs <findecs@%s>", r.Mailgun.Domain())

	link := fmt.Sprintf("%s/#/resetPassword?token=%s", r.URL, token)

	msg := mailgun.NewMessage(
		from,
		"Findecs - aseta uusi salasana",
		"Voit asettaa uuden salasanan tästä linkistä: "+link,
		email,
	)

	msg.SetHtml(fmt.Sprintf(`
		<strong>Voit asettaa uuden salasanan alla olevasta linkistä 24 tunnin sisällä.</strong>
		<a style="display: block;font-weight: bold;color: darkcyan;border-radius:0.5rem;margin:0.5rem 0;" href="%s" target="_blank">Aseta salasana</a>
		Jos et pyytänyt salasanan palautusta, ei tähän viestiin tarvitse reagoida.
	`, link))

	mes, id, err := r.Mailgun.Send(msg)

	if err == nil {
		log.WithFields(log.Fields{
			"response": mes,
			"id":       id,
			"email":    email,
		}).Printf("Password reset email sent")
	} else {
		log.Print(err)
	}

	return err
}

// Reset user password after they have a reset token
func (r *Resolver) resetPassword(ctx context.Context, token, newPassword string) error {
	var userID string
	err := r.DB.GetContext(ctx, &userID, `
		SELECT id FROM users WHERE reset_token = ? AND reset_expiry > CURRENT_TIMESTAMP
	`, token)

	if err == sql.ErrNoRows {
		return errInvalidResetToken
	}

	if err != nil {
		return err
	}

	return r.setUserPassword(ctx, userID, newPassword)
}

// Generate a comment for the event if necessary
func (r *Resolver) generateCommentForEvent(ctx context.Context, event *model.Event, id string) {
	if event.Status == model.StatusPaid {
		var results struct {
			Iban      *string `db:"iban"`
			OtherIban *string `db:"other_iban"`
		}

		err := r.DB.GetContext(ctx, &results, `
		SELECT u.iban, cc.other_iban
		FROM cost_claims cc
		JOIN users u ON cc.author = u.id
		WHERE cc.id = ?
		`, id)
		if err != nil {
			log.Error(err)
		}

		if iban := results.OtherIban; iban != nil {
			comment := fmt.Sprintf("Tilille %s", *iban)
			event.Comment = &comment
		} else if iban := results.Iban; iban != nil {
			comment := fmt.Sprintf("Tilille %s", *iban)
			event.Comment = &comment
		}
	}
}

var validActions = []string{"list", "get", "create", "update", "delete"}

func validAction(action string) bool {
	for _, ac := range validActions {
		if action == ac {
			return true
		}
	}

	return false
}
