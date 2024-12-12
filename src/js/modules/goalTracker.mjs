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

        row.appendChild(this.createNameCell(goal));
        
        goal.checks.forEach((checked, idx) => {
            row.appendChild(this.createCheckCell(goal, checked, idx));
        });

        return row;
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