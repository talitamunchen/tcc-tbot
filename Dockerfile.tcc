FROM talitamunchen/base-tcc:lastest

WORKDIR /app
COPY . /app
ENTRYPOINT node index.js