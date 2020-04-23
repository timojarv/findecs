// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

import (
	"fmt"
	"io"
	"strconv"
)

type CostClaimInput struct {
	Description   string        `json:"description"`
	Author        string        `json:"author"`
	CostPool      string        `json:"costPool"`
	Details       *string       `json:"details"`
	SourceOfMoney SourceOfMoney `json:"sourceOfMoney"`
}

type CostPoolInput struct {
	Name   string  `json:"name"`
	Budget float64 `json:"budget"`
}

type Receipt struct {
	ID         string  `json:"id"`
	Attachment string  `json:"attachment"`
	Amount     float64 `json:"amount"`
	Date       string  `json:"date"`
}

type ReceiptInput struct {
	Date       string  `json:"date"`
	Amount     float64 `json:"amount"`
	Attachment string  `json:"attachment"`
}

type User struct {
	ID        string   `json:"id"`
	Name      string   `json:"name"`
	Email     string   `json:"email"`
	Signature *string  `json:"signature"`
	Role      UserRole `json:"role"`
}

type UserInput struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

type SourceOfMoney string

const (
	SourceOfMoneyOwnAccount   SourceOfMoney = "ownAccount"
	SourceOfMoneyOtherAccount SourceOfMoney = "otherAccount"
	SourceOfMoneyCash         SourceOfMoney = "cash"
)

var AllSourceOfMoney = []SourceOfMoney{
	SourceOfMoneyOwnAccount,
	SourceOfMoneyOtherAccount,
	SourceOfMoneyCash,
}

func (e SourceOfMoney) IsValid() bool {
	switch e {
	case SourceOfMoneyOwnAccount, SourceOfMoneyOtherAccount, SourceOfMoneyCash:
		return true
	}
	return false
}

func (e SourceOfMoney) String() string {
	return string(e)
}

func (e *SourceOfMoney) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = SourceOfMoney(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid SourceOfMoney", str)
	}
	return nil
}

func (e SourceOfMoney) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

type Status string

const (
	StatusCreated  Status = "created"
	StatusApproved Status = "approved"
	StatusRejected Status = "rejected"
	StatusPaid     Status = "paid"
)

var AllStatus = []Status{
	StatusCreated,
	StatusApproved,
	StatusRejected,
	StatusPaid,
}

func (e Status) IsValid() bool {
	switch e {
	case StatusCreated, StatusApproved, StatusRejected, StatusPaid:
		return true
	}
	return false
}

func (e Status) String() string {
	return string(e)
}

func (e *Status) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = Status(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid Status", str)
	}
	return nil
}

func (e Status) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

type UserRole string

const (
	UserRoleBasic UserRole = "basic"
	UserRoleAdmin UserRole = "admin"
	UserRoleRoot  UserRole = "root"
)

var AllUserRole = []UserRole{
	UserRoleBasic,
	UserRoleAdmin,
	UserRoleRoot,
}

func (e UserRole) IsValid() bool {
	switch e {
	case UserRoleBasic, UserRoleAdmin, UserRoleRoot:
		return true
	}
	return false
}

func (e UserRole) String() string {
	return string(e)
}

func (e *UserRole) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = UserRole(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid UserRole", str)
	}
	return nil
}

func (e UserRole) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}