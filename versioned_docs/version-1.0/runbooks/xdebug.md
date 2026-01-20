---
title: Xdebug
---

# Xdebug

Este runbook descreve como usar o Xdebug no backend `feeds-upgrade`.

## Pré-requisitos

- Extensão **PHP Debug** no VSCode/Cursor.

## Subir o ambiente

```bash
cd /home/isckosta/projects/feeds-upgrade
docker-compose down
docker-compose build php
docker-compose up -d
```

## Verificar Xdebug

```bash
docker exec -it php-feeds php -v
```

## Configuração essencial

- Porta: `9003`
- Client host: `host.docker.internal`
- Path mapping: `/application` → workspace local

## Troubleshooting

- Xdebug não pausa: verifique se o debugger está “listening” no editor.
- Se a porta 9003 estiver ocupada, libere-a no host.

