# BCS2420-lab-project

## certificates

Install mkcert

https://github.com/FiloSottile/mkcert?tab=readme-ov-file#installation

Install CA locally

```bash
mkcert -install
```

To generate a self-signed certificate

```bash
mkdir certs && cd certs && mkcert localhost
```

## Docker

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

## Exploits

- Broken Access control (endpoints no access control)
- Injection (`admin'; DROP TABLE users; --// `)
- Insecure design
- identification and authentication failures (dictionary attacks)
- Security Logging and Monitoring Failures (No logging)
- Cryptography failure (No encryption enforced http / passwords not hashed in db)
