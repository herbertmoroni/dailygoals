class GoalTracker {
    constructor() {
        this.days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        this.goals = [
            { id: 1, name: 'Exercise', icon: '🏃', positive: true, points: 1, checks: [true, false, true, false, true, true, false] },
            { id: 2, name: 'Read', icon: '📚', positive: true, points: 1, checks: [true, true, false, true, false, true, true] },
            { id: 3, name: 'Meditate', icon: '🧘', positive: true, points: 1, checks: [false, true, true, true, true, false, false] },
            { id: 4, name: 'Late Night Snack', icon: '🍪', positive: false, points: -1, checks: [true, false, false, true, false, false, true] }
        ];

        this.initializeApp();
    }

    initializeApp() {
        this.initializeLucideIcons();
        this.renderDaysHeader();
        this.renderGoals();
        this.updateStats();
        this.renderDailyScores();
    }

    initializeLucideIcons() {
        lucide.createIcons();
    }

    renderDaysHeader() {
        const headerRow = document.getElementById('days-header');
        this.days.forEach(day => {
            const th = document.createElement('th');
            th.textContent = day;
            headerRow.appendChild(th);
        });
    }

    renderGoals() {
        const goalsList = document.getElementById('goals-list');
        goalsList.innerHTML = '';

        this.goals.forEach(goal => {
            const row = document.createElement('tr');
            row.className = 'goal-row';

            // Goal name cell
            const nameCell = document.createElement('td');
            nameCell.innerHTML = `
                <div class="goal-name">
                    <span class="goal-icon">${goal.icon}</span>
                    <span class="goal-text">${goal.name}</span>
                </div>
            `;

            row.appendChild(nameCell);

            // Check cells
            goal.checks.forEach((checked, idx) => {
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
                row.appendChild(cell);
            });

            goalsList.appendChild(row);
        });

        // Refresh Lucide icons after adding new elements
        lucide.createIcons();
    }

    toggleGoal(goalId, dayIndex) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            goal.checks[dayIndex] = !goal.checks[dayIndex];
            this.renderGoals();
            this.updateStats();
            this.renderDailyScores();
        }
    }

    getScoreForDay(dayIndex) {
        return this.goals.reduce((score, goal) => {
            return score + (goal.checks[dayIndex] ? goal.points : 0);
        }, 0);
    }

    renderDailyScores() {
        const scoresRow = document.getElementById('daily-scores');
        // Clear existing scores (except the label)
        while (scoresRow.children.length > 1) {
            scoresRow.removeChild(scoresRow.lastChild);
        }

        this.days.forEach((day, idx) => {
            const score = this.getScoreForDay(idx);
            const td = document.createElement('td');
            td.className = score > 0 ? 'score-positive' : 'score-negative';
            td.textContent = score > 0 ? `+${score}` : score;
            scoresRow.appendChild(td);
        });
    }

    updateStats() {
        // Update active goals count
        document.getElementById('active-goals-count').textContent = this.goals.length;

        // Calculate week score
        const weekScore = this.days.reduce((total, _, idx) => {
            return total + this.getScoreForDay(idx);
        }, 0);
        document.getElementById('week-score').textContent = weekScore > 0 ? `+${weekScore}` : weekScore;

        // For demo purposes, using static values for streaks
        // In a real app, these would be calculated based on historical data
        document.getElementById('current-streak').textContent = '5 days';
        document.getElementById('best-streak').textContent = '12 days';
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new GoalTracker();
});