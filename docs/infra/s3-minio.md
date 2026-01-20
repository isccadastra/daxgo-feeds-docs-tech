---
title: S3/MinIO (armazenamento)
---

# S3/MinIO (armazenamento)

O armazenamento local usa MinIO, compatível com S3, para arquivos de otimização
e feeds publicados.

## Estrutura de buckets

- Bucket: `daxgo`
- Pastas principais:
  - `json-to-optimize/`
  - `feeds/`
  - `temp/`

## Fluxo básico

1. O backend gera o JSON do feed.
2. Copia para `_temp.json` durante a otimização.
3. Publicação promove o `_temp.json` para o arquivo final.

## Diagnóstico rápido

```bash
docker logs -f minio_feeds_s3
```

## Console web

- Acesso: `http://localhost:9090`
- Usuário: `admin`
- Senha: `password`

