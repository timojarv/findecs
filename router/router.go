package router

import (
	"html/template"
	"net/http"
	"strconv"

	"github.com/sirupsen/logrus"
)

var mux *http.ServeMux

func init() {
	mux = http.NewServeMux()
	mux.HandleFunc("/", indexHandler)
}

// Run starts the router
func Run(host string, port int) {
	logrus.WithFields(logrus.Fields{
		"port": port,
		"host": host,
	}).Info("Router started.")

	logrus.Fatal(http.ListenAndServe(host+":"+strconv.Itoa(port), mux))
}

func render(w http.ResponseWriter, tmpl string, data interface{}) {
	t := template.Must(template.ParseFiles("templates/"+tmpl+".html", "templates/base.html"))
	t.Execute(w, data)
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	render(w, "costclaims", map[string]string{
		"Title": "Frontpage",
	})
}
