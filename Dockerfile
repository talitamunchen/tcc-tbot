FROM base-tcc:latest

WORKDIR /app
COPY . /app
ENTRYPOINT node index.js