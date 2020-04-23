package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"errors"

	"github.com/indecstty/findecs/graph/generated"
	"github.com/indecstty/findecs/graph/model"
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
		SELECT ROUND(SUM(amount), 2) FROM receipts WHERE cost_claim = ?
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

func (r *mutationResolver) CreateCostClaim(ctx context.Context, costClaim model.CostClaimInput, receipts []*model.ReceiptInput) (*model.CostClaim, error) {
	// Begin
	tx, err := r.DB.BeginTxx(ctx, nil)
	if err != nil {
		return nil, err
	}
	// Fetch latest running number
	var runningNumber int
	err = tx.GetContext(ctx, &runningNumber, `
		SELECT COALESCE(MAX(running_number), 0) FROM cost_claims WHERE year = YEAR(CURRENT_TIMESTAMP) GROUP BY running_number
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
		newReceipt := model.Receipt{
			ID:         r.ShortID.MustGenerate(),
			Attachment: receipt.Attachment,
			Amount:     receipt.Amount,
			Date:       receipt.Date,
		}

		_, err = tx.ExecContext(ctx, `
			INSERT INTO receipts (id, date, amount, attachment, cost_claim) VALUES (?, ?, ?, ?, ?)
		`, newReceipt.ID, newReceipt.Date, newReceipt.Amount, newReceipt.Attachment, newCostClaim.ID)
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

func (r *queryResolver) CostClaim(ctx context.Context, id string) (*model.CostClaim, error) {
	var costClaim model.CostClaim

	err := r.DB.GetContext(ctx, &costClaim, `
		SELECT id, running_number, description, author, cost_pool, status, details, created,
		modified, accepted_by, source_of_money FROM cost_claims
		WHERE id = ?
	`, id)

	return &costClaim, err
}

func (r *queryResolver) CostClaims(ctx context.Context) ([]*model.CostClaim, error) {
	var costClaims []*model.CostClaim

	err := r.DB.SelectContext(ctx, &costClaims, `
		SELECT id, running_number, description, author, cost_pool, status, details, created,
		modified, accepted_by, source_of_money FROM cost_claims
	`)

	return costClaims, err
}

func (r *queryResolver) User(ctx context.Context, id string) (*model.User, error) {
	var user model.User

	err := r.DB.GetContext(ctx, &user, `
		SELECT id, name, email, signature, role FROM users WHERE id = ?
	`, id)

	return &user, err
}

func (r *queryResolver) Users(ctx context.Context) ([]*model.User, error) {
	var users []*model.User

	err := r.DB.SelectContext(ctx, &users, `
		SELECT id, name, email, signature, role FROM users
	`)

	return users, err
}

func (r *queryResolver) CostPools(ctx context.Context) ([]*model.CostPool, error) {
	var costPools []*model.CostPool

	err := r.DB.SelectContext(ctx, &costPools, `
		SELECT id, name, budget FROM cost_pools ORDER BY name ASC
	`)

	return costPools, err
}

// CostClaim returns generated.CostClaimResolver implementation.
func (r *Resolver) CostClaim() generated.CostClaimResolver { return &costClaimResolver{r} }

// CostPool returns generated.CostPoolResolver implementation.
func (r *Resolver) CostPool() generated.CostPoolResolver { return &costPoolResolver{r} }

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type costClaimResolver struct{ *Resolver }
type costPoolResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
