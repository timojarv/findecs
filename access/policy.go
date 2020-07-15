package access

import (
	log "github.com/sirupsen/logrus"

	"github.com/timojarv/findecs/graph/model"
	"gopkg.in/yaml.v2"
)

const rightsYAML = `
basic:
    - resources:
        - costClaims
        - purchaseInvoices
      actions:
        create: allow
        read: own
        update: (status = created OR status = rejected)
    - resources:
        - salesInvoices
      actions:
        create: allow
        read: own
        update: status != paid
        delete: status != paid
    - resources:
        - costPools
      actions:
        read: allow
    - resources:
        - contacts
      actions:
        create: allow
        read: allow
        update: allow
admin:
    - resources:
        - costClaims
        - salesInvoices
        - purchaseInvoices
        - costPools
        - contacts
      actions:
        all: allow
    - resources:
        - users
      actions:
        read: allow
    
root:
    - resources:
        - costClaims
        - salesInvoices
        - purchaseInvoices
        - costPools
        - contacts
        - users
      actions:
        all: allow
`

// ControlDefinition defines access policies for a specific user
type ControlDefinition struct {
	Resources []string
	Actions   map[string]string
}

// ControlPolicy defines the whole policy
type ControlPolicy map[model.UserRole][]ControlDefinition

// Policy is the main program access control policy
var Policy ControlPolicy

func init() {
	err := yaml.Unmarshal([]byte(rightsYAML), &Policy)
	if err != nil {
		log.Fatal(err)
	}

	// Validate the access controls
	for role := range Policy {
		if !role.IsValid() {
			log.Fatalf("Invalid user role in access control policy: %s", role)
		}
	}

	log.Info("Access control policy loaded.")
}
