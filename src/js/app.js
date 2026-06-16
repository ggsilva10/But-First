/**
 * App - Aplicação principal
 * Responsável por:
 * - Inicialização e setup
 * - Gerenciamento de estado via Supabase
 * - Renderização de componentes
 * - Operações CRUD com INSERT/UPDATE/DELETE no Supabase
 */

const SUPABASE_URL = 'SUA_URL_AQUI';
const SUPABASE_KEY = 'SUA_KEY_AQUI';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const AppState = (() => {
    const state = {
        activeTab: 'dashboard',
        activeSection: 'dashboard',
        isLoading: false,
        tasks: [],
        habits: [],
        plans: [],
        schools: [],
        classes: [],
        workouts: [],
        stats: {
            totalTasks: 0,
            completedTasks: 0,
            totalSchools: 0,
            nextWorkout: '-',
        },
    };

    const subscribers = [];

    const notify = (changedKey) => {
        subscribers.forEach((callback) => callback(getState(), changedKey));
    };

    const subscribe = (callback) => {
        subscribers.push(callback);
        return () => {
            const index = subscribers.indexOf(callback);
            if (index > -1) subscribers.splice(index, 1);
        };
    };

    const setState = (newState) => {
        Object.assign(state, newState);
        Object.keys(newState).forEach((key) => notify(key));
    };

    const getState = () => ({ ...state });
    const get = (key) => state[key];

    const setActiveTab = (tab) => {
        setState({ activeTab: tab, activeSection: tab });
    };

    const setLoading = (isLoading) => {
        setState({ isLoading });
    };

    const buildStats = ({ tasks = [], schools = [], workouts = [] }) => ({
        totalTasks: tasks.length,
        completedTasks: tasks.filter((task) => task.completed).length,
        totalSchools: schools.length,
        nextWorkout: workouts.length > 0 ? workouts[0].name : '-',
    });

    const loadData = async () => {
        setLoading(true);

        try {
            const [tasksRes, habitsRes, plansRes, schoolsRes, classesRes, workoutsRes] = await Promise.all([
                supabase.from('tasks').select('*'),
                supabase.from('habits').select('*'),
                supabase.from('planos').select('*'),
                supabase.from('schools').select('*'),
                supabase.from('classes').select('*'),
                supabase.from('workouts').select('*'),
            ]);

            const errors = [tasksRes.error, habitsRes.error, plansRes.error, schoolsRes.error, classesRes.error, workoutsRes.error].filter(Boolean);
            if (errors.length > 0) {
                throw errors[0];
            }

            setState({
                tasks: tasksRes.data ?? [],
                habits: habitsRes.data ?? [],
                plans: plansRes.data ?? [],
                schools: schoolsRes.data ?? [],
                classes: classesRes.data ?? [],
                workouts: workoutsRes.data ?? [],
                stats: buildStats({
                    tasks: tasksRes.data ?? [],
                    schools: schoolsRes.data ?? [],
                    workouts: workoutsRes.data ?? [],
                }),
            });
        } catch (error) {
            console.error('Falha ao carregar dados do Supabase:', error);
        } finally {
            setLoading(false);
        }
    };

    const addTask = async (taskData) => {
        try {
            const payload = {
                title: taskData.title,
                completed: taskData.completed ?? false,
                priority: taskData.priority ?? 'medium',
                due_date: taskData.due_date ?? taskData.dueDate ?? new Date().toISOString().split('T')[0],
            };

            const { data, error } = await supabase.from('tasks').insert([payload]).select();
            if (error) {
                console.error('Falha ao adicionar tarefa:', error);
                return null;
            }

            const task = Array.isArray(data) ? data[0] : data;
            const tasks = [...state.tasks, task];
            setState({
                tasks,
                stats: buildStats({ tasks, schools: state.schools, workouts: state.workouts }),
            });
            return task;
        } catch (error) {
            console.error('Erro ao adicionar tarefa:', error);
            return null;
        }
    };

    const updateTask = async (taskId, taskData) => {
        try {
            const payload = { ...taskData };
            const { data, error } = await supabase.from('tasks').update(payload).eq('id', taskId).select();
            if (error) {
                console.error('Falha ao atualizar tarefa:', error);
                return null;
            }

            const updatedTask = Array.isArray(data) ? data[0] : data;
            const tasks = state.tasks.map((task) => (task.id === taskId ? updatedTask : task));
            setState({
                tasks,
                stats: buildStats({ tasks, schools: state.schools, workouts: state.workouts }),
            });
            return updatedTask;
        } catch (error) {
            console.error('Erro ao atualizar tarefa:', error);
            return null;
        }
    };

    const deleteTask = async (taskId) => {
        try {
            const { error } = await supabase.from('tasks').delete().eq('id', taskId);
            if (error) {
                console.error('Falha ao remover tarefa:', error);
                return false;
            }

            const tasks = state.tasks.filter((task) => task.id !== taskId);
            setState({
                tasks,
                stats: buildStats({ tasks, schools: state.schools, workouts: state.workouts }),
            });
            return true;
        } catch (error) {
            console.error('Erro ao remover tarefa:', error);
            return false;
        }
    };

    const toggleTaskComplete = async (taskId) => {
        try {
            const task = state.tasks.find((item) => item.id === taskId);
            if (!task) return null;
            return await updateTask(taskId, { completed: !task.completed });
        } catch (error) {
            console.error('Erro ao alternar conclusão da tarefa:', error);
            return null;
        }
    };

    const addHabit = async (habitData) => {
        try {
            const payload = {
                name: habitData.name,
                goal: habitData.goal || '',
                progress: habitData.progress ?? 0,
            };

            const { data, error } = await supabase.from('habits').insert([payload]).select();
            if (error) {
                console.error('Falha ao adicionar hábito:', error);
                return null;
            }

            const habit = Array.isArray(data) ? data[0] : data;
            setState({ habits: [...state.habits, habit] });
            return habit;
        } catch (error) {
            console.error('Erro ao adicionar hábito:', error);
            return null;
        }
    };

    const updateHabit = async (habitId, habitData) => {
        try {
            const { data, error } = await supabase.from('habits').update(habitData).eq('id', habitId).select();
            if (error) {
                console.error('Falha ao atualizar hábito:', error);
                return null;
            }

            const updatedHabit = Array.isArray(data) ? data[0] : data;
            setState({ habits: state.habits.map((habit) => (habit.id === habitId ? updatedHabit : habit)) });
            return updatedHabit;
        } catch (error) {
            console.error('Erro ao atualizar hábito:', error);
            return null;
        }
    };

    const deleteHabit = async (habitId) => {
        try {
            const { error } = await supabase.from('habits').delete().eq('id', habitId);
            if (error) {
                console.error('Falha ao remover hábito:', error);
                return false;
            }
            setState({ habits: state.habits.filter((habit) => habit.id !== habitId) });
            return true;
        } catch (error) {
            console.error('Erro ao remover hábito:', error);
            return false;
        }
    };

    const addPlan = async (planData) => {
        try {
            const payload = {
                title: planData.title,
                status: planData.status ?? 'planning',
                progress: planData.progress ?? 0,
            };

            const { data, error } = await supabase.from('planos').insert([payload]).select();
            if (error) {
                console.error('Falha ao adicionar plano:', error);
                return null;
            }

            const plan = Array.isArray(data) ? data[0] : data;
            setState({ plans: [...state.plans, plan] });
            return plan;
        } catch (error) {
            console.error('Erro ao adicionar plano:', error);
            return null;
        }
    };

    const updatePlan = async (planId, planData) => {
        try {
            const { data, error } = await supabase.from('planos').update(planData).eq('id', planId).select();
            if (error) {
                console.error('Falha ao atualizar plano:', error);
                return null;
            }
            const updatedPlan = Array.isArray(data) ? data[0] : data;
            setState({ plans: state.plans.map((plan) => (plan.id === planId ? updatedPlan : plan)) });
            return updatedPlan;
        } catch (error) {
            console.error('Erro ao atualizar plano:', error);
            return null;
        }
    };

    const deletePlan = async (planId) => {
        try {
            const { error } = await supabase.from('planos').delete().eq('id', planId);
            if (error) {
                console.error('Falha ao remover plano:', error);
                return false;
            }
            setState({ plans: state.plans.filter((plan) => plan.id !== planId) });
            return true;
        } catch (error) {
            console.error('Erro ao remover plano:', error);
            return false;
        }
    };

    return {
        subscribe,
        getState,
        get,
        setActiveTab,
        setLoading,
        loadData,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        addHabit,
        updateHabit,
        deleteHabit,
        addPlan,
        updatePlan,
        deletePlan,
    };
})();

const App = (() => {
    const DOM = {
        navTabs: document.querySelectorAll('.nav-tab'),
        sections: document.querySelectorAll('.sec'),
        statsGrid: document.querySelector('.stats-grid'),
        tasksList: document.querySelector('.tasks-list'),
        quickTaskInput: document.getElementById('quickTaskInput'),
        quickTaskAdd: document.getElementById('quickTaskAdd'),
    };

    const init = async () => {
        attachEventListeners();
        AppState.subscribe(handleStateChange);
        await AppState.loadData();
        renderSection(AppState.get('activeSection'));
    };

    const attachEventListeners = () => {
        DOM.navTabs.forEach((tab) => {
            tab.addEventListener('click', handleTabClick);
        });

        if (DOM.quickTaskAdd && DOM.quickTaskInput) {
            DOM.quickTaskAdd.addEventListener('click', handleQuickTaskAdd);
        }

        DOM.tasksList?.addEventListener('click', (event) => {
            const deleteButton = event.target.closest('[data-delete-task]');
            const completeToggle = event.target.closest('[data-toggle-complete]');

            if (deleteButton) {
                const taskElement = deleteButton.closest('.task');
                const taskId = Number(taskElement?.dataset.taskId);
                if (taskId) {
                    AppState.deleteTask(taskId);
                }
            }

            if (completeToggle) {
                const taskElement = completeToggle.closest('.task');
                const taskId = Number(taskElement?.dataset.taskId);
                if (taskId) {
                    AppState.toggleTaskComplete(taskId);
                }
            }
        });
    };

    const handleTabClick = (e) => {
        const tab = e.currentTarget.dataset.tab;
        if (!tab) return;
        AppState.setActiveTab(tab);
        DOM.navTabs.forEach((item) => item.classList.toggle('nav-tab--active', item.dataset.tab === tab));
        renderSection(tab);
    };

    const handleQuickTaskAdd = async () => {
        const title = DOM.quickTaskInput.value.trim();
        if (!title) return;
        await AppState.addTask({ title, completed: false, priority: 'medium' });
        DOM.quickTaskInput.value = '';
    };

    const handleStateChange = (_, changedKey) => {
        const active = AppState.get('activeSection');
        if (changedKey === 'tasks' && active === 'dashboard') {
            renderDashboard();
        }
    };

    const renderSection = (sectionName) => {
        DOM.sections.forEach((section) => {
            section.classList.toggle('sec--active', section.dataset.section === sectionName);
        });

        if (sectionName === 'dashboard') {
            renderDashboard();
        }
    };

    const renderDashboard = () => {
        const { tasks, stats } = AppState.getState();
        if (DOM.statsGrid) {
            const statCards = Array.from(DOM.statsGrid.querySelectorAll('.stat'));
            if (statCards.length >= 4) {
                statCards[0].querySelector('.value').textContent = stats.totalTasks;
                statCards[0].querySelector('.label').textContent = 'Tarefas';
                statCards[1].querySelector('.value').textContent = stats.completedTasks;
                statCards[1].querySelector('.label').textContent = 'Concluídas';
                statCards[2].querySelector('.value').textContent = stats.totalSchools;
                statCards[2].querySelector('.label').textContent = 'Escolas';
                statCards[3].querySelector('.value').textContent = stats.nextWorkout;
                statCards[3].querySelector('.label').textContent = 'Próximo treino';
            }
        }

        if (!DOM.tasksList) return;
        if (tasks.length === 0) {
            DOM.tasksList.innerHTML = '<p class="empty-state">Nenhuma tarefa cadastrada</p>';
            return;
        }

        DOM.tasksList.innerHTML = tasks
            .map((task) => createTaskElement(task))
            .join('');
    };

    const createTaskElement = (task) => {
        const completedClass = task.completed ? 'task--completed' : '';
        const checked = task.completed ? 'checked' : '';
        const dueDate = task.due_date || task.dueDate || '';
        return `
            <div class="task card ${completedClass}" data-task-id="${task.id}">
                <div class="task__checkbox">
                    <input type="checkbox" class="task__check" data-toggle-complete ${checked} />
                </div>
                <div class="task__content">
                    <div class="task__title">${escapeHtml(task.title)}</div>
                    <div class="task__date">${dueDate ? formatDate(dueDate) : 'Sem data'}</div>
                </div>
                <div class="task__priority">${escapeHtml(task.priority || 'medium')}</div>
                <div class="task__actions">
                    <button class="btn btn--small btn--ghost" data-edit-task>✎</button>
                    <button class="btn btn--small btn--ghost btn--danger" data-delete-task>✕</button>
                </div>
            </div>
        `;
    };

    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        if (Number.isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return {
        init,
    };
})();

window.addEventListener('DOMContentLoaded', () => {
    App.init();
});
