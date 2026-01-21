---
title: Product Studio
description: Geração de imagens personalizadas para campanhas de marketing
keywords: [product studio, imagens, campanhas, marketing]
tags: [features, product-studio, marketing]
---

# Product Studio

Sistema de geração de imagens personalizadas para campanhas de marketing de produtos.

:::info Módulo Product Studio
Product Studio permite criar campanhas visuais personalizadas aplicando templates sobre imagens de produtos.
:::

## Arquitetura

### Buckets S3

O Product Studio utiliza dois buckets S3 dedicados:

```plaintext title="Estrutura de armazenamento"
product-studio/
├── models-product-studio/
│   └── {clientHash}/
│       ├── img/                               # Imagens de template
│       └── {campaing_hash}.json               # Configurações de campanha
└── feed-files/
    └── {clientHash}/
        └── {campaing_hash}_stats.json         # Estatísticas de processamento

product-studio-cdn/
└── {clientHash}/
    └── {campaing_hash}/
        └── {image_files}.png                  # Imagens geradas
```

:::tip CDN
As imagens geradas são servidas via CDN:
`https://product-studio-cdn.s3.us-east-1.amazonaws.com/{clientHash}/{campaignHash}/{image}.png`
:::

## Components

### ProductStudioProcessImg.php

**Responsabilidade**: Processamento de imagens via Lambda

```php title="Processar imagem"
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

**Função Lambda**: `ssxml_product_studio-STEP5-generate-img-front`

**Endpoints (por ambiente)**:
- **Local**: `http://host.docker.internal:3000`
- **Dev**: `http://ec2-3-90-125-115.compute-1.amazonaws.com`
- **Prod**: `http://ec2-3-90-125-115.compute-1.amazonaws.com`

### ProductStudioCampaingProducts.php

**Responsabilidade**: Filtragem de produtos para campanhas

```php title="Filtrar produtos"
$campaing = new ProductStudioCampaingProducts();

$result = $campaing->filterProducts(
    $clientHash,
    $feedHash,
    $midiaHash,
    $filters,
    $campaingHash,
    $publish = 0  // 0 = retorna dados, 1 = publica no S3
);
```

**Função Lambda**: `ssxml_product_studio-STEP6-filter-campaing-products`

:::note Invocação Assíncrona
Quando `$publish = 1`, a Lambda é invocada com `InvocationType: 'Event'` para processamento assíncrono.
:::

#### Métodos auxiliares

```php title="Verificar status da campanha"
$status = $campaing->getProductsStatus(
    $clientHash,
    $feedHash,
    $midiaHash,
    $campaingHash
);
// Retorna: percentual de processamento (0-100)
```

```php title="Buscar imagens geradas"
$images = $campaing->getImagesFromS3(
    $clientHash,
    $feedHash,
    $mediaHash,
    $campaingHash,
    $currentPage
);
// Retorna: array de URLs (8 imagens por página)
```

## Controller

**Arquivo:** `controllers/ProductStudioController.php`

### Rotas principais

| Rota | Método | Descrição |
|------|--------|-----------|
| `/product-studio/list` | `actionIndex()` | Lista campanhas do cliente |
| `/product-studio/insert` | `actionInsert()` | Criar nova campanha |
| `/product-studio/edit/{hash}` | `actionEdit()` | Editar campanha existente |
| `/product-studio/delete/{hash}` | `actionDelete()` | Excluir campanha |
| `/product-studio/filter` | `actionFilter()` | Aplicar filtros aos produtos |
| `/product-studio/getimages` | `actionGetImages()` | Buscar imagens geradas |
| `/product-studio/getfeedmediafields` | `actionGetFeedMediaFields()` | Obter campos disponíveis |

## Fluxo de criação de campanha

### 1. Criar campanha

```http
GET /product-studio/insert?client={hash}&feed={hash}&media={hash}
```

**Processo**:
1. Usuário seleciona feed e mídia
2. Define filtros de produtos (categoria, preço, estoque)
3. Escolhe template visual
4. Configura posicionamento de elementos

### 2. Upload de templates

```php title="Upload para S3"
$S3->putObject([
    'Bucket' => 'product-studio',
    'Key' => "models-product-studio/{$clientHash}/img/{$filename}",
    'Body' => $fileContent,
    'ACL' => 'public-read'
]);
```

**Arquivos suportados**:
- `.json`: Configurações do template (Fabric.js)
- `.png`, `.jpg`: Imagens de fundo

### 3. Filtrar produtos

```http
POST /product-studio/filter
Content-Type: application/json

{
  "client_hash": "abc123...",
  "feed_hash": "def456...",
  "media_hash": "ghi789...",
  "filters": {
    "category": "Roupas",
    "price_min": 50,
    "price_max": 200
  },
  "publish": 0
}
```

:::info Filtros disponíveis
Os filtros são baseados nos campos do feed configurado. Use `getfeedmediafields` para listar campos disponíveis.
:::

### 4. Gerar imagens

```php title="Processamento em lote"
// Para cada produto filtrado
foreach ($products as $product) {
    $processor = new ProductStudioProcessImg(...);
    $processor->processImg();
}
```

**Processo Lambda**:
1. Carrega template do S3
2. Carrega imagem do produto
3. Aplica transformações (resize, crop, overlay)
4. Salva no bucket `product-studio-cdn`

### 5. Publicar campanha

```http
POST /product-studio/filter
{
  "publish": 1,
  "campaing_hash": "xyz..."
}
```

**Resultado**:
- Arquivo `{campaing_hash}_stats.json` criado em `product-studio/feed-files/{clientHash}/`
- Imagens disponíveis em `product-studio-cdn/{clientHash}/{campaing_hash}/`

## Frontend (Vue.js)

### Assets

```plaintext title="web/product-studio/"
product-studio/
├── js/
│   └── index.5e478b1c.js     # Bundle Vue.js
├── assets/
│   └── index-6edd0d5a.css    # Estilos
└── template/
    └── type.json              # Templates disponíveis
```

:::note Build
O frontend é uma SPA Vue.js buildada com Vite. O código-fonte original não está no repositório, apenas o bundle compilado.
:::

### Templates disponíveis

```json title="template/type.json"
{
  "templates": [
    {
      "id": "template-1",
      "name": "Banner Horizontal",
      "tempUrl": "/product-studio/template/113e496b-...-ae5f-6fae94adce82.json",
      "src": "/product-studio/template/e011a0d9-...-aca8-86afdbf405d2.png"
    }
  ]
}
```

## Models

### ProductStudioCampaing

**Tabela:** `product_studio_campaing`

```php
[
    'campaing_hash' => 'unique_hash',
    'client_hash' => 'client_id',
    'feed_hash' => 'feed_id',
    'media_hash' => 'media_id',
    'name' => 'Campanha Black Friday',
    'filters' => '{"category": "Roupas"}',
    'template_url' => '/product-studio/template/...',
    'status' => 'processing', // draft, processing, completed
    'created_at' => '2026-01-21 10:00:00',
    'updated_at' => '2026-01-21 10:30:00'
]
```

## API Endpoints

### GET /product-studio/getimages

**Query params**:
- `client_hash`
- `feed_hash`
- `media_hash`
- `campaing_hash`
- `page` (default: 1)

**Response**:
```json
{
  "images": [
    "https://product-studio-cdn.s3.us-east-1.amazonaws.com/{client}/{campaing}/img1.png",
    "https://product-studio-cdn.s3.us-east-1.amazonaws.com/{client}/{campaing}/img2.png"
  ],
  "total": 150,
  "per_page": 8,
  "current_page": 1
}
```

### GET /product-studio/getfeedmediafields

**Query params**:
- `client_hash`
- `feed_hash`
- `media_hash`

**Response**:
```json
{
  "fields": [
    "id",
    "title",
    "description",
    "price",
    "image_link",
    "category",
    "brand"
  ]
}
```

## Configuração

### Variáveis de ambiente

Usa as credenciais AWS padrão do sistema:

```php
DAXGO_ENV_KEY=your-aws-key
DAXGO_ENV_SECRET=your-aws-secret
```

### Permissões IAM

A role IAM deve ter permissões para:

```json title="Política IAM"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::product-studio/*",
        "arn:aws:s3:::product-studio-cdn/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": ["lambda:InvokeFunction"],
      "Resource": [
        "arn:aws:lambda:us-east-1:*:function:ssxml_product_studio-*"
      ]
    }
  ]
}
```

## Troubleshooting

### Imagens não são geradas

**Verificar**:
1. Lambda `ssxml_product_studio-STEP5-generate-img-front` está ativa
2. Permissões S3 para `product-studio` e `product-studio-cdn`
3. Logs da Lambda no CloudWatch

### Template não carrega

**Verificar**:
1. Arquivo `.json` existe em `product-studio/models-product-studio/{client}/`
2. URL do template está correta no banco de dados
3. Permissões de leitura no S3

### Erro ao filtrar produtos

**Verificar**:
1. Lambda `ssxml_product_studio-STEP6-filter-campaing-products` está ativa
2. Feed e mídia existem e têm produtos
3. Sintaxe dos filtros está correta

:::tip Debug local
Para testar localmente, configure `YII_ENV='local'` e aponte para `http://host.docker.internal:3000`
:::

## Melhorias futuras

- [ ] Suporte a vídeos além de imagens
- [ ] Editor de templates online (atualmente offline)
- [ ] Integração direta com redes sociais
- [ ] A/B testing de templates
- [ ] Analytics de performance por campanha

