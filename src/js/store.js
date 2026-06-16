/**
 * Store - Módulo centralizado de gerenciamento de dados
 * Responsável por:
 * - Inicializar dados mockados
 * - Gerenciar localStorage
 * - Fornecer métodos para CRUD de entidades
 */

const Store = (() => {
    // Dados padrão mockados
    const DEFAULT_SCHOOLS = [
        { id: 1, name: 'Escola Municipal A', city: 'São Paulo' },
        { id: 2, name: 'Escola Estadual B', city: 'Rio de Janeiro' },
        { id: 3, name: 'Colégio Privado C', city: 'Belo Horizonte' },
    ];

    const DEFAULT_CLASSES = [
        { id: 1, name: '6º Ano A', schoolId: 1, students: 30 },
        { id: 2, name: '7º Ano B', schoolId: 1, students: 28 },
        { id: 3, name: '8º Ano A', schoolId: 2, students: 32 },
    ];

    const DEFAULT_TASKS = [
        { id: 1, title: 'Preparar aula de Matemática', completed: false, dueDate: '2026-05-31', priority: 'high' },
        { id: 2, title: 'Corrigir provas', completed: true, dueDate: '2026-05-28', priority: 'medium' },
        { id: 3, title: 'Atualizar plano de aula', completed: false, dueDate: '2026-06-02', priority: 'medium' },
    ];

    const DEFAULT_WORKOUTS = [
        { id: 1, name: 'Corrida matinal', date: '2026-05-30', duration: 30, intensity: 'high' },
        { id: 2, name: 'Musculação', date: '2026-05-31', duration: 60, intensity: 'medium' },
        { id: 3, name: 'Yoga', date: '2026-06-01', duration: 45, intensity: 'low' },
    ];

    const DEFAULT_PLANS = [
        { id: 1, title: 'Plano Q2 2026', status: 'active', progress: 65 },
        { id: 2, title: 'Objetivos Pessoais', status: 'planning', progress: 20 },
        { id: 3, title: 'Desenvolvimento Profissional', status: 'active', progress: 80 },
    ];

    // Storage keys
    const KEYS = {
        SCHOOLS: 'but_first_schools',
        CLASSES: 'but_first_classes',
        TASKS: 'but_first_tasks',
        WORKOUTS: 'but_first_workouts',
        PLANS: 'but_first_plans',
    };

    /**
     * Inicializa os dados no localStorage
     */
    const init = () => {
        Object.keys(KEYS).forEach(key => {
            const storageKey = KEYS[key];
            if (!localStorage.getItem(storageKey)) {
                const defaultData = getDefaultData(key);
                localStorage.setItem(storageKey, JSON.stringify(defaultData));
            }
        });
    };

    /**
     * Retorna dados padrão baseado na chave
     */
    const getDefaultData = (key) => {
        const defaults = {
            SCHOOLS: DEFAULT_SCHOOLS,
            CLASSES: DEFAULT_CLASSES,
            TASKS: DEFAULT_TASKS,
            WORKOUTS: DEFAULT_WORKOUTS,
            PLANS: DEFAULT_PLANS,
        };
        return defaults[key] || [];
    };

    /**
     * Retorna todos os dados de uma entidade
     */
    const getAll = (entity) => {
        const storageKey = KEYS[entity.toUpperCase()];
        if (!storageKey) return [];
        
        const data = localStorage.getItem(storageKey);
        return data ? JSON.parse(data) : [];
    };

    /**
     * Retorna uma entidade pelo ID
     */
    const getById = (entity, id) => {
        const all = getAll(entity);
        return all.find(item => item.id === id) || null;
    };

    /**
     * Adiciona uma nova entidade
     */
    const add = (entity, data) => {
        const all = getAll(entity);
        const newItem = {
            id: Math.max(...all.map(item => item.id || 0), 0) + 1,
            ...data,
        };
        all.push(newItem);
        save(entity, all);
        return newItem;
    };

    /**
     * Atualiza uma entidade existente
     */
    const update = (entity, id, data) => {
        const all = getAll(entity);
        const index = all.findIndex(item => item.id === id);
        
        if (index !== -1) {
            all[index] = { ...all[index], ...data };
            save(entity, all);
            return all[index];
        }
        return null;
    };

    /**
     * Remove uma entidade
     */
    const remove = (entity, id) => {
        const all = getAll(entity);
        const filtered = all.filter(item => item.id !== id);
        save(entity, filtered);
        return true;
    };

    /**
     * Salva dados no localStorage
     */
    const save = (entity, data) => {
        const storageKey = KEYS[entity.toUpperCase()];
        if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(data));
                        // Async sync to IndexedDB if available
                        try{
                            if(window.IDBSync && typeof window.IDBSync.writeAll === 'function'){
                                window.IDBSync.writeAll(entity, data).catch(()=>{});
                            }
                        }catch(e){/* ignore */}
        }
    };

    /**
     * Retorna estatísticas gerais
     */
    const getStats = () => {
        const tasks = getAll('tasks');
        const schools = getAll('schools');
        const workouts = getAll('workouts');

        return {
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.completed).length,
            totalSchools: schools.length,
            nextWorkout: workouts.length > 0 ? workouts[0].name : '-',
        };
    };

    /**
     * Reset dos dados (útil para testes/dev)
     */
    const reset = () => {
        Object.keys(KEYS).forEach(key => {
            localStorage.removeItem(KEYS[key]);
        });
        init();
    };

    // Inicializa o store automaticamente
    init();

    // Public API
    return {
        getAll,
        getById,
        add,
        update,
        remove,
        getStats,
        reset,
    };
})();

/* ======================================================
     IndexedDB sync layer (optional persistence)
     - Keeps an async copy of data in IndexedDB for larger storage
     - Store continues to use localStorage synchronously; IDB is a background sync
 ======================================================*/
(function(){
    const DB_NAME = 'but_first_db';
    const DB_VERSION = 1;
    const STORES = ['schools','classes','tasks','workouts','plans'];
    let db = null;

    const openDB = () => new Promise((resolve, reject) => {
        if (db) return resolve(db);
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const idb = e.target.result;
            STORES.forEach(s => { if (!idb.objectStoreNames.contains(s)) idb.createObjectStore(s, { keyPath: 'id' }); });
        };
        req.onsuccess = (e) => { db = e.target.result; resolve(db); };
        req.onerror = (e) => reject(e.target.error);
    });

    const writeAllToStore = async (storeName, items) => {
        try{
            const idb = await openDB();
            const tx = idb.transaction(storeName, 'readwrite');
            const os = tx.objectStore(storeName);
            // clear then put
            const clearReq = os.clear();
            clearReq.onsuccess = () => {
                items.forEach(it => os.put(it));
            };
            return new Promise((res, rej)=>{ tx.oncomplete = ()=>res(true); tx.onerror = ()=>rej(tx.error); });
        }catch(err){ console.warn('IDB writeAll failed', err); }
    };

    const readAllFromStore = async (storeName) => {
        try{
            const idb = await openDB();
            const tx = idb.transaction(storeName, 'readonly');
            const os = tx.objectStore(storeName);
            return new Promise((resolve,reject)=>{
                const req = os.getAll();
                req.onsuccess = () => resolve(req.result || []);
                req.onerror = () => reject(req.error);
            });
        }catch(err){ console.warn('IDB readAll failed', err); return []; }
    };

    // On startup: ensure IDB has data; if empty, migrate from localStorage (Store)
    (async function migrateIfNeeded(){
        try{
            await openDB();
            for(const s of STORES){
                const idbItems = await readAllFromStore(s);
                if(!idbItems || idbItems.length===0){
                    const lsKey = (()=>{ const map = {schools:'but_first_schools',classes:'but_first_classes',tasks:'but_first_tasks',workouts:'but_first_workouts',plans:'but_first_plans'}; return map[s]; })();
                    const data = localStorage.getItem(lsKey);
                    if(data){
                        try{ const parsed = JSON.parse(data); if(Array.isArray(parsed)) await writeAllToStore(s, parsed); }catch(e){}
                    }
                }
            }
        }catch(e){ console.warn('IDB migration failed', e); }
    })();

    // Expose a small API to allow Store.save to persist to IDB asynchronously
    window.IDBSync = {
        writeAll: writeAllToStore,
        readAll: readAllFromStore,
    };
})();
