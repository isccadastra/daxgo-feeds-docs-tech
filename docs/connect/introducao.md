# Introdução ao DaxGO Connect

## 1.1. O que é o Connect?

O **DaxGO Connect** é uma solução serverless especializada em captar dados de fluxo de navegação de sites de clientes e enviá-los para ferramentas externas de marketing e CRM.

### Características Principais

- **Função**: Captar dados de fluxo de navegação de sites de clientes e enviá-los para ferramentas externas
- **Arquitetura**: 100% serverless na AWS com Node.js
- **Integração de Dados**: Google Tag Manager (GTM) como origem dos dados
- **Ferramentas Suportadas**: 
  - Oracle Responsys
  - RD Station
  - Salesforce
  - Flexibilidade para adicionar outras ferramentas

:::info Diferença entre Feeds e Connect
Enquanto o **DaxGO Feeds** foca em otimização e gestão de feeds de produtos para e-commerce, o **DaxGO Connect** concentra-se em captura e integração de dados comportamentais de navegação para ferramentas de marketing e CRM.
:::

## 1.2. Objetivos desta Documentação

Esta documentação foi criada para:

- ✅ Facilitar o desenvolvimento de novas funcionalidades e integrações
- ✅ Prover um entendimento claro dos processos de deploy e da infraestrutura
- ✅ Servir como guia para troubleshooting e manutenção
- ✅ Documentar padrões e boas práticas de desenvolvimento

## 1.3. Público-Alvo

Esta documentação é direcionada para:

- **Desenvolvedores**: Responsáveis pela manutenção e evolução do Connect
- **Equipes Técnicas de Clientes**: Que precisam entender o fluxo de dados (em alto nível)
- **DevOps/SRE**: Para operação, monitoramento e troubleshooting
- **Arquitetos**: Que precisam de visão técnica sobre o funcionamento do sistema

## 1.4. Casos de Uso

O DaxGO Connect é utilizado para:

1. **Rastreamento de Comportamento**: Captura de eventos de navegação (visualização de produtos, cliques, adições ao carrinho)
2. **Enriquecimento de CRM**: Envio de dados comportamentais para ferramentas de marketing automation
3. **Personalização de Campanhas**: Alimentação de plataformas de e-mail marketing com dados contextuais
4. **Analytics Avançado**: Integração de dados de navegação com plataformas de análise e segmentação

## 1.5. Próximos Passos

Para começar a trabalhar com o DaxGO Connect, recomendamos seguir esta ordem:

1. 📐 [**Arquitetura**](./arquitetura.md) - Entenda a estrutura e componentes do sistema
2. 🏗️ [**Infraestrutura**](./infraestrutura.md) - Conheça os recursos AWS utilizados
3. 🚀 [**Deploy**](./deploy.md) - Aprenda como fazer deploy de novas versões
4. ⚙️ [**Funcionalidades**](./funcionalidades.md) - Explore as integrações disponíveis

