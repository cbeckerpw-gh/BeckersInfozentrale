/**
 * Steuerung des Einstellungen- & Verwaltungs-Popups
 */
const SettingsModule = {
    init() {
        const btnOpen = document.getElementById('btn-open-settings');
        const btnClose = document.getElementById('btn-close-settings');
        const modal = document.getElementById('modal-settings');
        const form = document.getElementById('form-add-task');

        if (btnOpen && modal) {
            btnOpen.addEventListener('click', () => modal.classList.remove('hidden'));
        }
        if (btnClose && modal) {
            btnClose.addEventListener('click', () => modal.classList.add('hidden'));
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const title = document.getElementById('input-task-title').value;
                const person = document.getElementById('select-task-person').value;
                const duration = parseInt(document.getElementById('input-task-duration').value, 10);

                if (title && duration) {
                    TasksModule.addTaskToColumn('heute', title, person, duration);
                    form.reset();
                    modal.classList.add('hidden');
                }
            });
        }
    }
};
