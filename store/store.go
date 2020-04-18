package store

import (
	"github.com/jmoiron/sqlx"
	// Import driver
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/mattn/go-sqlite3"

	// Migration driver
	"github.com/golang-migrate/migrate/v4/database/sqlite3"
	// Migration source
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/sirupsen/logrus"
)

// DB is the main datastore
var DB *sqlx.DB

func init() {
	var err error
	DB, err = sqlx.Connect("sqlite3", "findecs.db")
	if err != nil {
		logrus.Fatal(err)
	}

	logrus.Info("Database connected.")

	driver, err := sqlite3.WithInstance(DB.DB, &sqlite3.Config{})
	if err != nil {
		logrus.Fatal(err)
	}
	m, err := migrate.NewWithDatabaseInstance(
		"file://migration",
		"sqlite3", driver)
	if err != nil {
		logrus.Fatal(err)
	}
	err = m.Up()
	if err != nil {
		logrus.Fatal(err)
	}
	version, _, _ := m.Version()
	logrus.Infof("Database migrated. Currently at v%d.\n", version)
}
