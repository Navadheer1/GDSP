import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './config';
import { WriterDocument } from '@/types/writer';

/**
 * Creates a new document in the user's personal documents subcollection:
 * users/{userId}/documents/{documentId}
 */
export async function createDocument(
  userId: string,
  initialData: Omit<WriterDocument, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<WriterDocument> {
  if (!userId) {
    throw new Error('User ID is required to create a document in the database.');
  }

  const now = Date.now();
  const docsRef = collection(db, 'users', userId, 'documents');
  const docRef = await addDoc(docsRef, {
    ...initialData,
    userId,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: docRef.id,
    userId,
    createdAt: now,
    updatedAt: now,
    ...initialData,
  };
}

/**
 * Updates an existing document with content, title, and metadata.
 */
export async function updateDocument(
  userId: string,
  documentId: string,
  updates: Partial<Omit<WriterDocument, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  if (!userId || !documentId) {
    throw new Error('User ID and Document ID are required for updating.');
  }

  const docRef = doc(db, 'users', userId, 'documents', documentId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Date.now(),
  });
}

/**
 * Retrieves the user's documents sorted by last modified (newest first).
 */
export async function getUserDocuments(
  userId: string,
  maxDocs: number = 50
): Promise<WriterDocument[]> {
  if (!userId) return [];

  const docsRef = collection(db, 'users', userId, 'documents');
  const q = query(docsRef, orderBy('updatedAt', 'desc'), limit(maxDocs));
  const snapshot = await getDocs(q);

  const docs: WriterDocument[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    docs.push({
      id: docSnap.id,
      userId: data.userId || userId,
      title: data.title || 'Untitled Document',
      content: data.content || '',
      plainText: data.plainText || '',
      documentType: data.documentType || 'general',
      wordCount: typeof data.wordCount === 'number' ? data.wordCount : 0,
      characterCount: typeof data.characterCount === 'number' ? data.characterCount : 0,
      createdAt: data.createdAt || Date.now(),
      updatedAt: data.updatedAt || Date.now(),
    });
  });

  return docs;
}

/**
 * Fetches a single document by ID, ensuring user ownership.
 */
export async function getDocumentById(
  userId: string,
  documentId: string
): Promise<WriterDocument | null> {
  if (!userId || !documentId) return null;

  const docRef = doc(db, 'users', userId, 'documents', documentId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  if (data.userId && data.userId !== userId) {
    throw new Error('Access denied: You do not own this document.');
  }

  return {
    id: docSnap.id,
    userId: data.userId || userId,
    title: data.title || 'Untitled Document',
    content: data.content || '',
    plainText: data.plainText || '',
    documentType: data.documentType || 'general',
    wordCount: data.wordCount || 0,
    characterCount: data.characterCount || 0,
    createdAt: data.createdAt || Date.now(),
    updatedAt: data.updatedAt || Date.now(),
  };
}

/**
 * Deletes a document from the user's collection.
 */
export async function deleteDocument(userId: string, documentId: string): Promise<void> {
  if (!userId || !documentId) return;
  const docRef = doc(db, 'users', userId, 'documents', documentId);
  await deleteDoc(docRef);
}

/**
 * Local draft recovery storage utilities.
 * Keeps an in-browser recovery copy in case of sudden reload or unauthenticated editing.
 */
const RECOVERY_KEY_PREFIX = 'writer_draft_recovery_';

export function saveLocalRecoveryDraft(docId: string, data: Partial<WriterDocument>) {
  if (typeof window === 'undefined') return;
  try {
    const key = `${RECOVERY_KEY_PREFIX}${docId}`;
    localStorage.setItem(key, JSON.stringify({ ...data, savedAt: Date.now() }));
  } catch (err) {
    console.warn('Could not save local recovery draft:', err);
  }
}

export function getLocalRecoveryDraft(docId: string): (Partial<WriterDocument> & { savedAt: number }) | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${RECOVERY_KEY_PREFIX}${docId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearLocalRecoveryDraft(docId: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${RECOVERY_KEY_PREFIX}${docId}`);
  } catch {}
}
