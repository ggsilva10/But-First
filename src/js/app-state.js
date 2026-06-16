/**
 * AppState - Gerenciador de estado centralizado
 * Mantém um único ponto de verdade para o estado da aplicação
 * Todos os componentes consomem e atualizam através deste objeto
 */

const AppState = (() => {
    // Estado privado
    const state = {
        // Tab/seção ativa
        activeTab: 'dashboard',
        activeSection: 'dashboard',

        // Modo de visualização (ex: list, grid, cv, etc)
        viewMode: 'list',

        // Seleções do usuário
        selectedDay: null,
        selectedSchoolId: null,
        selectedClassId: null,
        selectedTaskId: null,

        // Filtros e buscas
        searchQuery: '',
        filterPriority: null,
        filterStatus: null,

        // Estados de UI
        isModalOpen: false,
        modalType: null,
        isSidebarOpen: false,
        isLoading: false,

        // Dados em memória (derivados do Store)
        tasks: [],
        schools: [],
        classes: [],
        workouts: [],
        plans: [],
        stats: {},
    };

    // Listeners para mudanças de estado
    const subscribers = [];

    /**
     * Notifica todos os subscribers sobre uma mudança
     */
    const notify = (changedKey) => {
        subscribers.forEach(callback => callback(state, changedKey));
    };

    /**
     * Se inscreve para receber notificações de mudanças
     */
    const subscribe = (callback) => {
        subscribers.push(callback);
        return () => {
            const index = subscribers.indexOf(callback);
            if (index > -1) subscribers.splice(index, 1);
        };
    };

    /**
     * Atualiza uma ou mais propriedades do estado
     */
    const setState = (newState) => {
        const changedKeys = Object.keys(newState);
        Object.assign(state, newState);
        changedKeys.forEach(key => notify(key));
    };

    /**
     * Obtém o estado completo (read-only)
     */
    const getState = () => ({ ...state });

    /**
     * Obtém uma propriedade específica do estado
     */
    const get = (key) => state[key];

    /**
     * Carrega dados do Store para o estado
     */
    const loadData = () => {
        setState({
            tasks: Store.getAll('tasks'),
            schools: Store.getAll('schools'),
            classes: Store.getAll('classes'),
            workouts: Store.getAll('workouts'),
            plans: Store.getAll('plans'),
            stats: Store.getStats(),
        });
    };

    /**
     * Muda para uma aba específica
     */
    const setActiveTab = (tab) => {
        setState({
            activeTab: tab,
            activeSection: tab,
        });
    };

    /**
     * Muda o modo de visualização
     */
    const setViewMode = (mode) => {
        setState({ viewMode: mode });
    };

    /**
     * Define o dia selecionado
     */
    const setSelectedDay = (day) => {
        setState({ selectedDay: day });
    };

    /**
     * Define a escola selecionada
     */
    const setSelectedSchool = (schoolId) => {
        setState({ selectedSchoolId: schoolId });
    };

    /**
     * Define a turma selecionada
     */
    const setSelectedClass = (classId) => {
        setState({ selectedClassId: classId });
    };

    /**
     * Define a tarefa selecionada
     */
    const setSelectedTask = (taskId) => {
        setState({ selectedTaskId: taskId });
    };

    /**
     * Atualiza filtros de busca
     */
    const setFilters = (filters) => {
        setState(filters);
    };

    /**
     * Abre modal
     */
    const openModal = (type) => {
        setState({
            isModalOpen: true,
            modalType: type,
        });
    };

    /**
     * Fecha modal
     */
    const closeModal = () => {
        setState({
            isModalOpen: false,
            modalType: null,
        });
    };

    /**
     * Alterna visibilidade da sidebar
     */
    const toggleSidebar = () => {
        setState({ isSidebarOpen: !state.isSidebarOpen });
    };

    /**
     * Define estado de carregamento
     */
    const setLoading = (isLoading) => {
        setState({ isLoading });
    };

    /**
     * Adiciona tarefa e atualiza estado
     */
    const addTask = (taskData) => {
        const newTask = Store.add('tasks', taskData);
        setState({
            tasks: Store.getAll('tasks'),
            stats: Store.getStats(),
        });
        return newTask;
    };

    /**
     * Atualiza tarefa e refresha estado
     */
    const updateTask = (taskId, taskData) => {
        const updated = Store.update('tasks', taskId, taskData);
        setState({
            tasks: Store.getAll('tasks'),
            stats: Store.getStats(),
        });
        return updated;
    };

    /**
     * Remove tarefa e refresha estado
     */
    const deleteTask = (taskId) => {
        Store.remove('tasks', taskId);
        setState({
            tasks: Store.getAll('tasks'),
            stats: Store.getStats(),
        });
    };

    /**
     * Alterna status concluído de uma tarefa
     */
    const toggleTaskComplete = (taskId) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
            updateTask(taskId, { completed: !task.completed });
        }
    };

    /**
     * Método genérico para adicionar entidade
     */
    const addEntity = (entity, data) => {
        const newItem = Store.add(entity, data);
        loadData();
        return newItem;
    };

    /**
     * Método genérico para atualizar entidade
     */
    const updateEntity = (entity, id, data) => {
        const updated = Store.update(entity, id, data);
        loadData();
        return updated;
    };

    /**
     * Método genérico para remover entidade
     */
    const deleteEntity = (entity, id) => {
        Store.remove(entity, id);
        loadData();
    };

    // Carrega dados iniciais
    loadData();

    // Public API
    return {
        // State accessors
        getState,
        get,
        subscribe,

        // State setters
        setState,
        setActiveTab,
        setViewMode,
        setSelectedDay,
        setSelectedSchool,
        setSelectedClass,
        setSelectedTask,
        setFilters,

        // Modal controls
        openModal,
        closeModal,

        // UI controls
        toggleSidebar,
        setLoading,

        // Data operations
        loadData,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        addEntity,
        updateEntity,
        deleteEntity,
    };
})();
