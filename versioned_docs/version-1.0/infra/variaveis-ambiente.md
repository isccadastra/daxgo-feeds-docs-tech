---
title: Variáveis de ambiente
---

# Variáveis de ambiente

Lista completa de variáveis de ambiente necessárias para configuração do sistema.

## Arquivo de configuração

**Localização:** `config/env-local.php`

```php
<?php
return [
    // ... variáveis abaixo
];
```

## AWS Services

### S3/MinIO

```php
'AWS_ACCESS_KEY_ID' => 'admin',
'AWS_SECRET_ACCESS_KEY' => 'password',
'AWS_S3_ENDPOINT' => 'http://host.docker.internal:9666',
'AWS_S3_BUCKET' => 'daxgo',
'AWS_S3_REGION' => 'us-east-1',
'AWS_S3_USE_PATH_STYLE' => true, // Para MinIO local
```

**Produção:**
```php
'AWS_S3_ENDPOINT' => '', // Vazio para usar endpoint padrão AWS
'AWS_S3_BUCKET' => 'daxgo-feeds-prod',
'AWS_S3_REGION' => 'us-east-1',
'AWS_S3_USE_PATH_STYLE' => false,
```

### DynamoDB

```php
'AWS_DYNAMODB_ACCESS_KEY' => 'dummy', // Local
'AWS_DYNAMODB_SECRET_KEY' => 'dummy', // Local
'AWS_DYNAMODB_REGION' => 'us-east-1',
'AWS_DYNAMODB_ENDPOINT' => 'http://dynamodb-local-feeds:8000', // Local
```

**Produção:**
```php
'AWS_DYNAMODB_ACCESS_KEY' => '', // Usar IAM role
'AWS_DYNAMODB_SECRET_KEY' => '', // Usar IAM role
'AWS_DYNAMODB_ENDPOINT' => '', // Vazio para usar endpoint padrão
```

### Lambda

```php
'AWS_LAMBDA_ACCESS_KEY' => '',
'AWS_LAMBDA_SECRET_KEY' => '',
'AWS_LAMBDA_REGION' => 'us-east-1',
'AWS_LAMBDA_FUNCTION_NAME' => 'feed-optimize',
'AWS_LAMBDA_FUNCTION_NAME_IA' => 'feed-optimize-ia',
'AWS_LAMBDA_FUNCTION_NAME_TIKTOK' => 'feed-tiktok-sync',
```

### SQS

```php
'AWS_SQS_ACCESS_KEY' => '',
'AWS_SQS_SECRET_KEY' => '',
'AWS_SQS_REGION' => 'us-east-1',
'AWS_SQS_QUEUE_URL' => 'https://sqs.us-east-1.amazonaws.com/123456789/feed-queue',
```

### CloudWatch

```php
'AWS_CLOUDWATCH_ACCESS_KEY' => '',
'AWS_CLOUDWATCH_SECRET_KEY' => '',
'AWS_CLOUDWATCH_REGION' => 'us-east-1',
'AWS_CLOUDWATCH_NAMESPACE' => 'DaxgoFeeds',
```

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
'DB_HOST' => 'mysql-feeds',
'DB_NAME' => 'feeds',
'DB_USER' => 'admin',
'DB_PASSWORD' => 'admin',
'DB_PORT' => '3306',
```

**Produção:**
```php
'DB_HOST' => 'rds-endpoint.us-east-1.rds.amazonaws.com',
'DB_NAME' => 'feeds_prod',
'DB_USER' => 'admin',
'DB_PASSWORD' => env('DB_PASSWORD'), // Usar secret manager
'DB_PORT' => '3306',
```

## Application

### Debug & Environment

```php
'YII_DEBUG' => true,
'YII_ENV' => 'dev', // 'prod' para produção
```

### URLs

```php
'BASE_URL' => 'http://localhost:9000',
'FEED_URL_BASE' => 'http://localhost:9666/daxgo/feeds',
```

**Produção:**
```php
'BASE_URL' => 'https://feeds.daxgo.io',
'FEED_URL_BASE' => 'https://cdn.daxgo.io/feeds',
```

### Cookies & Session

```php
'COOKIE_DOMAIN' => '.localhost',
'SESSION_TIMEOUT' => 3600, // 1 hora
```

**Produção:**
```php
'COOKIE_DOMAIN' => '.daxgo.io',
'SESSION_TIMEOUT' => 7200, // 2 horas
```

## Integrações

### TikTok

```php
'TIKTOK_APP_KEY' => '',
'TIKTOK_APP_SECRET' => '',
'TIKTOK_OAUTH_REDIRECT_URI' => 'http://localhost:9000/tiktok/callback',
```

### Analytics

```php
'GOOGLE_ANALYTICS_ID' => 'UA-XXXXXXXXX-X',
'GOOGLE_TAG_MANAGER_ID' => 'GTM-XXXXXX',
```

## Email

### SMTP

```php
'SMTP_HOST' => 'smtp.gmail.com',
'SMTP_PORT' => 587,
'SMTP_USERNAME' => 'noreply@daxgo.io',
'SMTP_PASSWORD' => env('SMTP_PASSWORD'),
'SMTP_ENCRYPTION' => 'tls',
'SMTP_FROM_EMAIL' => 'noreply@daxgo.io',
'SMTP_FROM_NAME' => 'Daxgo Feeds',
```

## Logs

### Sentry (Erro tracking)

```php
'SENTRY_DSN' => 'https://xxxxx@sentry.io/xxxxx',
'SENTRY_ENVIRONMENT' => 'dev', // 'prod' para produção
```

### CloudWatch Logs

```php
'CLOUDWATCH_LOGS_GROUP' => '/aws/elasticbeanstalk/daxgo-feeds',
'CLOUDWATCH_LOGS_STREAM' => 'i-xxxxxxxxx',
```

## Performance

### Cache

```php
'CACHE_DRIVER' => 'redis', // 'file' para local
'REDIS_HOST' => 'redis',
'REDIS_PORT' => 6379,
'REDIS_DATABASE' => 0,
```

### Queue

```php
'QUEUE_DRIVER' => 'sqs', // 'sync' para local
```

## Segurança

### Encryption

```php
'APP_KEY' => 'base64:xxxxxxxxxxxxxxxxxxxxxx',
'ENCRYPTION_KEY' => 'xxxxxxxxxxxxxxxxxxxxxx',
```

### JWT

```php
'JWT_SECRET' => 'xxxxxxxxxxxxxxxxxxxxxx',
'JWT_TTL' => 3600, // 1 hora
```

## Feature Flags

```php
'FEATURE_AI_CATALOG' => true,
'FEATURE_TIKTOK' => false,
'FEATURE_PRODUCT_STUDIO' => false,
'FEATURE_ANALYTICS_V2' => true,
```

## Limites e Timeouts

```php
'MAX_FEED_SIZE_MB' => 500,
'MAX_PRODUCTS_PER_FEED' => 100000,
'FEED_IMPORT_TIMEOUT' => 600, // 10 minutos
'LAMBDA_TIMEOUT' => 300, // 5 minutos
'API_RATE_LIMIT' => 60, // requisições por minuto
```

## Configuração por ambiente

### Development (Local)

```php
return [
    'YII_ENV' => 'dev',
    'YII_DEBUG' => true,
    'BASE_URL' => 'http://localhost:9000',
    'AWS_S3_ENDPOINT' => 'http://host.docker.internal:9666',
    'AWS_DYNAMODB_ENDPOINT' => 'http://dynamodb-local-feeds:8000',
    'GOOGLE_MERCHANT_SANDBOX' => true,
];
```

### Staging

```php
return [
    'YII_ENV' => 'staging',
    'YII_DEBUG' => false,
    'BASE_URL' => 'https://staging.feeds.daxgo.io',
    'AWS_S3_BUCKET' => 'daxgo-feeds-staging',
    'GOOGLE_MERCHANT_SANDBOX' => true,
];
```

### Production

```php
return [
    'YII_ENV' => 'prod',
    'YII_DEBUG' => false,
    'BASE_URL' => 'https://feeds.daxgo.io',
    'AWS_S3_BUCKET' => 'daxgo-feeds-prod',
    'GOOGLE_MERCHANT_SANDBOX' => false,
    'SENTRY_ENVIRONMENT' => 'production',
];
```

## Arquivo .env (alternativa)

Se usar `.env` em vez de `env-local.php`:

```env
# Application
YII_DEBUG=true
YII_ENV=dev
BASE_URL=http://localhost:9000

# Database
DB_HOST=mysql-feeds
DB_NAME=feeds
DB_USER=admin
DB_PASSWORD=admin

# AWS
AWS_ACCESS_KEY_ID=admin
AWS_SECRET_ACCESS_KEY=password
AWS_S3_ENDPOINT=http://host.docker.internal:9666
AWS_S3_BUCKET=daxgo
AWS_DYNAMODB_ENDPOINT=http://dynamodb-local-feeds:8000

# Google
GOOGLE_OAUTH2_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_OAUTH2_CLIENT_SECRET=GOCSPX-xxxxx
GOOGLE_MERCHANT_SANDBOX=true
```

## Carregar no Yii2

**config/web.php:**
```php
$config = [
    'components' => [
        'S3' => [
            'class' => 'app\components\S3',
            'credentials' => [
                'key' => getenv('AWS_ACCESS_KEY_ID'),
                'secret' => getenv('AWS_SECRET_ACCESS_KEY'),
            ],
            'region' => getenv('AWS_S3_REGION'),
            'version' => 'latest',
            'endpoint' => getenv('AWS_S3_ENDPOINT'),
            'use_path_style_endpoint' => true,
        ],
    ],
];
```

## Variáveis via SSM Parameter Store (AWS)

**Produção recomendada:**
```bash
aws ssm put-parameter \
  --name "/daxgo-feeds/prod/db-password" \
  --value "senha-segura" \
  --type "SecureString"

aws ssm put-parameter \
  --name "/daxgo-feeds/prod/google-oauth-secret" \
  --value "GOCSPX-xxxxx" \
  --type "SecureString"
```

**Carregar no código:**
```php
$dbPassword = $ssm->getParameter([
    'Name' => '/daxgo-feeds/prod/db-password',
    'WithDecryption' => true
])['Parameter']['Value'];
```


