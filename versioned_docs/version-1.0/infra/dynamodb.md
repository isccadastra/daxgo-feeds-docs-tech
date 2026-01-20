---
title: DynamoDB • Estrutura de dados
---

# DynamoDB • Estrutura de dados

Armazenamento NoSQL usado para promoções, tokens OAuth2 e dados de otimizações de IA.

## Tabelas principais

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


