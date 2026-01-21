---
title: Google Merchant
description: Integração completa com Google Merchant Center via Content API
keywords: [google merchant, content api, oauth2, shopping]
tags: [integrações, google, merchant]
---

# Integração com Google Merchant

Integração via Content API for Shopping v2.1 usando OAuth2, tokens persistidos em DynamoDB
e sincronização de promoções com Google Merchant Center.

:::info Content API v2.1
Utiliza a Google Shopping Content API v2.1 com autenticação OAuth 2.0 para operações de produtos e promoções.
:::

## Componentes principais

- `services/GoogleMerchantPromotionService.php`
- `services/GoogleMerchantTokenService.php`
- `services/PromotionService.php`
- `controllers/PromotionController.php`
- `controllers/OAuth2GoogleController.php`

## Fluxo de autorização (OAuth2)

1. `OAuth2GoogleController::actionAuthorize()` cria URL de autorização.
2. Callback recebe o code e salva tokens no DynamoDB.
3. Tokens são renovados automaticamente quando próximos de expirar.

## Dados no DynamoDB

- `ssxml_promotions`: promoções.
- `ssxml_google_merchant_tokens`: tokens OAuth por cliente/merchant_id.

## Sincronização de promoções

- Individual: `POST /promotions/sync/{promotion_id}`
- Em massa: `POST /promotions/sync-from-google`
- Encerrar promoção: `POST /promotions/stop/{promotion_id}`

## Variáveis de ambiente

```php
'DAXGO_ENV_GOOGLE_OAUTH2_CLIENT_ID' => '...',
'DAXGO_ENV_GOOGLE_OAUTH2_CLIENT_SECRET' => '...',
'DAXGO_ENV_GOOGLE_OAUTH2_REDIRECT_URI' => 'http://localhost:9000/oauth2/google/callback',
'GOOGLE_MERCHANT_MERCHANT_ID' => '123456789',
'GOOGLE_MERCHANT_SANDBOX' => true,
```

## Observações

- `offerType` é sempre `GENERIC_CODE`.
- Destinos inválidos (ex.: `GOOGLE_WALLET`) são filtrados antes do envio.

