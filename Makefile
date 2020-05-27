.PHONY: default
default:
	go run .

.PHONY: build
build:
	CGO_ENABLED=0 go build -o findecs .

.PHONY: ui
ui:
	yarn --cwd ui build

.PHONY: docker
docker: build ui
	docker build -t timojarv/findecs .