---
title: API Endpoints
description: Referência completa dos endpoints REST da API do Daxgo Feeds
keywords: [api, rest, endpoints, http, json, autenticação]
tags: [backend, api, referência]
---

# API Endpoints

Referência completa dos endpoints REST da API do Daxgo Feeds.

## Sumário

- [Autenticação](#autenticação)
- [Feeds](#feeds)
- [Otimização de Feeds](#otimização-de-feeds)
- [Promoções (Google Merchant)](#promoções-google-merchant)
- [OAuth2 Google](#oauth2-google)
- [Clientes](#clientes)
- [Usuários](#usuários)
- [Dashboard](#dashboard)
- [Códigos de Status](#códigos-de-status)
- [Erros Comuns](#erros-comuns)

---

## Autenticação

:::warning Autenticação obrigatória
Todos os endpoints requerem autenticação via **sessão do Yii2** (cookies `PHPSESSID`), exceto onde explicitamente indicado. Requisições POST exigem **CSRF token** (`X-CSRF-Token` header ou campo `_csrf`).
:::

### Headers obrigatórios

```http
Content-Type: application/json
X-Requested-With: XMLHttpRequest
X-CSRF-Token: [token obtido via meta tag ou cookie]
Cookie: PHPSESSID=[session_id]
```

### Rate Limiting

| Tipo | Limite |
|------|--------|
| Por usuário | 60 req/min |
| Por cliente | 300 req/min |

---

## Feeds

### Listar Feeds

```http
GET /feed
```

Lista todos os feeds do cliente autenticado.

**Resposta de sucesso (200)**

```json
{
  "feeds": [
    {
      "hash": "abc123...",
      "name": "Feed Principal",
      "url": "https://example.com/feed.xml",
      "file_type": "xml",
      "schedule": "hour",
      "status": "active",
      "last_import": "2026-01-27T10:30:00Z",
      "total_products": 1500
    }
  ],
  "total": 1
}
```

---

### Criar Feed

```http
POST /feed/insert
```

Cria um novo feed para o cliente autenticado.

**Parâmetros do body**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `name` | `string` | Sim | Nome do feed |
| `url` | `string` | Sim | URL do feed de origem |
| `file_type` | `string` | Sim | Tipo: `xml`, `csv`, `zip` |
| `schedule` | `string` | Não | Frequência: `hour`, `day`, `week` |
| `item_wrapper` | `string` | Não | Nó XML do produto (padrão: `product`) |

**Exemplo de requisição**

```json
{
  "name": "Feed Principal",
  "url": "https://example.com/feed.xml",
  "file_type": "xml",
  "schedule": "hour",
  "item_wrapper": "product"
}
```

**Resposta de sucesso (201)**

```json
{
  "status": "success",
  "message": "Feed criado com sucesso",
  "feed_hash": "abc123..."
}
```

**Possíveis erros**

| Código | Descrição |
|--------|-----------|
| `400` | URL inválida ou formato não suportado |
| `422` | Validação falhou (campos obrigatórios) |

---

### Atualizar Feed

```http
POST /feed/update
```

Atualiza configurações de um feed existente.

**Parâmetros do body**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `feed_hash` | `string` | Sim | Hash do feed |
| `name` | `string` | Não | Novo nome |
| `url` | `string` | Não | Nova URL |
| `schedule` | `string` | Não | Nova frequência |
| `status` | `string` | Não | `active` ou `inactive` |

**Resposta de sucesso (200)**

```json
{
  "status": "success",
  "message": "Feed atualizado com sucesso"
}
```

---

### Deletar Feed

```http
POST /feed/delete
```

Remove um feed e todos os seus dados associados.

**Parâmetros do body**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `feed_hash` | `string` | Sim | Hash do feed |

**Resposta de sucesso (200)**

```json
{
  "status": "success",
  "message": "Feed deletado com sucesso"
}
```

:::danger Atenção
Esta ação é **irreversível**. Todos os produtos, customizações e histórico do feed serão permanentemente removidos.
:::

---

## Otimização de Feeds

### Iniciar Otimização

```http
GET /feed/optimize
```

Inicializa a interface de customização/otimização de feeds. Realiza validação de concorrência e prepara o arquivo temporário no S3.

**Parâmetros de query**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `client` | `string` | Sim | Hash do cliente |
| `feed` | `string` | Sim | Hash do feed |
| `media` | `string` | Sim | Hash da mídia (ex: Google Shopping) |

**Exemplo de requisição**

```http
GET /feed/optimize?client=abc123&feed=def456&media=ghi789
```

**Resposta de sucesso (200)**

Retorna HTML da interface Vue 2 de otimização.

**Possíveis erros**

| Código | Descrição |
|--------|-----------|
| `403` | Feed/mídia já está sendo otimizado por outro usuário |
| `404` | Feed/mídia não encontrado |

:::info Controle de concorrência
Este endpoint implementa bloqueio de concorrência. Se outro usuário já estiver otimizando o mesmo feed/mídia, a requisição será redirecionada para `/dashboard`.
:::

---

### Carregar/Processar Dados

```http
POST /feed/get-data-to-optimize
```

Retorna produtos otimizados aplicando regras, filtros, busca e paginação. Este endpoint é usado tanto para **preview** quanto para **publicação**.

:::warning CSRF desabilitado
Este endpoint tem `enableCsrfValidation = false` para permitir requisições AJAX do frontend Vue 2.
:::

**Parâmetros do body**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `client_hash` | `string` | Sim | Hash do cliente |
| `feed_hash` | `string` | Sim | Hash do feed |
| `media_hash` | `string` | Sim | Hash da mídia |
| `qtd_per_page` | `number` | Não | Produtos por página (padrão: 30) |
| `page` | `number` | Não | Página atual (0-based) |
| `search_by` | `string` | Não | Campo de busca (ex: `title`, `sku`) |
| `search_value` | `string` | Não | Valor da busca |
| `order_by` | `string` | Não | Campo de ordenação |
| `order_type` | `string` | Não | `asc` ou `desc` |
| `products` | `array` | Não | Produtos atuais (estado do frontend) |
| `rules` | `array` | Não | Regras de transformação |
| `filters` | `array` | Não | Filtros de produtos |
| `regrasFeed` | `object` | Não | Mapeamento de campos |
| `titles_created` | `array` | Não | Colunas customizadas |
| `publish_products` | `number` | Não | `0` = preview, `1` = publicar |
| `is_first_request` | `number` | Não | `1` = primeira requisição |

**Exemplo de requisição (preview)**

```json
{
  "client_hash": "abc123",
  "feed_hash": "def456",
  "media_hash": "ghi789",
  "qtd_per_page": 30,
  "page": 0,
  "search_by": "title",
  "search_value": "iPhone",
  "order_by": "price",
  "order_type": "asc",
  "products": [],
  "rules": [
    {
      "id": 0,
      "coluna": "title",
      "regra": "substituir_texto",
      "texto1": "iPhone",
      "texto2": "iPhone 15 Pro",
      "ativo": true
    }
  ],
  "filters": [
    {
      "id": 0,
      "coluna": "price",
      "condicao": "maior_que",
      "texto": "100",
      "active": true
    }
  ],
  "publish_products": 0,
  "is_first_request": 0
}
```

**Resposta de sucesso (200) - Preview**

```json
{
  "produtos_default": [
    {
      "sku": "IPHONE-001",
      "title": "iPhone 15 Pro 256GB",
      "price": "7999.00",
      "brand": "Apple",
      "availability": "in stock",
      "ssxml_status": "active",
      "ssxml_manual_set": {},
      "optimize_conversion_rate": 0.035,
      "optimize_views": 1500
    }
  ],
  "regras": [...],
  "filtros": [...],
  "regrasFeed": {
    "title": "name",
    "price": "price",
    "link": "url"
  },
  "default_fields": {
    "id": "ID do produto",
    "title": "Título",
    "price": "Preço"
  },
  "page": 0,
  "titles": ["sku", "title", "price", "brand"],
  "titles_created": ["custom_field_0"],
  "totalPages": 15,
  "totalProducts": 450,
  "media_name": "Google Shopping"
}
```

**Exemplo de requisição (publicação)**

```json
{
  "client_hash": "abc123",
  "feed_hash": "def456",
  "media_hash": "ghi789",
  "products": [...],
  "rules": [...],
  "filters": [...],
  "regrasFeed": {...},
  "titles_created": [...],
  "publish_products": 1
}
```

**Resposta de sucesso (200) - Publicação**

```json
{
  "status": "success",
  "message": "Feed publicado com sucesso!",
  "feed_url": "https://s3.amazonaws.com/daxgo/feeds/abc123_def456_ghi789.xml",
  "published_at": "2026-01-27T10:30:00Z",
  "total_products": 450
}
```

**Possíveis erros**

| Código | Descrição |
|--------|-----------|
| `400` | Parâmetros inválidos |
| `403` | Permissão negada (client/feed/media) |
| `500` | Erro na Lambda de otimização |

:::tip Integração com Lambda
Este endpoint invoca a Lambda `ssxml_product_optimize_PRODUCAO` via componente [`FeedRunOptimizeOnLambda`](./componentes#feedrunoptimizeonlambda) para processar os produtos de forma assíncrona.
:::

---

## Promoções (Google Merchant)

### Listar Promoções

```http
GET /promotions
```

Lista promoções do Google Merchant Center com filtros avançados.

**Parâmetros de query**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `search` | `string` | Busca textual (título ou ID) |
| `status` | `string` | Filtro: `active`, `archived`, `stopped` |
| `sync_status` | `string` | Filtro: `pending`, `synced`, `error` |
| `start_date_from` | `date` | Data de início (mínima) |
| `start_date_to` | `date` | Data de início (máxima) |
| `end_date_from` | `date` | Data de término (mínima) |
| `end_date_to` | `date` | Data de término (máxima) |
| `redemption_channel` | `string` | `ONLINE` ou `IN_STORE` |
| `promotion_destination` | `string` | Ex: `FREE_LISTINGS`, `SHOPPING_ADS` |

**Exemplo de requisição**

```http
GET /promotions?status=active&sync_status=synced&redemption_channel=ONLINE
```

**Resposta de sucesso (200)**

Retorna HTML da interface de gerenciamento.

---

### Listar Promoções (AJAX)

```http
GET /promotions/list-data
```

Endpoint AJAX para atualização dinâmica da listagem.

**Resposta de sucesso (200)**

```json
{
  "html": "<table>...</table>",
  "stats": {
    "total": 100,
    "active": 80,
    "synced": 75,
    "error": 5,
    "stopped": 15,
    "pending_sync": 10
  }
}
```

---

### Criar Promoção

```http
POST /promotions/insert
```

Cria uma nova promoção no DynamoDB e opcionalmente sincroniza com o Google Merchant Center.

**Parâmetros do body**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `promotion_id` | `string` | Sim | ID único da promoção |
| `title` | `string` | Sim | Título da promoção |
| `start_date` | `date` | Sim | Data de início (ISO 8601) |
| `end_date` | `date` | Sim | Data de término |
| `buyer_incentive_type` | `string` | Sim | `PERCENTAGE`, `MONEY_OFF`, `BUY_M_GET_N_MONEY_OFF` |
| `buyer_incentive_value` | `number` | Sim | Valor do desconto |
| `redemption_channel` | `string` | Sim | `ONLINE`, `IN_STORE` |
| `promotion_destinations` | `array` | Sim | Ex: `["FREE_LISTINGS", "SHOPPING_ADS"]` |
| `product_applicability` | `string` | Não | `ALL_PRODUCTS`, `SPECIFIC_PRODUCTS` |
| `offer_type` | `string` | Não | `GENERIC_CODE`, `NO_CODE` |
| `coupon_code` | `string` | Não | Código do cupom (se aplicável) |
| `sync_immediately` | `boolean` | Não | Sincronizar com Google agora (padrão: `false`) |

**Exemplo de requisição**

```json
{
  "promotion_id": "BLACK_FRIDAY_2026",
  "title": "Black Friday 2026 - 30% OFF",
  "start_date": "2026-11-24T00:00:00Z",
  "end_date": "2026-11-30T23:59:59Z",
  "buyer_incentive_type": "PERCENTAGE",
  "buyer_incentive_value": 30,
  "redemption_channel": "ONLINE",
  "promotion_destinations": ["FREE_LISTINGS", "SHOPPING_ADS"],
  "product_applicability": "ALL_PRODUCTS",
  "offer_type": "NO_CODE",
  "sync_immediately": true
}
```

**Resposta de sucesso (201)**

```json
{
  "status": "success",
  "message": "Promoção criada com sucesso",
  "promotion_id": "BLACK_FRIDAY_2026",
  "sync_status": "synced"
}
```

---

### Visualizar Promoção

```http
GET /promotions/view/{promotion_id}
```

Retorna detalhes completos de uma promoção.

**Resposta de sucesso (200)**

```json
{
  "promotion_id": "BLACK_FRIDAY_2026",
  "title": "Black Friday 2026 - 30% OFF",
  "status": "active",
  "sync_status": "synced",
  "start_date": "2026-11-24T00:00:00Z",
  "end_date": "2026-11-30T23:59:59Z",
  "buyer_incentive_type": "PERCENTAGE",
  "buyer_incentive_value": 30,
  "created_at": "2026-01-20T10:00:00Z",
  "last_sync": "2026-01-27T09:00:00Z"
}
```

---

### Atualizar Promoção

```http
POST /promotions/update/{promotion_id}
```

Atualiza uma promoção existente.

**Parâmetros do body**

Aceita os mesmos campos de criação (apenas campos fornecidos serão atualizados).

---

### Deletar Promoção

```http
POST /promotions/delete/{promotion_id}
```

Remove uma promoção do DynamoDB e do Google Merchant Center.

**Resposta de sucesso (200)**

```json
{
  "status": "success",
  "message": "Promoção deletada com sucesso"
}
```

---

### Deletar Múltiplas Promoções

```http
POST /promotions/bulk-delete
```

Remove múltiplas promoções de uma vez.

**Parâmetros do body**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `promotion_ids` | `array` | Sim | Array de IDs de promoções |

**Exemplo de requisição**

```json
{
  "promotion_ids": ["PROMO_1", "PROMO_2", "PROMO_3"]
}
```

---

### Sincronizar Promoção

```http
POST /promotions/sync/{promotion_id}
```

Sincroniza uma promoção específica com o Google Merchant Center.

**Resposta de sucesso (200)**

```json
{
  "status": "success",
  "message": "Promoção sincronizada com sucesso",
  "sync_status": "synced"
}
```

---

### Sincronizar Todas Pendentes

```http
POST /promotions/sync-from-google
```

Sincroniza todas as promoções com status `pending` ou `error`.

**Resposta de sucesso (200)**

```json
{
  "status": "success",
  "message": "10 promoções sincronizadas com sucesso",
  "synced": 10,
  "errors": 0
}
```

---

### Encerrar Promoção

```http
POST /promotions/stop/{promotion_id}
```

Encerra uma promoção imediatamente, atualizando seu status para `stopped`.

---

### Exportar CSV

```http
GET /promotions/export-csv
```

Exporta todas as promoções filtradas para arquivo CSV.

**Resposta de sucesso (200)**

```csv
promotion_id,title,status,start_date,end_date,buyer_incentive_type,buyer_incentive_value
BLACK_FRIDAY_2026,"Black Friday 2026 - 30% OFF",active,2026-11-24,2026-11-30,PERCENTAGE,30
```

---

### Exportar PDF

```http
GET /promotions/export-pdf
```

Exporta relatório de promoções em PDF (visualização do cliente).

---

## OAuth2 Google

### Iniciar Autorização

```http
GET /oauth2/google/authorize
```

Inicia o fluxo OAuth2 para autorizar acesso ao Google Merchant Center. Redireciona o usuário para a tela de consentimento do Google.

**Parâmetros de query**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `client_hash` | `string` | Sim | Hash do cliente |
| `merchant_id` | `string` | Sim | ID da conta do Google Merchant Center |

**Exemplo de requisição**

```http
GET /oauth2/google/authorize?client_hash=abc123&merchant_id=1234567890
```

**Resposta de sucesso (302)**

Redireciona para: `https://accounts.google.com/o/oauth2/v2/auth?...`

---

### Callback OAuth2

```http
GET /oauth2/google/callback
```

Endpoint de callback para receber o authorization code do Google após o usuário autorizar o acesso.

**Parâmetros de query**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `code` | `string` | Authorization code do Google |
| `state` | `string` | State para validação CSRF |
| `error` | `string` | Erro (se usuário negar acesso) |

**Fluxo de sucesso**

1. Recebe `code` do Google
2. Troca `code` por `access_token` e `refresh_token`
3. Armazena tokens no DynamoDB (`GoogleMerchantTokenService`)
4. Redireciona para dashboard com mensagem de sucesso

---

### Revogar Acesso

```http
POST /oauth2/google/revoke
```

Revoga tokens de acesso do Google e remove do DynamoDB.

**Parâmetros do body**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `client_hash` | `string` | Sim | Hash do cliente |

**Resposta de sucesso (200)**

```json
{
  "status": "success",
  "message": "Acesso revogado com sucesso"
}
```

---

## Clientes

:::warning Acesso restrito
Endpoints de gerenciamento de clientes requerem permissões de **administrador**.
:::

### Listar Clientes

```http
GET /client
```

Lista todos os clientes cadastrados (admin only).

**Resposta de sucesso (200)**

```json
{
  "clients": [
    {
      "hash": "abc123",
      "name": "Loja Exemplo",
      "cnpj": "12.345.678/0001-90",
      "status": "active",
      "created_at": "2025-01-01T00:00:00Z",
      "total_feeds": 5
    }
  ],
  "total": 1
}
```

---

### Criar Cliente

```http
POST /client/insert
```

Cria um novo cliente no sistema.

**Parâmetros do body**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `name` | `string` | Sim | Nome do cliente |
| `cnpj` | `string` | Sim | CNPJ (validado) |
| `email` | `string` | Sim | E-mail principal |
| `phone` | `string` | Não | Telefone |
| `google_merchant_id` | `string` | Não | ID do Google Merchant Center |
| `catalogo_inteligente` | `boolean` | Não | Ativar IA (padrão: `false`) |

---

### Atualizar Cliente

```http
POST /client/update
```

Atualiza dados de um cliente existente.

---

### Deletar Cliente

```http
POST /client/delete
```

Remove um cliente e todos os seus dados associados (feeds, produtos, usuários).

:::danger Atenção
Esta ação é **irreversível** e remove permanentemente todos os dados do cliente.
:::

---

## Usuários

### Listar Usuários

```http
GET /user
```

Lista todos os usuários do cliente autenticado.

---

### Criar Usuário

```http
POST /user/insert
```

Cria um novo usuário associado ao cliente.

**Parâmetros do body**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `name` | `string` | Sim | Nome do usuário |
| `email` | `string` | Sim | E-mail (único) |
| `password` | `string` | Sim | Senha (mínimo 8 caracteres) |
| `role` | `string` | Não | `admin`, `user` (padrão: `user`) |

---

### Atualizar Usuário

```http
POST /user/update
```

Atualiza dados de um usuário existente.

---

### Deletar Usuário

```http
POST /user/delete
```

Remove um usuário do sistema.

---

## Dashboard

### Obter Estatísticas

```http
GET /dashboard
```

Retorna estatísticas gerais do cliente autenticado.

**Resposta de sucesso (200)**

```json
{
  "stats": {
    "total_feeds": 10,
    "total_products": 15000,
    "feeds_processing": 2,
    "feeds_active": 8,
    "last_import": "2026-01-27T10:00:00Z",
    "promotions_active": 5,
    "analytics": {
      "total_views": 50000,
      "total_clicks": 2500,
      "conversion_rate": 0.035
    }
  }
}
```

---

## Códigos de Status

| Código | Descrição | Quando ocorre |
|--------|-----------|---------------|
| `200` | OK | Requisição bem-sucedida |
| `201` | Created | Recurso criado com sucesso |
| `204` | No Content | Ação bem-sucedida sem retorno |
| `400` | Bad Request | Parâmetros inválidos ou faltando |
| `401` | Unauthorized | Não autenticado (sessão expirada) |
| `403` | Forbidden | Sem permissão para acessar recurso |
| `404` | Not Found | Recurso não encontrado |
| `422` | Unprocessable Entity | Validação de dados falhou |
| `429` | Too Many Requests | Rate limit excedido |
| `500` | Internal Server Error | Erro interno do servidor |
| `503` | Service Unavailable | Serviço temporariamente indisponível |

---

## Erros Comuns

### Erro de CSRF Token

**Problema**: `400 Bad Request - Invalid CSRF Token`

**Causa**: Token CSRF ausente, inválido ou expirado.

**Solução**:
```javascript
// Obter token da meta tag
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

// Incluir no header
fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

---

### Erro de Sessão Expirada

**Problema**: `401 Unauthorized - Session Expired`

**Causa**: Sessão do usuário expirou (inatividade > 30 minutos).

**Solução**: Redirecionar para `/site/login`.

---

### Erro de Concorrência

**Problema**: `403 Forbidden - Feed is being optimized by another user`

**Causa**: Outro usuário está otimizando o mesmo feed/mídia.

**Solução**: Aguardar o outro usuário finalizar ou solicitar que libere o acesso.

---

### Erro de Lambda Timeout

**Problema**: `500 Internal Server Error - Lambda timeout`

**Causa**: Lambda de otimização excedeu o tempo limite (muitos produtos ou regras complexas).

**Solução**:
- Reduzir quantidade de produtos por página
- Simplificar regras de transformação
- Contatar suporte para aumentar timeout da Lambda

---

### Erro de Rate Limit

**Problema**: `429 Too Many Requests`

**Causa**: Excedeu o limite de 60 requisições/minuto.

**Solução**: Implementar retry com backoff exponencial:

```javascript
async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, options);
    
    if (response.status !== 429) {
      return response;
    }
    
    // Backoff exponencial: 1s, 2s, 4s...
    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
  }
  
  throw new Error('Rate limit exceeded after retries');
}
```

---

## Exemplos de Uso

### JavaScript (Fetch API)

```javascript
// Criar feed
async function createFeed(feedData) {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
  
  const response = await fetch('/feed/insert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: JSON.stringify(feedData)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

// Uso
const newFeed = await createFeed({
  name: 'Feed Principal',
  url: 'https://example.com/feed.xml',
  file_type: 'xml',
  schedule: 'hour'
});

console.log('Feed criado:', newFeed.feed_hash);
```

---

### cURL

```bash
# Login
curl -X POST https://app.daxgo.com/site/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "senha"}' \
  -c cookies.txt

# Criar feed (com cookies de sessão)
curl -X POST https://app.daxgo.com/feed/insert \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: TOKEN_AQUI" \
  -b cookies.txt \
  -d '{
    "name": "Feed Principal",
    "url": "https://example.com/feed.xml",
    "file_type": "xml",
    "schedule": "hour"
  }'
```

---

:::tip Documentação relacionada
- [Estrutura Yii2](./estrutura-yii2.md) - Controllers e actions
- [Componentes](./componentes.md) - Componentes usados pelos endpoints
- [Modelos de Dados](./modelos-dados.md) - Estrutura dos dados
:::


