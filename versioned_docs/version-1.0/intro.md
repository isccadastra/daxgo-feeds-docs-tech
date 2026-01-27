---
sidebar_position: 1
title: Visão geral
description: Documentação técnica completa do Daxgo Feeds para desenvolvedores
keywords: [daxgo, feeds, yii2, vue, documentação técnica, api]
tags: [introdução, overview]
---

# Daxgo Feeds • Documentação Técnica

Documentação completa para o time de desenvolvimento do **Daxgo Feeds**, plataforma de gestão e otimização de feeds de produtos.

:::info Sobre esta documentação
Esta é a **documentação técnica** destinada a desenvolvedores. Para documentação de produto e usuários, acesse a [documentação principal](https://docs.feeds.daxgo.io).
:::

## Conteúdo da documentação

### Backend & API
- [**Estrutura Yii2**](./backend/estrutura-yii2) - Arquitetura MVC, controllers, models e components
- [**Modelos de Dados**](./backend/modelos-dados) - Entidades principais e relacionamentos
- [**Pipeline de Feeds**](./backend/processamento-feeds) - Importação, processamento e publicação
- [**API Endpoints**](./backend/api-endpoints) - Referência completa de endpoints REST

### Front-end
- [**Customizar Feeds**](./frontend/customizar-feeds) - Módulo Vue.js de otimização
- [**Padrões de UI/UX**](./frontend/padroes-ui) - Guia de padronização visual

### Infraestrutura
- [**Ambiente Local**](./infra/ambiente-local) - Setup com Docker Compose
- [**S3/MinIO**](./infra/s3-minio) - Armazenamento de arquivos
- [**DynamoDB**](./infra/dynamodb) - Estrutura de tabelas NoSQL
- [**Lambda Functions**](./infra/lambda-functions) - Processamento assíncrono
- [**Variáveis de Ambiente**](./infra/variaveis-ambiente) - Configurações completas

### Integrações
- [**Google Merchant Center**](./integ/google-merchant) - Content API for Shopping e Promoções
- [**TikTok Shop**](./integ/tiktok) - Sincronização de produtos

### Features
- [**Catálogo Inteligente (IA)**](./features/catalogo-inteligente) - Otimizações com IA
- [**Analytics**](./features/analytics) - Métricas e relatórios
- [**Product Studio**](./features/product-studio) - Processamento de imagens

### Troubleshooting
- [**Xdebug Setup**](./runbooks/xdebug) - Configuração de debug PHP
- [**S3 Troubleshooting**](./runbooks/s3-troubleshooting) - Resolução de problemas

## Quick Start

:::tip Pré-requisitos
Certifique-se de ter instalado: **Docker**, **Docker Compose** e **Git**
:::

### 1. Clone e configure

```bash title="Terminal"
git clone <repo-feeds-upgrade>
cd feeds-upgrade
cp config/env-local.example.php config/env-local.php
```

:::warning Configuração obrigatória
Edite o arquivo `config/env-local.php` com suas credenciais de acesso (S3, DynamoDB, MySQL).
:::

### 2. Suba o ambiente

```bash title="Terminal"
docker-compose up -d
```

<details>
<summary>Ver logs dos containers</summary>

```bash
# Logs de todos os serviços
docker-compose logs -f

# Logs de um serviço específico
docker-compose logs -f php
docker-compose logs -f nginx
```
</details>

### 3. Acesse os serviços

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **Backend** | http://localhost:9000 | Usuário do sistema |
| **MinIO Console** | http://localhost:9090 | admin / password |
| **PHPMyAdmin** | http://localhost:9001 | admin / admin |
| **DynamoDB Local** | http://localhost:8000 | - |
| **S3 Console** | http://localhost:9092 | - |

### 4. Explore a arquitetura

Comece pela [**Visão Geral da Arquitetura**](./arquitetura/visao-geral).

## Repositórios

| Repo | Tecnologia | Descrição |
|------|------------|-----------|
| `feeds-upgrade` | Yii2, PHP 8.2 | Backend principal |
| `feeds-front-vue` | Vue.js 2 | Front-end de otimização |

## Stack Técnica

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

## Arquitetura

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

## Convenções

:::note Convenções de documentação
- Caminhos de arquivos referenciam os repos `feeds-upgrade` ou `feeds-front-vue`
- Endpoints são descritos no formato `METHOD /path`
- Variáveis de ambiente usam o prefixo `DAXGO_ENV_` quando aplicável
- Cookies e sessões do Yii2 são usados para autenticação
:::

## Contribuindo

:::tip Como contribuir
Ao contribuir para o projeto:

1. Siga os [**Padrões de UI/UX**](./frontend/padroes-ui)
2. Consulte a [**Referência de API**](./backend/api-endpoints)
3. Teste localmente com Docker
4. Atualize esta documentação quando necessário
5. Execute os testes antes de fazer commit
:::

## Última atualização

**Janeiro de 2026** - Documentação completa com todas as features e integrações atuais.


