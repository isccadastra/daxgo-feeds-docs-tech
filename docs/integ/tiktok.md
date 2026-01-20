---
title: Integração TikTok Shop
---

# Integração TikTok Shop

Sincronização de produtos e pedidos com TikTok Shop.

## Models

### Autenticação
- `TikTokAuthToken`: Tokens de autenticação
- `TikTokToken`: Tokens de acesso

### Sincronização
- `TikTokBrands`: Marcas cadastradas
- `TikTokOrders`: Pedidos importados

### Logs
- `TikTokLogProduct`: Produtos sincronizados
- `TikTokLogPrice`: Alterações de preço
- `TikTokLogStock`: Alterações de estoque
- `TikTokLogOrder`: Processamento de pedidos
- `TikTokLogPriceProduct`: Log detalhado de preços

## Taxonomia

**Model:** `TaxonomyTikTok`

Mapeia categorias internas para categorias TikTok.

## Component

**Arquivo:** `components/LambdaTiktok.php`

Lambda function para sincronização assíncrona.

## Configuração

### Variáveis de ambiente

```php
'TIKTOK_APP_KEY' => 'app_key_xxxx',
'TIKTOK_APP_SECRET' => 'app_secret_xxxx',
'TIKTOK_OAUTH_REDIRECT_URI' => 'https://feeds.daxgo.io/tiktok/callback',
```

## Fluxo de sincronização

1. Autenticar com TikTok OAuth
2. Importar catálogo de produtos
3. Sincronizar preços e estoque
4. Importar pedidos
5. Atualizar status

## Endpoints TikTok API

- `/product/list`: Listar produtos
- `/product/upload`: Criar/atualizar produtos
- `/order/list`: Listar pedidos
- `/logistics/tracking`: Rastreamento


