import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export const getUserData = async (userId: string) => {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};

export const updateUserData = async (userId: string, data: any) => {
  const ref = doc(db, "users", userId);
  await setDoc(ref, data, { merge: true });
};