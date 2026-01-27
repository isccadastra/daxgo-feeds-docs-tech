---
title: Integração LIA VTEX
description: Integração LIA para geração de XML e sincronização de inventário VTEX
keywords: [lia, vtex, estoque, inventário, xml]
tags: [integrações, lia, vtex, ecommerce]
---

# Integração LIA VTEX

Integração para geração de XML de produtos e sincronização de inventário com plataforma VTEX via AWS Lambda.

:::info Sobre LIA
LIA é um sistema de integração para geração de feeds de produtos e sincronização de inventário com lojas VTEX.
:::

## Componente

**Arquivo:** `components/LambdaLia.php`

Componente responsável por invocar funções Lambda AWS para processar integrações LIA com VTEX.

### Funções Lambda

| Função Lambda | Método | Responsabilidade |
|--------------|--------|------------------|
| `integracao_LIA_VTEX_generate_XML` | `generateLiaXml()` | Gera XML de produtos para LIA |
| `integracao_LIA_VTEX_create_inventory` | `prepareInventory()` | Prepara e sincroniza inventário VTEX |

---

## DynamoDB

### Tabela: `ssxml_store`

Armazena configurações das lojas VTEX para integração.

**Chave primária:**
- `client_hash` (String, HASH): Hash do cliente
- `store_code` (String, RANGE): Código da loja (ex: "VTEX")

**Atributos:**
```json
{
  "client_hash": "abc123",
  "store_code": "VTEX",
  "vtex_app_key": "vtexappkey-...",
  "vtex_account": "nome-da-conta",
  "vtex_token": "eyJhbGciOi...",
  "vtex_warehouse_id": "1_1"
}
```

---

## Métodos

### generateLiaXml()

```php
public function generateLiaXml(
    $client_hash, 
    $store_code, 
    $xmlUrl
): array
```

Gera XML de produtos no formato LIA a partir de um feed existente.

**Parâmetros:**
- `$client_hash` (string): Hash do cliente
- `$store_code` (string): Código da loja (geralmente "VTEX")
- `$xmlUrl` (string): URL do feed de produtos processado

**Processo:**
1. Busca configurações da loja no DynamoDB (`ssxml_store`)
2. Adiciona URL do XML ao payload
3. Invoca Lambda `integracao_LIA_VTEX_generate_XML`
4. Lambda processa produtos e retorna XML formatado

**Retorno:**
Array com o resultado do processamento da Lambda

**Exemplo de uso:**

```php
$lambdaLia = new LambdaLia();

$result = $lambdaLia->generateLiaXml(
    $clientHash,
    'VTEX',
    'https://s3.amazonaws.com/bucket/feed.xml'
);
```

---

### prepareInventory()

```php
public function prepareInventory(
    $client_hash,
    $store_code,
    $vtex_app_key,
    $vtex_warehouse_id,
    $vtex_account,
    $vtex_token
): void
```

Prepara e sincroniza inventário da loja VTEX.

**Parâmetros:**
- `$client_hash` (string): Hash do cliente
- `$store_code` (string): Código da loja
- `$vtex_app_key` (string): Chave de API VTEX
- `$vtex_warehouse_id` (string): ID do depósito VTEX (ex: "1_1")
- `$vtex_account` (string): Nome da conta VTEX
- `$vtex_token` (string): Token de autenticação VTEX

**Processo:**
1. Invoca Lambda `integracao_LIA_VTEX_create_inventory`
2. Lambda busca SKUs da VTEX (paginado, 500 por página)
3. Lambda formata dados de estoque
4. Lambda atualiza inventário no sistema LIA

**Payload enviado:**

```json
{
  "type": "triggerPrepareInventory",
  "client_hash": "abc123",
  "store_code": "VTEX",
  "vtex_app_key": "vtexappkey-...",
  "vtex_warehouse_id": "1_1",
  "vtex_account": "nome-da-conta",
  "vtex_token": "eyJhbGci...",
  "page": 1,
  "pageSize": 500
}
```

**Exemplo de uso:**

```php
$lambdaLia = new LambdaLia();

$lambdaLia->prepareInventory(
    $clientHash,
    'VTEX',
    $vtexAppKey,
    $vtexWarehouseId,
    $vtexAccount,
    $vtexToken
);
```

---

## Controller

### StoreController

Gerencia cadastro e configuração de lojas VTEX.

**Endpoint:** `POST /store/insert`

Ao criar uma nova loja, automaticamente dispara a Lambda de preparação de inventário:

```php
// StoreController::actionInsert()
if ($oStore->save()) {
    $oLambda = new LambdaLia();
    
    $oLambda->prepareInventory(
        $client_hash,
        $store_code,
        $vtex_app_key,
        $vtex_warehouse_id,
        $vtex_account,
        $vtex_token
    );
}
```

---

## API VTEX

### Endpoints utilizados pelas Lambdas

```http
GET https://{account}.vtexcommercestable.com.br/api/catalog_system/pvt/sku/stockkeepingunitids
```

Busca lista de SKUs da conta VTEX.

```http
GET https://{account}.vtexcommercestable.com.br/api/logistics/pvt/inventory/skus/{skuId}
```

Busca dados de inventário de um SKU específico.

:::info Paginação
A API VTEX retorna no máximo 1000 SKUs por requisição. As Lambdas fazem paginação automática.
:::

:::warning Credenciais VTEX
As credenciais VTEX (App Key e Token) devem ter permissões de:
- Leitura de catálogo de produtos
- Leitura de inventário/estoque
:::

---

## Configuração

### Variáveis de ambiente

Não há variáveis específicas para LIA. A integração usa as credenciais AWS padrão:

```php
DAXGO_ENV_KEY=your-aws-key
DAXGO_ENV_SECRET=your-aws-secret
```

### Configuração da loja

As configurações da loja VTEX devem ser cadastradas via interface ou diretamente no DynamoDB:

**Campos obrigatórios:**
- `client_hash`: Hash do cliente Daxgo
- `store_code`: Código identificador da loja (ex: "VTEX")
- `vtex_app_key`: Chave de API VTEX
- `vtex_account`: Nome da conta VTEX (subdomínio)
- `vtex_token`: Token de autenticação VTEX
- `vtex_warehouse_id`: ID do depósito/warehouse VTEX

---

## Troubleshooting

### Erro: "Missing store configuration"

**Causa**: Dados de configuração ausentes no DynamoDB

**Solução**:
1. Verificar se o registro existe em `ssxml_store`
2. Validar se todos os campos obrigatórios estão preenchidos
3. Verificar se `client_hash` e `store_code` estão corretos

### Erro: "Error invoking Lambda function"

**Causa**: Falha na invocação Lambda

**Solução**:
1. Verificar logs do CloudWatch
2. Validar credenciais AWS (`DAXGO_ENV_KEY`, `DAXGO_ENV_SECRET`)
3. Verificar permissões IAM para invocar Lambda
4. Confirmar que as funções Lambda existem na região correta

### Erro de autenticação VTEX

**Causa**: Credenciais VTEX inválidas ou sem permissões

**Solução**:
1. Validar `vtex_app_key` e `vtex_token`
2. Verificar se as credenciais têm permissões adequadas
3. Testar credenciais diretamente na API VTEX
4. Gerar novas credenciais se necessário

### XML vazio ou incompleto

**Causa**: URL do feed inválida ou produtos não encontrados

**Solução**:
1. Validar URL do feed (`$xmlUrl`)
2. Verificar se o feed possui produtos
3. Testar acesso direto à URL do feed
4. Checar logs da Lambda `integracao_LIA_VTEX_generate_XML`

---

:::tip Debug
Habilite logs detalhados nas Lambdas para debug de problemas de integração. Os logs ficam disponíveis no CloudWatch.
:::

:::info Documentação relacionada
- [DynamoDB](../infra/dynamodb.md) - Estrutura da tabela `ssxml_store`
- [Lambda Functions](../infra/lambda-functions.md) - Funções AWS Lambda
- [Componentes](../backend/componentes.md) - Outros componentes do sistema
:::
