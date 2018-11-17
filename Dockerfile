FROM base-tcc-talita:latest 

WORKDIR /app
COPY . /app
ENTRYPOINT node index.js