---
title: Product Studio
---

# Product Studio

Processamento e otimização de imagens de produtos.

## Components

### `ProductStudioCampaingProducts`

**Arquivo:** `components/ProductStudioCampaingProducts.php`

Gestão de campanhas e produtos associados.

### `ProductStudioProcessImg`

**Arquivo:** `components/ProductStudioProcessImg.php`

Processamento de imagens (resize, crop, watermark, etc.).

## Model

**Arquivo:** `models/ProductStudioCampaing.php`

Campanhas de Product Studio.

**Atributos:**
- `campaign_id`: ID da campanha
- `client_hash`: Cliente
- `name`: Nome da campanha
- `settings`: Configurações JSON
- `status`: Status da campanha

## Funcionalidades

### Processamento de imagens

- Resize automático
- Crop inteligente
- Aplicação de watermark
- Otimização de qualidade
- Conversão de formatos

### Campanhas

- Agrupa produtos para processamento em lote
- Aplica configurações específicas por campanha
- Histórico de processamento

## Configuração

```php
$settings = [
    'resize' => [
        'width' => 1200,
        'height' => 1200,
        'mode' => 'fit'
    ],
    'watermark' => [
        'enabled' => true,
        'position' => 'bottom-right',
        'opacity' => 0.5
    ],
    'quality' => 85,
    'format' => 'jpg'
];
```

## Armazenamento

Imagens processadas são salvas em S3:
```
bucket: daxgo/
└── product-studio/
    ├── {campaign_id}/
    │   ├── original/
    │   └── processed/
    └── cache/
```


