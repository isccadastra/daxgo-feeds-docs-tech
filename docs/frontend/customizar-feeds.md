---
title: Customizar Feeds (Front-end)
---

# Customizar Feeds (Front-end)

O módulo “Customizar Feeds” é um app Vue 2 que entrega a UI de otimização
de feeds e é distribuído como assets estáticos no backend Yii2.

## Repositório

- `feeds-front-vue`

## Stack

- Vue 2
- Axios / VueResource
- Webpack 2 (template clássico)

## Estrutura relevante

- `src/App.vue`: UI principal, regras, filtros, publish e interações.
- `src/main.js`: bootstrap do Vue.
- `build-feeds.sh`: build e cópia de assets para o backend.

## Build e deploy de assets

```bash
cd /home/isckosta/projects/feeds-front-vue
npm install
npm run build
```

O script `build-feeds.sh` automatiza a cópia do build para:

- `feeds-upgrade/web/feed-optimize/static/js/`

## Integração com o backend

### Endpoints

- `POST /feed/get-data-to-optimize`

### Cookies usados

- `client_hash`
- `feed_hash`
- `media_hash`

Esses cookies são setados no backend em `FeedController::actionOptimize()`.

### Fluxo resumido

1. Backend renderiza `views/feed/optimize.php` (apenas `<div id=app></div>`).
2. O layout `views/layouts/feed-optimize.php` carrega `FeedOptimizeAsset`.
3. O bundle injeta os JS gerados do Vue em `feed-optimize/static/js/`.
4. O Vue lê cookies, envia regras/filtros para `/feed/get-data-to-optimize`
   e recebe o JSON atualizado.

## Configuração de path no front-end

No `App.vue`, o path muda conforme o host:

- Local: `http://localhost:9000/feed/get-data-to-optimize`
- Produção: `/feed/get-data-to-optimize`

