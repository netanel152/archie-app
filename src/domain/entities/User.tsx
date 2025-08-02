import { auth, db } from '../../infrastructure/integrations/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';

export interface UserData {
  id: string;
  email?: string | null;
  language_preference?: 'en' | 'he';
}

const me = (): Promise<UserData> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      unsubscribe();
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          const userData: UserData = {
            id: user.uid,
            email: data.email || null,
            language_preference: data.language_preference === 'he' ? 'he' : 'en',
          };
          resolve(userData);
        } else {
          const newUser: Omit<UserData, 'id'> = {
            email: user.email,
            language_preference: 'en'
          };
          await setDoc(userDocRef, newUser);
          resolve({ id: user.uid, ...newUser });
        }
      } else {
        reject(new Error("User not authenticated"));
      }
    });
  });
};

const updateMyUserData = async (data: Partial<Omit<UserData, 'id'>>): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is currently signed in.");
  }
  const userDocRef = doc(db, 'users', user.uid);
  await updateDoc(userDocRef, data);
};

export const User = {
  me,
  updateMyUserData,
};