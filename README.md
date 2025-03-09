# BCS2420-lab-project

## Installation (manual)

- Tested with Node.js v22

Clone the repository

```bash
git clone https://github.com/macluxHD/BCS2420-lab-project
```

Install the dependencies

```bash
npm install
```

### HTTPS setup

Install mkcert

https://github.com/FiloSottile/mkcert?tab=readme-ov-file#installation

Install CA locally

```bash
mkcert -install
```

To generate a self-signed certificate

Put the certificate in the `certs` folder

```bash
mkdir certs && cd certs
```

Generate the certificate

```bash
mkcert localhost
```

### Running

Run the server

```bash
npm start
```

## Installation (Docker)

To start

```bash
docker-compose up --build -d
```

To stop

```bash
docker-compose down
```

To see the logs

```bash
docker-compose logs -f
```
