import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './config';
import { SavedHistoryItem } from '@/types';

/**
 * Saves a rewritten text session to the user's personal history subcollection:
 * users/{userId}/history/{historyId}
 */
export async function saveRewriteHistory(
  userId: string,
  item: Omit<SavedHistoryItem, 'id' | 'userId' | 'createdAt'>
): Promise<string> {
  if (!userId) throw new Error('User ID is required to save history.');

  const historyRef = collection(db, 'users', userId, 'history');
  const docRef = await addDoc(historyRef, {
    ...item,
    userId,
    createdAt: Date.now(),
  });

  return docRef.id;
}

/**
 * Retrieves the current user's rewrite history, sorted by newest first
 */
export async function getUserHistory(userId: string, maxItems: number = 20): Promise<SavedHistoryItem[]> {
  if (!userId) return [];

  const historyRef = collection(db, 'users', userId, 'history');
  const q = query(historyRef, orderBy('createdAt', 'desc'), limit(maxItems));
  const snapshot = await getDocs(q);

  const results: SavedHistoryItem[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    results.push({
      id: docSnap.id,
      userId: data.userId || userId,
      originalText: data.originalText,
      humanizedText: data.humanizedText,
      context: data.context,
      tone: data.tone,
      verificationStatus: data.verificationStatus || 'passed',
      verificationScore: data.verificationScore || 100,
      createdAt: data.createdAt || Date.now(),
    });
  });

  return results;
}

/**
 * Deletes an item from the user's history
 */
export async function deleteHistoryItem(userId: string, historyId: string): Promise<void> {
  if (!userId || !historyId) return;
  const docRef = doc(db, 'users', userId, 'history', historyId);
  await deleteDoc(docRef);
}
