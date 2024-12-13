export class Goal {
    constructor(id, name, icon, positive, points) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.positive = positive;
        this.points = points;
        this.dailyChecks = {};
    }

    toggle(dateString) {
        this.dailyChecks[dateString] = !this.dailyChecks[dateString];
    }

    isChecked(dateString) {
        return !!this.dailyChecks[dateString];
    }

    getScore(startDate, endDate) {
        let score = 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            if (this.dailyChecks[dateStr]) {
                score += this.points;
            }
        }
        return score;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            icon: this.icon,
            positive: this.positive,
            points: this.points,
            dailyChecks: this.dailyChecks
        };
    }

    static fromJSON(data) {
        const goal = new Goal(
            data.id,
            data.name,
            data.icon,
            data.positive,
            data.points
        );
        goal.dailyChecks = data.dailyChecks || {};
        return goal;
    }
}