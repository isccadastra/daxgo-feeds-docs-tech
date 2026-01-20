---
title: Padrões de UI/UX
---

# Padrões de UI/UX • Daxgo Feeds

Guia de padronização visual aplicado nas telas do sistema, com foco em consistência e redução de poluição visual.

## Objetivo da padronização

- Reduzir poluição visual causada por múltiplas cores de botões
- Criar hierarquia visual clara e consistente
- Facilitar manutenção e evolução do sistema
- Melhorar experiência do usuário

## Telas padronizadas

- **Otimização de Feeds** (Vue.js)
- **Promotions** (PHP/Yii2)
- **Feeds** (PHP/Yii2)

## Paleta de cores

### Cores principais

| Cor | Código Hex | Uso | Classe Bootstrap |
|-----|------------|-----|------------------|
| **Azul Daxgo (Primary)** | `#007bff` | Ações principais e secundárias | `btn-primary`, `text-primary` |
| **Verde (Success)** | `#28a745` | Ações específicas importantes (Publicar, Sincronizar) | `btn-success`, `text-success` |
| **Vermelho (Danger)** | `#dc3545` | Ações destrutivas (Excluir, Deletar) | `btn-danger`, `text-danger` |
| **Cinza (Secondary)** | `#6c757d` | Ações neutras (Cancelar) | `btn-secondary`, `text-secondary` |
| **Amarelo (Warning)** | `#ffc107` | Alertas e avisos | `text-warning` |
| **Azul Claro (Info)** | `#17a2b8` | Informações | `text-info` |

### Cores de texto

| Elemento | Código Hex | Uso | Classe |
|----------|------------|-----|--------|
| **Texto Principal** | `#1a1a1a` | Números, valores, títulos | `text-gray-800` |
| **Texto Secundário** | `#8e8e93` | Labels, descrições | `text-gray-400` |
| **Fundo Cards** | `#ffffff` | Background dos cards | `background-color: #ffffff` |

## Hierarquia de botões

### 1. Botões Primários (`btn-primary`)

**Uso:** Ações principais e secundárias (mais comuns)

**Exemplos:**
- Adicionar Coluna
- Gerenciar Colunas
- Filtrar
- Nova Promoção
- Editar
- Salvar
- Aplicar
- Exportar CSV/PDF

**Código:**
```html
<button type="button" class="btn btn-primary">
    <i class="fa fa-plus"></i> Adicionar
</button>
```

### 2. Botões de Sucesso (`btn-success`)

**Uso:** Ações específicas importantes (uso limitado)

**Exemplos:**
- Publicar Feed
- Sincronizar com Google

**Código:**
```html
<button type="button" class="btn btn-success">
    <i class="fa fa-check"></i> Publicar
</button>
```

### 3. Botões de Perigo (`btn-danger`)

**Uso:** Ações destrutivas e críticas

**Exemplos:**
- Excluir
- Deletar
- Remover

**Código:**
```html
<button type="button" class="btn btn-danger">
    <i class="fa fa-trash"></i> Excluir
</button>
```

### 4. Botões Secundários (`btn-secondary`)

**Uso:** Ações neutras e de cancelamento

**Exemplos:**
- Cancelar
- Voltar
- Fechar

**Código:**
```html
<button type="button" class="btn btn-secondary">
    <i class="fa fa-times"></i> Cancelar
</button>
```

### Tamanhos

| Classe | Uso |
|--------|-----|
| `btn-sm` | Botões pequenos (modais, painéis laterais) |
| `btn` | Tamanho padrão |
| `h-40px` | Altura fixa de 40px (botões do header) |

## Cards de estatísticas

### Estrutura padrão

```html
<div class="col-md col-sm-6 mb-3">
    <div class="card h-100" style="background-color: #ffffff;">
        <div class="card-body d-flex justify-content-between align-items-center flex-column p-4">
            <div class="d-flex my-4 w-100">
                <div class="me-5">
                    <i class="[ícone] text-[cor]" style="font-size: 3.5rem;"></i>
                </div>
                <div>
                    <span class="fw-semibold fs-2x text-gray-800 lh-1 ls-n2">[Valor]</span>
                    <div class="m-0">
                        <span class="fw-semibold fs-6 text-gray-400">[Label]</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
```

### Características

- **Background:** Branco puro (`#ffffff`)
- **Sem cores sólidas no fundo**
- **Ícone à esquerda:** Grande (3.5rem) e colorido
- **Número:** Grande (`fs-2x`) em cinza escuro (`text-gray-800`)
- **Label:** Menor (`fs-6`) em cinza claro (`text-gray-400`)
- **Altura uniforme:** `h-100` para todos os cards na mesma linha

### Exemplo Vue.js

```vue
<div class="card h-100" style="background-color: #ffffff;">
    <div class="card-body d-flex justify-content-between align-items-center flex-column p-4">
        <div class="d-flex my-4 w-100">
            <div class="me-5">
                <i class="fa fa-cubes text-primary" style="font-size: 3.5rem;"></i>
            </div>
            <div>
                <span class="fw-semibold fs-2x text-gray-800 lh-1 ls-n2">{{ totalProdutos }}</span>
                <div class="m-0">
                    <span class="fw-semibold fs-6 text-gray-400">Total de Produtos</span>
                </div>
            </div>
        </div>
    </div>
</div>
```

### Exemplo PHP/Yii2

```php
<div class="card h-100">
    <div class="card-body d-flex justify-content-between align-items-center flex-column p-4">
        <div class="d-flex my-4 w-100">
            <div class="me-5">
                <i class="ki-duotone ki-chart-simple fs-3tx text-primary">
                    <span class="path1"></span>
                    <span class="path2"></span>
                    <span class="path3"></span>
                    <span class="path4"></span>
                </i>
            </div>
            <div>
                <span class="fw-semibold fs-2x text-gray-800 lh-1 ls-n2"><?= $stats['total'] ?? 0 ?></span>
                <div class="m-0">
                    <span class="fw-semibold fs-6 text-gray-400">Total de Promoções</span>
                </div>
            </div>
        </div>
    </div>
</div>
```

## Ícones

### Font Awesome 4.5.0

Usado principalmente na **Tela de Otimização de Feeds (Vue.js)**

| Uso | Ícone | Classe | Cor |
|-----|-------|--------|-----|
| Total de Produtos | Cubos | `fa fa-cubes` | `text-primary` |
| Regras Aplicadas | Engrenagens | `fa fa-cogs` | `text-success` |
| Filtros Ativos | Filtro | `fa fa-filter` | `text-info` |
| Taxa de Otimização | Gráfico Pizza | `fa fa-pie-chart` | `text-warning` |

**Tamanho padrão:** `font-size: 3.5rem;`

### Keenicons (ki-duotone)

Usado principalmente nas **Telas de Promotions e PHP**

| Uso | Ícone | Classe | Cor |
|-----|-------|--------|-----|
| Total de Promoções | Gráfico Simples | `ki-duotone ki-chart-simple` | `text-primary` |
| Promoções Ativas | Check Circle | `ki-duotone ki-check-circle` | `text-success` |
| Sincronizadas | Setas Circulares | `ki-duotone ki-arrows-circle` | `text-info` |
| Com Erro | Informação | `ki-duotone ki-information-5` | `text-warning` |
| Encerradas | Stop Circle | `ki-duotone ki-stop-circle` | `text-danger` |

**Tamanho padrão:** `fs-3tx`

**Estrutura dos ícones duotone:**
```html
<i class="ki-duotone ki-[nome-icone] fs-3tx text-[cor]">
    <span class="path1"></span>
    <span class="path2"></span>
    <!-- Adicionar mais paths conforme necessário -->
</i>
```

### Ícones em botões

| Contexto | Tamanho | Espaçamento |
|----------|---------|-------------|
| Botões normais | `fs-2` ou padrão | `me-2` (margin-end) |
| Botões pequenos | padrão | `me-1` ou `me-2` |
| Botões grandes | `fs-2` | `me-2` |

## Alterações por tela

### Tela de Otimização de Feeds

**Arquivo:** `feeds-front-vue/src/App.vue`

**Botões do Toolbar:**
- Adicionar Coluna: `btn-info` → `btn-primary`
- Gerenciar Colunas: `btn-success` → `btn-primary`
- Filtros: `btn-warning` → `btn-primary`
- Gerenciar Regras: Mantido `btn-primary`
- **Publicar:** Mantido `btn-success` (ação crítica)

**Painéis Laterais:**
- Mostrar/Ocultar Todas: `btn-success/warning` → `btn-primary`
- Ativar/Desativar Regras: `btn-success/warning` → `btn-primary`
- Adicionar Condição: `btn-warning` → `btn-primary`
- Nova Regra/Coluna/Filtro: `btn-success` → `btn-primary`

**Cards de Estatísticas:**
- Removida classe `dashboard-stats` com estilos CSS
- Cards com fundo branco: `background-color: #ffffff`
- Ícones Font Awesome 4.5.0 com `font-size: 3.5rem`

### Tela de Promotions

**Arquivo:** `feeds-upgrade/views/promotion/index.php`

**Botões do Header:**
- Nova Promoção: `btn-info` → `btn-primary`
- Sincronizar: Mantido `btn-success` (ação específica)
- Excluir: Mantido `btn-danger` (ação crítica)

**Botões de Exportação:**
- Exportar CSV: `btn-success` → `btn-primary`
- Exportar PDF: `btn-danger` → `btn-primary`

### Formulário de Promotions

**Arquivo:** `feeds-upgrade/views/promotion/form-add-edit.php`

- Botão Salvar: `btn-light-success` → `btn-primary`
- Botão Cancelar: `btn-light-danger` → `btn-secondary`

## Regras de aplicação

### ✅ FAZER

1. Use `btn-primary` para a maioria das ações (adicionar, editar, salvar, filtrar, exportar)
2. Use `btn-success` APENAS para ações específicas muito importantes (publicar, sincronizar)
3. Use `btn-danger` APENAS para ações destrutivas (excluir, deletar, remover)
4. Use `btn-secondary` para ações neutras (cancelar, voltar)
5. Mantenha cards com fundo branco sem cores sólidas
6. Posicione ícones à esquerda nos cards de estatísticas
7. Use tamanho consistente para ícones: `3.5rem` ou `fs-3tx`
8. Mantenha hierarquia visual clara

### ❌ NÃO FAZER

1. Não use múltiplas cores de botões na mesma tela sem necessidade
2. Não use cores sólidas no background dos cards (evitar `bg-primary`, `bg-success`, etc.)
3. Não use `btn-warning` ou `btn-info` para botões principais
4. Não misture estilos de ícones diferentes na mesma seção
5. Não crie novos padrões de cores sem documentar
6. Não use texto branco em cards com fundo colorido

## Checklist de padronização

Ao criar ou modificar uma tela, verifique:

- [ ] Todos os botões secundários usam `btn-primary`
- [ ] Apenas ações específicas importantes usam `btn-success`
- [ ] Apenas ações destrutivas usam `btn-danger`
- [ ] Botões de cancelar usam `btn-secondary`
- [ ] Cards de estatísticas têm fundo branco
- [ ] Ícones dos cards têm tamanho de 3.5rem ou fs-3tx
- [ ] Ícones estão à esquerda nos cards
- [ ] Números usam `text-gray-800` e labels usam `text-gray-400`
- [ ] Não há poluição visual por excesso de cores
- [ ] Interface está limpa e profissional

## Classes auxiliares

```css
.fs-7          /* Tamanho de fonte 7 */
.fw-bold       /* Peso de fonte bold */
.fw-semibold   /* Peso de fonte semibold */
.me-2          /* Margin-end de 2 (espaçamento do ícone) */
.gap-2         /* Gap de 2 entre elementos flex */
.h-40px        /* Altura fixa de 40px */
.text-gray-800 /* Texto principal */
.text-gray-400 /* Texto secundário */
```

## Referência completa

Para o guia completo com todos os exemplos de código, consulte:
- [`DOCUMENTACAO_TECNICA_PADRONIZACAO_UI.md`](../../feeds-upgrade/DOCUMENTACAO_TECNICA_PADRONIZACAO_UI.md)


