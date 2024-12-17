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
            document.querySelector('#selectedIcon').textContent = '📌';
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
        document.getElementById('goalModal').style.display = 'none';
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

    async render() {
        this.initializeLucideIcons();
        this.renderDaysHeader();
        this.renderGoals();
        await this.updateStats();
        this.renderDailyScores();
    }

    async toggleGoal(goalId, dateStr) {
        const goal = this.user.getGoal(goalId);
        if (!goal) return;
    
        goal.toggle(dateStr);
        if (this.user.uid !== 'demo') {
            await this.storage.saveGoal(this.user.uid, goal);
        }
        await this.render();  
    }

    renderGoals() {
        const goalsList = document.getElementById('goals-list');
        goalsList.innerHTML = '';
        
        goalsList.addEventListener('dragover', e => {
            e.preventDefault();
            const dragging = goalsList.querySelector('.dragging');
            if (!dragging) return;
            
            const siblings = [...goalsList.querySelectorAll('tr:not(.dragging)')];
            const nextSibling = siblings.find(sibling => {
                const rect = sibling.getBoundingClientRect();
                return e.clientY <= rect.top + rect.height / 2;
            });
            
            if (nextSibling) {
                goalsList.insertBefore(dragging, nextSibling);
            } else {
                goalsList.appendChild(dragging);
            }
        });
        
        this.user.getAllGoals().forEach(goal => {
            const row = this.createGoalRow(goal, this.getWeekDates());
            goalsList.appendChild(row);
        });
        
        lucide.createIcons();
    }
    
    async handleDragEnd() {
        const goals = [...document.querySelectorAll('.goal-row')].map((row, index) => {
            const goalId = row.dataset.goalId;
            const goal = this.user.getGoal(goalId);
            goal.order = index;
            return goal;
        });
    
        if (this.user.uid !== 'demo') {
            await Promise.all(goals.map(goal => 
                this.storage.saveGoal(this.user.uid, goal)
            ));
        }
    }

    getWeekDates() {
        const today = new Date();
        const day = today.getDay(); 
        const lastSunday = new Date(today);
        lastSunday.setDate(today.getDate() - day); 
    
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(lastSunday);
            date.setDate(lastSunday.getDate() + i); 
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    }
    

    createGoalRow(goal, dates) {
        const row = document.createElement('tr');
        row.className = 'goal-row';
        row.draggable = true;
        row.dataset.goalId = goal.id;
        
        row.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', goal.id);
            row.classList.add('dragging');
        });
        
        row.addEventListener('dragend', async () => {
            row.classList.remove('dragging');
            await this.handleDragEnd();
        });
        
        row.appendChild(this.createNameCell(goal));
        
        dates.forEach(dateStr => {
            row.appendChild(this.createCheckCell(goal, goal.isChecked(dateStr), dateStr));
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
        const nameDiv = document.createElement('div');
        nameDiv.className = 'goal-name';
        
        nameDiv.innerHTML = `
            <span class="goal-icon">${goal.icon}</span>
            <span class="goal-text">${goal.name}</span>
        `;
    
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i data-lucide="trash-2"></i>';
        deleteBtn.onclick = () => this.deleteGoal(goal.id);
        
        nameDiv.appendChild(deleteBtn);
        cell.appendChild(nameDiv);
        return cell;
    }

    
    createCheckCell(goal, checked, dateStr) {
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

        button.addEventListener('click', () => this.toggleGoal(goal.id, dateStr));
        cell.appendChild(button);
        return cell;
    }

    renderDailyScores() {
        if (!this.user) return;
        
        const scoresRow = document.getElementById('daily-scores');
        while (scoresRow.children.length > 1) {
            scoresRow.removeChild(scoresRow.lastChild);
        }
    
        const dates = this.getWeekDates();
        dates.forEach(dateStr => {
            const dailyScore = this.user.getAllGoals()
                .reduce((score, goal) => 
                    score + (goal.isChecked(dateStr) ? goal.points : 0), 0);
                
            const td = document.createElement('td');
            td.className = dailyScore >= 0 ? 'score-positive' : 'score-negative';
            td.textContent = dailyScore > 0 ? `+${dailyScore}` : dailyScore;
            scoresRow.appendChild(td);
        });
    }
    
    async updateStreaks() {
        if (!this.user) return { current: 0, best: 0 };
        
        const dates = this.getWeekDates();
        const dailyScores = [];
        
        // Calculate scores for each day
        dates.forEach(date => {
            const score = this.user.getAllGoals().reduce((total, goal) => 
                total + (goal.isChecked(date) ? goal.points : 0), 0);
            dailyScores.push(score);
        });
        
        let currentStreak = 0;
        let bestStreak = 0;
        let tempStreak = 0;
        
        // Calculate streaks from newest to oldest
        for (let i = dailyScores.length - 1; i >= 0; i--) {
            if (dailyScores[i] > 0) {
                tempStreak++;
                currentStreak = tempStreak;
                bestStreak = Math.max(bestStreak, tempStreak);
            } else {
                tempStreak = 0;
            }
        }
        
        return { current: currentStreak, best: bestStreak };
    }
    
    async updateStats() {
        if (!this.user) return;
        
        document.getElementById('active-goals-count').textContent = this.user.getAllGoals().length;
        
        const dates = this.getWeekDates();
        const weekScore = this.user.getAllGoals().reduce((total, goal) => 
            total + goal.getScore(dates[0], dates[6]), 0);
        document.getElementById('week-score').textContent = weekScore;
    
        const streaks = await this.updateStreaks();
        document.getElementById('current-streak').textContent = `${streaks.current} days`;
        document.getElementById('best-streak').textContent = `${streaks.best} days`;
    }

    renderDaysHeader() {
        const headerRow = document.getElementById('days-header');
        headerRow.innerHTML = '<th class="goal-column">Goals</th>';
        
        const dates = this.getWeekDates();
        dates.forEach(dateStr => {
            const th = document.createElement('th');
            const date = new Date(dateStr + 'T00:00:00'); // Force UTC timezone
            th.innerHTML = `
                <div>${this.days[date.getDay()]}</div>
                <div class="text-xs text-gray-500">${date.getMonth() + 1}/${date.getDate()}</div>
            `;
            headerRow.appendChild(th);
        });
    }

    initializeLucideIcons() {
        lucide.createIcons();
    }

    async calculateDailyScore(date) {
        return this.user.getAllGoals().reduce((score, goal) => 
            score + (goal.isChecked(date) ? goal.points : 0), 0);
    }
}