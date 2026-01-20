import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Arquitetura',
      items: ['arquitetura/visao-geral'],
    },
    {
      type: 'category',
      label: 'Backend (Yii2)',
      items: [
        'backend/estrutura-yii2',
        'backend/modelos-dados',
        'backend/processamento-feeds',
        'backend/api-endpoints',
      ],
    },
    {
      type: 'category',
      label: 'Infra & Ambiente',
      items: [
        'infra/ambiente-local',
        'infra/s3-minio',
        'infra/dynamodb',
        'infra/lambda-functions',
        'infra/variaveis-ambiente',
      ],
    },
    {
      type: 'category',
      label: 'Integrações',
      items: [
        'integ/google-merchant',
        'integ/google-merchant-promotions',
        'integ/tiktok',
      ],
    },
    {
      type: 'category',
      label: 'Front-end',
      items: [
        'frontend/customizar-feeds',
        'frontend/padroes-ui',
      ],
    },
    {
      type: 'category',
      label: 'Features',
      items: [
        'features/catalogo-inteligente',
        'features/analytics',
        'features/product-studio',
      ],
    },
    {
      type: 'category',
      label: 'Runbooks',
      items: [
        'runbooks/xdebug',
        'runbooks/s3-troubleshooting',
      ],
    },
  ],
};

export default sidebars;
