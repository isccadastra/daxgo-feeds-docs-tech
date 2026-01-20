---
sidebar_position: 1
title: Visão geral
---

# Daxgo Feeds • Documentação Técnica

Documentação completa para o time de desenvolvimento do **Daxgo Feeds**, plataforma de gestão e otimização de feeds de produtos.

## 📚 Conteúdo da documentação

### 🏗️ Backend & API
- [**Estrutura Yii2**](./backend/estrutura-yii2.md) - Arquitetura MVC, controllers, models e components
- [**Modelos de Dados**](./backend/modelos-dados.md) - Entidades principais e relacionamentos
- [**Pipeline de Feeds**](./backend/processamento-feeds.md) - Importação, processamento e publicação
- [**API Endpoints**](./backend/api-endpoints.md) - Referência completa de endpoints REST

### 🎨 Front-end
- [**Customizar Feeds**](./frontend/customizar-feeds.md) - Módulo Vue.js de otimização
- [**Padrões de UI/UX**](./frontend/padroes-ui.md) - Guia de padronização visual

### ⚙️ Infraestrutura
- [**Ambiente Local**](./infra/ambiente-local.md) - Setup com Docker Compose
- [**S3/MinIO**](./infra/s3-minio.md) - Armazenamento de arquivos
- [**DynamoDB**](./infra/dynamodb.md) - Estrutura de tabelas NoSQL
- [**Lambda Functions**](./infra/lambda-functions.md) - Processamento assíncrono
- [**Variáveis de Ambiente**](./infra/variaveis-ambiente.md) - Configurações completas

### 🔌 Integrações
- [**Google Merchant**](./integ/google-merchant.md) - Content API for Shopping
- [**Promoções Google**](./integ/google-merchant-promotions.md) - Módulo de promoções
- [**TikTok Shop**](./integ/tiktok.md) - Sincronização de produtos

### ✨ Features
- [**Catálogo Inteligente (IA)**](./features/catalogo-inteligente.md) - Otimizações com IA
- [**Analytics**](./features/analytics.md) - Métricas e relatórios
- [**Product Studio**](./features/product-studio.md) - Processamento de imagens

### 🛠️ Troubleshooting
- [**Xdebug Setup**](./runbooks/xdebug.md) - Configuração de debug PHP
- [**S3 Troubleshooting**](./runbooks/s3-troubleshooting.md) - Resolução de problemas

## 🚀 Quick Start

### 1. Clone e configure

```bash
git clone <repo-feeds-upgrade>
cd feeds-upgrade
cp config/env-local.example.php config/env-local.php
```

### 2. Suba o ambiente

```bash
docker-compose up -d
```

### 3. Acesse os serviços

- **Backend**: http://localhost:9000
- **MinIO Console**: http://localhost:9667 (admin/password)
- **DynamoDB Admin**: http://localhost:8001

### 4. Explore a arquitetura

Comece pela [**Visão Geral da Arquitetura**](./arquitetura/visao-geral.md).

## 🔗 Repositórios

| Repo | Tecnologia | Descrição |
|------|------------|-----------|
| `feeds-upgrade` | Yii2, PHP 8.2 | Backend principal |
| `feeds-front-vue` | Vue.js 2 | Front-end de otimização |
| `daxgo-feeds-docs` | Docusaurus | Docs de produto |
| `daxgo-feeds-docs-tech` | Docusaurus | Esta documentação |

## 🛠️ Stack Técnica

### Backend
- **Framework**: Yii2
- **Linguagem**: PHP 8.2
- **Database**: MySQL 8.0
- **NoSQL**: DynamoDB

### Front-end
- **Framework**: Vue.js 2
- **Build**: Webpack 3
- **Libs**: Axios, VueMultiselect, Vuetable-2

### Infraestrutura
- **Container**: Docker Compose
- **Storage**: AWS S3 / MinIO
- **Compute**: AWS Lambda
- **Queue**: AWS SQS

### Integrações
- Google OAuth2 & Merchant Center API
- TikTok Shop API
- AWS Services (S3, DynamoDB, Lambda, SQS, CloudWatch)

## 📊 Arquitetura

```
┌──────────────┐     ┌──────────────┐     ┌─────────────┐
│   Vue.js 2   │────▶│  Yii2 API    │────▶│    MySQL    │
│  Front-end   │     │   Backend    │     │   Database  │
└──────────────┘     └──────────────┘     └─────────────┘
                            │
                            ├──────▶ S3/MinIO (Feeds & Assets)
                            ├──────▶ DynamoDB (Promotions & Tokens)
                            ├──────▶ Lambda (Processamento)
                            └──────▶ Google Merchant API
```

## 📖 Convenções

- Caminhos de arquivos referenciam os repos `feeds-upgrade` ou `feeds-front-vue`
- Endpoints são descritos no formato `METHOD /path`
- Variáveis de ambiente usam o prefixo `DAXGO_ENV_` quando aplicável
- Cookies e sessões do Yii2 são usados para autenticação

## 🤝 Contribuindo

Ao contribuir:

1. Siga os [**Padrões de UI/UX**](./frontend/padroes-ui.md)
2. Consulte a [**Referência de API**](./backend/api-endpoints.md)
3. Teste localmente com Docker
4. Atualize esta documentação quando necessário

## 📝 Última atualização

**Janeiro de 2026** - Documentação completa com todas as features e integrações atuais.

