package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"errors"
	"fmt"
	"strings"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/hashicorp/go-multierror"
	"github.com/indecstty/findecs/graph/generated"
	"github.com/indecstty/findecs/graph/model"
	"github.com/indecstty/findecs/storage"
	"github.com/jmoiron/sqlx"
	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
)

func (r *costClaimResolver) Author(ctx context.Context, obj *model.CostClaim) (*model.User, error) {
	var user model.User

	err := r.DB.GetContext(ctx, &user, `
		SELECT id, name, email FROM users WHERE id = ? 
	`, obj.AuthorID)

	return &user, err
}

func (r *costClaimResolver) CostPool(ctx context.Context, obj *model.CostClaim) (*model.CostPool, error) {
	var costPool model.CostPool

	err := r.DB.GetContext(ctx, &costPool, `
		SELECT id, name FROM cost_pools WHERE id = ? 
	`, obj.CostPoolID)

	return &costPool, err
}

func (r *costClaimResolver) AcceptedBy(ctx context.Context, obj *model.CostClaim) (*model.User, error) {
	var acceptor model.User
	var err error

	if obj.AcceptedByID != nil {
		err = r.DB.GetContext(ctx, &acceptor, `
			SELECT id, name, email FROM users WHERE id = ? 
		`, obj.AcceptedByID)
	}

	return &acceptor, err
}

func (r *costClaimResolver) Receipts(ctx context.Context, obj *model.CostClaim) ([]*model.Receipt, error) {
	var receipts []*model.Receipt

	err := r.DB.SelectContext(ctx, &receipts, `
		SELECT id, amount, attachment, date FROM receipts WHERE cost_claim = ?
	`, obj.ID)

	return receipts, err
}

func (r *costClaimResolver) Total(ctx context.Context, obj *model.CostClaim) (float64, error) {
	var total float64

	err := r.DB.GetContext(ctx, &total, `
		SELECT ROUND(COALESCE(SUM(amount), 0), 2) FROM receipts WHERE cost_claim = ?
	`, obj.ID)

	return total, err
}

func (r *costPoolResolver) Total(ctx context.Context, obj *model.CostPool) (float64, error) {
	var total float64

	err := r.DB.GetContext(ctx, &total, `
		SELECT ROUND(COALESCE(SUM(receipts.amount), 0), 2)
		FROM cost_claims
		JOIN receipts
		ON receipts.cost_claim = cost_claims.id
		AND cost_claims.cost_pool = ?
	`, obj.ID)

	return total, err
}

func (r *mutationResolver) CreateUser(ctx context.Context, user model.UserInput) (*model.User, error) {
	newUser := model.User{
		ID:    r.ShortID.MustGenerate(),
		Name:  user.Name,
		Email: user.Email,
	}

	_, err := r.DB.ExecContext(ctx, `
		INSERT INTO users (id, name, email, pw_hash) VALUES (?, ?, ?, 'temp_hash')
	`, newUser.ID, newUser.Name, newUser.Email)
	return &newUser, err
}

func (r *mutationResolver) CreateCostPool(ctx context.Context, costPool model.CostPoolInput) (*model.CostPool, error) {
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
	_, err := r.DB.ExecContext(ctx, `
		UPDATE cost_pools SET name = ?, budget = ? WHERE id = ?
	`, costPool.Name, costPool.Budget, id)

	return &model.CostPool{
		ID:     id,
		Name:   costPool.Name,
		Budget: costPool.Budget,
	}, err
}

func (r *mutationResolver) DeleteCostPool(ctx context.Context, id string) (string, error) {
	_, err := r.DB.ExecContext(ctx, `
		DELETE FROM cost_pools WHERE id = ?
	`, id)

	return id, err
}

func (r *mutationResolver) CreateCostClaim(ctx context.Context, costClaim model.CostClaimInput, receipts []*model.ReceiptInput) (*model.CostClaim, error) {
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
		AuthorID:      costClaim.Author,
		CostPoolID:    costClaim.CostPool,
		Status:        "created",
		Details:       costClaim.Details,
		SourceOfMoney: costClaim.SourceOfMoney,
	}

	_, err = tx.ExecContext(ctx, `
		INSERT INTO cost_claims (id, running_number, description, author, cost_pool, status, details, source_of_money)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`,
		newCostClaim.ID,
		newCostClaim.RunningNumber,
		newCostClaim.Description,
		newCostClaim.AuthorID,
		newCostClaim.CostPoolID,
		newCostClaim.Status,
		newCostClaim.Details,
		newCostClaim.SourceOfMoney)
	if err != nil {
		tx.Rollback()
		return &newCostClaim, err
	}

	for _, receipt := range receipts {
		err = r.CreateReceipt(ctx, receipt, newCostClaim.ID, tx)
		if err != nil {
			tx.Rollback()
			return &newCostClaim, err
		}
	}

	err = tx.GetContext(ctx, &newCostClaim, `
		SELECT created, modified FROM cost_claims WHERE id = ?
	`, newCostClaim.ID)
	if err != nil {
		tx.Rollback()
		return &newCostClaim, err
	}

	err = tx.Commit()
	return &newCostClaim, err
}

func (r *mutationResolver) UpdateCostClaim(ctx context.Context, id string, costClaim model.CostClaimInput, receipts []*model.ReceiptInput) (*model.CostClaim, error) {
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
			err = r.CreateReceipt(ctx, receipt, id, tx)
		}

		if err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	// Update cost claim
	_, err = tx.ExecContext(ctx, `
		UPDATE cost_claims SET description = ?, cost_pool = ?, details = ?, source_of_money = ? WHERE id = ?
	`, costClaim.Description, costClaim.CostPool, costClaim.Details, costClaim.SourceOfMoney, id)
	if err != nil {
		tx.Rollback()
		return nil, err
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
	updated, err := r.Resolver.Query().CostClaim(ctx, id)

	// Lastly delete removed receipt files
	for _, removed := range removedReceipts {
		storage.DeleteReceipt(removed.Attachment)
	}

	return updated, err
}

func (r *mutationResolver) DeleteCostClaim(ctx context.Context, id string) (string, error) {
	var receipts []string

	err := r.DB.SelectContext(ctx, &receipts, `
		SELECT attachment FROM receipts WHERE cost_claim = ?
	`, id)
	if err != nil {
		return id, err
	}

	_, err = r.DB.ExecContext(ctx, `
		DELETE FROM cost_claims WHERE id = ?
	`, id)
	if err != nil {
		return id, err
	}

	var errors error

	for _, receipt := range receipts {
		if err = storage.DeleteReceipt(receipt); err != nil {
			errors = multierror.Append(err)
		}
	}

	return id, errors
}

func (r *mutationResolver) SetCostClaimStatus(ctx context.Context, id string, status model.Status) (*model.CostClaim, error) {
	var claim model.CostClaim

	tx, err := r.DB.BeginTxx(ctx, nil)
	if err != nil {
		return &claim, nil
	}

	_, err = tx.ExecContext(ctx, `
		UPDATE cost_claims SET status = ? WHERE id = ?
	`, status, id)
	if err != nil {
		tx.Rollback()
		return &claim, err
	}

	err = tx.GetContext(ctx, &claim, `
		SELECT id, running_number, description, author, cost_pool, status, details, created,
		modified, accepted_by, source_of_money FROM cost_claims
		WHERE id = ?
	`, id)

	return &claim, err
}

func (r *mutationResolver) CreateContact(ctx context.Context, contact model.ContactInput) (*model.Contact, error) {
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

func (r *queryResolver) CostClaims(ctx context.Context, limit *int, offset int) ([]*model.CostClaim, error) {
	var costClaims []*model.CostClaim

	limitClause := ""
	if limit != nil {
		limitClause = fmt.Sprintf("LIMIT %d OFFSET %d", *limit, offset)
	}
	err := r.DB.SelectContext(ctx, &costClaims, fmt.Sprintf(`
		SELECT id, running_number, description, author, cost_pool, status, details, created,
		modified, accepted_by, source_of_money FROM cost_claims ORDER BY created DESC %s
		`, limitClause))

	return costClaims, err
}

func (r *queryResolver) CostClaim(ctx context.Context, id string) (*model.CostClaim, error) {
	var costClaim model.CostClaim

	err := r.DB.GetContext(ctx, &costClaim, `
		SELECT id, running_number, description, author, cost_pool, status, details, created,
		modified, accepted_by, source_of_money FROM cost_claims
		WHERE id = ?
	`, id)

	return &costClaim, err
}

func (r *queryResolver) User(ctx context.Context, id string) (*model.User, error) {
	var user model.User

	err := r.DB.GetContext(ctx, &user, `
		SELECT id, name, email, signature, role, pw_hash FROM users WHERE id = ?
	`, id)

	return &user, err
}

func (r *queryResolver) Users(ctx context.Context, limit *int, offset int) ([]*model.User, error) {
	var users []*model.User

	limitClause := ""
	if limit != nil {
		limitClause = fmt.Sprintf("LIMIT %d OFFSET %d", *limit, offset)
	}
	err := r.DB.SelectContext(ctx, &users, fmt.Sprintf(`
		SELECT id, name, email, signature, role, pw_hash FROM users ORDER BY name %s
	`, limitClause))

	return users, err
}

func (r *queryResolver) CostPools(ctx context.Context, limit *int, offset int) ([]*model.CostPool, error) {
	var costPools []*model.CostPool

	limitClause := ""
	if limit != nil {
		limitClause = fmt.Sprintf("LIMIT %d OFFSET %d", *limit, offset)
	}
	err := r.DB.SelectContext(ctx, &costPools, fmt.Sprintf(`
		SELECT id, name, budget FROM cost_pools ORDER BY name %s
	`, limitClause))

	return costPools, err
}

func (r *queryResolver) Contacts(ctx context.Context, limit *int, offset int) ([]*model.Contact, error) {
	var contacts []*model.Contact

	limitClause := ""
	if limit != nil {
		limitClause = fmt.Sprintf("LIMIT %d OFFSET %d", *limit, offset)
	}
	err := r.DB.SelectContext(ctx, &contacts, fmt.Sprintf(`
		SELECT id, name, address FROM contacts ORDER BY name %s
	`, limitClause))

	return contacts, err
}

func (r *queryResolver) AccessToken(ctx context.Context, email string, password string) (string, error) {
	var user model.User

	r.DB.GetContext(ctx, &user, `
		SELECT id, name, email, pw_hash FROM users WHERE email = ?
	`, email)

	err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))

	if err != nil || user.PasswordHash == "" {
		return "", errors.New("authentication failed")
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":   user.ID,
		"name":  user.Name,
		"email": user.Email,
	})

	tokenString, err := token.SignedString(r.JWTKey)

	return tokenString, err
}

func (r *userResolver) HasPassword(ctx context.Context, obj *model.User) (bool, error) {
	return obj.PasswordHash != "", nil
}

// CostClaim returns generated.CostClaimResolver implementation.
func (r *Resolver) CostClaim() generated.CostClaimResolver { return &costClaimResolver{r} }

// CostPool returns generated.CostPoolResolver implementation.
func (r *Resolver) CostPool() generated.CostPoolResolver { return &costPoolResolver{r} }

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

// User returns generated.UserResolver implementation.
func (r *Resolver) User() generated.UserResolver { return &userResolver{r} }

type costClaimResolver struct{ *Resolver }
type costPoolResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type userResolver struct{ *Resolver }

// !!! WARNING !!!
// The code below was going to be deleted when updating resolvers. It has been copied here so you have
// one last chance to move it out of harms way if you want. There are two reasons this happens:
//  - When renaming or deleting a resolver the old code will be put in here. You can safely delete
//    it when you're done.
//  - You have helper methods in this file. Move them out to keep these resolver files clean.
func (r *mutationResolver) CreateReceipt(ctx context.Context, receipt *model.ReceiptInput, costClaimID string, tx *sqlx.Tx) error {
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
