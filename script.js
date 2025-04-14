'use strict';

// --- الإعداد الأولي عند تحميل الصفحة ---
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. اختيار عناصر واجهة المستخدم (DOM Elements) ---
    const taskForm = document.getElementById('add-task-form');
    const taskInput = document.getElementById('task-input-field');
    const addTaskDescription = document.getElementById('add-task-description'); // <<< اختيار حقل الوصف الجديد
    const addTaskStatusSelect = document.getElementById('add-task-status');
    const taskListContainer = document.getElementById('tasks-list-container');
    const totalCountSpan = document.getElementById('total-count');
    const completedCountSpan = document.getElementById('completed-count');
    const pendingCountSpan = document.getElementById('pending-count');
    const noTasksMessage = taskListContainer.querySelector('.no-tasks-message');

    // التحقق من وجود العناصر الأساسية (بما في ذلك الوصف)
    if (!taskForm || !taskInput || !addTaskDescription || !addTaskStatusSelect || !taskListContainer || !totalCountSpan || !completedCountSpan || !pendingCountSpan || !noTasksMessage) {
        console.error("خطأ فادح: عنصر أو أكثر من عناصر الواجهة الرئيسية غير موجود!");
        alert("حدث خطأ أثناء تحميل التطبيق. الرجاء تحديث الصفحة.");
        return; // أوقف التنفيذ
    }

    // --- 2. حالة التطبيق (State) ---
    let tasks = [];
    const taskStatuses = {
        todo: 'لم تبدأ',
        inProgress: 'قيد التنفيذ',
        done: 'مكتملة'
    };
    const LOCAL_STORAGE_KEY = 'personalTaskManager_v1.1'; // تحديث طفيف للمفتاح

    // --- 3. وظائف مساعدة (Helper Functions) ---
    const escapeHTML = (str) => { /* ... (كما هي) ... */
        if (str === null || str === undefined) return '';
        const textNode = document.createTextNode(str);
        const div = document.createElement('div');
        div.appendChild(textNode);
        return div.innerHTML;
     };
    const formatDate = (dateString) => { /* ... (كما هي) ... */
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString('ar-EG', {
                day: 'numeric', month: 'long', year: 'numeric'
            });
        } catch (e) {
            console.warn("تنسيق تاريخ غير صالح:", dateString, e);
            return '';
        }
    };

    // --- 4. وظائف إدارة البيانات والعرض (Data & Rendering) ---
    const loadTasks = () => { /* ... (كما هي - تتحقق من وجود description) ... */
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        tasks = [];
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                if (Array.isArray(parsedData)) {
                    tasks = parsedData.map(task => ({
                        id: task.id || `task_${Date.now()}_${Math.random()}`,
                        text: task.text || '',
                        description: task.description || '', // Load description
                        status: Object.keys(taskStatuses).includes(task.status) ? task.status : 'todo',
                        dateAdded: task.dateAdded || new Date().toISOString(),
                        dateCompleted: task.dateCompleted || null
                    })).filter(task => task.text);
                }
            } catch (error) {
                console.error("خطأ في قراءة أو تحليل المهام من التخزين:", error);
            }
        }
        console.log(`تم تحميل ${tasks.length} مهمة من التخزين.`);
     };
    const saveTasks = () => { /* ... (كما هي) ... */
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
            console.log(`تم حفظ ${tasks.length} مهمة في التخزين.`);
        } catch (error) {
            console.error("خطأ في حفظ المهام:", error);
            alert("لم نتمكن من حفظ حالة المهام!");
        }
    };
    const updateCounts = () => { /* ... (كما هي) ... */
        const total = tasks.length;
        const completed = tasks.filter(task => task.status === 'done').length;
        const pending = total - completed;

        totalCountSpan.textContent = `الإجمالي: ${total}`;
        completedCountSpan.textContent = `المكتملة: ${completed}`;
        pendingCountSpan.textContent = `المتبقية: ${pending}`;
    };
    const renderTasks = () => { /* ... (كما هي - تعرض الوصف إذا كان موجودًا) ... */
        console.log("بدء عملية العرض...");
        taskListContainer.querySelectorAll('.task-item').forEach(item => item.remove());
        noTasksMessage.style.display = tasks.length === 0 ? 'block' : 'none';

        tasks.forEach(task => {
            const li = document.createElement('li');
            const currentStatus = Object.keys(taskStatuses).includes(task.status) ? task.status : 'todo';
            li.className = `task-item status-${currentStatus}`;
            li.dataset.taskId = task.id;

            const isDone = currentStatus === 'done';
            const addedDateFormatted = formatDate(task.dateAdded);
            const completedDateFormatted = isDone ? formatDate(task.dateCompleted) : '';
            const descriptionHTML = task.description ? `<p class="task-description">${escapeHTML(task.description)}</p>` : '';
            const completedDateHTML = completedDateFormatted ? `<span class="task-date task-completed-date">أُنجزت: ${completedDateFormatted}</span>` : '';

            li.innerHTML = `
                <div class="task-view">
                    <div class="task-content">
                        <input type="checkbox" class="complete-checkbox" ${isDone ? 'checked' : ''} title="${isDone ? 'إلغاء التحديد' : 'تحديد كمكتمل'}">
                        <div class="task-details">
                            <span class="task-status-badge">${escapeHTML(taskStatuses[currentStatus])}</span>
                            <span class="task-text">${escapeHTML(task.text)}</span>
                            ${descriptionHTML}
                            <div class="task-dates">
                                <span class="task-date task-added-date">أُضيفت: ${addedDateFormatted}</span>
                                ${completedDateHTML}
                            </div>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="edit-btn" type="button" title="تعديل المهمة"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn" type="button" title="حذف المهمة"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
                <div class="task-edit-view">
                    <input type="text" class="edit-task-text" value="${escapeHTML(task.text)}" placeholder="عنوان المهمة" required>
                    <textarea class="edit-task-description" placeholder="أضف وصفاً (اختياري)">${escapeHTML(task.description)}</textarea>
                    <div class="edit-controls">
                        <select class="edit-task-status">
                            ${Object.entries(taskStatuses).map(([key, label]) =>
                                `<option value="${key}" ${currentStatus === key ? 'selected' : ''}>${escapeHTML(label)}</option>`
                            ).join('')}
                        </select>
                        <button class="save-edit-btn" type="button"><i class="fas fa-save"></i> حفظ</button>
                        <button class="cancel-edit-btn" type="button"><i class="fas fa-times"></i> إلغاء</button>
                    </div>
                </div>
            `;
            taskListContainer.appendChild(li);
        });

        updateCounts();
        console.log("انتهاء عملية العرض.");
     };

    // --- 5. معالجات الأحداث (Event Handlers) ---

    /**
     * معالجة حدث إرسال نموذج إضافة مهمة جديدة (مُعدَّل).
     */
    const handleAddTaskSubmit = (event) => {
        event.preventDefault();

        const text = taskInput.value.trim();
        const description = addTaskDescription.value.trim(); // <<< قراءة الوصف من الحقل الجديد
        const status = addTaskStatusSelect.value;

        if (!text) {
            alert("الرجاء إدخال عنوان للمهمة.");
            taskInput.focus();
            return;
        }
        if (!Object.keys(taskStatuses).includes(status)) {
            alert("الحالة المحددة غير صالحة.");
            return;
        }

        // إنشاء كائن المهمة الجديدة مع الوصف
        const newTask = {
            id: `task_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            text: text,
            description: description, // <<< استخدام الوصف المدخل
            status: status,
            dateAdded: new Date().toISOString(),
            dateCompleted: status === 'done' ? new Date().toISOString() : null
        };

        tasks.unshift(newTask);
        saveTasks();
        renderTasks();

        // إعادة تعيين النموذج (بما في ذلك حقل الوصف)
        taskInput.value = '';
        addTaskDescription.value = ''; // <<< مسح حقل الوصف
        addTaskStatusSelect.value = 'todo';
        taskInput.focus();
    };

    // وظائف التعديل والحذف والنقر تبقى كما هي
    const enterEditMode = (taskItem) => { /* ... (كما هي) ... */
        taskListContainer.querySelectorAll('.task-item.editing').forEach(item => {
            if (item !== taskItem) { item.classList.remove('editing'); }
        });
        taskItem.classList.add('editing');
        const titleInput = taskItem.querySelector('.edit-task-text');
        if (titleInput) { titleInput.focus(); titleInput.select(); }
     };
    const cancelEditMode = (taskItem) => { /* ... (كما هي) ... */
        taskItem.classList.remove('editing');
        renderTasks(); // Re-render to restore original values visually
     };
    const saveEditChanges = (taskItem, taskId) => { /* ... (كما هي - تحفظ الوصف أيضًا) ... */
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        const newText = taskItem.querySelector('.edit-task-text').value.trim();
        const newDescription = taskItem.querySelector('.edit-task-description').value.trim(); // Read description from edit view
        const newStatus = taskItem.querySelector('.edit-task-status').value;

        if (!newText) { alert("عنوان المهمة مطلوب."); taskItem.querySelector('.edit-task-text').focus(); return; }
        if (!Object.keys(taskStatuses).includes(newStatus)) { alert("الحالة المحددة غير صالحة."); return; }

        const originalStatus = tasks[taskIndex].status;
        let newCompletionDate = tasks[taskIndex].dateCompleted;

        if (newStatus === 'done' && originalStatus !== 'done') { newCompletionDate = new Date().toISOString(); }
        else if (newStatus !== 'done' && originalStatus === 'done') { newCompletionDate = null; }

        tasks[taskIndex] = { ...tasks[taskIndex], text: newText, description: newDescription, status: newStatus, dateCompleted: newCompletionDate }; // Save description

        saveTasks();
        renderTasks();
    };
    const handleTaskListClick = (event) => { /* ... (كما هي) ... */
        const target = event.target;
        const taskItem = target.closest('.task-item');
        if (!taskItem) return;
        const taskId = taskItem.dataset.taskId;
        const isEditing = taskItem.classList.contains('editing');

        if (!isEditing) { // View Mode Actions
            if (target.closest('.delete-btn')) {
                const taskText = tasks.find(t => t.id === taskId)?.text || 'هذه المهمة';
                if (confirm(`هل أنت متأكد من حذف "${escapeHTML(taskText)}"?`)) {
                    tasks = tasks.filter(t => t.id !== taskId);
                    saveTasks(); renderTasks();
                }
            } else if (target.closest('.edit-btn')) {
                enterEditMode(taskItem);
            } else if (target.classList.contains('complete-checkbox')) {
                const taskIndex = tasks.findIndex(t => t.id === taskId);
                if (taskIndex > -1) {
                    const isCurrentlyDone = tasks[taskIndex].status === 'done';
                    tasks[taskIndex].status = isCurrentlyDone ? 'todo' : 'done';
                    tasks[taskIndex].dateCompleted = !isCurrentlyDone ? new Date().toISOString() : null;
                    saveTasks(); renderTasks();
                }
            }
        } else { // Edit Mode Actions
            if (target.closest('.save-edit-btn')) {
                saveEditChanges(taskItem, taskId);
            } else if (target.closest('.cancel-edit-btn')) {
                cancelEditMode(taskItem);
            }
        }
     };

    // --- 6. ربط الأحداث (Event Binding) ---
    taskForm.addEventListener('submit', handleAddTaskSubmit);
    taskListContainer.addEventListener('click', handleTaskListClick);
    console.log("تم ربط معالجات الأحداث.");

    // --- 7. التحميل الأولي (Initial Load) ---
    console.log("بدء تحميل التطبيق الأولي...");
    loadTasks();
    renderTasks();
    console.log("التطبيق جاهز للعمل.");

}); // --- نهاية DOMContentLoaded ---
