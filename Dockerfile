FROM alpine
WORKDIR /app

COPY ./migration /app/migration
COPY ./findecs /app/findecs
COPY ./ui/dist/ /app/ui/

ENTRYPOINT ["/app/findecs"]
CMD ["-playground=false", "-ui=true"]