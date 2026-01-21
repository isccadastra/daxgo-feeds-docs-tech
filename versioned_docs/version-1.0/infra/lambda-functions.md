---
title: Lambda Functions
description: Funções Lambda AWS para processamento assíncrono de feeds e integrações
keywords: [lambda, aws, serverless, processamento assíncrono]
tags: [infraestrutura, lambda, aws]
---

# Lambda Functions

O sistema Daxgo Feeds utiliza múltiplas funções Lambda AWS para processamento assíncrono e escalável de feeds, integrações e geração de conteúdo.

:::info Produção
Todas as funções Lambda listadas são utilizadas em **produção** e foram extraídas do código-fonte do projeto master.
:::

## Categorias de funções

- **Otimização de Feeds**: Processamento de produtos com regras e filtros
- **Product Studio**: Geração de imagens personalizadas
- **Inteligência Artificial**: Categorização e otimização com IA
- **TikTok Shop**: 11 funções para integração completa
- **LIA (Magazine Luiza)**: Geração de XML e sincronização de estoque

## Funções de otimização

### ssxml_product_optimize_PRODUCAO

**Component:** `FeedRunOptimizeOnLambda.php`

**Responsabilidade:** Processar produtos aplicando regras, filtros e otimizações

**Invocação:**
```php
$lambda = new FeedRunOptimizeOnLambda(
    $clientHash, 
    $feedHash, 
    $mediaHash,
    $file,
    $products,
    $rules,
    $filters
);
$result = $lambda->optimizeProducts();
```

**Payload:**
```php
[
    'client_hash' => $clientHash,
    'feed_hash' => $feedHash,
    'media_hash' => $mediaHash,
    'file' => 'feed.xml',
    'products' => '[]',
    'rules' => [...],
    'filters' => [...],
    'qtd_per_page' => 10,
    'page' => 0,
    'search_by' => 'title',
    'search_value' => '',
    'order_by' => 'price',
    'order_type' => 'asc',
    'publish_products' => 0,
    'titles_created' => [],
    'titles' => [],
    'mediaIa' => 'off',
    'feedIa' => 'off'
]
```

:::tip Paginação
Suporta paginação com `qtd_per_page` e `page` para processar grandes volumes de produtos.
:::

---

## Funções de Product Studio

### ssxml_product_studio-STEP5-generate-img-front

**Component:** `ProductStudioProcessImg.php`

**Responsabilidade:** Geração de imagens personalizadas para campanhas

**Invocação:**
```php
$processor = new ProductStudioProcessImg(
    $jsonImgContent,
    $clientHash,
    $s3Key,
    $s3Bucket,
    $pathToImgInS3,
    $nameImg
);
$result = $processor->processImg();
```

**Payload:**
```php
[
    'jsonImgContent' => {...},  // Configuração Fabric.js
    'clientHash' => $clientHash,
    's3Key' => $s3Key,
    's3Bucket' => 'product-studio',
    'pathToImgInS3' => 'models-product-studio/client/img/',
    'nameImg' => 'produto-123.png'
]
```

---

### ssxml_product_studio-STEP6-filter-campaing-products

**Component:** `ProductStudioCampaingProducts.php`

**Responsabilidade:** Filtrar produtos para campanhas

**Invocação:**
```php
$campaing = new ProductStudioCampaingProducts();
$result = $campaing->filterProducts(
    $clientHash,
    $feedHash,
    $midiaHash,
    $filters,
    $campaingHash,
    $publish
);
```

**Invocação Assíncrona:** Quando `$publish = 1`, usa `InvocationType: 'Event'`

---

## Funções de Inteligência Artificial

### feeds-dados-IA-CATEGORIA-orquestrador

**Component:** `LambdaIA.php`

**Responsabilidade:** Orquestração de categorização automática de produtos

**Invocação:**
```php
$lambdaIA = new LambdaIA();
$result = $lambdaIA->dispatchGetIaCategories(
    $clientHash,
    $productCategory
);
```

**Payload:**
```php
[
    'client_hash' => $clientHash,
    'product_categorie' => 'Roupas > Camisetas'
]
```

**Tipo de invocação:** `Event` (assíncrono)

---

## Funções de integração TikTok Shop

O sistema possui 11 funções Lambda dedicadas à integração completa com TikTok Shop.

**Component:** `LambdaTiktok.php`

<details>
<summary>Ver todas as 11 funções TikTok</summary>

### integracao-tik-tok-PRODUTOS-lista-produtos

```php
$lambdaTiktok->dispatchGenerateProducts($clientHash);
```

**Payload:**
```php
[
    'type' => 'triggerPrepareProductList',
    'client_hash' => $clientHash,
    'url' => $feedLink,
    'warehouse_id' => $warehouseId
]
```

---

### integracao-tik-tok-PRODUTOS-compara-xml

```php
$lambdaTiktok->dispatchUpdateProducts($clientHash, $oldXml, $newXml);
```

**Payload:**
```php
[
    'client_hash' => $clientHash,
    'antigo_xml' => 'feed_old.xml',
    'novo_xml' => 'feed_new.xml'
]
```

---

### integracao-tik-tok-VTEX-PRODUTO-ADDITIONAL-IMAGES-XML

```php
$lambdaTiktok->dispatchSearchImagesVtex($clientHash);
```

**Payload:**
```php
[
    'type' => 'triggerSyncProductImagesFromXmlNew',
    'client_hash' => $clientHash
]
```

---

### integracao-tik-tok-BRANDS-VTEX

```php
$lambdaTiktok->dispatchGenerateBrands($clientHash);
```

---

### integracao-tik-tok-PRECO-VTEX-monta-lista-sku

```php
$lambdaTiktok->dispatchPrepareListPrice($clientHash);
```

---

### integracao-tik-tok-ESTOQUE-VTEX-atualizacao-estoque

```php
$lambdaTiktok->dispatchPrepareStock($clientHash);
```

---

### integracao-tik-tok-PEDIDOS-novo-pedido-TTK

```php
$lambdaTiktok->dispatchSendOrder($clientHash, $orderId);
```

---

### integracao-tik-tok-BUSCA-PEDIDOS-TESTE

```php
$lambdaTiktok->dispatchGetOrder($clientHash);
```

---

### integracao-tik-tok-ORDERHOOK-MANAGEMENT

```php
$lambdaTiktok->dispatchGenerateOrderHook($clientHash);
```

---

### integracao-tik-tok-SHIPPING-PACKAGE

```php
$lambdaTiktok->dispatchPackage($clientHash, $orderId, $packageId);
```

**Tipo de invocação:** `RequestResponse` (síncrono)

</details>

:::note Tipos de invocação
- **Event**: Assíncrono, não espera resposta (maioria das funções TikTok)
- **RequestResponse**: Síncrono, espera resposta (apenas `SHIPPING-PACKAGE`)
:::

---

## Funções de integração LIA (Magazine Luiza)

**Component:** `LambdaLia.php`

### integracao_LIA_VTEX_generate_XML

```php
$lambdaLia = new LambdaLia();
$result = $lambdaLia->generateLiaXml(
    $clientHash,
    $storeCode,
    $xmlUrl
);
```

**Responsabilidade:** Gerar XML de produtos para LIA a partir de dados VTEX

---

### integracao_LIA_VTEX_create_inventory

```php
$lambdaLia->prepareInventory(
    $clientHash,
    $storeCode,
    $vtexAppKey,
    $vtexWarehouseId,
    $vtexAccount,
    $vtexToken
);
```

**Payload:**
```php
[
    'type' => 'triggerPrepareInventory',
    'client_hash' => $clientHash,
    'store_code' => 'VTEX',
    'vtex_app_key' => $appKey,
    'vtex_warehouse_id' => '1_1',
    'vtex_account' => 'account-name',
    'vtex_token' => $token,
    'page' => 1,
    'pageSize' => 500
]
```

**Responsabilidade:** Criar e sincronizar inventário VTEX com LIA

---

## Configuração

### Component Lambda

**Arquivo:** `components/Lambda.php`

```php title="Lambda.php"
class Lambda extends LambdaClient
{
    public function connect()
    {
        $params = [
            'credentials' => [
                'key' => Yii::$app->params['DAXGO_ENV_KEY'],
                'secret' => Yii::$app->params['DAXGO_ENV_SECRET']
            ],
            'region' => 'us-east-1',
            'version' => 'latest'
        ];

        // Ambiente local: usa endpoint local
        if (YII_ENV == 'local') {
            $params['endpoint'] = Yii::$app->params['DAXGO_ENV_ENV_LOCAL_LAMBDA_ENDPOINT'];
            $params['use_path_style_endpoint'] = true;
            $params['signature_version'] = 'v4';
            $params['debug'] = true;
        }

        return LambdaClient::factory($params);
    }
}
```

### Variáveis de ambiente

```php title="config/env-local.php"
// Credenciais AWS
'DAXGO_ENV_KEY' => 'admin',
'DAXGO_ENV_SECRET' => 'password',

// Endpoint Lambda local (apenas desenvolvimento)
'DAXGO_ENV_ENV_LOCAL_LAMBDA_ENDPOINT' => 'http://host.docker.internal:9555',
```

:::warning Endpoint local
Em ambiente local (`YII_ENV == 'local'`), o sistema usa LocalStack ou emulador Lambda rodando em `http://host.docker.internal:9555`.
:::

### Ambientes

| Ambiente | `YII_ENV` | Endpoint Lambda | Debug |
|----------|-----------|-----------------|-------|
| **Local** | `local` | `http://host.docker.internal:9555` | `true` |
| **Dev** | `dev` | AWS Lambda (us-east-1) | `false` |
| **Prod** | `prod` | AWS Lambda (us-east-1) | `false` |

### Invocação síncrona

```php title="Exemplo de invocação"
// Conectar ao Lambda
$Lambda = Yii::$app->Lambda->connect();

// Invocar função
$response = $Lambda->invoke([
    'FunctionName' => 'ssxml_product_optimize_PRODUCAO',
    'Payload' => json_encode($payload)
]);

// Processar resposta
$result = json_decode($response['Payload']->getContents(), true);
```

### Invocação assíncrona

```php title="Invocação Event (não aguarda resposta)"
$Lambda->invoke([
    'FunctionName' => 'integracao-tik-tok-PRODUTOS-lista-produtos',
    'InvocationType' => 'Event',  // Assíncrono
    'Payload' => json_encode($payload)
]);
```

:::info Tipos de invocação
- **Padrão (RequestResponse)**: Aguarda resposta da Lambda
- **Event**: Dispara e esquece (assíncrono)
- **DryRun**: Valida parâmetros sem executar
:::

### Sufixo de ambiente (dev)

```php title="Lambda.php - getSuffixFunctionName()"
public function getSuffixFunctionName()
{
    if (YII_ENV == 'dev') {
        return '_dev';
    }
    return '';
}
```

:::note Nomenclatura
Em ambiente de **dev**, algumas funções podem ter sufixo `_dev`. Exemplo: `ssxml_product_optimize_PRODUCAO_dev`
:::

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


