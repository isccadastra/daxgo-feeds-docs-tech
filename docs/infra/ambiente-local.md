---
title: Ambiente local
---

# Ambiente local

O ambiente local do backend é orquestrado via Docker Compose no repo `feeds-upgrade`.

## Serviços principais

- **php**: aplicação Yii2.
- **nginx**: expõe o app em `http://localhost:9000`.
- **mysql**: banco transacional.
- **dynamodb-local**: dados de promoções e tokens.
- **minio**: S3 local (porta 9666).
- **phpmyadmin**: UI para MySQL (porta 9001).

## Subir o ambiente

```bash
cd /home/isckosta/projects/feeds-upgrade
docker-compose up -d
```

## Portas úteis

- App: `http://localhost:9000`
- PhpMyAdmin: `http://localhost:9001`
- DynamoDB Local: `http://localhost:8000`
- MinIO Console: `http://localhost:9090`
- MinIO S3: `http://localhost:9666`

## Observações

- O PHP usa Xdebug (porta 9003) quando habilitado.
- O MinIO é inicializado com bucket `daxgo` e pastas padrão.

