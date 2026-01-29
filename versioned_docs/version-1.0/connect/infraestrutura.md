# Infraestrutura

## 4.1. Visão Geral

O DaxGO Connect opera **exclusivamente na AWS (Amazon Web Services)** utilizando uma arquitetura serverless moderna e escalável.

### Características da Infraestrutura

- ☁️ **Cloud Provider**: 100% AWS
- 🎯 **Arquitetura**: Serverless (sem servidores para gerenciar)
- 📡 **Origem dos Dados**: Google Tag Manager (GTM) em sites de clientes
- 🔄 **Fluxo**: GTM → API Gateway (WAF) → Lambda(s) → DynamoDB → CRM APIs
- ⏰ **Orquestração**: EventBridge para tarefas agendadas
- 🔐 **Segurança**: Secrets Manager para credenciais sensíveis

### Princípios de Design

1. **Serverless First**: Sem infraestrutura para gerenciar
2. **Pay-per-use**: Custos proporcionais ao uso real
3. **Auto-scaling**: Escalabilidade automática conforme demanda
4. **Managed Services**: Uso de serviços gerenciados pela AWS
5. **Security by Design**: Segurança em todas as camadas

## 4.2. Componentes Detalhados da AWS

### 4.2.1. API Gateway

**Função**: Ponto de entrada HTTP(S) para os dados do GTM, roteamento para Lambdas ReceiveData.

#### Configuração

| Aspecto | Configuração |
|---------|--------------|
| **Tipo de Endpoint** | Edge-Optimized ou Regional (REST APIs) |
| **Protocolo** | HTTPS |
| **Autenticação** | Nenhuma (proteção via WAF) |
| **Throttling** | Configurável por cliente |
| **Caching** | Desabilitado (dados em tempo real) |

#### Estrutura de Endpoints

```
API Gateway - DaxGO Connect
│
├─ /responsys (compartilhado)
│  └─ POST - Aciona Lambda ReceiveData Responsys
│
├─ /salesforce (compartilhado)
│  └─ POST - Aciona Lambda ReceiveData Salesforce
│
└─ /rdstation (único)
   └─ POST - Aciona Lambda ReceiveData RD Station
```

#### Integração com Lambda

```json
{
  "type": "AWS_PROXY",
  "httpMethod": "POST",
  "uri": "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:ACCOUNT_ID:function:connect-receive-data/invocations",
  "passthroughBehavior": "WHEN_NO_MATCH"
}
```

#### Segurança

- ✅ **AWS WAF** integrado (proteção contra ataques)
- ✅ **HTTPS obrigatório** (TLS 1.2+)
- ✅ **CORS configurado** para domínios dos clientes
- ❌ **Sem API Key** nos endpoints do GTM (simplifica integração)

#### Monitoramento

Métricas disponíveis no CloudWatch:
- `4XXError`: Erros de cliente
- `5XXError`: Erros de servidor
- `Count`: Total de requisições
- `Latency`: Tempo de resposta
- `IntegrationLatency`: Tempo de integração com Lambda

### 4.2.2. AWS Lambda

**Função**: Execução do código (Node.js) para ingestão, tratamento, transformação e envio de dados, além da atualização de tokens.

#### Configuração Típica

| Parâmetro | Valor Padrão | Observações |
|-----------|--------------|-------------|
| **Runtime** | Node.js 18.x - 22.x | Versões LTS |
| **Memória** | 512 MB - 1024 MB | Ajustável por função |
| **Timeout** | 30s - 60s | Depende da integração |
| **Rede** | Pública (sem VPC) | Acesso direto à internet |
| **Concorrência** | Sem reserva | Auto-scaling padrão |
| **Arquitetura** | x86_64 | Padrão AWS |

#### Tipos de Funções Lambda

##### ReceiveData Lambdas

**Responsabilidade**: Ingestão inicial dos dados

```javascript
// Exemplo: connect-responsys-client-abc-receive
exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  
  // Validação
  if (!body.email || !body.eventType) {
    return { statusCode: 400, body: 'Invalid payload' };
  }
  
  // Armazenamento ou processamento direto
  await storeInDynamoDB(body);
  
  return { statusCode: 200, body: 'Data received' };
};
```

**Características**:
- Timeout curto (10-15s)
- Memória moderada (512 MB)
- Alta frequência de invocação
- Erro = notificação SNS

##### ProcessData Lambdas

**Responsabilidade**: Tratamento e envio para CRMs

```javascript
// Exemplo: connect-responsys-client-abc-process
exports.handler = async (event) => {
  // Buscar dados do DynamoDB
  const records = await getDynamoDBRecords();
  
  // Buscar token atualizado
  const token = await getTokenFromDynamoDB();
  
  // Processar cada registro
  for (const record of records) {
    const transformed = transformData(record);
    await sendToCRM(transformed, token);
    await deleteFromDynamoDB(record.id);
  }
  
  return { statusCode: 200, body: 'Processing complete' };
};
```

**Características**:
- Timeout longo (30-60s)
- Memória maior (1024 MB)
- Acionada por EventBridge
- Processa lotes de dados

##### Lambdas de Atualização de Token

**Responsabilidade**: Renovação automática de tokens

```javascript
// Exemplo: connect-responsys-refresh-token
exports.handler = async (event) => {
  // Buscar credenciais do Secrets Manager
  const credentials = await getSecretsManagerSecret('responsys/client-abc/creds');
  
  // Solicitar novo token
  const response = await axios.post('https://api.responsys.com/auth/token', {
    username: credentials.username,
    password: credentials.password,
    grant_type: 'password'
  });
  
  // Armazenar token no DynamoDB
  await saveToDynamoDB({
    clientId: 'client-abc',
    token: response.data.access_token,
    expiresAt: Date.now() + (response.data.expires_in * 1000)
  });
  
  return { statusCode: 200, body: 'Token refreshed' };
};
```

**Características**:
- Timeout médio (30s)
- Memória baixa (256 MB)
- Acionada por EventBridge periodicamente
- Crítica para continuidade

#### Permissões IAM

Exemplo de política IAM para Lambda ReceiveData:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:ACCOUNT_ID:table/connect-navigation-data"
    },
    {
      "Effect": "Allow",
      "Action": [
        "sns:Publish"
      ],
      "Resource": "arn:aws:sns:us-east-1:ACCOUNT_ID:connect-errors"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:us-east-1:ACCOUNT_ID:log-group:/aws/lambda/*"
    }
  ]
}
```

#### Acesso à Rede

- **Não utilizam VPC** (acesso direto à internet)
- Comunicação com APIs externas via HTTPS
- Acesso a serviços AWS via endpoints públicos

:::tip Por que sem VPC?
Lambdas sem VPC têm menor latência e não requerem NAT Gateway, reduzindo custos. Como não há necessidade de acesso a recursos privados, a rede pública da AWS é suficiente.
:::

### 4.2.3. Amazon DynamoDB

**Função**: Armazenamento de dados de navegação (buffer temporário) e persistência de tokens/configurações.

#### Tabelas

##### 1. Tabela de Dados de Navegação

**Exemplo**: `connect-navigation-data`

```javascript
{
  "TableName": "connect-navigation-data",
  "KeySchema": [
    { "AttributeName": "recordId", "KeyType": "HASH" },  // Partition key
    { "AttributeName": "timestamp", "KeyType": "RANGE" }  // Sort key
  ],
  "AttributeDefinitions": [
    { "AttributeName": "recordId", "AttributeType": "S" },
    { "AttributeName": "timestamp", "AttributeType": "N" }
  ],
  "BillingMode": "PAY_PER_REQUEST"  // On-demand
}
```

**Exemplo de Registro**:

```json
{
  "recordId": "client-abc-20260128-uuid",
  "timestamp": 1706457600000,
  "clientId": "client-abc",
  "email": "user@example.com",
  "eventType": "product_view",
  "productId": "PROD-12345",
  "productName": "Smartphone XYZ",
  "productPrice": 1299.90,
  "productImage": "https://example.com/image.jpg",
  "productUrl": "https://example.com/product/xyz",
  "tid": "GA4.123456789.987654321",  // GA4 client ID
  "ttl": 1706544000  // Expira em 24h
}
```

**Características**:
- Modo: **On-demand** (escalabilidade automática)
- TTL: Ativado (dados expiram automaticamente)
- Backups: Não configurados (dados transitórios)
- GSI: Pode ter índice por `clientId` para queries

##### 2. Tabela de Tokens

**Exemplo**: `connect-responsys-tokens`

```javascript
{
  "TableName": "connect-responsys-tokens",
  "KeySchema": [
    { "AttributeName": "clientId", "KeyType": "HASH" }
  ],
  "AttributeDefinitions": [
    { "AttributeName": "clientId", "AttributeType": "S" }
  ],
  "BillingMode": "PAY_PER_REQUEST"
}
```

**Exemplo de Registro**:

```json
{
  "clientId": "client-abc",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "dGhpc2lzYXJlZnJlc2h0b2tlbg==",
  "expiresAt": 1706461200000,
  "updatedAt": 1706457600000,
  "environment": "production"
}
```

**Características**:
- Modo: **On-demand**
- TTL: Não ativado (tokens persistem)
- Backups: Recomendado (dados críticos)
- Acesso: Somente Lambdas ProcessData e RefreshToken

##### 3. Tabela de Configurações (RD Station)

**Exemplo**: `connect-rdstation-config`

```javascript
{
  "TableName": "connect-rdstation-config",
  "KeySchema": [
    { "AttributeName": "tid", "KeyType": "HASH" }  // GA4 client ID
  ],
  "AttributeDefinitions": [
    { "AttributeName": "tid", "AttributeType": "S" }
  ],
  "BillingMode": "PAY_PER_REQUEST"
}
```

**Exemplo de Registro**:

```json
{
  "tid": "GA4.123456789.987654321",
  "clientId": "client-xyz",
  "clientName": "Loja XYZ Ltda",
  "endpoint": "https://api.rd.services/platform/conversions",
  "token": "rdstation_api_token_here",
  "active": true,
  "createdAt": 1706457600000
}
```

**Características**:
- Modo: **On-demand**
- Permite Lambda compartilhada identificar configuração por `tid`
- Acesso: Lambda ReceiveData RD Station

#### Controle de Acesso

- Políticas IAM granulares por Lambda
- Princípio do menor privilégio
- Auditoria via CloudTrail

### 4.2.4. Amazon SNS (Simple Notification Service)

**Função**: Notificação de erros críticos das aplicações Lambda.

#### Configuração

**Tópico**: `connect-errors`

```javascript
{
  "TopicArn": "arn:aws:sns:us-east-1:ACCOUNT_ID:connect-errors",
  "DisplayName": "DaxGO Connect - Erros Críticos",
  "Subscriptions": [
    {
      "Protocol": "email",
      "Endpoint": "dev@daxgo.io"
    },
    {
      "Protocol": "email",
      "Endpoint": "app@daxgo.io"
    }
  ]
}
```

#### Exemplo de Uso na Lambda

```javascript
const AWS = require('aws-sdk');
const sns = new AWS.SNS();

async function notifyError(error, context) {
  const message = {
    Subject: `[ERRO] ${context.functionName}`,
    Message: JSON.stringify({
      function: context.functionName,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, null, 2),
    TopicArn: process.env.SNS_TOPIC_ARN
  };
  
  await sns.publish(message).promise();
}

// Uso
try {
  await processData();
} catch (error) {
  await notifyError(error, context);
  throw error;
}
```

#### Tipos de Notificações

- ⚠️ **Erros de integração** com APIs externas
- ⚠️ **Falhas de autenticação** (tokens expirados)
- ⚠️ **Timeouts** de Lambda
- ⚠️ **Erros de validação** críticos

### 4.2.5. Amazon EventBridge (Scheduler)

**Função**: Orquestração de tarefas agendadas (ProcessData e RefreshToken).

#### Regras Configuradas

##### Processamento de Dados

```javascript
{
  "Name": "connect-process-responsys-client-abc",
  "Description": "Processa dados do cliente ABC a cada 15 min",
  "ScheduleExpression": "rate(15 minutes)",
  "State": "ENABLED",
  "Targets": [
    {
      "Arn": "arn:aws:lambda:us-east-1:ACCOUNT_ID:function:connect-responsys-client-abc-process",
      "Id": "1"
    }
  ]
}
```

##### Atualização de Tokens

```javascript
{
  "Name": "connect-refresh-token-responsys",
  "Description": "Atualiza tokens Responsys a cada 4 horas",
  "ScheduleExpression": "rate(4 hours)",
  "State": "ENABLED",
  "Targets": [
    {
      "Arn": "arn:aws:lambda:us-east-1:ACCOUNT_ID:function:connect-responsys-refresh-token",
      "Id": "1"
    }
  ]
}
```

#### Expressões de Agendamento

| Expressão | Descrição | Uso |
|-----------|-----------|-----|
| `rate(15 minutes)` | A cada 15 minutos | ProcessData |
| `rate(30 minutes)` | A cada 30 minutos | ProcessData (volume menor) |
| `rate(4 hours)` | A cada 4 horas | RefreshToken |
| `cron(0 */2 * * ? *)` | A cada 2 horas (cron) | RefreshToken |

### 4.2.6. AWS WAF (Web Application Firewall)

**Função**: Proteção do API Gateway contra ataques web comuns e controle de tráfego.

#### Regras Configuradas

```javascript
{
  "Name": "connect-waf-rules",
  "Rules": [
    {
      "Name": "AWSManagedRulesCommonRuleSet",
      "Priority": 1,
      "Statement": {
        "ManagedRuleGroupStatement": {
          "VendorName": "AWS",
          "Name": "AWSManagedRulesCommonRuleSet"
        }
      }
    },
    {
      "Name": "RateLimitRule",
      "Priority": 2,
      "Statement": {
        "RateBasedStatement": {
          "Limit": 2000,
          "AggregateKeyType": "IP"
        }
      }
    }
  ]
}
```

#### Proteções Ativas

- ✅ **SQL Injection** (SQLi)
- ✅ **Cross-Site Scripting** (XSS)
- ✅ **Rate Limiting** (2000 req/5min por IP)
- ✅ **Proteção contra bots** maliciosos
- ✅ **Geo-blocking** (se configurado)

### 4.2.7. AWS Secrets Manager

**Função**: Armazenamento seguro e gerenciamento de credenciais (login/senha) usadas pelas Lambdas de Atualização de Token.

#### Estrutura de Secrets

```javascript
{
  "Name": "/connect/responsys/client-abc/credentials",
  "Description": "Credenciais Responsys do cliente ABC",
  "SecretString": JSON.stringify({
    "username": "client-abc-api-user",
    "password": "super-secret-password",
    "endpoint": "https://login2.responsys.net/rest/api/v1.3"
  }),
  "KmsKeyId": "alias/aws/secretsmanager",  // Criptografia
  "RotationEnabled": false  // Rotação manual
}
```

#### Acesso na Lambda

```javascript
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getCredentials(secretName) {
  const response = await secretsManager.getSecretValue({
    SecretId: secretName
  }).promise();
  
  return JSON.parse(response.SecretString);
}

// Uso
const creds = await getCredentials('/connect/responsys/client-abc/credentials');
console.log(creds.username);  // Nunca loggar a senha!
```

#### Boas Práticas

- ✅ Criptografia habilitada (KMS)
- ✅ Rotação periódica de senhas
- ✅ Auditoria de acessos via CloudTrail
- ❌ Nunca logar credenciais
- ❌ Nunca armazenar em variáveis de ambiente

## 4.3. Diagrama de Infraestrutura

:::info Diagrama Original
<!-- TODO: Cole a imagem ou diagrama da infraestrutura AWS aqui -->

O diagrama deve mostrar:
- Google Tag Manager (origem)
- API Gateway + WAF
- Lambda Functions (3 tipos)
- DynamoDB (3 tabelas)
- EventBridge (agendamento)
- SNS (notificações)
- Secrets Manager (credenciais)
- CloudWatch (monitoramento)
- CRM APIs (destino)
:::

## 4.4. Acesso e Segurança

### 4.4.1. Acesso à Conta AWS

**Gerenciamento via IAM**:

- ✅ Usuários individuais (sem compartilhamento de credenciais)
- ✅ MFA obrigatório (Google Authenticator)
- ✅ Políticas baseadas em funções (roles)
- ✅ Auditoria via CloudTrail

**Exemplo de Política de Usuário**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:*",
        "dynamodb:*",
        "apigateway:*",
        "cloudwatch:*",
        "logs:*"
      ],
      "Resource": "*",
      "Condition": {
        "Bool": {
          "aws:MultiFactorAuthPresent": "true"
        }
      }
    }
  ]
}
```

### 4.4.2. Segurança em Nível de Serviço

#### API Gateway

- ✅ AWS WAF integrado
- ✅ HTTPS obrigatório
- ✅ Throttling por cliente
- ✅ Logs detalhados

#### Lambda

- ✅ Políticas IAM granulares
- ✅ Variáveis de ambiente criptografadas
- ✅ Código versionado (Git)
- ✅ Backup automático (backup.js)

#### DynamoDB

- ✅ Criptografia em repouso (KMS)
- ✅ Criptografia em trânsito (TLS)
- ✅ Controle de acesso via IAM
- ✅ Auditoria via CloudTrail

#### Secrets Manager

- ✅ Criptografia via KMS
- ✅ Rotação de secrets
- ✅ Controle de acesso granular
- ✅ Auditoria completa

### 4.4.3. Princípio do Menor Privilégio

Cada Lambda tem apenas as permissões necessárias:

```javascript
// Lambda ReceiveData - só precisa escrever no DynamoDB
{
  "Action": ["dynamodb:PutItem"],
  "Resource": "arn:aws:dynamodb:...:table/connect-navigation-data"
}

// Lambda ProcessData - precisa ler e deletar do DynamoDB
{
  "Action": ["dynamodb:Query", "dynamodb:DeleteItem"],
  "Resource": "arn:aws:dynamodb:...:table/connect-navigation-data"
}

// Lambda RefreshToken - precisa acessar Secrets Manager e DynamoDB
{
  "Action": ["secretsmanager:GetSecretValue", "dynamodb:PutItem"],
  "Resource": ["arn:aws:secretsmanager:...", "arn:aws:dynamodb:..."]
}
```

## 4.5. Monitoramento e Logs

### 4.5.1. Amazon CloudWatch

**Função**: Logs, métricas e monitoramento centralizado.

#### Logs

**Estrutura**:

```
/aws/lambda/
├─ connect-responsys-client-abc-receive
├─ connect-responsys-client-abc-process
├─ connect-responsys-refresh-token
├─ connect-salesforce-client-xyz-receive
└─ connect-rdstation-receive
```

**Exemplo de Log**:

```json
{
  "timestamp": "2026-01-28T10:30:45.123Z",
  "level": "INFO",
  "requestId": "abc123-def456-ghi789",
  "message": "Dados recebidos do GTM",
  "clientId": "client-abc",
  "eventType": "product_view",
  "productId": "PROD-12345"
}
```

#### Métricas

**Métricas de Lambda**:
- `Invocations`: Número de invocações
- `Errors`: Número de erros
- `Duration`: Tempo de execução
- `Throttles`: Invocações throttled
- `ConcurrentExecutions`: Execuções simultâneas

**Métricas de DynamoDB**:
- `ConsumedReadCapacityUnits`: Leituras consumidas
- `ConsumedWriteCapacityUnits`: Escritas consumidas
- `UserErrors`: Erros de usuário
- `SystemErrors`: Erros de sistema

**Métricas de API Gateway**:
- `Count`: Total de requests
- `4XXError`: Erros de cliente
- `5XXError`: Erros de servidor
- `Latency`: Latência total

#### Alarmes

**Exemplo: Alta Taxa de Erros**

```javascript
{
  "AlarmName": "connect-high-error-rate",
  "AlarmDescription": "Taxa de erro acima de 5% nas últimas 5 min",
  "MetricName": "Errors",
  "Namespace": "AWS/Lambda",
  "Statistic": "Average",
  "Period": 300,
  "EvaluationPeriods": 1,
  "Threshold": 5.0,
  "ComparisonOperator": "GreaterThanThreshold",
  "TreatMissingData": "notBreaching",
  "ActionsEnabled": true,
  "AlarmActions": [
    "arn:aws:sns:us-east-1:ACCOUNT_ID:connect-errors"
  ]
}
```

#### Dashboards

**Dashboard Customizado por Cliente**:

```javascript
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "title": "Invocações Lambda - Cliente ABC",
        "metrics": [
          ["AWS/Lambda", "Invocations", {"stat": "Sum"}]
        ],
        "period": 300,
        "region": "us-east-1"
      }
    },
    {
      "type": "metric",
      "properties": {
        "title": "Taxa de Erros",
        "metrics": [
          ["AWS/Lambda", "Errors", {"stat": "Sum"}]
        ],
        "period": 300
      }
    },
    {
      "type": "log",
      "properties": {
        "query": "fields @timestamp, @message | filter clientId = 'client-abc' | sort @timestamp desc",
        "region": "us-east-1",
        "logGroupName": "/aws/lambda/connect-responsys-client-abc-receive"
      }
    }
  ]
}
```

### 4.5.2. AWS CloudTrail

**Função**: Auditoria de ações na conta AWS.

**Eventos Rastreados**:
- Criação/modificação de Lambdas
- Acesso a Secrets Manager
- Modificações em políticas IAM
- Criação de regras EventBridge
- Acesso a DynamoDB (se habilitado)

## 4.6. Custos Estimados

### Estrutura de Custos

| Serviço | Modelo de Cobrança | Custo Estimado/Mês |
|---------|-------------------|-------------------|
| **Lambda** | Por invocação + duração | $50 - $200 |
| **DynamoDB** | On-demand (leituras/escritas) | $20 - $100 |
| **API Gateway** | Por requisição | $10 - $50 |
| **CloudWatch** | Logs armazenados + métricas | $5 - $20 |
| **EventBridge** | Por regra acionada | $1 - $5 |
| **Secrets Manager** | Por secret armazenado | $1 - $2 |
| **WAF** | Por regra + requisições | $10 - $30 |
| **SNS** | Por notificação | < $1 |
| **TOTAL** | - | **$97 - $408/mês** |

:::info Variação de Custos
Custos variam significativamente com o volume de tráfego e número de clientes. Para produção em larga escala, considere Reserved Capacity no DynamoDB e otimização de Lambdas.
:::

### Otimização de Custos

1. **Lambda**: Reduzir memória e timeout quando possível
2. **DynamoDB**: Usar TTL para deletar dados automaticamente
3. **CloudWatch**: Configurar retenção de logs (7-14 dias)
4. **API Gateway**: Usar caching quando aplicável
5. **Layers**: Compartilhar dependências entre Lambdas

## 4.7. Disaster Recovery e Backup

### Backup de Dados Críticos

| Componente | Estratégia de Backup | Retenção |
|------------|---------------------|----------|
| **DynamoDB (Tokens)** | Point-in-time recovery | 35 dias |
| **DynamoDB (Config)** | On-demand backups | 90 dias |
| **DynamoDB (Navegação)** | Não (dados transitórios) | N/A |
| **Código Lambda** | Versionamento Git | Permanente |
| **Secrets Manager** | Versionamento automático | Permanente |

### Plano de Recuperação

1. **Falha de Lambda**: Deploy da versão anterior (backup.js)
2. **Corrupção de DynamoDB**: Restore do backup mais recente
3. **Perda de Secrets**: Restaurar versão anterior do secret
4. **Falha Regional**: Não há multi-region (single region deployment)

:::warning Limitação Atual
O Connect não possui deployment multi-region. Em caso de falha regional da AWS, o serviço fica indisponível até a recuperação da região.
:::

## 4.8. Compliance e Governança

### LGPD/GDPR

- ✅ Dados pessoais criptografados em repouso e em trânsito
- ✅ TTL configurado para deletar dados automaticamente
- ✅ Auditoria completa de acessos via CloudTrail
- ⚠️ Sem opt-out automatizado (requer implementação)

### Políticas de Retenção

- **Logs CloudWatch**: 14 dias (padrão)
- **Dados de Navegação (DynamoDB)**: 24-48 horas (TTL)
- **Tokens (DynamoDB)**: Sem expiração (atualização contínua)
- **Configurações (DynamoDB)**: Sem expiração

### Auditoria

- **CloudTrail**: Todos os eventos de API
- **VPC Flow Logs**: Não aplicável (sem VPC)
- **CloudWatch Logs**: Todas as invocações de Lambda
- **Access Logs (API Gateway)**: Habilitados

