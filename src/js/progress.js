import { auth, db } from './modules/auth.mjs';
import { GoalStorage } from './modules/goalStorage.mjs';
import { User } from './modules/user.mjs';
import { demoGoals } from './modules/demoData.mjs';
import { ProgressView } from './modules/progressView.mjs';
import { Menu } from './modules/menu.mjs';
import { Goal } from './modules/goal.mjs';


class ProgressUI {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.storage = new GoalStorage(db, auth);
        this.progressView = new ProgressView();
        this.goals = [];
    }

    createSvgElement(tag, attributes = {}) {
        const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        return element;
    }

    renderGraph(goal) {
        const width = 800;
        const height = 300;
        const padding = { top: 20, right: 30, bottom: 30, left: 40 };

        const svg = this.createSvgElement('svg', {
            width,
            height,
            class: 'w-full h-auto'
        });

        // Get progress data
        const data = this.progressView.calculateProgress(goal);

        // Create path for the line
        const linePath = this.progressView.generateSvgPath(data, width, height, padding);
        const path = this.createSvgElement('path', {
            d: linePath,
            stroke: goal.positive ? '#059669' : '#ef4444',
            'stroke-width': '2',
            fill: 'none'
        });

        svg.appendChild(path);

        // Add axes
        const xAxis = this.createSvgElement('line', {
            x1: padding.left,
            y1: padding.top + height - padding.top - padding.bottom,
            x2: padding.left + width - padding.left - padding.right,
            y2: padding.top + height - padding.top - padding.bottom,
            stroke: '#d1d5db'
        });

        const yAxis = this.createSvgElement('line', {
            x1: padding.left,
            y1: padding.top,
            x2: padding.left,
            y2: padding.top + height - padding.top - padding.bottom,
            stroke: '#d1d5db'
        });

        svg.appendChild(xAxis);
        svg.appendChild(yAxis);

        return svg;
    }

    createGoalCard(goal) {
        const card = document.createElement('div');
        card.className = 'progress-card';
        
        const header = document.createElement('div');
        header.className = 'progress-header';
        header.innerHTML = `
            <span class="goal-icon">${goal.icon}</span>
            <h3>${goal.name}</h3>
        `;
        
        card.appendChild(header);
        card.appendChild(this.renderGraph(goal));
        return card;
    }

    render() {
        this.container.innerHTML = `
            <div class="timeframe-buttons">
                <button class="${this.progressView.timeframe === 'week' ? 'active' : ''}" data-timeframe="week">Week</button>
                <button class="${this.progressView.timeframe === 'month' ? 'active' : ''}" data-timeframe="month">Month</button>
                <button class="${this.progressView.timeframe === 'year' ? 'active' : ''}" data-timeframe="year">Year</button>
            </div>
            <div id="graphs-container"></div>
        `;

        const graphsContainer = document.getElementById('graphs-container');
        this.goals.forEach(goal => {
            graphsContainer.appendChild(this.createGoalCard(goal));
        });

        // Add event listeners for timeframe buttons
        const buttons = this.container.querySelectorAll('.timeframe-buttons button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                this.progressView.timeframe = button.dataset.timeframe;
                this.render();
            });
        });
    }

    initialize(goals) {
        this.goals = goals;
        this.render();
    }
}

// Initialize the progress view
document.addEventListener('DOMContentLoaded', () => {
    new Menu();
    const progressUI = new ProgressUI('progress-container');
    
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const storage = new GoalStorage(db, auth);
            const userData = await storage.loadUserData(user.uid);
            progressUI.initialize(userData.getAllGoals());
        } else {
            const demoUser = new User('demo', 'Demo User', null);
            demoGoals.forEach(data => {
                const goal = Goal.fromJSON(data);
                demoUser.addGoal(goal);
            });
            progressUI.initialize(demoUser.getAllGoals());
        }
    });
   
});

