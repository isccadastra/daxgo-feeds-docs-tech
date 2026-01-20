---
title: Lambda Functions
---

# Lambda Functions

Processamento assíncrono de feeds e otimizações via AWS Lambda.

## Funções principais

### `feed-optimize`

**Component:** `FeedRunOptimizeOnLambda`

**Responsabilidade:** Processar feeds aplicando regras e filtros

**Payload:**
```json
{
  "client_hash": "abc123...",
  "feed_hash": "def456...",
  "media_hash": "ghi789...",
  "products": [...],
  "rules": [...],
  "filters": [...],
  "options": {
    "batch_size": 1000,
    "timeout": 300
  }
}
```

**Retorno:**
```json
{
  "products": [...],
  "stats": {
    "total": 10000,
    "processed": 9500,
    "filtered": 500
  },
  "errors": []
}
```

**Invocação:**
```php
$lambda = new FeedRunOptimizeOnLambda($clientHash, $feedHash, $mediaHash);
$result = $lambda->invoke($payload);
```

---

### `feed-optimize-ia`

**Component:** `LambdaIA`

**Responsabilidade:** Aplicar otimizações com IA (títulos, descrições, categorias)

**Payload:**
```json
{
  "client_hash": "abc123...",
  "feed_hash": "def456...",
  "products": [...],
  "optimizations": {
    "title": true,
    "description": true,
    "category": true
  }
}
```

**Retorno:**
```json
{
  "products": [...],
  "stats": {
    "title_optimized": 500,
    "description_optimized": 300,
    "category_optimized": 200
  }
}
```

---

### `feed-tiktok-sync`

**Component:** `LambdaTiktok`

**Responsabilidade:** Sincronizar produtos com TikTok Shop

**Payload:**
```json
{
  "client_hash": "abc123...",
  "products": [...],
  "action": "sync"
}
```

---

## Configuração

### Variáveis de ambiente

```php
'AWS_LAMBDA_REGION' => 'us-east-1',
'AWS_LAMBDA_FUNCTION_NAME' => 'feed-optimize',
'AWS_LAMBDA_FUNCTION_NAME_IA' => 'feed-optimize-ia',
'AWS_LAMBDA_FUNCTION_NAME_TIKTOK' => 'feed-tiktok-sync',
```

### Timeout

```php
'LAMBDA_TIMEOUT' => 300, // 5 minutos
```

### Memory

Lambda configurado com:
- Memory: 1024 MB (ajustável)
- Timeout: 300s
- Runtime: Node.js 18 / Python 3.9

## Invocação assíncrona

```php
use app\components\Lambda;

$lambda = Yii::$app->Lambda;
$lambda->invokeAsync([
    'FunctionName' => 'feed-optimize',
    'InvocationType' => 'Event', // Assíncrono
    'Payload' => json_encode($payload)
]);
```

## Monitoramento

### CloudWatch Logs

```bash
# Ver logs
aws logs tail /aws/lambda/feed-optimize --follow

# Filtrar erros
aws logs filter-pattern '/aws/lambda/feed-optimize' --filter-pattern 'ERROR'
```

### Métricas

- Invocations
- Errors
- Duration
- Throttles
- ConcurrentExecutions

## Troubleshooting

### Timeout

**Causa:** Processamento demora mais que o limite configurado

**Solução:**
- Aumentar timeout da função
- Processar em lotes menores
- Otimizar código

### Out of Memory

**Causa:** Memória insuficiente para processar dados

**Solução:**
- Aumentar memory da função
- Processar em lotes

### Throttling

**Causa:** Muitas invocações simultâneas

**Solução:**
- Aumentar concurrent executions limit
- Implementar retry com backoff


