import {
  db,
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  buildCreateAudit,
  buildUpdateAudit,
  handleFirestoreError,
  OperationType,
} from './firebase';

export interface TaskSubtaskRecord {
  id: string;
  taskId: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  assignedTo: string;
  assignedToUid?: string;
  progress: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface TaskRecord {
  id: string;
  taskId?: string;
  title: string;
  description?: string;
  token: string;
  taskType?: string;
  category?: string;
  department?: string;
  section?: string;
  space?: string;
  assignee: string;
  assignedTo?: string;
  assignedToUid?: string;
  assignedBy?: string;
  assignedByUid?: string;
  qaLead?: string;
  qaLeadUid?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';
  status: 'IN PROGRESS' | 'COMPLETED' | 'ON HOLD' | 'TODO' | 'CANCELLED';
  progressDone: number;
  progressTotal: number;
  progress?: number;
  startDate?: string;
  deadline: string;
  dueDate?: string;
  completedDate?: string;
  isCritical?: boolean;
  isOverdue?: boolean;
  daysLate?: number;
  subtaskCount?: number;
  completedSubtaskCount?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  createdByEmail?: string;
  updatedByEmail?: string;
}

const TASKS_COLLECTION = 'tasks';

export const DEFAULT_TASKS_FALLBACK: TaskRecord[] = [
  {
    id: 't-1',
    taskId: 'MMSC-003796-A14',
    title: 'M32LU3FGQ MP software check',
    token: 'MMSC-003796-A14',
    assignee: '38949',
    assignedTo: '38949',
    qaLead: 'Atiqur Rahman',
    priority: 'HIGH',
    status: 'IN PROGRESS',
    progressDone: 0,
    progressTotal: 277,
    deadline: 'Sep 1',
    dueDate: '2026-09-01',
    isOverdue: true,
    isCritical: true,
    daysLate: 12,
    space: 'SMT in PCBA-2023',
    department: 'PCBA',
    category: 'Software Validation',
  },
  {
    id: 't-2',
    taskId: 'NE4TW-174487-E67',
    title: 'New Expressluck 43inch TV with 1.5GB RAM',
    token: 'NE4TW-174487-E67',
    assignee: 'task_manager1',
    assignedTo: 'task_manager1',
    qaLead: 'Atiqur Rahman',
    priority: 'MEDIUM',
    status: 'IN PROGRESS',
    progressDone: 0,
    progressTotal: 0,
    deadline: 'Sep 9',
    dueDate: '2026-09-09',
    isOverdue: true,
    daysLate: 4,
    space: 'SMT in PCBA-2023',
    department: 'PCBA',
    category: 'Trial Production',
  },
  {
    id: 't-3',
    taskId: 'W(RC-845987-685',
    title: 'WGRC-04 (HKC) Remote Check',
    token: 'W(RC-845987-685',
    assignee: '38949',
    assignedTo: '38949',
    qaLead: 'Atiqur Rahman',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    progressDone: 0,
    progressTotal: 0,
    deadline: 'Sep 8',
    dueDate: '2026-09-08',
    completedDate: '2026-09-08',
    space: 'SMT in PCBA-2023',
    department: 'PCBA',
    category: 'Peripheral Quality',
  },
  {
    id: 't-4',
    taskId: 'MMSC-752975-21A',
    title: 'MARCEL M43LU3UGQ Software check',
    token: 'MMSC-752975-21A',
    assignee: '38949',
    assignedTo: '38949',
    qaLead: 'Atiqur Rahman',
    priority: 'HIGH',
    status: 'COMPLETED',
    progressDone: 277,
    progressTotal: 277,
    deadline: 'Sep 7',
    dueDate: '2026-09-07',
    completedDate: '2026-09-07',
    space: 'SMT in PCBA-2023',
    department: 'PCBA',
    category: 'Software Validation',
  },
  {
    id: 't-5',
    taskId: 'ACIGT-756875-581',
    title: 'App checking in Google TV',
    token: 'ACIGT-756875-581',
    assignee: '38949',
    assignedTo: '38949',
    qaLead: 'Atiqur Rahman',
    priority: 'HIGH',
    status: 'COMPLETED',
    progressDone: 0,
    progressTotal: 0,
    deadline: 'Sep 7',
    dueDate: '2026-09-07',
    completedDate: '2026-09-07',
    space: 'SMT in PCBA-2023',
    department: 'PCBA',
    category: 'App Integration',
  },
  {
    id: 't-6',
    taskId: 'RNWCI-577851-B09',
    title: 'Remote not working check in W55G5Y Check',
    token: 'RNWCI-577851-B09',
    assignee: 'task_manager1',
    assignedTo: 'task_manager1',
    qaLead: 'Atiqur Rahman',
    priority: 'HIGH',
    status: 'COMPLETED',
    progressDone: 0,
    progressTotal: 0,
    deadline: 'Sep 5',
    dueDate: '2026-09-05',
    completedDate: '2026-09-05',
    space: 'SMT in PCBA-2023',
    department: 'PCBA',
    category: 'Process Fault',
  },
  {
    id: 't-7',
    taskId: 'SCOW&-174325-3A0',
    title: 'Software Checking of W55SA3UGQ & M55LU3UGQ',
    token: 'SCOW&-174325-3A0',
    assignee: 'task_manager1',
    assignedTo: 'task_manager1',
    qaLead: 'Atiqur Rahman',
    priority: 'HIGH',
    status: 'IN PROGRESS',
    progressDone: 0,
    progressTotal: 0,
    deadline: 'Sep 2',
    dueDate: '2026-09-02',
    isOverdue: true,
    isCritical: true,
    daysLate: 11,
    space: 'SMT in PCBA-2023',
    department: 'PCBA',
    category: 'Software Validation',
  },
  {
    id: 't-8',
    taskId: 'MMSC-002704-B43',
    title: 'M40LU3FGQ MP software check.',
    token: 'MMSC-002704-B43',
    assignee: '38949',
    assignedTo: '38949',
    qaLead: 'Atiqur Rahman',
    priority: 'HIGH',
    status: 'COMPLETED',
    progressDone: 277,
    progressTotal: 280,
    deadline: 'Aug 31',
    dueDate: '2026-08-31',
    completedDate: '2026-08-31',
    space: 'SMT in PCBA-2023',
    department: 'PCBA',
    category: 'Software Validation',
  },
  {
    id: 't-16',
    taskId: 'NSCST-019284-912',
    title: 'NEW Software check of sample TV(32KA1Q-Expressluck)',
    token: 'NSCST-019284-912',
    assignee: '38949',
    assignedTo: '38949',
    qaLead: 'Atiqur Rahman',
    priority: 'HIGH',
    status: 'ON HOLD',
    progressDone: 45,
    progressTotal: 277,
    deadline: 'Jan 15',
    dueDate: '2026-01-15',
    isOverdue: true,
    daysLate: 241,
    space: 'SMT in PCBA-2023',
    department: 'PCBA',
    category: 'Trial Production',
  },
  {
    id: 't-17',
    taskId: 'BGA-CS-2026-09A',
    title: 'BGA Solder Joint Cross-Section Voiding Check (SMT-1 Line)',
    token: 'BGA-CS-2026-09A',
    assignee: 'QM-Inspector-02',
    assignedTo: 'QM-Inspector-02',
    qaLead: 'Atiqur Rahman',
    priority: 'HIGH',
    status: 'IN PROGRESS',
    progressDone: 14,
    progressTotal: 20,
    deadline: 'Sep 13',
    dueDate: '2026-09-13',
    space: 'SMT in PCBA-2023',
    department: 'PCBA',
    category: 'Process Fault',
  },
];

export async function createTask(
  task: Omit<TaskRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
): Promise<TaskRecord> {
  const audit = buildCreateAudit();
  const payload = {
    ...task,
    taskId: task.taskId || task.token,
    assignedTo: task.assignedTo || task.assignee,
    subtaskCount: task.progressTotal || 0,
    completedSubtaskCount: task.progressDone || 0,
    progress:
      task.progressTotal > 0
        ? Math.round((task.progressDone / task.progressTotal) * 100)
        : task.status === 'COMPLETED'
        ? 100
        : 0,
    ...audit,
  };

  try {
    const docRef = await addDoc(collection(db, TASKS_COLLECTION), payload);
    return {
      ...payload,
      id: docRef.id,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, TASKS_COLLECTION);
  }
}

export async function updateTask(
  id: string,
  updates: Partial<Omit<TaskRecord, 'id' | 'createdAt' | 'createdBy'>>
): Promise<void> {
  const path = `${TASKS_COLLECTION}/${id}`;
  const audit = buildUpdateAudit();
  const payload: Record<string, any> = {
    ...updates,
    ...audit,
  };

  if (updates.progressDone !== undefined || updates.progressTotal !== undefined) {
    if (updates.progressDone !== undefined) payload.completedSubtaskCount = updates.progressDone;
    if (updates.progressTotal !== undefined) payload.subtaskCount = updates.progressTotal;
  }

  try {
    await setDoc(doc(db, TASKS_COLLECTION, id), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTask(id: string): Promise<void> {
  const path = `${TASKS_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, TASKS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getTasks(): Promise<TaskRecord[]> {
  try {
    const snap = await getDocs(collection(db, TASKS_COLLECTION));
    const list: TaskRecord[] = [];
    snap.forEach((d) => {
      list.push({
        ...(d.data() as TaskRecord),
        id: d.id,
      });
    });
    list.sort((a, b) => ((b.createdAt || '') > (a.createdAt || '') ? 1 : -1));
    return list;
  } catch (error) {
    console.warn('Could not fetch tasks from Firestore:', error);
    return [];
  }
}

export function subscribeTasks(
  onData: (tasks: TaskRecord[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    return onSnapshot(
      collection(db, TASKS_COLLECTION),
      (snap) => {
        const list: TaskRecord[] = [];
        snap.forEach((d) => {
          list.push({
            ...(d.data() as TaskRecord),
            id: d.id,
          });
        });
        list.sort((a, b) => ((b.createdAt || '') > (a.createdAt || '') ? 1 : -1));
        onData(list);
      },
      (err) => {
        console.warn('Task subscription notice:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    if (onError) onError(err);
    return () => {};
  }
}

// Subtasks CRUD under tasks/{taskId}/subtasks/{subtaskId}
export async function addTaskSubtask(
  taskId: string,
  subtask: { title: string; assignedTo?: string; description?: string }
): Promise<TaskSubtaskRecord> {
  const path = `${TASKS_COLLECTION}/${taskId}/subtasks`;
  const audit = buildCreateAudit();
  const payload = {
    taskId,
    title: subtask.title.trim(),
    description: subtask.description || '',
    status: 'TODO' as const,
    assignedTo: subtask.assignedTo || '38949',
    progress: 0,
    ...audit,
  };

  try {
    const docRef = await addDoc(collection(db, TASKS_COLLECTION, taskId, 'subtasks'), payload);
    return {
      ...payload,
      id: docRef.id,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateTaskSubtask(
  taskId: string,
  subtaskId: string,
  updates: Partial<Pick<TaskSubtaskRecord, 'title' | 'status' | 'progress' | 'assignedTo' | 'completedAt'>>
): Promise<void> {
  const path = `${TASKS_COLLECTION}/${taskId}/subtasks/${subtaskId}`;
  const audit = buildUpdateAudit();
  try {
    await updateDoc(doc(db, TASKS_COLLECTION, taskId, 'subtasks', subtaskId), {
      ...updates,
      ...audit,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTaskSubtask(taskId: string, subtaskId: string): Promise<void> {
  const path = `${TASKS_COLLECTION}/${taskId}/subtasks/${subtaskId}`;
  try {
    await deleteDoc(doc(db, TASKS_COLLECTION, taskId, 'subtasks', subtaskId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeTaskSubtasks(
  taskId: string,
  onData: (subtasks: TaskSubtaskRecord[]) => void
): () => void {
  try {
    return onSnapshot(
      collection(db, TASKS_COLLECTION, taskId, 'subtasks'),
      (snap) => {
        const list: TaskSubtaskRecord[] = [];
        snap.forEach((d) => {
          list.push({
            ...(d.data() as TaskSubtaskRecord),
            id: d.id,
          });
        });
        list.sort((a, b) => ((a.createdAt || '') > (b.createdAt || '') ? 1 : -1));
        onData(list);
      },
      (err) => {
        console.warn('Subtasks subscription notice:', err);
      }
    );
  } catch {
    return () => {};
  }
}
