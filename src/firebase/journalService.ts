import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth } from './config';
import { JournalEntry, ChatMessage, JournalSummary } from '../types';
import { sanitizeForFirestore } from '../utils/sanitizer';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Persists or updates a journal entry in the user's isolated subcollection:
 * /users/{userId}/journal_entries/{entryId}
 */
export async function saveJournalEntry(
  userId: string,
  entry: JournalEntry
): Promise<void> {
  if (!userId) throw new Error('User ID is required to persist journal entries.');
  if (!entry.id) throw new Error('Entry ID is required.');

  const entryPath = `users/${userId}/journal_entries/${entry.id}`;
  try {
    const entryRef = doc(db, 'users', userId, 'journal_entries', entry.id);
    const sanitized = sanitizeForFirestore({
      ...entry,
      userId,
      updatedAt: new Date().toISOString(),
    });

    await setDoc(entryRef, sanitized, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, entryPath);
  }

  // Also record interaction summary in interactions collection for logging & auditing
  const interactionPath = `users/${userId}/interactions/${entry.id}_${Date.now()}`;
  try {
    const interactionRef = doc(db, 'users', userId, 'interactions', `${entry.id}_${Date.now()}`);
    await setDoc(
      interactionRef,
      sanitizeForFirestore({
        entryId: entry.id,
        title: entry.title,
        messageCount: entry.messages.length,
        timestamp: new Date().toISOString(),
        hasSummary: !!entry.summary,
      }),
      { merge: true }
    );
  } catch (err) {
    console.warn('Non-blocking interaction log failed:', err);
  }
}

/**
 * Loads all journal entries for the authenticated user
 */
export async function loadUserJournalEntries(userId: string): Promise<JournalEntry[]> {
  if (!userId) return [];

  const path = `users/${userId}/journal_entries`;
  try {
    const entriesRef = collection(db, 'users', userId, 'journal_entries');
    const q = query(entriesRef, orderBy('updatedAt', 'desc'), limit(50));
    const snapshot = await getDocs(q);

    const entries: JournalEntry[] = [];
    snapshot.forEach((docSnap) => {
      entries.push(docSnap.data() as JournalEntry);
    });

    return entries;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Loads a single journal entry by ID
 */
export async function loadJournalEntry(
  userId: string,
  entryId: string
): Promise<JournalEntry | null> {
  if (!userId || !entryId) return null;

  const path = `users/${userId}/journal_entries/${entryId}`;
  try {
    const entryRef = doc(db, 'users', userId, 'journal_entries', entryId);
    const snap = await getDoc(entryRef);

    if (snap.exists()) {
      return snap.data() as JournalEntry;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Deletes a journal entry
 */
export async function deleteJournalEntry(
  userId: string,
  entryId: string
): Promise<void> {
  if (!userId || !entryId) throw new Error('Invalid user or entry ID');

  const path = `users/${userId}/journal_entries/${entryId}`;
  try {
    const entryRef = doc(db, 'users', userId, 'journal_entries', entryId);
    await deleteDoc(entryRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

