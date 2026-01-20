---
title: Estrutura do backend (Yii2)
---

# Estrutura do backend (Yii2)

O backend principal está no repositório `feeds-upgrade`, baseado em Yii2 e PHP 8.2.

## Organização de pastas

- `controllers/`: endpoints e ações principais.
- `models/`: entidades e models de domínio.
- `services/`: serviços de integração (ex.: Google Merchant).
- `components/`: componentes utilitários (S3, processamento de feeds).
- `views/`: páginas/partials do backend.
- `web/`: assets públicos e bundles.

## Rotas e controllers relevantes

- `FeedController`
  - `actionOptimize()`: inicializa otimização, set de cookies/sessão e layout do módulo.
  - `actionGetDataToOptimize()`: recebe regras/filtros e retorna JSON otimizado.
- `PromotionController` e `OAuth2GoogleController`: integração com Google Merchant.

## Fluxo de otimização (backend)

1. `actionOptimize()` recebe `client_hash`, `feed_hash`, `media_hash`.
2. Define cookies e sessão para o front-end usar no módulo.
3. Registra o bundle `FeedOptimizeAsset`, que carrega o front-end compilado.
4. `actionGetDataToOptimize()` processa regras, filtros e devolve dados.

## Assets do front-end de otimização

O bundle `FeedOptimizeAsset` busca arquivos em `web/feed-optimize/static/js/`
e injeta no layout `views/layouts/feed-optimize.php`.

## Cron

O cron principal está definido em `cron.yaml` com execução de `/cron.php` a cada 5 min.

