import { db, auth } from '../../infrastructure/integrations/firebase';
import { dbLogger } from '../../application/services/logger';
import {
  collection,
  query,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

export interface ItemData {
  id: string;
  product_name: string;
  product_model?: string;
  store_name?: string;
  purchase_date?: string;
  total_price?: number;
  currency?: string;
  warranty_period?: string;
  warranty_expiration_date?: string;
  category?: string;
  receipt_image_url?: string;
  manual_url?: string;
  user_notes?: string;
  processing_status: "processing" | "completed" | "failed";
  created_date?: Timestamp;
}

const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user is currently signed in.");
  return user.uid;
};

const list = async (sort: string = "created_date"): Promise<ItemData[]> => {
  const userId = getCurrentUserId();
  dbLogger.info({ userId, sort }, "Fetching item list.");
  const itemsCollectionRef = collection(db, `users/${userId}/items`);
  const sortDirection = sort.startsWith('-') ? 'desc' : 'asc';
  const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
  const q = query(itemsCollectionRef, orderBy(sortField, sortDirection));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ItemData));
};

const create = async (data: Partial<Omit<ItemData, 'id'>>): Promise<string> => {
  const userId = getCurrentUserId();
  dbLogger.info({ userId, data }, "Creating new item.");
  const itemsCollectionRef = collection(db, `users/${userId}/items`);
  const docRef = await addDoc(itemsCollectionRef, {
    ...data,
    created_date: Timestamp.now(),
  });
  dbLogger.info({ userId, itemId: docRef.id }, "Successfully created new item.");
  return docRef.id; // Return the new document's ID
};

const update = async (id: string, data: Partial<ItemData>): Promise<void> => {
  const userId = getCurrentUserId();
  dbLogger.info({ userId, itemId: id, data }, "Updating item.");
  const itemDocRef = doc(db, `users/${userId}/items`, id);
  await updateDoc(itemDocRef, data);
};

const deleteItem = async (id: string): Promise<void> => {
  const userId = getCurrentUserId();
  const itemDocRef = doc(db, `users/${userId}/items`, id);
  await deleteDoc(itemDocRef);
};

export const Item = {
  list,
  create,
  update,
  delete: deleteItem
};