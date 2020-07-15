package main

import (
	"context"
	"flag"
	"net/http"
	"os"
	"strings"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"
	"github.com/mailgun/mailgun-go"
	log "github.com/sirupsen/logrus"
	"github.com/teris-io/shortid"
	"github.com/timojarv/findecs/access"
	"github.com/timojarv/findecs/graph"
	"github.com/timojarv/findecs/graph/generated"
	"github.com/timojarv/findecs/graph/model"
	"github.com/timojarv/findecs/session"
	"github.com/timojarv/findecs/storage"
	"github.com/timojarv/findecs/store"
)

const defaultPort = "8080"

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	debug := flag.Bool("debug", false, "Set debug logging")
	bootstrap := flag.Bool("bootstrap", false, "Create initial user")
	usePlayground := flag.Bool("playground", true, "Enable GraphQL playground")
	useUI := flag.Bool("ui", false, "Enable UI server")
	flag.Parse()
	if *debug {
		log.SetLevel(log.DebugLevel)
		log.Debug("Debugging logs enabled.")
	}

	log.Info("💸 Findecs 💸")

	router := chi.NewRouter()

	router.Use(cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:1234", "http://192.168.10.51:1234"},
		AllowCredentials: true,
	}).Handler)

	router.Use(session.Middleware(store.DB.DB))

	router.Use(middleware.Logger)

	resolver := graph.Resolver{
		DB:            store.DB,
		ShortID:       shortid.MustNew(1, shortid.DefaultABC, 326691),
		ServerVersion: "findecs-v0.1.0",
		Mailgun:       mailgun.NewMailgun(os.Getenv("MAILGUN_DOMAIN"), os.Getenv("MAILGUN_KEY")),
		URL:           os.Getenv("FINDECS_URL"),
	}
	srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &resolver}))

	// Bootstrapping
	if *bootstrap {
		pw := "admin"
		_, err := resolver.MakeUser(context.Background(), model.UserInput{
			Name:     "Admin",
			Email:    "admin@email.com",
			Role:     "root",
			Password: &pw,
		})
		if err != nil {
			log.Fatal(err)
		}
		log.Info("Initial user created.")
	}

	if *usePlayground {
		router.Handle("/playground", playground.Handler("GraphQL playground", "/query"))
		log.Infof("Connect to http://localhost:%s/playground for GraphQL playground.", port)
	} else {
		log.Info("Playground is disabled.")
	}
	router.Handle("/query", srv)

	// Uploaded files
	FileServer(router, "/upload", http.Dir(storage.UPLOAD_DIR))

	// User interface
	if *useUI {
		FileServer(router, "/", http.Dir("ui"))
		log.Info("Serving UI on root route.")
	}

	log.Debugf("%+v", access.Policy)

	log.Fatal(http.ListenAndServe(":"+port, router))
}

// FileServer conveniently sets up a http.FileServer handler to serve
// static files from a http.FileSystem.
func FileServer(r chi.Router, path string, root http.FileSystem) {
	if strings.ContainsAny(path, "{}*") {
		panic("FileServer does not permit any URL parameters.")
	}

	if path != "/" && path[len(path)-1] != '/' {
		r.Get(path, http.RedirectHandler(path+"/", 301).ServeHTTP)
		path += "/"
	}
	path += "*"

	r.Get(path, func(w http.ResponseWriter, r *http.Request) {
		rctx := chi.RouteContext(r.Context())
		pathPrefix := strings.TrimSuffix(rctx.RoutePattern(), "/*")
		fs := http.StripPrefix(pathPrefix, http.FileServer(root))
		fs.ServeHTTP(w, r)
	})
}
