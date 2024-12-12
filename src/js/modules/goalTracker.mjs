import { Goal } from './goal.mjs';
import { User } from './user.mjs';
import { GoalStorage } from './goalStorage.mjs';
import { demoGoals } from './demoData.mjs';

export class GoalTracker {
    constructor(auth, db) {
        this.days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        this.storage = new GoalStorage(db, auth);
        this.user = null;
        this.setupAuthListener(auth);
        this.setupModalHandlers();
    }

    setupModalHandlers() {
        const modal = document.getElementById('goalModal');
        const form = document.getElementById('goalForm');
        const cancelBtn = document.getElementById('cancelBtn');
        const iconPicker = document.getElementById('iconPicker');
        const addButton = document.getElementById('addGoalBtn');
    
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = {
                name: form.querySelector('#goalName').value,
                icon: document.querySelector('#selectedIcon').textContent,
                positive: form.querySelector('[name="goalType"]:checked').value === 'positive',
                points: form.querySelector('[name="goalType"]:checked').value === 'positive' ? 1 : -1
            };
            this.handleGoalSubmit(formData);
            modal.style.display = 'none';
        });
    
        cancelBtn.addEventListener('click', () => modal.style.display = 'none');
        iconPicker.addEventListener('click', () => this.showEmojiPicker());
        addButton.addEventListener('click', () => {
            form.reset();
            modal.style.display = 'flex';
        });
    }

    showEmojiPicker() {
        const emojis = ['📚', '🏃', '🧘', '💪', '🎯', '💡', '🍎', '💤', '💧', '🎨', '✍️', '🎵'];
        let picker = document.querySelector('.emoji-picker');
        
        if (picker) {
            picker.remove();
            return;
        }
    
        picker = document.createElement('div');
        picker.className = 'emoji-picker';
        picker.innerHTML = emojis.map(emoji => 
            `<button type="button" class="emoji-btn">${emoji}</button>`
        ).join('');
    
        picker.addEventListener('click', (e) => {
            if (e.target.classList.contains('emoji-btn')) {
                document.querySelector('#selectedIcon').textContent = e.target.textContent;
                picker.remove();
            }
        });
    
        const iconPicker = document.getElementById('iconPicker');
        iconPicker.parentNode.insertBefore(picker, iconPicker.nextSibling);
    }
    
    handleGoalSubmit(formData) {
        const goal = new Goal(
            crypto.randomUUID(),
            formData.name,
            formData.icon,
            formData.positive,
            formData.points
        );
    
        if (this.user.uid !== 'demo') {
            this.storage.saveGoal(this.user.uid, goal);
        }
        
        this.user.addGoal(goal);
        this.render();
    }

    setupAuthListener(auth) {
        auth.onAuthStateChanged(async (authUser) => {
            if (authUser) {
                this.user = await this.storage.loadUserData(authUser.uid);
            } else {
                this.loadDemoData();
            }
            this.render();
        });
    }

    loadDemoData() {
        this.user = new User('demo', 'Demo User', null);
        demoGoals.forEach(data => {
            const goal = Goal.fromJSON(data);
            this.user.addGoal(goal);
        });
    }

    render() {
        this.initializeLucideIcons();
        this.renderDaysHeader();
        this.renderGoals();
        this.updateStats();
        this.renderDailyScores();
    }

    async toggleGoal(goalId, dayIndex) {
        const goal = this.user.getGoal(goalId);
        if (!goal) return;

        goal.toggle(dayIndex);
        if (this.user.uid !== 'demo') {
            await this.storage.saveGoal(this.user.uid, goal);
        }
        this.render();
    }

    renderGoals() {
        const goalsList = document.getElementById('goals-list');
        goalsList.innerHTML = '';

        this.user.getAllGoals().forEach(goal => {
            const row = this.createGoalRow(goal);
            goalsList.appendChild(row);
        });

        lucide.createIcons();
    }

    createGoalRow(goal) {
        const row = document.createElement('tr');
        row.className = 'goal-row';
    
        // Add delete button to name cell
        const nameCell = this.createNameCell(goal);
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i data-lucide="trash-2"></i>';
        deleteBtn.onclick = () => this.deleteGoal(goal.id);
        nameCell.querySelector('.goal-name').appendChild(deleteBtn);
        
        row.appendChild(nameCell);
        
        goal.checks.forEach((checked, idx) => {
            row.appendChild(this.createCheckCell(goal, checked, idx));
        });
    
        return row;
    }

    async deleteGoal(goalId) {
        if (confirm('Are you sure you want to delete this goal?')) {
            if (this.user.uid !== 'demo') {
                await this.storage.deleteGoal(this.user.uid, goalId);
            }
            this.user.removeGoal(goalId);
            this.render();
        }
    }

    createNameCell(goal) {
        const cell = document.createElement('td');
        cell.innerHTML = `
            <div class="goal-name">
                <span class="goal-icon">${goal.icon}</span>
                <span class="goal-text">${goal.name}</span>
            </div>
        `;
        return cell;
    }

    createCheckCell(goal, checked, idx) {
        const cell = document.createElement('td');
        const button = document.createElement('button');
        button.className = `check-button ${checked ? 'checked' : ''} ${goal.positive ? 'positive' : 'negative'}`;
        
        if (checked) {
            const icon = document.createElement('i');
            icon.setAttribute('data-lucide', goal.positive ? 'smile' : 'frown');
            button.appendChild(icon);
        } else {
            const circle = document.createElement('div');
            circle.className = 'check-circle';
            button.appendChild(circle);
        }

        button.addEventListener('click', () => this.toggleGoal(goal.id, idx));
        cell.appendChild(button);
        return cell;
    }

    updateStats() {
        document.getElementById('active-goals-count').textContent = 
            this.user.getAllGoals().length;
        
        const weekScore = this.user.getWeekScore();
        document.getElementById('week-score').textContent = 
            weekScore > 0 ? `+${weekScore}` : weekScore;
        
        document.getElementById('current-streak').textContent = '5 days';
        document.getElementById('best-streak').textContent = '12 days';
    }

    renderDailyScores() {
        const scoresRow = document.getElementById('daily-scores');
        while (scoresRow.children.length > 1) {
            scoresRow.removeChild(scoresRow.lastChild);
        }

        this.days.forEach((_, idx) => {
            const dailyScore = this.user.getAllGoals()
                .reduce((score, goal) => 
                    score + (goal.checks[idx] ? goal.points : 0), 0);
                
            const td = document.createElement('td');
            td.className = dailyScore >= 0 ? 'score-positive' : 'score-negative';
            td.textContent = dailyScore > 0 ? `+${dailyScore}` : dailyScore;
            scoresRow.appendChild(td);
        });
    }

    renderDaysHeader() {
        const headerRow = document.getElementById('days-header');
        while (headerRow.children.length > 1) {
            headerRow.removeChild(headerRow.lastChild);
        }
        
        this.days.forEach(day => {
            const th = document.createElement('th');
            th.textContent = day;
            headerRow.appendChild(th);
        });
    }

    initializeLucideIcons() {
        lucide.createIcons();
    }
}