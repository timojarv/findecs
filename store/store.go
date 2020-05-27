package store

import (
	"fmt"
	"os"

	"github.com/jmoiron/sqlx"
	// Import driver
	_ "github.com/go-sql-driver/mysql"
	"github.com/golang-migrate/migrate/v4"

	// Migration driver
	"github.com/golang-migrate/migrate/v4/database/mysql"
	// Migration source
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/sirupsen/logrus"
)

// DB is the main datastore
var DB *sqlx.DB

func init() {
	var err error
	dbHost := os.Getenv("MYSQL_HOST")
	if dbHost == "" {
		dbHost = "127.0.0.1"
	}
	dbPort := os.Getenv("MYSQL_PORT")
	if dbPort == "" {
		dbPort = "3306"
	}
	dsn := fmt.Sprintf("findecs:%s@tcp(%s:%s)/findecs?multiStatements=true&interpolateParams=true", os.Getenv("MYSQL_PASSWORD"), dbHost, dbPort)
	DB, err = sqlx.Connect("mysql", dsn)
	if err != nil {
		logrus.Fatal(err)
	}

	logrus.Info("Database connected.")

	driver, err := mysql.WithInstance(DB.DB, &mysql.Config{})
	if err != nil {
		logrus.Fatal(err)
	}
	m, err := migrate.NewWithDatabaseInstance(
		"file://migration",
		"mysql", driver)
	if err != nil {
		logrus.Fatal(err)
	}
	err = m.Up()
	if err != nil {
		if err == migrate.ErrNoChange {
			version, _, _ := m.Version()
			logrus.Infof("Database is at the latest version. (v%d)", version)
		} else {
			logrus.Fatal(err)
		}
	} else {
		version, _, _ := m.Version()
		logrus.Infof("Database migrated. Currently at v%d.", version)
	}
}
