---
title: Services
description: Catálogo dos services do backend Yii2 e suas responsabilidades
keywords: [services, backend, yii2, google merchant, analytics, ia, frete, promocao]
tags: [arquitetura, backend]
---

# Services

Este catálogo lista os services presentes em `/services`.
O objetivo é mapear responsabilidades e integrações principais de cada classe.

## Lista de services

- `FeedOptimizeLogger`  
  Log de otimização de feeds (salvamento/publicação), com envio para CloudWatch.
- `GoogleMerchantData`  
  Cliente de integração com Google Merchant (Shopping Content/Reports): métricas de performance, status e produtos reprovados.
- `GoogleMerchantPromotionService`  
  Sincronização de promoções com o Google Merchant (listar, importar, sincronizar, encerrar, remover, gerar XML fallback).
- `GoogleMerchantShippingService`  
  Envio das regras de frete do cliente para o Google Merchant via SDK (build de `ShippingSettings`).
- `GoogleMerchantTokenService`  
  Gestão de tokens OAuth do Merchant no DynamoDB (persistência, renovação, revogação e validação).
- `IaData`  
  Integração com IA (OpenRouter) para mapeamento de campos e taxonomias, com cache em arquivo.
- `ProductsAnalytics`  
  Cadastro/consulta de produtos analíticos e listagem de categorias.
- `ProductsDataAnalytics`  
  Coleta de dados do GA4, normalização por cliente e persistência em `products_data_analytics` e `products_analytics`.
- `ProductsDataAnalyticsConsolidated`  
  Consolidação de métricas por período e exportação de JSON para S3 (`json-to-optimize`).
- `ProductsDataAnalyticsReport`  
  Consultas e relatórios (mais vistos, conversão, variações, filtros por período/categoria/sku).
- `PromotionService`  
  CRUD e status de promoções no DynamoDB, incluindo logs de erro de sincronização.
- `ShippingMerchantSyncService`  
  Orquestração de sincronização pendente de regras de frete com Google Merchant.
- `ShippingService`  
  CRUD de regras de frete, status de sincronização e marcação de status no Google.
- `Taxonomy`  
  Aplicação de sugestões de taxonomia via IA e aceite de sugestões.