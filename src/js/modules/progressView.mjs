export class ProgressView {
    constructor() {
        this.timeframe = 'month';
    }

    getDateRange() {
        const end = new Date();
        const start = new Date();
        
        switch(this.timeframe) {
            case 'week':
                start.setDate(end.getDate() - 7);
                break;
            case 'month':
                start.setMonth(end.getMonth() - 1);
                break;
            case 'year':
                start.setFullYear(end.getFullYear() - 1);
                break;
        }
        
        return {
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0]
        };
    }

    calculateProgress(goal) {
        const { startDate, endDate } = this.getDateRange();
        const dates = [];
        const current = new Date(startDate);
        const end = new Date(endDate);

        while (current <= end) {
            dates.push({
                date: current.toISOString().split('T')[0],
                completed: goal.isChecked(current.toISOString().split('T')[0])
            });
            current.setDate(current.getDate() + 1);
        }

        // Calculate 7-day moving average
        return dates.map((_, index, arr) => {
            if (index < 6) return null;
            const window = arr.slice(index - 6, index + 1);
            const completed = window.filter(d => d.completed).length;
            return {
                date: arr[index].date,
                value: (completed / 7) * 100
            };
        }).filter(Boolean);
    }

    generateSvgPath(data, width, height, padding) {
        const graphWidth = width - padding.left - padding.right;
        const graphHeight = height - padding.top - padding.bottom;
        const { startDate, endDate } = this.getDateRange();

        const xScale = (date) => {
            const start = new Date(startDate);
            const current = new Date(date);
            const days = (current - start) / (24 * 60 * 60 * 1000);
            return (days * graphWidth) / ((new Date(endDate) - start) / (24 * 60 * 60 * 1000));
        };

        const yScale = (value) => {
            return graphHeight - (value * graphHeight) / 100;
        };

        return data.map((point, i) => {
            const x = xScale(point.date) + padding.left;
            const y = yScale(point.value) + padding.top;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');
    }
}