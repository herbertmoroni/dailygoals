import { Goal } from './goal.mjs';
import { User } from './user.mjs';
import { demoGoals } from './demoData.mjs';
import { 
    doc, 
    getDoc, 
    setDoc, 
    collection, 
    getDocs 
} from 'firebase/firestore';

export class GoalStorage {
    constructor(db, auth) {
        this.db = db;
        this.auth = auth;
    }

    async loadUserData(uid) {
        if (!this.auth.currentUser || this.auth.currentUser.uid !== uid) {
            throw new Error('Unauthorized access');
        }

        const userDoc = await getDoc(doc(this.db, 'users', uid));
        if (!userDoc.exists()) {
            await this.initializeNewUser(uid);
            return this.loadUserData(uid);
        }

        const userData = userDoc.data();
        const user = new User(uid, userData.displayName, userData.email);

        const goalsSnapshot = await getDocs(
            collection(this.db, 'users', uid, 'goals')
        );

        goalsSnapshot.forEach(doc => {
            const goalData = doc.data();
            const goal = Goal.fromJSON({ id: doc.id, ...goalData });
            user.addGoal(goal);
        });

        return user;
    }

    async initializeNewUser(uid) {
        const userData = {
            displayName: this.auth.currentUser.displayName,
            email: this.auth.currentUser.email,
            createdAt: new Date()
        };

        await setDoc(doc(this.db, 'users', uid), userData);

        const goalsCollection = collection(this.db, 'users', uid, 'goals');
        for (const demoGoal of demoGoals) {
            const { id, ...goalData } = demoGoal;
            await setDoc(doc(goalsCollection), goalData);
        }
    }

    async saveGoal(uid, goal) {
        if (!this.auth.currentUser || this.auth.currentUser.uid !== uid) {
            throw new Error('Unauthorized access');
        }

        await setDoc(
            doc(this.db, 'users', uid, 'goals', goal.id),
            goal.toJSON()
        );
        console.log('Goal saved:', goal.toJSON());
    }
}