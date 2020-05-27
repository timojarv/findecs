package storage

import (
	"io"
	"os"
	"path/filepath"

	log "github.com/sirupsen/logrus"
)

const UPLOAD_DIR = "upload"

var receiptsDir string
var signaturesDir string

func init() {
	receiptsDir = filepath.Join(UPLOAD_DIR, "receipts")
	err := os.MkdirAll(receiptsDir, os.ModeDir+os.ModePerm)
	if err != nil && !os.IsExist(err) {
		log.Fatal(err)
	}

	signaturesDir = filepath.Join(UPLOAD_DIR, "signatures")
	err = os.MkdirAll(signaturesDir, os.ModeDir+os.ModePerm)
	if err != nil && !os.IsExist(err) {
		log.Fatal(err)
	}
}

func SaveReceipt(file io.Reader, filename string) error {
	path := filepath.Join(receiptsDir, filename)
	fd, err := os.Create(path)
	if err != nil {
		return err
	}

	_, err = io.Copy(fd, file)
	return err
}

func SaveSignature(file io.Reader, filename string) error {
	path := filepath.Join(signaturesDir, filename)
	fd, err := os.Create(path)
	if err != nil {
		return err
	}

	_, err = io.Copy(fd, file)
	return err
}

func DeleteReceipt(receipt string) error {
	path := filepath.Join(receiptsDir, receipt)
	return os.Remove(path)
}
