---
title: Integração LIA (Magazine Luiza)
description: Integração com LIA para sincronização de produtos e estoque VTEX
keywords: [lia, magazine luiza, magalu, vtex, estoque]
tags: [integrações, lia, vtex, ecommerce]
---

# Integração LIA (Magazine Luiza)

Integração com LIA (Magazine Luiza) para geração de XML de produtos e sincronização de inventário VTEX.

:::info Sobre LIA
LIA é a plataforma de integração do Magazine Luiza para sellers e parceiros de marketplace.
:::

## Component

**Arquivo:** `components/LambdaLia.php`

### Funções Lambda

| Função Lambda | Método | Responsabilidade |
|--------------|--------|------------------|
| `integracao_LIA_VTEX_generate_XML` | `generateLiaXml()` | Gera XML de produtos para LIA |
| `integracao_LIA_VTEX_create_inventory` | `prepareInventory()` | Cria e sincroniza inventário VTEX |

## Models

### Armazenamento DynamoDB

**Tabela:** `ssxml_store`

Armazena configurações da loja VTEX:

```json
{
  "client_hash": "abc123...",
  "store_code": "VTEX",
  "vtex_app_key": "vtexappkey-...",
  "vtex_account": "nome-da-conta",
  "vtex_token": "...",
  "vtex_warehouse_id": "1_1"
}
```

## Fluxo de integração

### 1. Geração de XML LIA

```php title="Gerar XML de produtos"
$lambdaLia = new LambdaLia();
$result = $lambdaLia->generateLiaXml(
    $clientHash,
    $storeCode,
    $xmlUrl
);
```

**Processo**:
1. Busca configurações da loja no DynamoDB (`ssxml_store`)
2. Adiciona URL do XML ao payload
3. Invoca Lambda para gerar XML no formato LIA
4. Lambda processa produtos e retorna XML formatado

:::note URL do Feed
O parâmetro `$xmlUrl` deve apontar para o feed de produtos processado pelo Daxgo Feeds.
:::

### 2. Sincronização de Inventário

```php title="Preparar inventário VTEX"
$lambdaLia->prepareInventory(
    $clientHash,
    $storeCode,
    $vtexAppKey,
    $vtexWarehouseId,
    $vtexAccount,
    $vtexToken
);
```

**Payload**:
```php
[
    'type' => 'triggerPrepareInventory',
    'client_hash' => $clientHash,
    'store_code' => $storeCode,
    'vtex_app_key' => $vtexAppKey,
    'vtex_warehouse_id' => $vtexWarehouseId,
    'vtex_account' => $vtexAccount,
    'vtex_token' => $vtexToken,
    'page' => 1,
    'pageSize' => 500
]
```

**Processo**:
1. Busca SKUs da VTEX (paginado, 500 por página)
2. Formata dados de estoque
3. Atualiza inventário no LIA

:::warning Credenciais VTEX
As credenciais VTEX (App Key e Token) devem ter permissões de leitura de inventário e produtos.
:::

## Configuração

### Variáveis de ambiente

Não há variáveis específicas para LIA. A integração usa as credenciais AWS padrão:

```php
DAXGO_ENV_KEY=your-aws-key
DAXGO_ENV_SECRET=your-aws-secret
```

### Configuração da loja

As configurações da loja VTEX devem ser cadastradas no DynamoDB:

```php title="Estrutura no DynamoDB"
TableName: ssxml_store
Partition Key: client_hash (String)
Sort Key: store_code (String)

Atributos:
- vtex_app_key: Chave de API VTEX
- vtex_account: Nome da conta VTEX
- vtex_token: Token de autenticação
- vtex_warehouse_id: ID do depósito VTEX
```

## API VTEX

### Endpoints utilizados

```http title="Buscar SKUs"
GET https://{account}.vtexcommercestable.com.br/api/catalog_system/pvt/sku/stockkeepingunitids
```

```http title="Buscar inventário"
GET https://{account}.vtexcommercestable.com.br/api/logistics/pvt/inventory/skus/{skuId}
```

:::info Paginação
A API VTEX retorna no máximo 1000 SKUs por requisição. A integração faz paginação automática.
:::

## Controllers

### TikTokController

Embora o nome sugira TikTok, este controller também gerencia integrações LIA:

```php title="Exemplo de uso"
// Em TikTokController.php
$lambdaLia = new LambdaLia();
$lambdaLia->generateLiaXml($clientHash, 'VTEX', $xmlUrl);
```

## Troubleshooting

### Erro: "Missing required TikTok shop data for client"

**Causa**: Dados de configuração ausentes no DynamoDB

**Solução**:
1. Verificar se o registro existe em `ssxml_store`
2. Validar se `vtex_app_key` e `vtex_warehouse_id` estão preenchidos

### Erro: "Error invoking Lambda function"

**Causa**: Falha na invocação Lambda

**Solução**:
1. Verificar logs do CloudWatch
2. Validar credenciais AWS (`DAXGO_ENV_KEY`, `DAXGO_ENV_SECRET`)
3. Verificar permissões IAM para invocar Lambda

### XML vazio ou incompleto

**Causa**: URL do feed inválida ou produtos não encontrados

**Solução**:
1. Validar URL do feed (`$xmlUrl`)
2. Verificar se o feed possui produtos
3. Checar logs da Lambda `integracao_LIA_VTEX_generate_XML`

:::tip Debug
Habilite logs detalhados na Lambda para debug de problemas de integração.
:::

## Próximos passos

- [ ] Documentar formato exato do XML LIA
- [ ] Adicionar exemplo de resposta da Lambda
- [ ] Documentar erros comuns da API VTEX
- [ ] Criar guia de configuração passo a passo


