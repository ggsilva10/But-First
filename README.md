# But First - Gestor de Tarefas Premium

Um aplicativo de gerenciamento de tarefas, planos e treinos construído com **Vanilla JavaScript, HTML5 e CSS3 puro**, seguindo arquitetura profissional com estado centralizado.

## 🏗️ Arquitetura & Padrões

### Estrutura Modular

O projeto segue uma arquitetura clara separando responsabilidades:

```
src/
├── index.html          # Markup estruturado
├── css/
│   └── style.css       # Estilos premium com custom scrollbars
├── js/
│   ├── store.js        # Gerenciamento de dados & localStorage
│   ├── app-state.js    # Estado centralizado da aplicação
│   └── app.js          # Lógica de UI e renderização
└── vercel.json         # Configuração de deploy
```

### 1. **Store (`js/store.js`)**

Módulo **IIFE** responsável por:
- ✅ Inicializar dados mockados (escolas, tarefas, turmas, planos, treinos)
- ✅ Gerenciar persistência via `localStorage`
- ✅ Fornecer CRUD abstrato para todas as entidades
- ✅ Gerar estatísticas gerais

```javascript
// Exemplo de uso
const tasks = Store.getAll('tasks');
const newTask = Store.add('tasks', { title: 'Nova Tarefa', ... });
Store.update('tasks', taskId, { completed: true });
Store.remove('tasks', taskId);
```

**Vantagens:**
- Dados isolados do escopo principal
- Fácil mudar fonte (API REST, por exemplo)
- localStorage automático
- Sem estado global poluído

---

### 2. **AppState (`js/app-state.js`)**

Gerenciador de estado centralizado com padrão **Observer**:

```javascript
// Estado único da aplicação
const state = {
    activeTab: 'dashboard',
    activeSection: 'dashboard',
    viewMode: 'list',
    selectedDay: null,
    tasks: [],
    schools: [],
    // ... mais propriedades
}
```

**API Pública:**
- `AppState.getState()` - retorna cópia do estado
- `AppState.get(key)` - retorna valor específico
- `AppState.setState({...})` - atualiza múltiplas props
- `AppState.subscribe(callback)` - subscreve a mudanças
- `AppState.setActiveTab(tab)` - muda de aba
- `AppState.addTask(data)` - adiciona tarefa
- `AppState.toggleTaskComplete(id)` - marca como concluída

**Vantagens:**
- Single source of truth
- Previsível e debugável
- Reativo via observers
- Desacoplamento entre componentes

---

### 3. **App (`js/app.js`)**

Camada de apresentação que:
- Gerencia eventos do DOM
- Renderiza componentes baseado no estado
- Consome `AppState` e `Store`
- Mantém cache de elementos (`DOM`)

```javascript
// App consuma estado via:
const state = AppState.getState();
const tasks = AppState.get('tasks');

// Subscreve a mudanças:
AppState.subscribe((state, changedKey) => {
    if (changedKey === 'tasks') {
        renderTasks(state.tasks);
    }
});
```

---

## 🎨 CSS Polido & Profissional

### Features Implementadas:

#### 1. **Scrollbars Customizadas (Hidden)**
```css
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
    opacity: 0; /* Hidden por padrão */
}

::-webkit-scrollbar-thumb:hover {
    opacity: 1; /* Aparece ao hover */
}
```
✅ Mantém fluidez nativa do scroll
✅ Visual limpo e moderno
✅ Sem quebra de layout

#### 2. **Transições Suaves**

**Buttons - Hover Effect:**
```css
.btn--primary:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Cards - Elevation:**
```css
.card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-primary);
}
```

**Navigation Tabs - Smooth Active:**
```css
.nav-tab--active::after {
    animation: slideIn 250ms ease-out;
}
```

#### 3. **Animação de Seções Refinada**

Substituiu a antiga `@keyframes fi` por uma solução mais orgânica:

```css
.sec--active {
    animation: fadeInSmooth 350ms ease-out forwards;
}

@keyframes fadeInSmooth {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```
✅ Sem saltos bruscos
✅ Suave e profissional
✅ Easing otimizado
✅ Pequeno deslocamento vertical para impacto visual

---

## 🚀 Funcionalidades

### Dashboard
- 📊 Cards com estatísticas em tempo real
- 📈 Total de tarefas, concluídas, escolas e próximo treino

### Tarefas
- ✅ Criar, editar, remover tarefas
- 🏷️ Prioridade (high, medium, low)
- 📅 Data de vencimento
- ✔️ Marcar como concluída
- 🔍 Buscar e filtrar

### Escolas
- 🏫 CRUD de escolas
- 🌍 Cidade/localização
- 📚 Relacionamento com turmas

### Turmas
- 👥 Criar e gerenciar turmas
- 📊 Quantidade de alunos
- 🔗 Vinculadas a escolas

### Treinos
- 💪 Log de treinos
- ⏱️ Duração e data
- 🔥 Nível de intensidade (high, medium, low)

### Planos
- 📋 Criar planos de objetivos
- 📊 Barra de progresso visual
- 🎯 Status (planning, active, completed)

---

## 📁 Como Iniciar

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/but-first.git
cd but-first
```

### 2. Abra `src/index.html` no navegador
```bash
# Opção 1: Abrir diretamente
open src/index.html

# Opção 2: Com servidor local (Python)
python -m http.server 8000

# Opção 3: Com Node.js http-server
npx http-server src
```

### 3. Pronto! 🎉
A aplicação carregará com dados mockados no `localStorage`.

---

## 🔧 Desenvolvimento & Extensão

### Adicionar Nova Entidade

**1. Defina dados padrão em `store.js`:**
```javascript
const DEFAULT_CATEGORIES = [
    { id: 1, name: 'Trabalho', color: '#6366f1' },
];

// Adicione à inicialização
const KEYS = {
    // ...
    CATEGORIES: 'but_first_categories',
};
```

**2. Adicione métodos em `app.js`:**
```javascript
const renderCategories = (categories) => {
    DOM.categoriesList.innerHTML = categories
        .map(cat => createCategoryElement(cat))
        .join('');
};
```

**3. Subscreva em `AppState.subscribe()`:**
```javascript
case 'categories':
    renderCategories(state.categories);
    break;
```

---

## 📱 Responsivo

- ✅ Desktop (1400px+)
- ✅ Tablet (769px - 1024px)
- ✅ Mobile (até 480px)

Breakpoints:
- `@media (max-width: 768px)` - Tablet
- `@media (max-width: 480px)` - Mobile

---

## 🎯 Padrões de Design Utilizados

1. **IIFE** (Immediately Invoked Function Expression) - Para encapsulamento
2. **Module Pattern** - Separação de responsabilidades
3. **Observer/Pub-Sub** - Estado reativo
4. **Event Delegation** - Eficiência de listeners
5. **Semantic HTML** - Acessibilidade
6. **BEM CSS** - Nomenclatura consistente

---

## 🎨 CSS Variables & Customização

Altere cores, espaçamentos e transições facilmente:

```css
:root {
    --color-primary: #6366f1;
    --color-danger: #ef4444;
    --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
    --spacing-lg: 1.5rem;
}
```

---

## 📊 Estrutura de Dados

### Task
```javascript
{
    id: number,
    title: string,
    completed: boolean,
    dueDate: string (YYYY-MM-DD),
    priority: 'high' | 'medium' | 'low'
}
```

### School
```javascript
{
    id: number,
    name: string,
    city: string
}
```

### Class
```javascript
{
    id: number,
    name: string,
    schoolId: number,
    students: number
}
```

### Workout
```javascript
{
    id: number,
    name: string,
    date: string (YYYY-MM-DD),
    duration: number (minutos),
    intensity: 'high' | 'medium' | 'low'
}
```

### Plan
```javascript
{
    id: number,
    title: string,
    status: 'planning' | 'active' | 'completed',
    progress: number (0-100)
}
```

---

## 🚀 Deploy

### Vercel
```bash
vercel deploy
```

A configuração está em `vercel.json`:
```json
{
  "buildCommand": "echo 'Frontend estático'",
  "outputDirectory": "src"
}
```

### GitHub Pages
```bash
git push origin main
# Ativa em Settings > Pages > Deploy from branch (main/src)
```

---

## 🔒 Segurança & Performance

- ✅ XSS Prevention - `escapeHtml()` em renderizações
- ✅ LocalStorage apenas (sem backend sensível)
- ✅ CSS com vars reutilizáveis (menor bundle)
- ✅ Sem dependências externas (Vanilla JS puro)
- ✅ Scroll suave nativo (sem JS pesado)

---

## 📝 Licença

MIT License - Sinta-se livre para usar e modificar.

---

## 👨‍💻 Desenvolvido por

**Gustavo** - Senior Frontend Engineer

---

## 📧 Contato & Suporte

Para dúvidas ou sugestões, abra uma issue no repositório.

---

**Última atualização:** Maio 2026
**Versão:** 2.0 (Refactoring Completo)
