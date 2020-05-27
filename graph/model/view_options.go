package model

import (
	"fmt"
	"strings"
)

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
	if len(conditions) == 0 {
		return ""
	}

	return "WHERE " + strings.Join(conditions, " AND ")
}
