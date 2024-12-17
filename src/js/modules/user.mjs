export class User {
    constructor(uid, displayName, email) {
        this.uid = uid;
        this.displayName = displayName;
        this.email = email;
        this.goals = new Map();
    }

    addGoal(goal) {
        this.goals.set(goal.id, goal);
    }

    removeGoal(goalId) {
        this.goals.delete(goalId);
    }

    getGoal(goalId) {
        return this.goals.get(goalId);
    }

    getAllGoals() {
        return Array.from(this.goals.values())
            .sort((a, b) => a.order - b.order);
    }

    getWeekScore() {
        return Array.from(this.goals.values())
            .reduce((total, goal) => total + goal.getScore(), 0);
    }
}