package main

import (
	"bufio"
	"flag"
	"fmt"
	"os"
	"strings"

	"github.com/indecstty/findecs/router"
	"github.com/indecstty/findecs/store"
	log "github.com/sirupsen/logrus"
)

func main() {
	var port int
	var host string
	flag.IntVar(&port, "port", 5000, "Server port")
	flag.StringVar(&host, "host", "0.0.0.0", "Server host")
	flag.Parse()
	log.Info("💸 Findecs 💸")

	go repl()
	router.Run(host, port)
}

func repl() {
	reader := bufio.NewReader(os.Stdin)

	for {
		fmt.Print("> ")
		cmd, _ := reader.ReadString('\n')

		cmd = strings.TrimSpace(cmd)

		_, err := store.DB.Exec(cmd)
		if err != nil {
			log.Error(err)
		} else {
			fmt.Println("OK")
		}
	}
}
