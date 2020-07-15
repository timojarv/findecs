package model

import (
	"fmt"
	"strings"
)

var allowedKeys = map[string]string{
	"description":   "description",
	"created":       "created",
	"name":          "name",
	"author":        "author_name",
	"status":        "status",
	"sender":        "sender_name",
	"total":         "total",
	"dueDate":       "due_date",
	"runningNumber": "running_number",
	"recipient":     "recipient_name",
	"date":          "date",
}

// Conditions is a vector of query conditions
type Conditions []string

// ToConditions converts the view options into SQL conditions
func (v *ViewOptions) ToConditions(userID string) []string {
	conditions := make(Conditions, 0)

	if v.Author == "self" {
		conditions = append(conditions, fmt.Sprintf("author = '%s'", userID))
	}

	if Status.IsValid(Status(v.Status)) {
		conditions = append(conditions, fmt.Sprintf("status = '%s'", v.Status))
	}

	return conditions
}

func (conditions Conditions) String() string {
	if conditions == nil {
		return ""
	}

	if len(conditions) == 0 {
		return ""
	}

	return "WHERE " + strings.Join(conditions, " AND ")
}

// Append adds new conditions to an existing set
func (conditions *Conditions) Append(newConditions ...string) {
	*conditions = append(*conditions, newConditions...)
}

func (so *SortOptions) String(do SortOptions) string {
	res := "ORDER BY"
	if so != nil && so.Order.IsValid() {
		if key, ok := allowedKeys[so.Key]; ok {
			res += fmt.Sprintf(" %s %s,", key, so.Order)
		}
	}

	res += fmt.Sprintf(" %s %s ", do.Key, do.Order)

	return res
}
