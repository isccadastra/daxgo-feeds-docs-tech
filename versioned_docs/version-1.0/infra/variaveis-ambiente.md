---
title: Variáveis de ambiente
description: Referência completa de variáveis de ambiente do Daxgo Feeds
keywords: [env, environment, configuração, variáveis]
tags: [infraestrutura, configuração, env]
---

# Variáveis de ambiente

Lista completa de variáveis de ambiente necessárias para configuração do sistema.

:::danger Segurança
Nunca commite o arquivo `config/env-local.php` com credenciais reais. Use `.gitignore` para proteger dados sensíveis.
:::

## Arquivo de configuração

**Localização:** `config/env-local.php`

```php
<?php
return [
    // ... variáveis abaixo
];
```

## Credenciais AWS

:::info Prefixo DAXGO_ENV_
Todas as variáveis de ambiente do sistema usam o prefixo `DAXGO_ENV_` para evitar conflitos.
:::

### Credenciais principais

```php title="Credenciais compartilhadas"
'DAXGO_ENV_KEY' => 'admin',           // AWS Access Key ID
'DAXGO_ENV_SECRET' => 'password',     // AWS Secret Access Key
```

:::note Uso compartilhado
Estas credenciais são usadas para **todos os serviços AWS**: S3, DynamoDB, Lambda, SQS.
:::

## Endpoints locais (desenvolvimento)

Apenas para ambiente `YII_ENV == 'local'`:

```php title="config/env-local.php - Endpoints locais"
'DAXGO_ENV_ENV_LOCAL_DYNAMO_ENDPOINT' => 'http://dynamodb-local:8000',
'DAXGO_ENV_ENV_LOCAL_LAMBDA_ENDPOINT' => 'http://host.docker.internal:9555',
'DAXGO_ENV_ENV_LOCAL_S3_ENDPOINT' => 'http://host.docker.internal:9666',
```

:::warning Host interno
`host.docker.internal` permite que containers Docker acessem serviços rodando no host (como MinIO e LocalStack).
:::

## Serviços AWS

### S3/MinIO

```php
'DAXGO_ENV_FEEDS_S3_BUCKET' => 'daxgo',
'DAXGO_ENV_FEEDS_S3_URL_PUBLISHED' => 'http://localhost:9666/minio/daxgo',
```

**Buckets utilizados**:
- `daxgo`: Bucket principal (feeds, JSONs)
- `product-studio`: Templates e modelos
- `product-studio-cdn`: Imagens geradas

**Produção:**
```php
'DAXGO_ENV_FEEDS_S3_BUCKET' => 'daxgo',
'DAXGO_ENV_FEEDS_S3_URL_PUBLISHED' => 'https://s3.amazonaws.com/daxgo',
```

### SQS

```php
'DAXGO_ENV_SQS_QUEUE_URL' => '',
```

:::note Opcional
SQS é opcional. Deixe vazio se não estiver usando filas.
:::

### Lambda

Configurado no component `Lambda.php`. Usa as mesmas credenciais (`DAXGO_ENV_KEY`, `DAXGO_ENV_SECRET`).

**Funções disponíveis**: Ver [documentação de Lambda](./lambda-functions.md)

### DynamoDB

Usa endpoint local em desenvolvimento, AWS em produção.

**Tabelas**:
- `ssxml_client`: Clientes
- `ssxml_feed`: Feeds
- `ssxml_media`: Mídias
- `ssxml_store`: Lojas (para integração LIA)
- `ssxml_token`: Tokens OAuth2 Google
- `ssxml_promotion`: Promoções Google Merchant

## Google Services

### OAuth2

```php
'DAXGO_ENV_GOOGLE_OAUTH2_CLIENT_ID' => 'xxxxx.apps.googleusercontent.com',
'DAXGO_ENV_GOOGLE_OAUTH2_CLIENT_SECRET' => 'GOCSPX-xxxxx',
'DAXGO_ENV_GOOGLE_OAUTH2_REDIRECT_URI' => 'http://localhost:9000/oauth2/google/callback',
```

**Produção:**
```php
'DAXGO_ENV_GOOGLE_OAUTH2_REDIRECT_URI' => 'https://feeds.daxgo.io/oauth2/google/callback',
```

### Google Merchant

```php
'GOOGLE_MERCHANT_MERCHANT_ID' => '123456789', // Opcional (pode ser por cliente)
'GOOGLE_MERCHANT_SANDBOX' => true, // false para produção
```

## Database

### MySQL

```php
'DAXGO_ENV_FEEDS_MYSQL_HOST' => 'mysql',
'DAXGO_ENV_FEEDS_MYSQL_PORT' => '3306',
'DAXGO_ENV_FEEDS_MYSQL_DB' => 'feeds',
'DAXGO_ENV_FEEDS_MYSQL_USER' => 'admin',
'DAXGO_ENV_FEEDS_MYSQL_PASS' => 'admin',
```

**Produção:**
```php
'DAXGO_ENV_FEEDS_MYSQL_HOST' => 'rds-endpoint.us-east-1.rds.amazonaws.com',
'DAXGO_ENV_FEEDS_MYSQL_PORT' => '3306',
'DAXGO_ENV_FEEDS_MYSQL_DB' => 'feeds',
'DAXGO_ENV_FEEDS_MYSQL_USER' => 'admin',
'DAXGO_ENV_FEEDS_MYSQL_PASS' => env('DB_PASSWORD'), // Usar secret manager
```

## Detecção de ambiente

O sistema detecta o ambiente via constante `YII_ENV` definida em `web/index.php`:

```php title="web/index.php"
// Define ambiente
defined('YII_ENV') or define('YII_ENV', 'prod');
defined('YII_DEBUG') or define('YII_DEBUG', false);
```

**Valores possíveis**:
- `local`: Desenvolvimento local com Docker
- `dev`: Desenvolvimento em servidor
- `prod`: Produção

:::tip Endpoints locais
Endpoints locais (DynamoDB, Lambda, S3) são usados **apenas** quando `YII_ENV == 'local'`.
:::

## Inteligência Artificial

### OpenRouter (IA)

```php
'DAXGO_ENV_FEEDS_IA_API_KEY' => '',      // Chave API OpenRouter
'DAXGO_ENV_FEEDS_IA_API_HOST' => '',     // Host da API IA
```

:::warning Custo
OpenRouter é pago por uso. Configure limites de budget.
:::

## Email

### SES (Amazon Simple Email Service)

```php
'DAXGO_ENV_FEEDS_SES_HOST' => '',
'DAXGO_ENV_FEEDS_SES_KEY' => '',
'DAXGO_ENV_FEEDS_SES_USER' => '',
```

:::note Opcional
Configuração de email é opcional. Se vazio, emails não serão enviados.
:::

## Como carregar variáveis

### Em Components

As variáveis são acessadas via `Yii::$app->params`:

```php title="Exemplo: components/Lambda.php"
$params = [
    'credentials' => [
        'key' => Yii::$app->params['DAXGO_ENV_KEY'],
        'secret' => Yii::$app->params['DAXGO_ENV_SECRET']
    ],
    'region' => 'us-east-1',
    'version' => 'latest'
];
```

### Em Controllers

```php title="Exemplo: controllers/FeedController.php"
$s3Bucket = Yii::$app->params['DAXGO_ENV_FEEDS_S3_BUCKET'];
$s3Url = Yii::$app->params['DAXGO_ENV_FEEDS_S3_URL_PUBLISHED'];
```

### Carregar env-local.php

O arquivo é carregado em `config/web.php`:

```php title="config/web.php"
$config = [
    'params' => require(__DIR__ . '/env-local.php'),
];
```

## Configuração por ambiente

### Development (Local)

```php title="config/env-local.php - Completo"
<?php
return [
    // Credenciais AWS
    'DAXGO_ENV_KEY' => 'admin',
    'DAXGO_ENV_SECRET' => 'password',
    
    // Endpoints locais
    'DAXGO_ENV_ENV_LOCAL_DYNAMO_ENDPOINT' => 'http://dynamodb-local:8000',
    'DAXGO_ENV_ENV_LOCAL_LAMBDA_ENDPOINT' => 'http://host.docker.internal:9555',
    'DAXGO_ENV_ENV_LOCAL_S3_ENDPOINT' => 'http://host.docker.internal:9666',
    
    // S3
    'DAXGO_ENV_FEEDS_S3_BUCKET' => 'daxgo',
    'DAXGO_ENV_FEEDS_S3_URL_PUBLISHED' => 'http://localhost:9666/minio/daxgo',
    
    // SQS
    'DAXGO_ENV_SQS_QUEUE_URL' => '',
    
    // Email
    'DAXGO_ENV_FEEDS_SES_HOST' => '',
    'DAXGO_ENV_FEEDS_SES_KEY' => '',
    'DAXGO_ENV_FEEDS_SES_USER' => '',
    
    // MySQL
    'DAXGO_ENV_FEEDS_MYSQL_HOST' => 'mysql',
    'DAXGO_ENV_FEEDS_MYSQL_PORT' => '3306',
    'DAXGO_ENV_FEEDS_MYSQL_DB' => 'feeds',
    'DAXGO_ENV_FEEDS_MYSQL_USER' => 'admin',
    'DAXGO_ENV_FEEDS_MYSQL_PASS' => 'admin',
    
    // IA
    'DAXGO_ENV_FEEDS_IA_API_KEY' => '',
    'DAXGO_ENV_FEEDS_IA_API_HOST' => '',
    
    // Google OAuth2
    'DAXGO_ENV_GOOGLE_OAUTH2_CLIENT_ID' => 'YOUR_CLIENT_ID.apps.googleusercontent.com',
    'DAXGO_ENV_GOOGLE_OAUTH2_CLIENT_SECRET' => 'YOUR_CLIENT_SECRET',
    'DAXGO_ENV_GOOGLE_OAUTH2_REDIRECT_URI' => 'http://localhost:9000/oauth2/google/callback',
];
```

:::danger Credenciais obrigatórias
Configure suas próprias credenciais Google OAuth2. Obtenha em: https://console.cloud.google.com/apis/credentials
:::

### Production

```php title="Variáveis de ambiente - Produção"
// Credenciais AWS (usar IAM Role ou Secrets Manager)
DAXGO_ENV_KEY=YOUR_AWS_ACCESS_KEY
DAXGO_ENV_SECRET=YOUR_AWS_SECRET_KEY

// S3
DAXGO_ENV_FEEDS_S3_BUCKET=daxgo
DAXGO_ENV_FEEDS_S3_URL_PUBLISHED=https://s3.amazonaws.com/daxgo

// MySQL
DAXGO_ENV_FEEDS_MYSQL_HOST=feeds-prod.cluster-xxx.us-east-1.rds.amazonaws.com
DAXGO_ENV_FEEDS_MYSQL_PORT=3306
DAXGO_ENV_FEEDS_MYSQL_DB=feeds
DAXGO_ENV_FEEDS_MYSQL_USER=admin
DAXGO_ENV_FEEDS_MYSQL_PASS=<from-secrets-manager>

// IA
DAXGO_ENV_FEEDS_IA_API_KEY=<openrouter-key>
DAXGO_ENV_FEEDS_IA_API_HOST=https://openrouter.ai/api/v1

// SES
DAXGO_ENV_FEEDS_SES_HOST=email-smtp.us-east-1.amazonaws.com
DAXGO_ENV_FEEDS_SES_KEY=<ses-smtp-key>
DAXGO_ENV_FEEDS_SES_USER=<ses-smtp-user>

// Google OAuth2
DAXGO_ENV_GOOGLE_OAUTH2_CLIENT_ID=<prod-client-id>.apps.googleusercontent.com
DAXGO_ENV_GOOGLE_OAUTH2_CLIENT_SECRET=<prod-secret>
DAXGO_ENV_GOOGLE_OAUTH2_REDIRECT_URI=https://feeds.daxgo.io/oauth2/google/callback
```

## Resumo de variáveis obrigatórias

### Mínimo para rodar local

```php title="Essenciais para desenvolvimento"
// AWS
'DAXGO_ENV_KEY' => 'admin',
'DAXGO_ENV_SECRET' => 'password',

// Endpoints locais
'DAXGO_ENV_ENV_LOCAL_DYNAMO_ENDPOINT' => 'http://dynamodb-local:8000',
'DAXGO_ENV_ENV_LOCAL_LAMBDA_ENDPOINT' => 'http://host.docker.internal:9555',
'DAXGO_ENV_ENV_LOCAL_S3_ENDPOINT' => 'http://host.docker.internal:9666',

// S3
'DAXGO_ENV_FEEDS_S3_BUCKET' => 'daxgo',

// MySQL
'DAXGO_ENV_FEEDS_MYSQL_HOST' => 'mysql',
'DAXGO_ENV_FEEDS_MYSQL_PORT' => '3306',
'DAXGO_ENV_FEEDS_MYSQL_DB' => 'feeds',
'DAXGO_ENV_FEEDS_MYSQL_USER' => 'admin',
'DAXGO_ENV_FEEDS_MYSQL_PASS' => 'admin',
```

### Opcionais (features específicas)

```php title="Apenas se usar a feature"
// Inteligência Artificial
'DAXGO_ENV_FEEDS_IA_API_KEY' => '<openrouter-key>',
'DAXGO_ENV_FEEDS_IA_API_HOST' => 'https://openrouter.ai/api/v1',

// Email (SES)
'DAXGO_ENV_FEEDS_SES_HOST' => '<ses-host>',
'DAXGO_ENV_FEEDS_SES_KEY' => '<ses-key>',
'DAXGO_ENV_FEEDS_SES_USER' => '<ses-user>',

// Google OAuth2 (Google Merchant, Analytics)
'DAXGO_ENV_GOOGLE_OAUTH2_CLIENT_ID' => '<client-id>',
'DAXGO_ENV_GOOGLE_OAUTH2_CLIENT_SECRET' => '<client-secret>',
'DAXGO_ENV_GOOGLE_OAUTH2_REDIRECT_URI' => 'http://localhost:9000/oauth2/google/callback',

// SQS
'DAXGO_ENV_SQS_QUEUE_URL' => '<queue-url>',
```

## Boas práticas

:::tip Segurança
1. **Nunca commite** `config/env-local.php` com credenciais reais
2. Use `.gitignore` para proteger o arquivo
3. Em produção, use **AWS Secrets Manager** ou **Systems Manager Parameter Store**
4. Rotacione credenciais periodicamente
5. Use IAM Roles sempre que possível (evita hardcoded credentials)
:::

:::warning Endpoints locais
Variáveis `DAXGO_ENV_ENV_LOCAL_*` são **ignoradas** em produção. Elas só são usadas quando `YII_ENV == 'local'`.
:::

## Troubleshooting

### Erro: "Access key not found"

**Causa**: Variáveis `DAXGO_ENV_KEY` ou `DAXGO_ENV_SECRET` não definidas

**Solução**: Verificar se `config/env-local.php` existe e está sendo carregado

### Erro: "Connection refused" (DynamoDB/Lambda/S3)

**Causa**: Endpoints locais não estão rodando ou configurados incorretamente

**Solução**:
1. Verificar se Docker Compose está rodando (`docker-compose ps`)
2. Verificar se MinIO está em `http://localhost:9666`
3. Verificar se DynamoDB Local está em `http://localhost:8000`

### Erro: "Table does not exist" (DynamoDB)

**Causa**: Tabelas não foram criadas no DynamoDB Local

**Solução**: Executar migrations ou criar tabelas manualmente


