---
title: API Endpoints • Referência
---

# API Endpoints • Referência

Documentação dos principais endpoints do sistema.

## Feed Management

### `GET /feed`
Lista feeds do cliente atual.

**Resposta:**
```json
{
  "feeds": [...]
}
```

### `POST /feed/insert`
Cria novo feed.

**Payload:**
```json
{
  "name": "Feed Principal",
  "url": "https://example.com/feed.xml",
  "file_type": "xml",
  "schedule": "hour"
}
```

### `POST /feed/update`
Atualiza feed existente.

### `POST /feed/delete`
Deleta feed.

---

## Feed Optimization

### `GET /feed/optimize`
Inicializa tela de customização.

**Query params:**
- `client_hash`
- `feed_hash`
- `media_hash`

### `POST /feed/get-data-to-optimize`
Retorna dados otimizados para customização.

**Payload:**
```json
{
  "client_hash": "...",
  "feed_hash": "...",
  "media_hash": "...",
  "qtd_per_page": 30,
  "page": 0,
  "search_by": "",
  "search_value": "",
  "order_by": "name",
  "order_type": "asc",
  "products": [...],
  "rules": [...],
  "filters": [...],
  "regrasFeed": {},
  "titles_created": [],
  "publish_products": 0,
  "is_first_request": 1
}
```

**Resposta:**
```json
{
  "produtos_default": [...],
  "regras": [...],
  "filtros": [...],
  "regrasFeed": {},
  "default_fields": {},
  "page": 0,
  "titles": [...],
  "titles_created": [...],
  "totalPages": 100,
  "totalProducts": 3000,
  "media_name": "Facebook Ads",
  "feed_url": "https://..."
}
```

---

## Promotions (Google Merchant)

### `GET /promotions`
Lista promoções com filtros.

**Query params:**
- `search`: Busca textual
- `status`: `active`, `archived`, `stopped`
- `sync_status`: `pending`, `synced`, `error`
- `start_date_from`, `start_date_to`
- `end_date_from`, `end_date_to`
- `redemption_channel`
- `promotion_destination`

### `GET /promotions/list-data`
AJAX endpoint para atualização dinâmica.

**Resposta:**
```json
{
  "html": "<table>...</table>",
  "stats": {
    "total": 100,
    "active": 80,
    "synced": 75,
    "error": 5,
    "stopped": 15
  }
}
```

### `POST /promotions/insert`
Cria promoção.

**Payload:**
```json
{
  "promotion_id": "PROMO_123",
  "title": "Black Friday",
  "start_date": "2025-11-24",
  "end_date": "2025-11-30",
  "buyer_incentive_type": "PERCENTAGE",
  "buyer_incentive_value": 30,
  "redemption_channel": "ONLINE",
  "promotion_destinations": ["FREE_LISTINGS"],
  "sync_immediately": false
}
```

### `GET /promotions/view/{promotion_id}`
Visualiza detalhes.

### `POST /promotions/update/{promotion_id}`
Atualiza promoção.

### `POST /promotions/delete/{promotion_id}`
Deleta promoção.

### `POST /promotions/bulk-delete`
Deleta múltiplas promoções.

**Payload:**
```json
{
  "promotion_ids": ["PROMO_1", "PROMO_2"]
}
```

### `POST /promotions/sync/{promotion_id}`
Sincroniza uma promoção com Google.

### `POST /promotions/sync-from-google`
Sincroniza todas pendentes.

### `POST /promotions/stop/{promotion_id}`
Encerra promoção imediatamente.

### `GET /promotions/export-csv`
Exporta para CSV.

### `GET /promotions/export-pdf`
Exporta para PDF (cliente).

---

## OAuth2 Google

### `GET /oauth2/google/authorize`
Inicia fluxo OAuth2.

**Query params:**
- `client_hash`
- `merchant_id`

### `GET /oauth2/google/callback`
Callback OAuth2.

**Query params:**
- `code`: Authorization code
- `state`: State verification

### `POST /oauth2/google/revoke`
Revoga acesso.

---

## Client Management

### `GET /client`
Lista clientes (admin only).

### `POST /client/insert`
Cria cliente.

### `POST /client/update`
Atualiza cliente.

### `POST /client/delete`
Deleta cliente.

---

## Media Management

### `GET /media`
Lista mídias disponíveis.

### `POST /media/insert`
Cria mídia customizada.

---

## User Management

### `GET /user`
Lista usuários.

### `POST /user/insert`
Cria usuário.

### `POST /user/update`
Atualiza usuário.

### `POST /user/delete`
Deleta usuário.

---

## Dashboard

### `GET /dashboard`
Dashboard principal com estatísticas.

**Resposta:**
```json
{
  "stats": {
    "total_feeds": 10,
    "total_products": 10000,
    "feeds_processing": 2
  }
}
```

---

## Authentication

### `POST /site/login`
Login de usuário.

**Payload:**
```json
{
  "email": "user@example.com",
  "password": "senha"
}
```

### `POST /site/logout`
Logout de usuário.

---

## Filtros e ordenação

Muitos endpoints suportam:

**Ordenação:**
- `order_by`: Nome do campo
- `order_type`: `asc` ou `desc`

**Paginação:**
- `page`: Página atual (0-based)
- `qtd_per_page`: Items por página

**Busca:**
- `search_by`: Campo para buscar
- `search_value`: Valor da busca

---

## Headers comuns

```http
Content-Type: application/json
X-Requested-With: XMLHttpRequest
X-CSRF-Token: [token]
```

## Autenticação

Sessão baseada em cookies do Yii2.

**Cookie:**
- `PHPSESSID`: Session ID
- `_csrf`: CSRF token

## Rate limiting

- 60 requisições por minuto por usuário
- 300 requisições por minuto por cliente

## Status codes

- `200`: Sucesso
- `400`: Bad request
- `401`: Não autenticado
- `403`: Sem permissão
- `404`: Não encontrado
- `422`: Validação falhou
- `500`: Erro interno


