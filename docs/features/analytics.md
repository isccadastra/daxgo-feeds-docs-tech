---
title: Analytics e Métricas
description: Sistema de análise de performance de produtos e feeds via Google Analytics
keywords: [analytics, métricas, google analytics, performance, dados]
tags: [features, analytics, métricas]
---

# Analytics e Métricas

Sistema de análise de dados de produtos e performance de feeds.

:::tip Google Analytics Data API
Utiliza a nova Google Analytics Data API (v0.11+) para coletar métricas detalhadas de performance.
:::

## Services

### `ProductsAnalytics`

**Arquivo:** `services/ProductsAnalytics.php`

Análise básica de produtos.

### `ProductsDataAnalytics`

**Arquivo:** `services/ProductsDataAnalytics.php`

Análise detalhada de dados de produtos com métricas consolidadas.

### `ProductsDataAnalyticsConsolidated`

**Arquivo:** `services/ProductsDataAnalyticsConsolidated.php`

Consolidação de métricas por período.

### `ProductsDataAnalyticsReport`

**Arquivo:** `services/ProductsDataAnalyticsReport.php`

Geração de relatórios customizados.

## Models

- `ProductsAnalytics.php`
- `ProductsDataAnalytics.php`
- `ProductsDataAnalyticsConsolidated.php`

## Métricas coletadas

### Por produto
- Impressões
- Cliques
- CTR (Click-Through Rate)
- Conversões
- Valor de vendas
- ROAS (Return on Ad Spend)

### Por feed
- Total de produtos
- Produtos ativos
- Produtos otimizados
- Taxa de otimização
- Erros de validação

### Por cliente
- Performance geral
- Comparação entre mídias
- Evolução temporal

## Component

**Arquivo:** `components/Analytics.php`

Integração com serviços de analytics (Google Analytics, Facebook Pixel, etc.).

**Métodos:**
```php
public function trackEvent($eventName, $params)
public function trackPageView($page)
public function trackConversion($orderId, $value)
```

## CloudWatch

**Arquivo:** `components/CloudWatch.php`

Envio de métricas customizadas para CloudWatch.

**Exemplo:**
```php
$cloudWatch = Yii::$app->CloudWatch;
$cloudWatch->putMetricData([
    'Namespace' => 'DaxgoFeeds',
    'MetricData' => [
        [
            'MetricName' => 'FeedsProcessed',
            'Value' => 1,
            'Unit' => 'Count',
            'Timestamp' => time(),
            'Dimensions' => [
                [
                    'Name' => 'ClientHash',
                    'Value' => $clientHash
                ]
            ]
        ]
    ]
]);
```

## Dashboard

Acesse métricas em tempo real através do dashboard do sistema.

**Métricas disponíveis:**
- Performance de feeds
- Taxa de otimização
- Produtos por status
- Erros e alertas


