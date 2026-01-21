---
title: Integração TikTok Shop
description: Sincronização de produtos, preços, estoque e pedidos com TikTok Shop
keywords: [tiktok, tiktok shop, sincronização, produtos]
tags: [integrações, tiktok, ecommerce]
---

# Integração TikTok Shop

Sincronização de produtos e pedidos com TikTok Shop.

:::info API TikTok Shop
Utiliza a API oficial do TikTok Shop para sincronização bidirecional de produtos, preços, estoque e pedidos.
:::

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

### Funções Lambda

O componente LambdaTiktok invoca múltiplas funções Lambda para processamento assíncrono:

<details>
<summary>Ver todas as funções Lambda (11 funções)</summary>

| Função Lambda | Método | Responsabilidade |
|--------------|--------|------------------|
| `integracao-tik-tok-PRODUTOS-lista-produtos` | `dispatchGenerateProducts()` | Prepara e envia lista de produtos para TikTok |
| `integracao-tik-tok-PRODUTOS-compara-xml` | `dispatchUpdateProducts()` | Compara XMLs antigo/novo e atualiza diferenças |
| `integracao-tik-tok-VTEX-PRODUTO-ADDITIONAL-IMAGES-XML` | `dispatchSearchImagesVtex()` | Busca imagens adicionais na VTEX e atualiza TikTok |
| `integracao-tik-tok-BRANDS-VTEX` | `dispatchGenerateBrands()` | Sincroniza marcas da VTEX para DynamoDB |
| `integracao-tik-tok-PRECO-VTEX-monta-lista-sku` | `dispatchPrepareListPrice()` | Prepara lista de SKUs para atualização de preços |
| `integracao-tik-tok-ESTOQUE-VTEX-atualizacao-estoque` | `dispatchPrepareStock()` | Sincroniza estoque VTEX → TikTok |
| `integracao-tik-tok-PEDIDOS-novo-pedido-TTK` | `dispatchSendOrder()` | Processa novo pedido do TikTok |
| `integracao-tik-tok-BUSCA-PEDIDOS-TESTE` | `dispatchGetOrder()` | Busca pedidos do cliente (ambiente de teste) |
| `integracao-tik-tok-ORDERHOOK-MANAGEMENT` | `dispatchGenerateOrderHook()` | Gerencia webhooks de pedidos |
| `integracao-tik-tok-SHIPPING-PACKAGE` | `dispatchPackage()` | Gerencia pacotes de envio e rastreamento |

</details>

:::note Invocação Assíncrona
A maioria das funções usa `InvocationType: 'Event'` para processamento assíncrono sem esperar resposta.
:::

## Configuração

### Variáveis de ambiente

```php
'TIKTOK_APP_KEY' => 'app_key_xxxx',
'TIKTOK_APP_SECRET' => 'app_secret_xxxx',
'TIKTOK_OAUTH_REDIRECT_URI' => 'https://feeds.daxgo.io/tiktok/callback',
```

## Fluxo de sincronização

### 1. Sincronização de Produtos

```php title="Gerar lista de produtos"
$lambdaTiktok = new LambdaTiktok();
$result = $lambdaTiktok->dispatchGenerateProducts($clientHash);
// Invoca: integracao-tik-tok-PRODUTOS-lista-produtos
```

**Payload**:
```php
[
    'type' => 'triggerPrepareProductList',
    'client_hash' => $clientHash,
    'url' => $client->tik_tok_shop_feed_link,
    'warehouse_id' => $client->tik_tok_shop_warehouse_id
]
```

### 2. Atualização de Produtos (Comparação de XML)

```php title="Detectar alterações"
$lambdaTiktok->dispatchUpdateProducts($clientHash, $oldXml, $newXml);
// Invoca: integracao-tik-tok-PRODUTOS-compara-xml
```

**Processo**:
1. Compara XML antigo vs novo
2. Identifica produtos alterados, novos e removidos
3. Envia apenas as diferenças para TikTok

### 3. Sincronização de Estoque

```php title="Atualizar estoque"
$lambdaTiktok->dispatchPrepareStock($clientHash);
// Invoca: integracao-tik-tok-ESTOQUE-VTEX-atualizacao-estoque
```

### 4. Sincronização de Preços

```php title="Atualizar preços"
$lambdaTiktok->dispatchPrepareListPrice($clientHash);
// Invoca: integracao-tik-tok-PRECO-VTEX-monta-lista-sku
```

### 5. Processamento de Pedidos

```php title="Novo pedido"
$lambdaTiktok->dispatchSendOrder($clientHash, $orderId);
// Invoca: integracao-tik-tok-PEDIDOS-novo-pedido-TTK
```

:::tip Sandbox
Use `dispatchSendProductSandbox()` para testar envio de produtos na loja sandbox do Daxgo antes de enviar para o cliente.
:::

## Endpoints TikTok API

- `/product/list`: Listar produtos
- `/product/upload`: Criar/atualizar produtos
- `/order/list`: Listar pedidos
- `/logistics/tracking`: Rastreamento


