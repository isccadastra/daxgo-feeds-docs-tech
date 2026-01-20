---
title: Troubleshooting S3/MinIO
---

# Troubleshooting S3/MinIO

Runbook para erros comuns de S3/MinIO durante customização de mídia.

## Sintoma: 404 ao customizar mídia

Possível causa: bucket/pastas inexistentes no MinIO local.

### Passos rápidos

```bash
cd /home/isckosta/projects/feeds-upgrade
docker-compose down
docker-compose up -d
```

## Verificar bucket

- Acesse `http://localhost:9090`
- Usuário: `admin`
- Senha: `password`
- Confirme bucket `daxgo`

## Script de diagnóstico

```bash
cd /home/isckosta/projects/feeds-upgrade
./debug-s3-issue.sh
```

## Erros comuns

- **Connection refused**: MinIO não subiu; reinicie o container.
- **Access denied**: permissões do bucket; reconfigure via `mc`.
- **NoSuchKey**: arquivo fonte não existe; recriar mídia ou verificar fluxo.

