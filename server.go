package main

import (
	"flag"
	"net/http"
	"os"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/go-chi/chi"
	"github.com/go-chi/cors"
	"github.com/indecstty/findecs/graph"
	"github.com/indecstty/findecs/graph/generated"
	"github.com/indecstty/findecs/store"
	log "github.com/sirupsen/logrus"
	"github.com/teris-io/shortid"
)

const defaultPort = "8080"

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	delay := flag.Bool("delay", false, "Delay the request")
	flag.Parse()

	log.Info("💸 Findecs 💸")

	router := chi.NewRouter()

	router.Use(cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:8080", "http://localhost:1234"},
		AllowCredentials: true,
	}).Handler)

	if *delay {
		router.Use(func(handler http.Handler) http.Handler {
			time.Sleep(2 * time.Second)
			return handler
		})
		log.Info("All requests will be delayed by 2 seconds.")
	}

	srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{
		DB:      store.DB,
		ShortID: shortid.MustNew(1, shortid.DefaultABC, 326691),
	}}))

	router.Handle("/", playground.Handler("GraphQL playground", "/query"))
	router.Handle("/query", srv)

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}
