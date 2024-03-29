package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/hashicorp/go-multierror"
	log "github.com/sirupsen/logrus"
	"github.com/timojarv/findecs/access"
	"github.com/timojarv/findecs/graph/generated"
	"github.com/timojarv/findecs/graph/model"
	"github.com/timojarv/findecs/session"
	"github.com/timojarv/findecs/storage"
	"golang.org/x/crypto/bcrypt"
)

func (r *contactResolver) SalesInvoices(ctx context.Context, obj *model.Contact) ([]*model.SalesInvoice, error) {
	var invoices []*model.SalesInvoice

	err := r.DB.SelectContext(ctx, &invoices, `
		SELECT si.id, si.running_number, si.recipient, si.date, si.due_date, si.author,
		si.status, si.details, si.payer_reference, si.contact_person, si.created, si.modified
		FROM sales_invoices si
		WHERE si.recipient = ?
	`, obj.ID)

	return invoices, err
}

func (r *contactResolver) PurchaseInvoices(ctx context.Context, obj *model.Contact) ([]*model.PurchaseInvoice, error) {
	var invoices []*model.PurchaseInvoice

	err := r.DB.SelectContext(ctx, &invoices, `
		SELECT pi.id, pi.sender, pi.description, pi.due_date, pi.status, pi.created,
		pi.modified, pi.details, pi.note, pi.author
		FROM purchase_invoices pi
		WHERE pi.sender = ?
	`, obj.ID)

	return invoices, err
}

func (r *costClaimResolver) Author(ctx context.Context, obj *model.CostClaim) (*model.User, error) {
	return r.Query().User(ctx, &obj.AuthorID)
}

func (r *costClaimResolver) CostPool(ctx context.Context, obj *model.CostClaim) (*model.CostPool, error) {
	var costPool model.CostPool

	err := r.DB.GetContext(ctx, &costPool, `
		SELECT id, name FROM cost_pools WHERE id = ? 
	`, obj.CostPoolID)

	return &costPool, err
}

func (r *costClaimResolver) Status(ctx context.Context, obj *model.CostClaim) (model.Status, error) {
	status := model.StatusCreated

	err := r.DB.GetContext(ctx, &status, `
		SELECT status FROM cost_claim_events
		WHERE cost_claim = ?
		ORDER BY timestamp DESC
		LIMIT 1
	`, obj.ID)

	if err == sql.ErrNoRows {
		err = nil
	}

	return status, err
}

func (r *costClaimResolver) ApprovedBy(ctx context.Context, obj *model.CostClaim) (*model.User, error) {
	if obj.ApprovedByID == nil {
		return nil, nil
	}
	return r.Query().User(ctx, obj.ApprovedByID)
}

func (r *costClaimResolver) Receipts(ctx context.Context, obj *model.CostClaim) ([]*model.Receipt, error) {
	var receipts []*model.Receipt

	err := r.DB.SelectContext(ctx, &receipts, `
		SELECT id, amount, attachment, date FROM receipts WHERE cost_claim = ?
	`, obj.ID)

	return receipts, err
}

func (r *costClaimResolver) Events(ctx context.Context, obj *model.CostClaim) ([]*model.Event, error) {
	var events []*model.Event

	err := r.DB.SelectContext(ctx, &events, `
		SELECT id, timestamp, status, comment, author
		FROM cost_claim_events
		WHERE cost_claim = ?
		ORDER BY timestamp
	`, obj.ID)

	return events, err
}

func (r *costPoolResolver) Total(ctx context.Context, obj *model.CostPool) (float64, error) {
	var total float64

	err := r.DB.GetContext(ctx, &total, `
		SELECT ROUND(SUM(amount), 2)
		FROM (
			SELECT receipts.amount AS amount
			FROM cost_claims
			JOIN receipts
			ON receipts.cost_claim = cost_claims.id
			AND cost_claims.cost_pool = ?

			UNION

			SELECT amount
			FROM purchase_invoice_rows
			WHERE cost_pool = ?

			UNION

			SELECT (0 - amount) AS AMOUNT
			FROM sales_invoice_rows
			WHERE cost_pool = ?

			UNION

			SELECT 0 AS amount
		) t
	`, obj.ID, obj.ID, obj.ID)

	return total, err
}

func (r *costPoolResolver) CostClaims(ctx context.Context, obj *model.CostPool) ([]*model.CostClaim, error) {
	var claims []*model.CostClaim

	err := r.DB.SelectContext(ctx, &claims, `
		SELECT id, running_number, description, author, cost_pool, details, created,
		modified, source_of_money, approved_by FROM cost_claims WHERE cost_pool = ?
	`, obj.ID)

	return claims, err
}

func (r *costPoolResolver) SalesInvoices(ctx context.Context, obj *model.CostPool) ([]*model.SalesInvoice, error) {
	var invoices []*model.SalesInvoice

	err := r.DB.SelectContext(ctx, &invoices, `
		SELECT si.id, si.running_number, si.recipient, si.date, si.due_date, si.author,
		si.status, si.details, si.payer_reference, si.contact_person, si.created, si.modified
		FROM sales_invoice_rows sir
		JOIN sales_invoices si ON sir.invoice = si.id
		WHERE sir.cost_pool = ?
		GROUP BY si.id
	`, obj.ID)

	return invoices, err
}

func (r *costPoolResolver) PurchaseInvoices(ctx context.Context, obj *model.CostPool) ([]*model.PurchaseInvoice, error) {
	var invoices []*model.PurchaseInvoice

	err := r.DB.SelectContext(ctx, &invoices, `
		SELECT pi.id, pi.sender, pi.description, pi.due_date, pi.status, pi.created,
		pi.modified, pi.details, pi.note, pi.author
		FROM purchase_invoice_rows pir
		JOIN purchase_invoices pi ON pir.invoice = pi.id
		WHERE pir.cost_pool = ?
		GROUP BY pi.id
	`, obj.ID)

	return invoices, err
}

func (r *eventResolver) Author(ctx context.Context, obj *model.Event) (*model.User, error) {
	return r.Query().User(ctx, &obj.AuthorID)
}

func (r *mutationResolver) CreateUser(ctx context.Context, user model.UserInput) (*model.User, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return nil, errNotAuthenticated
	}

	ok, _ := access.Authorize(currentUser, "users", "create")
	if !ok {
		return nil, errUnauthorized
	}

	return r.MakeUser(ctx, user)
}

func (r *mutationResolver) UpdateUser(ctx context.Context, id string, user model.UserInput) (*model.User, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return nil, errNotAuthenticated
	}

	ok, conditions := access.Authorize(currentUser, "users", "update")
	if !ok {
		return nil, errUnauthorized
	}

	conditions.Append("id = ?")

	_, err := r.DB.ExecContext(ctx, fmt.Sprintf(`
		UPDATE users SET name = ?, email = ?, role = ? %s
	`, conditions), user.Name, user.Email, user.Role, id)
	if err != nil {
		return nil, err
	}

	return r.Query().User(ctx, &id)
}

func (r *mutationResolver) DeleteUser(ctx context.Context, id string) (string, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return "", errNotAuthenticated
	}

	ok, conditions := access.Authorize(currentUser, "users", "delete")
	if !ok {
		return "", errUnauthorized
	}

	conditions.Append("id = ?")

	_, err := r.DB.ExecContext(ctx, fmt.Sprintf(`
		DELETE FROM users %s
	`, conditions), id)

	return id, err
}

func (r *mutationResolver) Login(ctx context.Context, email string, password string) (*model.User, error) {
	var user model.User

	r.DB.GetContext(ctx, &user, `
		SELECT id, name, email, pw_hash FROM users WHERE email = ?
	`, email)

	err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))

	if err != nil || user.PasswordHash == "" {
		return nil, errors.New("authentication failed")
	}

	session.Set(ctx, user.ID)

	return &user, err
}

func (r *mutationResolver) UpdateSettings(ctx context.Context, settings model.SettingsInput) (*model.User, error) {
	userID := session.Get(ctx)
	if userID == nil {
		return nil, errNotAuthenticated
	}

	_, err := r.DB.ExecContext(ctx, `
		UPDATE users SET name = ?, email = ?, position = ?, phone = ?, iban = ? WHERE id = ?
	`, settings.Name, settings.Email, settings.Position, settings.Phone, settings.Iban, *userID)

	if err == nil && settings.NewPassword != nil {
		err = r.setUserPassword(ctx, *userID, *settings.NewPassword)
	}

	if signature := settings.Signature; signature != nil && err == nil {
		log.Infof("File upload for signature (%s): %s (%s %d bytes)", userID, signature.Filename, signature.ContentType, signature.Size)

		parts := strings.Split(signature.Filename, ".")
		extension := "." + parts[len(parts)-1]
		signatureFileName := *userID + extension

		err = storage.SaveSignature(signature.File, signatureFileName)

		if err == nil {
			_, err = r.DB.ExecContext(ctx, `
				UPDATE users SET signature = ? WHERE id =?
			`, signatureFileName, userID)
		}
	}

	if err != nil {
		return nil, err
	}

	return r.Query().User(ctx, userID)
}

func (r *mutationResolver) Logout(ctx context.Context) (bool, error) {
	if session.Get(ctx) == nil {
		return false, errNotAuthenticated
	}

	return true, session.Clear(ctx)
}

func (r *mutationResolver) RequestPasswordReset(ctx context.Context, email string) (string, error) {
	err := r.sendPasswordResetEmail(ctx, email)
	return email, err
}

func (r *mutationResolver) ResetPassword(ctx context.Context, token string, newPassword string) (string, error) {
	err := r.resetPassword(ctx, token, newPassword)

	return "", err
}

func (r *mutationResolver) CreateCostPool(ctx context.Context, costPool model.CostPoolInput) (*model.CostPool, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return nil, errNotAuthenticated
	}

	ok, _ := access.Authorize(currentUser, "costPools", "create")
	if !ok {
		return nil, errUnauthorized
	}

	if costPool.Budget < 0 {
		return nil, errors.New("cost pool budget must be positive")
	}

	newCostPool := model.CostPool{
		ID:     r.ShortID.MustGenerate(),
		Name:   costPool.Name,
		Budget: costPool.Budget,
	}

	_, err := r.DB.ExecContext(ctx, `
		INSERT INTO cost_pools (id, name, budget) VALUES (?, ?, ?)
	`, newCostPool.ID, newCostPool.Name, newCostPool.Budget)

	return &newCostPool, err
}

func (r *mutationResolver) UpdateCostPool(ctx context.Context, id string, costPool model.CostPoolInput) (*model.CostPool, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return nil, errNotAuthenticated
	}

	ok, conditions := access.Authorize(currentUser, "costPools", "update")
	if !ok {
		return nil, errUnauthorized
	}

	conditions.Append("id = ?")

	_, err := r.DB.ExecContext(ctx, fmt.Sprintf(`
		UPDATE cost_pools SET name = ?, budget = ? %s
	`, conditions), costPool.Name, costPool.Budget, id)

	return &model.CostPool{
		ID:     id,
		Name:   costPool.Name,
		Budget: costPool.Budget,
	}, err
}

func (r *mutationResolver) DeleteCostPool(ctx context.Context, id string) (string, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return "", errNotAuthenticated
	}

	ok, conditions := access.Authorize(currentUser, "costPools", "delete")
	if !ok {
		return "", errUnauthorized
	}

	conditions.Append("id = ?")

	_, err := r.DB.ExecContext(ctx, fmt.Sprintf(`
		DELETE FROM cost_pools %s
	`, conditions), id)

	return id, err
}

func (r *mutationResolver) CreateCostClaim(ctx context.Context, costClaim model.CostClaimInput, receipts []*model.ReceiptInput) (*model.CostClaim, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return nil, errNotAuthenticated
	}

	ok, conditions := access.Authorize(currentUser, "costClaims", "create")
	if !ok {
		return nil, errUnauthorized
	}

	// pre check
	if costClaim.SourceOfMoney == model.SourceOfMoneyOtherAccount && costClaim.OtherIBAN == nil {
		return nil, errors.New("missing field otherIban")
	}

	// Begin
	tx, err := r.DB.BeginTxx(ctx, nil)
	if err != nil {
		return nil, err
	}
	// Fetch latest running number
	var runningNumber int
	err = tx.GetContext(ctx, &runningNumber, `
		SELECT MAX(running_number) FROM (
			SELECT running_number FROM cost_claims WHERE year = YEAR(CURRENT_TIMESTAMP)  UNION SELECT 0
		) t;
	`)
	if err != nil {
		tx.Rollback()
		return nil, err
	}
	newCostClaim := model.CostClaim{
		ID:            r.ShortID.MustGenerate(),
		RunningNumber: runningNumber + 1,
		Description:   costClaim.Description,
		AuthorID:      currentUser.ID,
		CostPoolID:    costClaim.CostPool,
		Details:       costClaim.Details,
		SourceOfMoney: costClaim.SourceOfMoney,
		OtherIBAN:     costClaim.OtherIBAN,
	}

	_, err = tx.ExecContext(ctx, `
		INSERT INTO cost_claims (id, running_number, description, author, cost_pool, details, source_of_money, other_iban)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`,
		newCostClaim.ID,
		newCostClaim.RunningNumber,
		newCostClaim.Description,
		newCostClaim.AuthorID,
		newCostClaim.CostPoolID,
		newCostClaim.Details,
		newCostClaim.SourceOfMoney,
		newCostClaim.OtherIBAN)
	if err != nil {
		tx.Rollback()
		return &newCostClaim, err
	}

	for _, receipt := range receipts {
		err = r.createReceipt(ctx, receipt, newCostClaim.ID, tx)
		if err != nil {
			tx.Rollback()
			return &newCostClaim, err
		}
	}

	conditions.Append("id = ?")

	err = tx.GetContext(ctx, &newCostClaim, fmt.Sprintf(`
		SELECT created, modified FROM cost_claims %s
	`, conditions), newCostClaim.ID)
	if err != nil {
		tx.Rollback()
		return &newCostClaim, err
	}

	err = tx.Commit()
	return &newCostClaim, err
}

func (r *mutationResolver) UpdateCostClaim(ctx context.Context, id string, costClaim model.CostClaimInput, receipts []*model.ReceiptInput) (*model.CostClaim, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return nil, errNotAuthenticated
	}

	ok, conditions := access.Authorize(currentUser, "costClaims", "update")
	if !ok {
		return nil, errUnauthorized
	}

	// pre check
	if costClaim.SourceOfMoney == model.SourceOfMoneyOtherAccount {
		if costClaim.OtherIBAN == nil {
			return nil, errors.New("missing field otherIban")
		}
	} else {
		costClaim.OtherIBAN = nil
	}

	var oldReceipts, removedReceipts []*model.Receipt

	// Get a list of existing receipts
	err := r.DB.SelectContext(ctx, &oldReceipts, `
		SELECT id, attachment FROM receipts WHERE cost_claim = ?
	`, id)
	if err != nil {
		return nil, err
	}

	tx, err := r.DB.BeginTxx(ctx, nil)
	if err != nil {
		return nil, err
	}

	receiptIDs := make(map[string]bool)
	for _, receipt := range receipts {
		if receipt.ID != nil && *receipt.ID != "" {
			receiptIDs[*receipt.ID] = true
			// Update other receipts in the DB
			_, err = tx.ExecContext(ctx, `
				UPDATE receipts SET date = ?, amount = ? WHERE id = ?
			`, receipt.Date, receipt.Amount, *receipt.ID)
		} else {
			// Upload new receipt files
			// Insert new receipts into DB
			err = r.createReceipt(ctx, receipt, id, tx)
		}

		if err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	conditions.Append("id = ?")

	// Update cost claim
	res, err := tx.ExecContext(ctx, fmt.Sprintf(`
		UPDATE cost_claims SET description = ?, cost_pool = ?, details = ?, source_of_money = ?, other_iban = ? %s
	`, conditions), costClaim.Description, costClaim.CostPool, costClaim.Details, costClaim.SourceOfMoney, costClaim.OtherIBAN, id)
	if err != nil {
		tx.Rollback()
		return nil, err
	}
	if modified, _ := res.RowsAffected(); modified == 0 {
		tx.Rollback()
		return nil, errUnauthorized
	}

	// List which receipts have been removed (if any)
	for _, oldReceipt := range oldReceipts {
		if _, ok := receiptIDs[oldReceipt.ID]; !ok {
			removedReceipts = append(removedReceipts, oldReceipt)
		}
	}

	// Delete removed receipts from DB
	for _, removed := range removedReceipts {
		_, err := tx.ExecContext(ctx, `
			DELETE FROM receipts WHERE id = ?
		`, removed.ID)
		if err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	err = tx.Commit()
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	// Fetch the updated claim
	updated, err := r.Query().CostClaim(ctx, id)

	// Lastly delete removed receipt files
	for _, removed := range removedReceipts {
		storage.DeleteReceipt(removed.Attachment)
	}

	return updated, err
}

func (r *mutationResolver) DeleteCostClaim(ctx context.Context, id string) (string, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return "", errNotAuthenticated
	}

	ok, conditions := access.Authorize(currentUser, "costClaims", "delete")
	if !ok {
		return "", errUnauthorized
	}

	var receipts []string

	err := r.DB.SelectContext(ctx, &receipts, `
		SELECT attachment FROM receipts WHERE cost_claim = ?
	`, id)
	if err != nil {
		return id, err
	}

	conditions.Append("id = ?")

	res, err := r.DB.ExecContext(ctx, fmt.Sprintf(`
		DELETE FROM cost_claims %s
	`, conditions), id)
	if err != nil {
		return id, err
	}
	if modified, _ := res.RowsAffected(); modified == 0 {
		return id, errUnauthorized
	}

	var errors error

	for _, receipt := range receipts {
		if err = storage.DeleteReceipt(receipt); err != nil {
			errors = multierror.Append(err)
		}
	}

	return id, errors
}

func (r *mutationResolver) SetCostClaimStatus(ctx context.Context, id string, status model.Status, comment *string) (*model.CostClaim, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return nil, errNotAuthenticated
	}

	ok, conditions := access.Authorize(currentUser, "costClaims", "setStatus")
	if !ok {
		return nil, errUnauthorized
	}

	var count int64
	conditions.Append("id = ?")

	err := r.DB.GetContext(ctx, &count, fmt.Sprintf(`
		SELECT COUNT(*) FROM cost_claims %s
	`, conditions), id)
	if err != nil {
		return nil, err
	}

	event := model.Event{
		ID:       r.ShortID.MustGenerate(),
		AuthorID: currentUser.ID,
		Status:   status,
		Comment:  comment,
	}

	r.generateCommentForEvent(ctx, &event, id)

	_, err = r.DB.ExecContext(ctx, `
		INSERT INTO cost_claim_events (id, author, status, comment, cost_claim) VALUES (?, ?, ?, ?, ?)
	`, event.ID, event.AuthorID, event.Status, event.Comment, id)
	if err != nil {
		return nil, err
	}

	return r.Query().CostClaim(ctx, id)
}

func (r *mutationResolver) RevokeCostClaimStatus(ctx context.Context, id string) (*model.CostClaim, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return nil, errNotAuthenticated
	}

	ok, conditions := access.Authorize(currentUser, "costClaims", "setStatus")
	if !ok {
		return nil, errUnauthorized
	}

	var eventID string
	conditions.Append("cc.id = ?")

	err := r.DB.GetContext(ctx, &eventID, fmt.Sprintf(`
		SELECT cce.id FROM cost_claims cc
		JOIN cost_claim_events cce ON cce.cost_claim = cc.id
		%s
		ORDER BY cce.timestamp DESC
		LIMIT 1
	`, conditions), id)
	if err != nil {
		return nil, err
	}

	_, err = r.DB.ExecContext(ctx, `
		DELETE FROM cost_claim_events WHERE id = ?
	`, eventID)
	if err != nil {
		return nil, err
	}

	return r.Query().CostClaim(ctx, id)
}

func (r *mutationResolver) CreateContact(ctx context.Context, contact model.ContactInput) (*model.Contact, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return nil, errNotAuthenticated
	}

	ok, _ := access.Authorize(currentUser, "contacts", "create")
	if !ok {
		return nil, errUnauthorized
	}

	newContact := model.Contact{
		ID:   r.ShortID.MustGenerate(),
		Name: contact.Name,
	}

	if contact.Address != nil {
		newContact.Address = *contact.Address
	}

	_, err := r.DB.ExecContext(ctx, `
		INSERT INTO contacts (id, name, address) VALUES (?, ?, ?)
	`, newContact.ID, newContact.Name, newContact.Address)

	return &newContact, err
}

func (r *mutationResolver) UpdateContact(ctx context.Context, id string, contact model.ContactInput) (*model.Contact, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return nil, errNotAuthenticated
	}

	ok, conditions := access.Authorize(currentUser, "contacts", "update")
	if !ok {
		return nil, errUnauthorized
	}

	_, err := r.DB.ExecContext(ctx, fmt.Sprintf(`
		UPDATE contacts SET name = ?, address = ? %s
	`, conditions), contact.Name, contact.Address, id)

	return &model.Contact{ID: id, Name: contact.Name, Address: *contact.Address}, err
}

func (r *mutationResolver) DeleteContact(ctx context.Context, id string) (string, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return "", errNotAuthenticated
	}

	ok, conditions := access.Authorize(currentUser, "contacts", "delete")
	if !ok {
		return "", errUnauthorized
	}

	conditions.Append("id = ?")

	_, err := r.DB.ExecContext(ctx, fmt.Sprintf(`
		DELETE FROM contacts %s
	`, conditions), id)

	return id, err
}

func (r *mutationResolver) CreatePurchaseInvoice(ctx context.Context, invoice model.PurchaseInvoiceInput, rows []*model.InvoiceRowInput) (*model.PurchaseInvoice, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return nil, errNotAuthenticated
	}

	ok, _ := access.Authorize(currentUser, "purchaseInvoices", "create")
	if !ok {
		return nil, errUnauthorized
	}

	tx, err := r.DB.BeginTxx(ctx, nil)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	id := r.ShortID.MustGenerate()

	_, err = tx.ExecContext(ctx, `
		INSERT INTO purchase_invoices (id, sender, description, due_date, details, author)
		VALUES (?, ?, ?, ?, ?, ?)
	`, id, invoice.Sender, invoice.Description, invoice.DueDate, invoice.Details, currentUser.ID)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	for _, row := range rows {
		if r.createInvoiceRow(ctx, row, id, "purchase", tx) != nil {
			tx.Rollback()
			return nil, err
		}
	}

	if err = tx.Commit(); err != nil {
		return nil, err
	}

	return r.Query().PurchaseInvoice(ctx, id)
}

func (r *mutationResolver) UpdatePurchaseInvoice(ctx context.Context, id string, invoice model.PurchaseInvoiceInput, rows []*model.InvoiceRowInput) (*model.PurchaseInvoice, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return nil, errNotAuthenticated
	}

	ok, conditions := access.Authorize(currentUser, "purchaseInvoices", "update")
	if !ok {
		return nil, errUnauthorized
	}

	conditions.Append("id = ?")

	var oldRows, removedRows []*model.InvoiceRow

	// Get a list of existing rows
	err := r.DB.SelectContext(ctx, &oldRows, `
		SELECT id FROM purchase_invoice_rows WHERE invoice = ?
	`, id)
	if err != nil {
		return nil, err
	}

	tx, err := r.DB.BeginTxx(ctx, nil)
	if err != nil {
		return nil, err
	}

	rowIDs := make(map[string]bool)
	for _, row := range rows {
		if row.ID != nil && *row.ID != "" {
			rowIDs[*row.ID] = true
			// Update other rows in the DB
			_, err = tx.ExecContext(ctx, `
				UPDATE purchase_invoice_rows SET cost_pool = ?, description = ?, amount = ? WHERE id = ?
			`, row.CostPool, row.Description, row.Amount, *row.ID)
		} else {
			err = r.createInvoiceRow(ctx, row, id, "purchase", tx)
		}

		if err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	// Update invoice
	_, err = tx.ExecContext(ctx, fmt.Sprintf(`
		UPDATE purchase_invoices SET sender = ?, description = ?, due_date = ?, details = ? %s
	`, conditions), invoice.Sender, invoice.Description, invoice.DueDate, invoice.Details, id)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	// List which rows have been removed (if any)
	for _, oldRow := range oldRows {
		if _, ok := rowIDs[oldRow.ID]; !ok {
			removedRows = append(removedRows, oldRow)
		}
	}

	// Delete removed rows from DB
	for _, removed := range removedRows {
		_, err := tx.ExecContext(ctx, `
			DELETE FROM Rows WHERE id = ?
		`, removed.ID)
		if err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	err = tx.Commit()
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	// Fetch the updated invoice
	return r.Query().PurchaseInvoice(ctx, id)
}

func (r *mutationResolver) DeletePurchaseInvoice(ctx context.Context, id string) (string, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return "", errNotAuthenticated
	}

	ok, conditions := access.Authorize(currentUser, "purchaseInvoices", "delete")
	if !ok {
		return "", errUnauthorized
	}

	conditions.Append("id = ?")

	_, err := r.DB.ExecContext(ctx, fmt.Sprintf(`
		DELETE FROM purchase_invoices %s
	`, conditions), id)

	return id, err
}

func (r *mutationResolver) CreateSalesInvoice(ctx context.Context, invoice model.SalesInvoiceInput, rows []*model.InvoiceRowInput) (*model.SalesInvoice, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return nil, errNotAuthenticated
	}

	ok, _ := access.Authorize(currentUser, "salesInvoices", "create")
	if !ok {
		return nil, errUnauthorized
	}

	tx, err := r.DB.BeginTxx(ctx, nil)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	var runningNumber int
	err = tx.GetContext(ctx, &runningNumber, `
		SELECT MAX(running_number) FROM (
			SELECT running_number FROM sales_invoices UNION SELECT 0
		) t;
	`)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	id := r.ShortID.MustGenerate()

	_, err = tx.ExecContext(ctx, `
		INSERT INTO sales_invoices (id, running_number, recipient, date, due_date, details, payer_reference, contact_person, author)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, id, runningNumber+1, invoice.Recipient, invoice.Date, invoice.DueDate, invoice.Details, invoice.PayerReference, invoice.ContactPerson, currentUser.ID)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	for _, row := range rows {
		if r.createInvoiceRow(ctx, row, id, "sales", tx) != nil {
			tx.Rollback()
			return nil, err
		}
	}

	if err = tx.Commit(); err != nil {
		return nil, err
	}

	return r.Query().SalesInvoice(ctx, id)
}

func (r *mutationResolver) UpdateSalesInvoice(ctx context.Context, id string, invoice model.SalesInvoiceInput, rows []*model.InvoiceRowInput) (*model.SalesInvoice, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return nil, errNotAuthenticated
	}

	ok, conditions := access.Authorize(currentUser, "salesInvoices", "update")
	if !ok {
		return nil, errUnauthorized
	}

	conditions.Append("id = ?")

	var oldRows, removedRows []*model.InvoiceRow

	// Get a list of existing rows
	err := r.DB.SelectContext(ctx, &oldRows, `
		SELECT id FROM sales_invoice_rows WHERE invoice = ?
	`, id)
	if err != nil {
		return nil, err
	}

	tx, err := r.DB.BeginTxx(ctx, nil)
	if err != nil {
		return nil, err
	}

	rowIDs := make(map[string]bool)
	for _, row := range rows {
		if row.ID != nil && *row.ID != "" {
			rowIDs[*row.ID] = true
			// Update other rows in the DB
			_, err = tx.ExecContext(ctx, `
				UPDATE sales_invoice_rows SET cost_pool = ?, description = ?, amount = ? WHERE id = ?
			`, row.CostPool, row.Description, row.Amount, *row.ID)
		} else {
			err = r.createInvoiceRow(ctx, row, id, "sales", tx)
		}

		if err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	// Update invoice
	_, err = tx.ExecContext(ctx, fmt.Sprintf(`
		UPDATE sales_invoices SET recipient = ?, date = ?, due_date = ?, details = ?, payer_reference = ?, contact_person = ?
		%s
	`, conditions), invoice.Recipient, invoice.Date, invoice.DueDate, invoice.Details, invoice.PayerReference, invoice.ContactPerson, id)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	// List which rows have been removed (if any)
	for _, oldRow := range oldRows {
		if _, ok := rowIDs[oldRow.ID]; !ok {
			removedRows = append(removedRows, oldRow)
		}
	}

	// Delete removed rows from DB
	for _, removed := range removedRows {
		_, err := tx.ExecContext(ctx, `
			DELETE FROM Rows WHERE id = ?
		`, removed.ID)
		if err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	err = tx.Commit()
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	// Fetch the updated invoice
	return r.Query().SalesInvoice(ctx, id)
}

func (r *mutationResolver) DeleteSalesInvoice(ctx context.Context, id string) (string, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return "", errNotAuthenticated
	}

	ok, conditions := access.Authorize(currentUser, "salesInvoices", "delete")
	if !ok {
		return "", errUnauthorized
	}

	conditions.Append("id = ?")

	_, err := r.DB.ExecContext(ctx, fmt.Sprintf(`
		DELETE FROM sales_invoices %s
	`, conditions), id)

	return id, err
}

func (r *purchaseInvoiceResolver) Author(ctx context.Context, obj *model.PurchaseInvoice) (*model.User, error) {
	return r.Query().User(ctx, &obj.AuthorID)
}

func (r *purchaseInvoiceResolver) Sender(ctx context.Context, obj *model.PurchaseInvoice) (*model.Contact, error) {
	return r.Query().Contact(ctx, obj.SenderID)
}

func (r *purchaseInvoiceResolver) ApprovedBy(ctx context.Context, obj *model.PurchaseInvoice) (*model.User, error) {
	if obj.ApprovedByID == nil {
		return nil, nil
	}
	return r.Query().User(ctx, obj.ApprovedByID)
}

func (r *purchaseInvoiceResolver) Rows(ctx context.Context, obj *model.PurchaseInvoice) ([]*model.PurchaseInvoiceRow, error) {
	var rows []*model.PurchaseInvoiceRow

	err := r.DB.SelectContext(ctx, &rows, `
		SELECT id, invoice, cost_pool, description, amount FROM purchase_invoice_rows WHERE invoice = ?
	`, obj.ID)

	return rows, err
}

func (r *purchaseInvoiceRowResolver) Invoice(ctx context.Context, obj *model.PurchaseInvoiceRow) (*model.PurchaseInvoice, error) {
	var invoice model.PurchaseInvoice

	err := r.DB.GetContext(ctx, &invoice, `
		SELECT id, sender, description, due_date, status, created, modified, details, note, author
		FROM purchase_invoices WHERE id = ?
	`, obj.InvoiceID)

	return &invoice, err
}

func (r *purchaseInvoiceRowResolver) CostPool(ctx context.Context, obj *model.PurchaseInvoiceRow) (*model.CostPool, error) {
	return r.Query().CostPool(ctx, obj.CostPoolID)
}

func (r *queryResolver) CostClaims(ctx context.Context, limit *int, offset int, viewOptions *model.ViewOptions, sortOptions *model.SortOptions) (*model.CostClaimsConnection, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return nil, errNotAuthenticated
	}

	ok, conditions := access.Authorize(currentUser, "costClaims", "read")
	if !ok {
		return nil, errUnauthorized
	}

	if viewOptions != nil {
		conditions.Append(viewOptions.ToConditions(currentUser.ID)...)
	}

	orderClause := sortOptions.String(model.SortOptions{Key: "created", Order: "desc"})

	log.Debug(orderClause)

	limitClause := ""
	if limit != nil {
		limitClause = fmt.Sprintf("LIMIT %d OFFSET %d", *limit, offset)
	}

	var costClaims []*model.CostClaim
	err := r.DB.SelectContext(ctx, &costClaims, fmt.Sprintf(`
		SELECT cc.id, running_number, description, author, cost_pool, details, created,
		ROUND(COALESCE(SUM(receipts.amount), 0), 2) AS total, users.name AS author_name,
		cce.status AS status,
		modified, source_of_money, approved_by
		FROM cost_claims cc
		JOIN receipts ON cost_claim = cc.id
		JOIN users ON users.id = cc.author
		JOIN (
			SELECT cost_claim, timestamp, status
			FROM cost_claim_events
			GROUP BY cost_claim
			ORDER BY timestamp
		) cce ON cce.cost_claim = cc.id 
		%s GROUP BY cc.id %s %s
		`, conditions, orderClause, limitClause))
	if err != nil {
		return nil, err
	}

	var totalCount int
	err = r.DB.GetContext(ctx, &totalCount, fmt.Sprintf(`
		SELECT COUNT(*) FROM cost_claims %s
	`, conditions))

	return &model.CostClaimsConnection{
		Nodes:      costClaims,
		TotalCount: totalCount,
	}, err
}

func (r *queryResolver) CostClaim(ctx context.Context, id string) (*model.CostClaim, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return nil, errNotAuthenticated
	}

	ok, conditions := access.Authorize(currentUser, "costClaims", "read")
	if !ok {
		return nil, errUnauthorized
	}
	conditions.Append("id = ?")

	var costClaim model.CostClaim

	err := r.DB.GetContext(ctx, &costClaim, fmt.Sprintf(`
		SELECT id, running_number, description, author, cost_pool, details, created,
		modified, source_of_money, other_iban, approved_by FROM cost_claims
		%s
	`, conditions), id)

	return &costClaim, err
}

func (r *queryResolver) User(ctx context.Context, id *string) (*model.User, error) {
	userID := session.Get(ctx)
	if userID == nil {
		return nil, errNotAuthenticated
	}

	var conditions model.Conditions
	columns := ", email, signature, role, pw_hash, position, phone, iban"

	if id != nil && userID != nil && *id != *userID {
		currentUser, _ := r.Query().User(ctx, nil)
		if currentUser == nil {
			return nil, errNotAuthenticated
		}

		resource := "users"
		userID = id

		// Allow all users to query for the name of other users
		var ok bool
		ok, conditions = access.Authorize(currentUser, resource, "read")
		if !ok {
			columns = ""
		}
	}

	conditions.Append("id = ?")

	var user model.User

	err := r.DB.GetContext(ctx, &user, fmt.Sprintf(`
		SELECT id, name%s FROM users %s
	`, columns, conditions), userID)

	return &user, err
}

func (r *queryResolver) Users(ctx context.Context, limit *int, offset int, sortOptions *model.SortOptions) ([]*model.User, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return nil, errNotAuthenticated
	}

	ok, conditions := access.Authorize(currentUser, "users", "read")
	if !ok {
		return nil, errUnauthorized
	}

	var users []*model.User

	orderClause := sortOptions.String(model.SortOptions{Key: "name", Order: "asc"})

	limitClause := ""
	if limit != nil {
		limitClause = fmt.Sprintf("LIMIT %d OFFSET %d", *limit, offset)
	}
	err := r.DB.SelectContext(ctx, &users, fmt.Sprintf(`
		SELECT id, name, email, signature, role, pw_hash, position, phone, iban FROM users %s %s %s
	`, conditions, orderClause, limitClause))

	return users, err
}

func (r *queryResolver) CostPools(ctx context.Context, limit *int, offset int, sortOptions *model.SortOptions) (*model.CostPoolsConnection, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return nil, errNotAuthenticated
	}

	ok, conditions := access.Authorize(currentUser, "costPools", "read")
	if !ok {
		return nil, errUnauthorized
	}

	var costPools []*model.CostPool

	orderClause := sortOptions.String(model.SortOptions{Key: "name", Order: "asc"})

	limitClause := ""
	if limit != nil {
		limitClause = fmt.Sprintf("LIMIT %d OFFSET %d", *limit, offset)
	}
	err := r.DB.SelectContext(ctx, &costPools, fmt.Sprintf(`
		SELECT id, name, budget FROM cost_pools %s %s %s
	`, conditions, orderClause, limitClause))
	if err != nil {
		return nil, err
	}

	var totalCount int
	err = r.DB.GetContext(ctx, &totalCount, fmt.Sprintf(`
		SELECT COUNT(*) FROM cost_pools %s
	`, conditions))

	return &model.CostPoolsConnection{
		Nodes:      costPools,
		TotalCount: totalCount,
	}, err
}

func (r *queryResolver) CostPool(ctx context.Context, id string) (*model.CostPool, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return nil, errNotAuthenticated
	}

	ok, conditions := access.Authorize(currentUser, "costPools", "read")
	if !ok {
		return nil, errUnauthorized
	}

	var costPool model.CostPool

	conditions.Append("id = ?")

	err := r.DB.GetContext(ctx, &costPool, fmt.Sprintf(`
		SELECT id, name, budget FROM cost_pools %s
	`, conditions), id)

	return &costPool, err
}

func (r *queryResolver) Contacts(ctx context.Context, limit *int, offset int, searchTerm *string, sortOptions *model.SortOptions) (*model.ContactsConnection, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return nil, errNotAuthenticated
	}

	ok, conditions := access.Authorize(currentUser, "contacts", "read")
	if !ok {
		return nil, errUnauthorized
	}

	args := make([]interface{}, 0)

	if searchTerm != nil && *searchTerm != "" {
		conditions.Append("MATCH (name, address) AGAINST (?)")
		args = append(args, *searchTerm)
	}

	orderClause := sortOptions.String(model.SortOptions{Key: "name", Order: "asc"})

	limitClause := ""
	if limit != nil {
		limitClause = fmt.Sprintf("LIMIT %d OFFSET %d", *limit, offset)
	}

	var contacts []*model.Contact
	err := r.DB.SelectContext(ctx, &contacts, fmt.Sprintf(`
		SELECT id, name, address FROM contacts %s %s %s
	`, conditions, orderClause, limitClause), args...)
	if err != nil {
		return nil, err
	}

	var totalCount int
	err = r.DB.GetContext(ctx, &totalCount, fmt.Sprintf(`
		SELECT COUNT(*) FROM contacts %s
	`, conditions), args...)

	return &model.ContactsConnection{
		Nodes:      contacts,
		TotalCount: totalCount,
	}, err
}

func (r *queryResolver) Contact(ctx context.Context, id string) (*model.Contact, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return nil, errNotAuthenticated
	}

	ok, conditions := access.Authorize(currentUser, "contacts", "read")
	if !ok {
		return nil, errUnauthorized
	}

	var contact model.Contact

	conditions.Append("id = ?")

	err := r.DB.GetContext(ctx, &contact, fmt.Sprintf(`
		SELECT id, name, address FROM contacts %s
	`, conditions), id)

	return &contact, err
}

func (r *queryResolver) PurchaseInvoices(ctx context.Context, limit *int, offset int, viewOptions *model.ViewOptions, sortOptions *model.SortOptions) (*model.PurchaseInvoicesConnection, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return nil, errNotAuthenticated
	}

	ok, conditions := access.Authorize(currentUser, "purchaseInvoices", "read")
	if !ok {
		return nil, errUnauthorized
	}

	if viewOptions != nil {
		conditions.Append(viewOptions.ToConditions(currentUser.ID)...)
	}

	orderClause := sortOptions.String(model.SortOptions{Key: "created", Order: "desc"})

	limitClause := ""
	if limit != nil {
		limitClause = fmt.Sprintf("LIMIT %d OFFSET %d", *limit, offset)
	}

	var invoices []*model.PurchaseInvoice
	err := r.DB.SelectContext(ctx, &invoices, fmt.Sprintf(`
		SELECT pi.id, sender, pi.description, due_date, status, created, modified, details, author, approved_by,
		ROUND(COALESCE(SUM(pir.amount), 0), 2) AS total, contacts.name AS sender_name
		FROM purchase_invoices pi
		JOIN purchase_invoice_rows pir ON pir.invoice = pi.id
		JOIN contacts ON contacts.id = pi.sender
		%s GROUP BY pi.id %s %s
	`, conditions, orderClause, limitClause))
	if err != nil {
		return nil, err
	}

	var totalCount int
	err = r.DB.GetContext(ctx, &totalCount, fmt.Sprintf(`
		SELECT COUNT(*) FROM purchase_invoices %s
	`, conditions))
	if err != nil {
		return nil, err
	}

	return &model.PurchaseInvoicesConnection{
		Nodes:      invoices,
		TotalCount: totalCount,
	}, nil
}

func (r *queryResolver) PurchaseInvoice(ctx context.Context, id string) (*model.PurchaseInvoice, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return nil, errNotAuthenticated
	}

	ok, conditions := access.Authorize(currentUser, "purchaseInvoices", "read")
	if !ok {
		return nil, errUnauthorized
	}

	conditions.Append("id = ?")

	var invoice model.PurchaseInvoice
	err := r.DB.GetContext(ctx, &invoice, fmt.Sprintf(`
		SELECT id, sender, description, due_date, status, created, modified, details, author, approved_by
		FROM purchase_invoices %s
	`, conditions), id)

	return &invoice, err
}

func (r *queryResolver) SalesInvoices(ctx context.Context, limit *int, offset int, viewOptions *model.ViewOptions, sortOptions *model.SortOptions) (*model.SalesInvoicesConnection, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return nil, errNotAuthenticated
	}

	ok, conditions := access.Authorize(currentUser, "salesInvoices", "read")
	if !ok {
		return nil, errUnauthorized
	}

	if viewOptions != nil {
		conditions.Append(viewOptions.ToConditions(currentUser.ID)...)
	}

	orderClause := sortOptions.String(model.SortOptions{Key: "date", Order: "desc"})

	limitClause := ""
	if limit != nil {
		limitClause = fmt.Sprintf("LIMIT %d OFFSET %d", *limit, offset)
	}

	var invoices []*model.SalesInvoice
	err := r.DB.SelectContext(ctx, &invoices, fmt.Sprintf(`
		SELECT si.id, running_number, recipient, date, due_date, status, details, payer_reference, contact_person, created, modified, author,
		ROUND(COALESCE(SUM(sir.amount), 0), 2) AS total, contacts.name AS recipient_name
		FROM sales_invoices si
		JOIN sales_invoice_rows sir ON sir.invoice = si.id
		JOIN contacts ON contacts.id = si.recipient
		%s GROUP BY si.id %s %s
	`, conditions, orderClause, limitClause))
	if err != nil {
		return nil, err
	}

	var totalCount int
	err = r.DB.GetContext(ctx, &totalCount, fmt.Sprintf(`
		SELECT COUNT(*) FROM sales_invoices %s
	`, conditions))
	if err != nil {
		return nil, err
	}

	return &model.SalesInvoicesConnection{
		Nodes:      invoices,
		TotalCount: totalCount,
	}, nil
}

func (r *queryResolver) SalesInvoice(ctx context.Context, id string) (*model.SalesInvoice, error) {
	currentUser, _ := r.Query().User(ctx, session.Get(ctx))
	if currentUser == nil {
		return nil, errNotAuthenticated
	}

	ok, conditions := access.Authorize(currentUser, "salesInvoices", "read")
	if !ok {
		return nil, errUnauthorized
	}

	conditions.Append("id = ?")

	var invoice model.SalesInvoice
	err := r.DB.GetContext(ctx, &invoice, fmt.Sprintf(`
		SELECT id, running_number, recipient, date, due_date, status, details, payer_reference, contact_person, created, modified, author
		FROM sales_invoices %s
	`, conditions), id)

	return &invoice, err
}

func (r *queryResolver) SystemInfo(ctx context.Context) (*model.SystemInfo, error) {
	var dbVersion string
	err := r.DB.GetContext(ctx, &dbVersion, `SELECT VERSION()`)

	return &model.SystemInfo{
		ServerVersion: r.ServerVersion,
		Database:      dbVersion,
	}, err
}

func (r *queryResolver) AccessPolicy(ctx context.Context) (string, error) {
	policy, err := json.Marshal(access.Policy)
	return string(policy), err
}

func (r *salesInvoiceResolver) Author(ctx context.Context, obj *model.SalesInvoice) (*model.User, error) {
	return r.Query().User(ctx, &obj.AuthorID)
}

func (r *salesInvoiceResolver) RunningNumber(ctx context.Context, obj *model.SalesInvoice) (int, error) {
	t, err := time.Parse("2006-01-02 15:04:05", obj.Created)

	if err != nil {
		log.Debugf("%#v", obj)
	}

	return t.Year()*10000 + 1000 + obj.RunningNumberSuffix, err
}

func (r *salesInvoiceResolver) Recipient(ctx context.Context, obj *model.SalesInvoice) (*model.Contact, error) {
	var contact model.Contact

	err := r.DB.GetContext(ctx, &contact, `
		SELECT id, name, address FROM contacts WHERE id = ?
	`, obj.RecipientID)

	return &contact, err
}

func (r *salesInvoiceResolver) Rows(ctx context.Context, obj *model.SalesInvoice) ([]*model.SalesInvoiceRow, error) {
	var rows []*model.SalesInvoiceRow

	err := r.DB.SelectContext(ctx, &rows, `
		SELECT id, invoice, cost_pool, description, amount FROM sales_invoice_rows WHERE invoice = ?
	`, obj.ID)

	return rows, err
}

func (r *salesInvoiceRowResolver) Invoice(ctx context.Context, obj *model.SalesInvoiceRow) (*model.SalesInvoice, error) {
	var invoice model.SalesInvoice

	err := r.DB.GetContext(ctx, &invoice, `
		SELECT id, running_number, recipient, date, due_date, status, details, payer_reference, contact_person, author
		FROM purchase_invoices WHERE id = ?
	`, obj.InvoiceID)

	return &invoice, err
}

func (r *salesInvoiceRowResolver) CostPool(ctx context.Context, obj *model.SalesInvoiceRow) (*model.CostPool, error) {
	return r.Query().CostPool(ctx, obj.CostPoolID)
}

func (r *userResolver) HasPassword(ctx context.Context, obj *model.User) (bool, error) {
	return obj.PasswordHash != "", nil
}

func (r *userResolver) CostClaims(ctx context.Context, obj *model.User) ([]*model.CostClaim, error) {
	userID := session.Get(ctx)
	if userID == nil {
		return nil, errNotAuthenticated
	}

	var costClaims []*model.CostClaim

	err := r.DB.SelectContext(ctx, &costClaims, `
		SELECT id, running_number, description, author, cost_pool, details, created,
		modified, source_of_money, approved_by FROM cost_claims WHERE author = ? ORDER BY created DESC
		`, obj.ID)

	return costClaims, err
}

func (r *userResolver) PurchaseInvoices(ctx context.Context, obj *model.User) ([]*model.PurchaseInvoice, error) {
	userID := session.Get(ctx)
	if userID == nil {
		return nil, errNotAuthenticated
	}

	var invoices []*model.PurchaseInvoice
	err := r.DB.SelectContext(ctx, &invoices, `
		SELECT id, sender, description, due_date, status, created, modified, details, author
		FROM purchase_invoices WHERE author = ? ORDER BY created DESC
	`, obj.ID)

	return invoices, err
}

func (r *userResolver) SalesInvoices(ctx context.Context, obj *model.User) ([]*model.SalesInvoice, error) {
	userID := session.Get(ctx)
	if userID == nil {
		return nil, errNotAuthenticated
	}

	var invoices []*model.SalesInvoice
	err := r.DB.SelectContext(ctx, &invoices, `
	SELECT id, running_number, recipient, date, due_date, status, details, payer_reference, contact_person, created, modified, author
	FROM sales_invoices WHERE author = ? ORDER BY created DESC
	`, obj.ID)

	return invoices, err
}

// Contact returns generated.ContactResolver implementation.
func (r *Resolver) Contact() generated.ContactResolver { return &contactResolver{r} }

// CostClaim returns generated.CostClaimResolver implementation.
func (r *Resolver) CostClaim() generated.CostClaimResolver { return &costClaimResolver{r} }

// CostPool returns generated.CostPoolResolver implementation.
func (r *Resolver) CostPool() generated.CostPoolResolver { return &costPoolResolver{r} }

// Event returns generated.EventResolver implementation.
func (r *Resolver) Event() generated.EventResolver { return &eventResolver{r} }

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// PurchaseInvoice returns generated.PurchaseInvoiceResolver implementation.
func (r *Resolver) PurchaseInvoice() generated.PurchaseInvoiceResolver {
	return &purchaseInvoiceResolver{r}
}

// PurchaseInvoiceRow returns generated.PurchaseInvoiceRowResolver implementation.
func (r *Resolver) PurchaseInvoiceRow() generated.PurchaseInvoiceRowResolver {
	return &purchaseInvoiceRowResolver{r}
}

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

// SalesInvoice returns generated.SalesInvoiceResolver implementation.
func (r *Resolver) SalesInvoice() generated.SalesInvoiceResolver { return &salesInvoiceResolver{r} }

// SalesInvoiceRow returns generated.SalesInvoiceRowResolver implementation.
func (r *Resolver) SalesInvoiceRow() generated.SalesInvoiceRowResolver {
	return &salesInvoiceRowResolver{r}
}

// User returns generated.UserResolver implementation.
func (r *Resolver) User() generated.UserResolver { return &userResolver{r} }

type contactResolver struct{ *Resolver }
type costClaimResolver struct{ *Resolver }
type costPoolResolver struct{ *Resolver }
type eventResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
type purchaseInvoiceResolver struct{ *Resolver }
type purchaseInvoiceRowResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type salesInvoiceResolver struct{ *Resolver }
type salesInvoiceRowResolver struct{ *Resolver }
type userResolver struct{ *Resolver }
