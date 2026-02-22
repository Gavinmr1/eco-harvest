import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

type UserData = {
  subscriptionPlan?: string | null;
  preferences?: string[];
  boxSize?: string;
};

export const getUserData = async (userId: string) => {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserData) : null;
};

export const updateUserData = async (userId: string, data: Partial<UserData>) => {
  const ref = doc(db, "users", userId);
  await setDoc(ref, data, { merge: true });
};
