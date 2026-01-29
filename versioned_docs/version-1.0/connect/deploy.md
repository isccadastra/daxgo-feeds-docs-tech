# Processos de Deploy

## 3.1. Visão Geral

O DaxGO Connect utiliza um **processo de deploy manual** via AWS Console ou AWS CLI, sem pipeline de CI/CD formal atualmente.

### Características do Processo

- ✅ **Compactação manual** do código-fonte Node.js
- ✅ **Upload direto** para a função Lambda na AWS
- ✅ **Backup integrado** (versão anterior como `backup.js`)
- ✅ **Rollback simplificado** em caso de problemas
- ⚠️ **Sem CI/CD automatizado** (planejado para o futuro)

:::warning Atenção
Como o processo é manual, é fundamental seguir os procedimentos documentados para evitar problemas em produção.
:::

## 3.2. Pré-requisitos

Antes de realizar um deploy, certifique-se de ter:

- ✅ **Acesso à conta AWS** com permissões para gerenciar funções Lambda e camadas
- ✅ **Código-fonte** da versão a ser implantada, testado localmente
- ✅ **AWS CLI** instalado e configurado (opcional, mas recomendado)
- ✅ **Backup** da versão anterior (incluído como `backup.js` no pacote)
- ✅ **Documentação** das mudanças realizadas

### Permissões IAM Necessárias

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:UpdateFunctionCode",
        "lambda:UpdateFunctionConfiguration",
        "lambda:GetFunction",
        "lambda:PublishLayerVersion",
        "cloudwatch:PutMetricData",
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

## 3.3. Ambientes

### 3.3.1. Ambiente de Produção

O ambiente de produção contém as funções Lambda que atendem os clientes reais.

#### Estrutura

- **Função Lambda principal** por cliente/integração
- **Camadas (Layers)** compartilhadas para dependências
- **Variáveis de ambiente** configuradas por função
- **Políticas IAM** específicas por função

#### Passos Detalhados para Deploy em Produção

##### 1. Preparação do Código

```bash
# 1. Navegue até o diretório do projeto
cd /caminho/para/projeto-connect

# 2. Certifique-se de que o código está atualizado
git pull origin main

# 3. Instale dependências (se necessário)
npm install --production
```

##### 2. Criação do Backup

```bash
# Copie o arquivo principal como backup
cp index.js backup.js
```

:::tip Estratégia de Backup
O arquivo `backup.js` contém o código da versão anterior e é incluído no pacote de deploy. Em caso de problemas, basta renomeá-lo para `index.js` e fazer re-deploy.
:::

##### 3. Compactação do Pacote

```bash
# Compacte o código-fonte e backup em um arquivo .zip
zip -r function.zip index.js backup.js node_modules/ config/ lib/

# OU, se as dependências estão em uma Layer:
zip -r function.zip index.js backup.js config/ lib/
```

**O que incluir no .zip:**
- ✅ `index.js` (código principal atualizado)
- ✅ `backup.js` (código da versão anterior)
- ✅ Dependências pequenas não presentes em camadas
- ✅ Arquivos de configuração locais
- ❌ `node_modules/` se estiver em uma Layer
- ❌ Arquivos de teste
- ❌ `.git/`, `.gitignore`, `README.md`

##### 4. Upload via AWS Console

1. Acesse o **AWS Console** → **Lambda**
2. Selecione a função Lambda que será atualizada
3. Na aba **Code**, clique em **Upload from** → **.zip file**
4. Selecione o arquivo `function.zip` criado
5. Clique em **Save**
6. Aguarde a atualização ser concluída

##### 5. Upload via AWS CLI (alternativa)

```bash
# Atualize o código da função Lambda
aws lambda update-function-code \
  --function-name nome-da-funcao-lambda \
  --zip-file fileb://function.zip \
  --region us-east-1
```

##### 6. Verificações Pós-Deploy

Após o deploy, é fundamental verificar:

**a) Logs no CloudWatch**

```bash
# Via AWS CLI
aws logs tail /aws/lambda/nome-da-funcao --follow
```

Ou acesse **CloudWatch → Log groups** → `/aws/lambda/nome-da-funcao`

**b) Dashboard de Monitoramento**

- Acesse o dashboard específico do cliente no CloudWatch
- Verifique métricas de invocação, erros e duração
- Confirme que não há picos de erros

**c) Testes Funcionais**

```bash
# Teste via AWS CLI (se aplicável)
aws lambda invoke \
  --function-name nome-da-funcao-lambda \
  --payload '{"test": "data"}' \
  response.json

cat response.json
```

**d) Notificações SNS**

- Monitore e-mails de erro do SNS
- Verifique se não há alertas após o deploy

:::warning Janela de Atenção
Monitore o sistema por pelo menos 30 minutos após o deploy para garantir que não há problemas.
:::

### 3.3.2. Ambiente de Desenvolvimento/Testes

Para testar mudanças antes de produção, é recomendado criar um ambiente isolado.

#### Criação do Ambiente de Teste

##### 1. Duplicação da Lambda de Produção

```bash
# Via AWS CLI
aws lambda create-function \
  --function-name nome-da-funcao-lambda-DEV \
  --runtime nodejs20.x \
  --role arn:aws:iam::account-id:role/lambda-role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --memory-size 512
```

##### 2. Configuração do API Gateway de Teste

Se necessário, crie um novo endpoint ou stage no API Gateway:

1. Acesse **API Gateway** no AWS Console
2. Selecione a API existente
3. Crie um novo **Stage** (ex: `dev`, `staging`)
4. Associe o stage à Lambda de teste
5. Anote a URL do novo endpoint

##### 3. Ajuste de Variáveis de Ambiente

Configure variáveis específicas para teste:

```bash
aws lambda update-function-configuration \
  --function-name nome-da-funcao-lambda-DEV \
  --environment Variables="{
    DYNAMODB_TABLE=connect-data-dev,
    SNS_TOPIC_ARN=arn:aws:sns:us-east-1:account-id:connect-errors-dev,
    ENVIRONMENT=development
  }"
```

##### 4. Deploy no Ambiente de Teste

Mesmo processo de compactação e upload descrito para produção, mas direcionado à função Lambda de teste.

## 3.4. Gerenciamento de Código e Versionamento

### Estratégia de Backup

O DaxGO Connect utiliza uma estratégia simples mas eficaz:

**backup.js no pacote de deploy**

```
function.zip
├── index.js         ← Versão NOVA (atual)
├── backup.js        ← Versão ANTERIOR (backup)
├── config/
└── lib/
```

**Vantagens:**
- ✅ Rollback rápido (renomear arquivo e re-deploy)
- ✅ Não depende de sistemas externos
- ✅ Backup sempre disponível junto com a função

### Processo de Rollback

Em caso de problemas com a nova versão:

#### Opção 1: Rollback via Backup Interno

```bash
# 1. Renomeie o backup como arquivo principal
mv backup.js index.js

# 2. Recompacte
zip -r function-rollback.zip index.js config/ lib/

# 3. Faça upload da versão antiga
aws lambda update-function-code \
  --function-name nome-da-funcao-lambda \
  --zip-file fileb://function-rollback.zip
```

#### Opção 2: Rollback via Versões do Lambda

AWS Lambda mantém versões anteriores:

```bash
# Liste versões
aws lambda list-versions-by-function \
  --function-name nome-da-funcao-lambda

# Crie um alias apontando para versão anterior
aws lambda update-alias \
  --function-name nome-da-funcao-lambda \
  --name PROD \
  --function-version 5  # versão anterior
```

### Versionamento Git (Recomendado)

Embora o deploy seja manual, o código deve ser versionado:

```bash
# Commit da nova versão
git add .
git commit -m "feat: implementa nova integração Salesforce"
git push origin main

# Tag de versão
git tag -a v1.2.3 -m "Deploy em produção - 2026-01-28"
git push origin v1.2.3
```

## 3.5. Dependências

### Gerenciamento via Camadas (Layers)

Dependências grandes ou compartilhadas são gerenciadas via **Lambda Layers**:

#### Criação de uma Layer

```bash
# 1. Instale dependências
mkdir nodejs
cd nodejs
npm install axios aws-sdk moment

# 2. Compacte (estrutura específica)
cd ..
zip -r layer.zip nodejs/

# 3. Publique a Layer
aws lambda publish-layer-version \
  --layer-name connect-dependencies \
  --description "Dependências compartilhadas do Connect" \
  --zip-file fileb://layer.zip \
  --compatible-runtimes nodejs18.x nodejs20.x nodejs22.x
```

#### Associação de uma Layer à Lambda

```bash
aws lambda update-function-configuration \
  --function-name nome-da-funcao-lambda \
  --layers arn:aws:lambda:us-east-1:account-id:layer:connect-dependencies:1
```

### Dependências no Pacote

Dependências menores podem ser incluídas diretamente no .zip:

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "uuid": "^9.0.0"
  }
}
```

```bash
npm install --production
zip -r function.zip index.js backup.js node_modules/
```

## 3.6. Variáveis de Ambiente

As variáveis de ambiente são configuradas diretamente na função Lambda e armazenam configurações essenciais.

### Variáveis Comuns

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DYNAMODB_TABLE_DATA` | Tabela de dados de navegação | `connect-navigation-data` |
| `DYNAMODB_TABLE_TOKENS` | Tabela de tokens de API | `connect-api-tokens` |
| `DYNAMODB_TABLE_CONFIG` | Tabela de configurações | `connect-client-config` |
| `SNS_TOPIC_ARN` | ARN do tópico SNS para erros | `arn:aws:sns:...` |
| `ENVIRONMENT` | Ambiente de execução | `production`, `development` |
| `API_TIMEOUT` | Timeout para chamadas externas | `30000` (ms) |

### Configuração via AWS Console

1. Acesse **Lambda** → Selecione a função
2. Vá em **Configuration** → **Environment variables**
3. Clique em **Edit**
4. Adicione ou modifique variáveis
5. Clique em **Save**

### Configuração via AWS CLI

```bash
aws lambda update-function-configuration \
  --function-name nome-da-funcao-lambda \
  --environment Variables="{
    DYNAMODB_TABLE_DATA=connect-navigation-data,
    DYNAMODB_TABLE_TOKENS=connect-api-tokens,
    SNS_TOPIC_ARN=arn:aws:sns:us-east-1:123456789:connect-errors,
    ENVIRONMENT=production
  }"
```

:::warning Credenciais Sensíveis
**NUNCA** armazene credenciais (senhas, API keys) em variáveis de ambiente. Use o **AWS Secrets Manager** para isso.
:::

### Exemplo de Uso no Código

```javascript
// index.js
const TABLE_DATA = process.env.DYNAMODB_TABLE_DATA;
const TABLE_TOKENS = process.env.DYNAMODB_TABLE_TOKENS;
const SNS_TOPIC = process.env.SNS_TOPIC_ARN;
const ENVIRONMENT = process.env.ENVIRONMENT || 'production';

exports.handler = async (event) => {
  console.log(`Running in ${ENVIRONMENT} environment`);
  
  // Usar variáveis no código
  const dataTable = TABLE_DATA;
  // ...
};
```

## 3.7. Checklist de Deploy

Use este checklist para garantir um deploy seguro:

### Antes do Deploy

- [ ] Código testado localmente
- [ ] Dependências atualizadas (se necessário)
- [ ] Backup criado (`backup.js`)
- [ ] Variáveis de ambiente revisadas
- [ ] Documentação atualizada
- [ ] Git commit realizado (com mensagem descritiva)
- [ ] Tag de versão criada
- [ ] Equipe notificada sobre o deploy

### Durante o Deploy

- [ ] Pacote .zip criado corretamente
- [ ] Upload realizado na função correta
- [ ] Confirmação de sucesso no console

### Após o Deploy

- [ ] Logs do CloudWatch verificados (primeiros 5 min)
- [ ] Dashboard de monitoramento verificado
- [ ] Teste funcional realizado (se aplicável)
- [ ] Notificações SNS monitoradas
- [ ] Monitoramento estendido (30 min)
- [ ] Documentação de deploy registrada

### Em Caso de Problema

- [ ] Logs analisados para identificar erro
- [ ] Decisão: fix forward ou rollback?
- [ ] Se rollback: backup.js ativado
- [ ] Incidente documentado
- [ ] Post-mortem agendado

## 3.8. Boas Práticas

### 1. Sempre Teste Localmente Primeiro

```bash
# Use ferramentas como sam local ou lambda-local
npm install -g lambda-local

lambda-local -l index.js -h handler -e event.json
```

### 2. Mantenha Logs Detalhados

```javascript
console.log('[INFO] Iniciando processamento', { clientId, timestamp });
console.error('[ERROR] Falha ao enviar dados', { error, clientId });
```

### 3. Use Versionamento Semântico

- **MAJOR**: Mudanças incompatíveis (breaking changes)
- **MINOR**: Novas funcionalidades compatíveis
- **PATCH**: Correções de bugs

Exemplo: `v1.2.3` → `v1.3.0` (nova feature)

### 4. Documente Cada Deploy

Mantenha um log de deploys:

```markdown
## 2026-01-28 - v1.3.0
- **Função**: connect-responsys-client-abc
- **Mudanças**: Adicionado suporte para eventos de carrinho abandonado
- **Responsável**: João Silva
- **Rollback**: Não foi necessário
```

### 5. Monitore Proativamente

Configure alarmes no CloudWatch:

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name connect-high-error-rate \
  --alarm-description "Taxa de erro acima de 5%" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Average \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold
```

## 3.9. Troubleshooting de Deploy

### Problema: "Code size exceeds limit"

**Solução:**
```bash
# Mova dependências para uma Layer
# Remova node_modules do .zip principal
zip -r function.zip index.js backup.js config/ lib/ -x "node_modules/*"
```

### Problema: "Function is still processing previous update"

**Solução:**
```bash
# Aguarde alguns segundos e tente novamente
sleep 10
aws lambda update-function-code --function-name nome-funcao --zip-file fileb://function.zip
```

### Problema: Função retorna erro após deploy

**Solução:**
1. Verifique logs no CloudWatch
2. Confirme variáveis de ambiente
3. Teste localmente com mesmo payload
4. Se necessário, faça rollback

### Problema: Permissões IAM insuficientes

**Solução:**
```bash
# Verifique a role da Lambda
aws lambda get-function-configuration --function-name nome-funcao | grep Role

# Atualize políticas IAM se necessário
```

