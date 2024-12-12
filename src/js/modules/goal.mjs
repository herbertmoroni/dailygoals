export class Goal {
    constructor(id, name, icon, positive, points) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.positive = positive;
        this.points = points;
        this.checks = new Array(7).fill(false);
    }

    toggle(dayIndex) {
        this.checks[dayIndex] = !this.checks[dayIndex];
    }

    getScore() {
        return this.checks.reduce((score, checked) => 
            score + (checked ? this.points : 0), 0);
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            icon: this.icon,
            positive: this.positive,
            points: this.points,
            checks: this.checks
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
        goal.checks = data.checks;
        return goal;
    }
}