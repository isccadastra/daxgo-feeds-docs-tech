---
title: DynamoDB • Estrutura de dados
description: Estrutura completa das 20+ tabelas DynamoDB - promoções, tokens OAuth, otimizações IA, TikTok Shop, controle de concorrência e entidades principais
keywords: [dynamodb, nosql, promoções, oauth, tokens, tiktok, product studio, ia, feeds]
tags: [infraestrutura, dynamodb, database, nosql]
---

# DynamoDB • Estrutura de dados

Armazenamento NoSQL usado para dados operacionais, promoções, tokens OAuth2 e otimizações de IA.

:::info DynamoDB Local
Em desenvolvimento, usamos DynamoDB Local rodando em Docker. Em produção, AWS DynamoDB gerenciado.
:::

## Sumário

### Promoções e Google Merchant
- [`ssxml_promotions`](#ssxml_promotions) - Promoções sincronizadas com Google
- [`ssxml_google_merchant_tokens`](#ssxml_google_merchant_tokens) - Tokens OAuth2 Google
- [`ssxml_promotion_logs`](#ssxml_promotion_logs) - Logs de erros de promoções
- [`ssxml_shipping_rules`](#ssxml_shipping_rules) - Regras de frete

### Inteligência Artificial
- [`ssxml_ia_feed_media_optimizations`](#ssxml_ia_feed_media_optimizations) - Configurações de IA por feed/mídia
- [`ssxml_ia_optimization_rules`](#ssxml_ia_optimization_rules) - Regras de otimização de IA
- [`ssxml_ia_product_optimizations`](#ssxml_ia_product_optimizations) - Otimizações de IA por produto

### TikTok Shop
- [`ssxml_tik_tok_token`](#ssxml_tik_tok_token) - Tokens OAuth TikTok
- [`ssxml_tik_tok_taxonomy`](#ssxml_tik_tok_taxonomy) - Taxonomia TikTok
- [`ssxml_tik_tok_brands`](#ssxml_tik_tok_brands) - Marcas TikTok
- [`ssxml_tik_tok_log_products`](#ssxml_tik_tok_log_products) - Logs de sincronização

### Product Studio
- [`ssxml_product_studio_campaing`](#ssxml_product_studio_campaing) - Campanhas de imagens personalizadas

### Controle e Publicação
- [`ssxml_feeds_in_optimization`](#ssxml_feeds_in_optimization) - Controle de concorrência
- [`ssxml_product_published`](#ssxml_product_published) - Histórico de produtos publicados
- [`ssxml_feed_content_hash`](#ssxml_feed_content_hash) - Hash de conteúdo de feeds
- [`ssxml_feed_update_time`](#ssxml_feed_update_time) - Timestamps de atualização

### Entidades Principais
- [`ssxml_client`](#ssxml_client) - Clientes cadastrados
- [`ssxml_feed`](#ssxml_feed) - Feeds de produtos
- [`ssxml_client_media`](#ssxml_client_media) - Configurações de mídia por feed
- [`ssxml_user`](#ssxml_user) - Usuários do sistema
- [`ssxml_media`](#ssxml_media) - Mídias disponíveis
- [`ssxml_taxonomy`](#ssxml_taxonomy) - Taxonomia Google
- [`ssxml_product_type`](#ssxml_product_type) - Tipos de produto Google

---

## Promoções e Google Merchant

### `ssxml_promotions`

Armazena promoções criadas no sistema para sincronização com Google Merchant.

**Chave primária:**
- `client_hash` (String, HASH): Hash do cliente
- `promotion_id` (String, RANGE): ID único da promoção

**Atributos:**
```json
{
  "client_hash": "abc123...",
  "promotion_id": "PROMO_1733123456_ABC",
  "title": "Black Friday - 30% OFF",
  "start_date": "2025-11-24",
  "end_date": "2025-11-30",
  "redemption_channel": ["ONLINE"],
  "promotion_destinations": ["FREE_LISTINGS", "SHOPPING_ADS"],
  "buyer_incentive": {
    "type": "PERCENTAGE",
    "value": 30
  },
  "conditions": {
    "min_items": 2,
    "min_price": 100.00
  },
  "sync_status": "SYNCED",
  "status": "active",
  "created_at": "2025-01-19T10:00:00Z",
  "updated_at": "2025-01-19T10:05:00Z",
  "last_synced_at": "2025-01-19T10:05:00Z",
  "target_audience": "EVERYONE",
  "qualification_requirement": "",
  "use_promotion_id_link": false,
  "product_applicability": "ALL_PRODUCTS"
}
```

**Valores possíveis:**
- `sync_status`: `PENDING`, `SYNCED`, `ERROR`
- `status`: `active`, `archived`, `stopped`
- `redemption_channel`: `ONLINE`, `IN_STORE`
- `promotion_destinations`: `FREE_LISTINGS`, `SHOPPING_ADS`, `GOOGLE_WALLET`
- `buyer_incentive.type`: `PERCENTAGE`, `AMOUNT`, `CASHBACK`, `DISCOUNT_INTERVAL`, `FREE_SHIPPING_STANDARD`, `FREE_SHIPPING_OVERNIGHT`, `FREE_SHIPPING_TWO_DAY`

**Service:** `PromotionService`

---

### `ssxml_google_merchant_tokens`

Armazena tokens OAuth2 para integração com Google Merchant Center.

**Chave primária:**
- `client_hash` (String, HASH): Hash do cliente
- `merchant_id` (String, RANGE): ID do Merchant Center

**Atributos:**
```json
{
  "client_hash": "abc123...",
  "merchant_id": "123456789",
  "access_token": "ya29.a0...",
  "refresh_token": "1//...",
  "token_expires_at": "2025-01-19T11:00:00Z",
  "expires_in": 3600,
  "status": "active",
  "authorized_at": "2025-01-19T10:00:00Z",
  "updated_at": "2025-01-19T10:00:00Z",
  "email": "user@example.com",
  "account_name": "Merchant Account"
}
```

**Valores possíveis:**
- `status`: `active`, `revoked`
- `expires_in`: Segundos até expiração (geralmente 3600)

**Service:** `GoogleMerchantTokenService`

**Renovação automática:**
- Tokens são renovados automaticamente quando faltam menos de 10 minutos para expirar
- Usa `refresh_token` para obter novo `access_token`
- Se `refresh_token` inválido, marca como `revoked`

---

### `ssxml_promotion_logs`

Logs de erros e eventos relacionados a promoções.

**Chave primária:**
- `client_hash` (String, HASH): Hash do cliente
- `timestamp` (String, RANGE): Timestamp do evento

**Atributos:**
```json
{
  "client_hash": "abc123...",
  "timestamp": "2025-01-19T10:05:00.123Z",
  "promotion_id": "PROMO_1733123456_ABC",
  "error_type": "sync_error",
  "error_message": "Invalid promotion data...",
  "error_trace": "Exception stack trace...",
  "action": "sync",
  "merchant_id": "123456789",
  "context": {}
}
```

**Tipos de erro:**
- `sync_error`: Erro na sincronização
- `validation_error`: Erro de validação
- `auth_error`: Erro de autenticação
- `api_error`: Erro na API do Google

**Model:** `PromotionLog`

---

### `ssxml_ia_feed_media_optimizations`

Configurações de otimizações de IA por feed/mídia.

**Chave primária:**
- `client_hash` (String, HASH): Hash do cliente
- `feed_hash` (String, RANGE): Hash do feed

**Atributos:**
```json
{
  "client_hash": "abc123...",
  "feed_hash": "def456...",
  "media_hash": "ghi789...",
  "main_feed": true,
  "optimizations": {
    "title": true,
    "description": true,
    "category": true
  },
  "status": "active",
  "created_at": "2025-01-19T10:00:00Z",
  "updated_at": "2025-01-19T10:05:00Z"
}
```

**Model:** `IaFeedMediaOptimizations`

---

### `ssxml_ia_optimization_rules`

Regras de otimização de IA.

**Chave primária:**
- `client_hash` (String, HASH): Hash do cliente
- `rule_id` (String, RANGE): ID da regra

**Atributos:**
```json
{
  "client_hash": "abc123...",
  "rule_id": "rule_123",
  "field": "title",
  "rule_type": "add_brand",
  "parameters": {},
  "status": "active"
}
```

**Model:** `IaOptimizationRules`

---

### `ssxml_ia_product_optimizations`

Armazena otimizações de IA aplicadas a produtos específicos.

**Chave primária:**
- `client_hash` (String, HASH): Hash do cliente
- `feed_hash_product_id` (String, RANGE): `{feed_hash}_{product_id}`

**Atributos:**
```json
{
  "client_hash": "abc123",
  "feed_hash_product_id": "def456_PROD-001",
  "feed_hash": "def456",
  "product_id": "PROD-001",
  "optimizations": {
    "general": {
      "title": "Título otimizado por IA",
      "description": "Descrição melhorada",
      "category": "Categoria sugerida"
    },
    "ghi789": {
      "title": "Título específico para Google Shopping"
    }
  },
  "created_at": "2026-01-27T10:00:00Z",
  "updated_at": "2026-01-27T10:30:00Z"
}
```

**Uso**: Catálogo Inteligente - otimizações por produto e mídia

---

### `ssxml_shipping_rules`

Regras de frete para sincronização com Google Merchant Center.

**Chave primária:**
- `client_hash` (String, HASH): Hash do cliente
- `shipping_hash` (String, RANGE): Hash único da regra

**Atributos:**
```json
{
  "client_hash": "abc123",
  "shipping_hash": "ship_456",
  "type": "CEP",
  "cep_start": "01000000",
  "cep_end": "05999999",
  "region_code": null,
  "transit_time_min": 2,
  "transit_time_max": 5,
  "cost": 15.90,
  "status": "active",
  "google_status": "synced",
  "created_at": "2026-01-20T10:00:00Z",
  "updated_at": "2026-01-27T09:00:00Z"
}
```

**Tipos de regra:**
- `CEP`: Faixa de CEPs (`cep_start` até `cep_end`)
- `REGION`: Estados/regiões (`region_code`: SP, RJ, etc.)

**Status Google:**
- `not_synced`: Pendente de sincronização
- `synced`: Sincronizado com sucesso
- `error`: Erro na sincronização

**Service:** `ShippingService`

---

### `ssxml_feeds_in_optimization`

Controle de concorrência para otimização de feeds (lock de usuários).

**Chave primária:**
- `client_hash` (String, HASH): Hash do cliente
- `feed_hash_media_hash` (String, RANGE): `{feed_hash}_{media_hash}`

**Atributos:**
```json
{
  "client_hash": "abc123",
  "feed_hash_media_hash": "def456_ghi789",
  "user_hash": "user123",
  "date": "2026-01-27T10:00:00Z",
  "session": "sess_abc123",
  "ip": "192.168.1.100",
  "feed_hash": "def456",
  "media_hash": "ghi789"
}
```

**Uso**: Previne que múltiplos usuários otimizem o mesmo feed/mídia simultaneamente, evitando conflitos no arquivo `_temp.json` no S3.

**Model:** `FeedsInOptimization`

**TTL**: Registros expiram automaticamente após 20 segundos de inatividade.

---

### `ssxml_tik_tok_token`

Tokens OAuth para integração com TikTok Shop.

**Chave primária:**
- `client_hash` (String, HASH): Hash do cliente
- `seller_id` (String, RANGE): ID do vendedor TikTok

**Atributos:**
```json
{
  "client_hash": "abc123",
  "seller_id": "7123456789",
  "auth_code": "auth_code_xyz",
  "access_token": "act_...",
  "access_token_expire_in": 1737984000,
  "refresh_token": "rft_...",
  "refresh_token_expire_in": 1769520000,
  "open_id": "open_id_123",
  "seller_name": "Loja Exemplo",
  "shop_cipher": "shop_abc123",
  "status": "active",
  "created_at": "2026-01-20T10:00:00Z",
  "updated_at": "2026-01-27T09:00:00Z"
}
```

**Renovação automática**: Tokens são renovados quando próximos da expiração.

**Model:** `TikTokToken`

---

### `ssxml_tik_tok_taxonomy`

Taxonomia de categorias do TikTok Shop.

**Chave primária:**
- `id` (String, HASH): ID da categoria TikTok
- `name` (String, RANGE): Nome da categoria

**Atributos:**
```json
{
  "id": "123456",
  "name": "Eletrônicos > Celulares",
  "parent_id": "123400",
  "level": 2,
  "is_leaf": true,
  "updated_at": "2026-01-20T10:00:00Z"
}
```

**Model:** `TaxonomyTikTok`

---

### `ssxml_tik_tok_brands`

Marcas cadastradas no TikTok Shop.

**Chave primária:**
- `id` (String, HASH): ID da marca TikTok

**Atributos:**
```json
{
  "id": "brand_123",
  "name": "Apple",
  "status": "approved",
  "created_at": "2026-01-20T10:00:00Z"
}
```

**Model:** `TikTokBrands`

---

### `ssxml_tik_tok_log_products`

Logs de sincronização de produtos com TikTok Shop.

**Chave primária:**
- `client_hash` (String, HASH): Hash do cliente
- `timestamp_product_id` (String, RANGE): `{timestamp}_{product_id}`

**Atributos:**
```json
{
  "client_hash": "abc123",
  "timestamp_product_id": "1737984000_PROD-001",
  "product_id": "PROD-001",
  "tik_tok_product_id": "7123456789",
  "action": "create",
  "status": "success",
  "error_message": null,
  "timestamp": "2026-01-27T10:00:00Z"
}
```

**Ações possíveis**: `create`, `update`, `delete`, `activate`, `deactivate`

**Model:** `TikTokLogProduct`

---

### `ssxml_product_studio_campaing`

Campanhas do Product Studio (personalização de imagens).

**Chave primária:**
- `client_hash` (String, HASH): Hash do cliente
- `campaing_hash` (String, RANGE): Hash da campanha

**Atributos:**
```json
{
  "client_hash": "abc123",
  "campaing_hash": "camp_456",
  "campaing_name": "Black Friday 2026",
  "feed_hash": "def456",
  "media_hash": "ghi789",
  "model_hash": "model_123",
  "model_img": "https://cdn.example.com/model.png",
  "date_begin": 1732406400,
  "date_end": 1733011200,
  "status": "active",
  "filter": "{\"category\": \"Eletrônicos\"}",
  "total_products": 150,
  "validity": "active",
  "created_at": "2026-01-20T10:00:00Z",
  "updated_at": "2026-01-27T09:00:00Z"
}
```

**Status possíveis**: `active`, `paused`, `finished`

**Model:** `ProductStudioCampaing`

---

### `ssxml_product_published`

Histórico de produtos publicados por feed/mídia.

**Chave primária:**
- `client_hash_feed_hash_media_hash` (String, HASH): `{client}_{feed}_{media}`
- `sku` (String, RANGE): SKU do produto

**Atributos:**
```json
{
  "client_hash_feed_hash_media_hash": "abc123_def456_ghi789",
  "sku": "PROD-001",
  "client_hash": "abc123",
  "feed_hash": "def456",
  "media_hash": "ghi789",
  "title": "Produto Exemplo",
  "price": 99.90,
  "availability": "in stock",
  "published_at": "2026-01-27T10:00:00Z",
  "last_sync": "2026-01-27T10:30:00Z"
}
```

**Uso**: Rastreamento de produtos publicados manualmente via interface de otimização.

**Model:** `ProductPublish`

---

## Tabelas principais do sistema

### `ssxml_client`

Clientes cadastrados no sistema.

**Chave primária:**
- `hash` (String, HASH): Hash único do cliente

**Atributos:**
```json
{
  "hash": "abc123",
  "name": "Loja Exemplo",
  "cnpj": "12345678000190",
  "email": "contato@loja.com",
  "phone": "+5511999999999",
  "status": "active",
  "plan_hash": "plan_123",
  "google_merchant_id": "1234567890",
  "catalogo_inteligente": true,
  "tik_tok_shop_enabled": false,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2026-01-27T09:00:00Z"
}
```

**Status possíveis**: `active`, `inactive`, `suspended`

**Model:** `Client`

---

### `ssxml_feed`

Feeds de produtos dos clientes.

**Chave primária:**
- `client_hash` (String, HASH): Hash do cliente
- `hash` (String, RANGE): Hash único do feed

**Atributos:**
```json
{
  "client_hash": "abc123",
  "hash": "def456",
  "name": "Feed Principal",
  "url": "https://example.com/feed.xml",
  "file_type": "xml",
  "item_wrapper": "product",
  "schedule": "hour",
  "status": "active",
  "last_import": "2026-01-27T09:00:00Z",
  "total_products": 1500,
  "columns": "{\"title\": \"name\", \"price\": \"price\"}",
  "created_at": "2025-06-01T00:00:00Z",
  "updated_at": "2026-01-27T09:00:00Z"
}
```

**Tipos de arquivo**: `xml`, `csv`, `zip`, `tar`

**Agendamentos**: `hour`, `day`, `week`, `manual`

**Model:** `Feed`

---

### `ssxml_client_media`

Configurações de mídia por feed (Google Shopping, Facebook, TikTok, etc.).

**Chave primária:**
- `client_hash_feed_hash` (String, HASH): `{client}_{feed}`
- `media_hash` (String, RANGE): Hash da mídia

**Atributos:**
```json
{
  "client_hash_feed_hash": "abc123_def456",
  "media_hash": "ghi789",
  "client_hash": "abc123",
  "feed_hash": "def456",
  "media_name": "Google Shopping",
  "output_format": "xml",
  "url_export_hash": "export_abc123",
  "rule": "[{\"id\": 0, \"coluna\": \"title\", \"regra\": \"substituir_texto\"}]",
  "filter": "[{\"id\": 0, \"coluna\": \"price\", \"condicao\": \"maior_que\"}]",
  "fields": "{\"title\": \"name\", \"description\": \"description\"}",
  "titles_created": "[\"custom_field_0\", \"custom_field_1\"]",
  "url_tag": "utm_source=google&utm_medium=shopping",
  "status": "active",
  "created_at": "2025-06-01T00:00:00Z",
  "updated_at": "2026-01-27T10:00:00Z"
}
```

**Formatos de saída**: `xml`, `csv`, `txt`

**Model:** `ClientMedia`

---

### `ssxml_user`

Usuários do sistema.

**Chave primária:**
- `hash` (String, HASH): Hash único do usuário

**Atributos:**
```json
{
  "hash": "user123",
  "name": "João Silva",
  "email": "joao@loja.com",
  "password_hash": "bcrypt_hash_here",
  "current_client": "abc123",
  "role": "admin",
  "status": "active",
  "last_login": "2026-01-27T09:00:00Z",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2026-01-27T09:00:00Z"
}
```

**Roles possíveis**: `admin`, `user`, `viewer`

**Model:** `User`

---

### `ssxml_media`

Mídias disponíveis no sistema (Google Shopping, Facebook, TikTok, etc.).

**Chave primária:**
- `hash` (String, HASH): Hash único da mídia

**Atributos:**
```json
{
  "hash": "media_google",
  "name": "Google Shopping",
  "type": "shopping",
  "feed_conf": "{\"item_wrapper\": \"item\", \"fields\": {...}}",
  "default_output_format": "xml",
  "requires_oauth": true,
  "status": "active",
  "created_at": "2025-01-01T00:00:00Z"
}
```

**Tipos**: `shopping`, `social`, `marketplace`, `custom`

**Model:** `Media`

---

### `ssxml_taxonomy`

Taxonomia do Google (categorias de produtos).

**Chave primária:**
- `id` (String, HASH): ID da categoria Google

**Atributos:**
```json
{
  "id": "1604",
  "name": "Eletrônicos > Celulares > Smartphones",
  "parent_id": "1603",
  "level": 3,
  "is_leaf": true,
  "language": "pt-BR",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

**Model:** `Taxonomy`

---

### `ssxml_product_type`

Tipos de produto do Google (product_type).

**Chave primária:**
- `client_hash` (String, HASH): Hash do cliente
- `id` (String, RANGE): ID único do tipo

**Atributos:**
```json
{
  "client_hash": "abc123",
  "id": "type_123",
  "name": "Eletrônicos > Smartphones > Apple",
  "category_id": "1604",
  "created_at": "2025-06-01T00:00:00Z"
}
```

**Model:** `ProductType`

---

## Tabelas auxiliares

### `ssxml_feed_content_hash`

Hash de conteúdo de feeds para detectar mudanças.

**Chave primária:**
- `client_hash_feed_hash` (String, HASH): `{client}_{feed}`

**Atributos:**
```json
{
  "client_hash_feed_hash": "abc123_def456",
  "content_hash": "sha256_hash_here",
  "last_check": "2026-01-27T10:00:00Z",
  "changed": false
}
```

**Uso**: Evita reimportação de feeds que não mudaram.

**Model:** `FeedContentHash`

---

### `ssxml_feed_update_time`

Timestamps de última atualização de feeds.

**Chave primária:**
- `client_hash` (String, HASH): Hash do cliente
- `feed_hash` (String, RANGE): Hash do feed

**Atributos:**
```json
{
  "client_hash": "abc123",
  "feed_hash": "def456",
  "feed_import_date_update": "2026-01-27T09:00:00Z",
  "feed_optimization_date_update": "2026-01-27T10:00:00Z",
  "feed_export_date_update": "2026-01-27T10:30:00Z"
}
```

**Model:** `FeedUpdateTime`

---

## Configuração local (DynamoDB Local)

**Docker Compose:**
```yaml
dynamodb-local:
  image: "amazon/dynamodb-local:latest"
  container_name: "dynamodb-local-feeds"
  ports:
    - "8000:8000"
  volumes:
    - "./my-dynamodb-data:/home/dynamodblocal/data"
  command: "-jar DynamoDBLocal.jar -sharedDb -dbPath ./data"
```

**Endpoint:**
- Local: `http://localhost:8000`
- Container: `http://dynamodb-local-feeds:8000`

**Credenciais (local):**
```php
'AWS_DYNAMODB_ACCESS_KEY' => 'dummy',
'AWS_DYNAMODB_SECRET_KEY' => 'dummy',
'AWS_DYNAMODB_REGION' => 'us-east-1',
'AWS_DYNAMODB_ENDPOINT' => 'http://dynamodb-local-feeds:8000'
```

## Component

**Arquivo:** `components/Dynamo.php`

Extends `DynamoDbClient` do AWS SDK.

**Métodos principais:**
```php
// Query
$result = $dynamo->query([
    'TableName' => 'ssxml_promotions',
    'KeyConditionExpression' => 'client_hash = :hash',
    'ExpressionAttributeValues' => [
        ':hash' => ['S' => $clientHash]
    ]
]);

// Get Item
$result = $dynamo->getItem([
    'TableName' => 'ssxml_promotions',
    'Key' => [
        'client_hash' => ['S' => $clientHash],
        'promotion_id' => ['S' => $promotionId]
    ]
]);

// Put Item
$dynamo->putItem([
    'TableName' => 'ssxml_promotions',
    'Item' => [
        'client_hash' => ['S' => $clientHash],
        'promotion_id' => ['S' => $promotionId],
        'title' => ['S' => 'Promoção Teste'],
        // ...
    ]
]);

// Update Item
$dynamo->updateItem([
    'TableName' => 'ssxml_promotions',
    'Key' => [
        'client_hash' => ['S' => $clientHash],
        'promotion_id' => ['S' => $promotionId]
    ],
    'UpdateExpression' => 'SET sync_status = :status',
    'ExpressionAttributeValues' => [
        ':status' => ['S' => 'SYNCED']
    ]
]);
```

## Tipos de dados DynamoDB

| Tipo | Código | Descrição | Exemplo |
|------|--------|-----------|---------|
| String | `S` | String UTF-8 | `['S' => 'text']` |
| Number | `N` | Número (string) | `['N' => '123']` |
| Binary | `B` | Binário base64 | `['B' => base64_encode($data)]` |
| Boolean | `BOOL` | Boolean | `['BOOL' => true]` |
| Null | `NULL` | Null | `['NULL' => true]` |
| List | `L` | Array | `['L' => [['S' => 'a'], ['S' => 'b']]]` |
| Map | `M` | Objeto | `['M' => ['key' => ['S' => 'value']]]` |
| String Set | `SS` | Set de strings | `['SS' => ['a', 'b', 'c']]` |
| Number Set | `NS` | Set de números | `['NS' => ['1', '2', '3']]` |

## Helper para remover tipos

```php
// components/Dynamo.php ou services/PromotionService.php
private function removeTypeOfData($data)
{
    if (is_array($data)) {
        $result = [];
        foreach ($data as $key => $value) {
            if (is_array($value) && count($value) === 1) {
                $type = key($value);
                if (in_array($type, ['S', 'N', 'BOOL', 'NULL', 'L', 'M', 'SS', 'NS', 'BS'])) {
                    $result[$key] = $this->removeTypeOfData($value[$type]);
                    continue;
                }
            }
            $result[$key] = $this->removeTypeOfData($value);
        }
        return $result;
    }
    return $data;
}
```

## Criar tabelas (produção)

**Usando AWS CLI:**

```bash
# Promotions
aws dynamodb create-table \
  --table-name ssxml_promotions \
  --attribute-definitions \
    AttributeName=client_hash,AttributeType=S \
    AttributeName=promotion_id,AttributeType=S \
  --key-schema \
    AttributeName=client_hash,KeyType=HASH \
    AttributeName=promotion_id,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

# Tokens
aws dynamodb create-table \
  --table-name ssxml_google_merchant_tokens \
  --attribute-definitions \
    AttributeName=client_hash,AttributeType=S \
    AttributeName=merchant_id,AttributeType=S \
  --key-schema \
    AttributeName=client_hash,KeyType=HASH \
    AttributeName=merchant_id,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```

## Monitoramento

**Métricas importantes:**
- Read Capacity Units (RCU)
- Write Capacity Units (WCU)
- Throttled Requests
- Table Size

**CloudWatch:**
```php
// components/CloudWatch.php
$cloudWatch->putMetricData([
    'Namespace' => 'DaxgoFeeds/DynamoDB',
    'MetricData' => [
        [
            'MetricName' => 'PromotionsSynced',
            'Value' => $count,
            'Unit' => 'Count',
            'Timestamp' => time()
        ]
    ]
]);
```

## Troubleshooting

### Erro: Cannot do operations on a non-existent table

**Causa:** Tabela não existe

**Solução:** Criar tabela localmente ou em produção

**Local (DynamoDB Local):**
```bash
# Criar tabela via script
php yii dynamo/create-table ssxml_promotions
```

### Erro: ValidationException

**Causa:** Tipo de dado incorreto

**Solução:** Verificar tipos DynamoDB (String como `['S' => 'value']`)

### Erro: ProvisionedThroughputExceededException

**Causa:** Muitas requisições

**Solução:** Usar `PAY_PER_REQUEST` ou aumentar capacidade


