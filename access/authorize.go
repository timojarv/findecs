package access

import (
	log "github.com/sirupsen/logrus"
	"github.com/timojarv/findecs/graph/model"
)

// Authorize checks the operation against the access policy
func Authorize(user *model.User, resource, action string) (bool, model.Conditions) {
	conditions := model.Conditions{}
	allowed := false

	if user == nil {
		return allowed, conditions
	}

	for role, definitions := range Policy {
		if role == user.Role {
			for _, definition := range definitions {
				for _, resourceType := range definition.Resources {
					if resourceType == resource || resourceType == "all" {
						policy, ok := definition.Actions[action]
						if !ok {
							policy, ok = definition.Actions["all"]
						}

						if !ok {
							continue
						}

						if policy != "" {
							allowed = true
						}

						if policy == "own" {
							conditions = append(conditions, "author = '"+user.ID+"'")
						} else if policy != "allow" {
							conditions = append(conditions, policy)
						}
					}
				}
			}
		}
	}

	log.WithFields(log.Fields{
		"user":    user.ID,
		"role":    user.Role,
		"action":  action,
		"resouce": resource,
	}).Debug("Authorizing against access control policy")

	if allowed {
		log.WithField("conditions", conditions).Debug("Authorization succeeded")
	} else {
		log.Debug("Authorization failed")
	}

	return allowed, conditions
}
