export const demoGoals = [
    { 
        id: '1', 
        name: 'Exercise', 
        icon: '🏃', 
        positive: true, 
        points: 1,
        dailyChecks: {
            [getWeekDates()[0]]: true,
            [getWeekDates()[2]]: true,
            [getWeekDates()[4]]: true,
            [getWeekDates()[5]]: true
        }
    },
    {
        id: '2',
        name: 'Read',
        icon: '📚',
        positive: true,
        points: 1,
        dailyChecks: {
            [getWeekDates()[0]]: true,
            [getWeekDates()[1]]: true,
            [getWeekDates()[3]]: true,
            [getWeekDates()[5]]: true,
            [getWeekDates()[6]]: true
        }
    },
    {
        id: '3',
        name: 'Meditate',
        icon: '🧘',
        positive: true,
        points: 1,
        dailyChecks: {
            [getWeekDates()[1]]: true,
            [getWeekDates()[2]]: true,
            [getWeekDates()[3]]: true,
            [getWeekDates()[4]]: true
        }
    },
    {
        id: '4',
        name: 'Late Night Snack',
        icon: '🍪',
        positive: false,
        points: -1,
        dailyChecks: {
            [getWeekDates()[0]]: true,
            [getWeekDates()[3]]: true,
            [getWeekDates()[6]]: true
        }
    }
 ];
 
 function getWeekDates() {
    const today = new Date();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay());  // Go back to last Sunday
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(sunday);
        date.setDate(sunday.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
}