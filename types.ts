
export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
}

export interface Employee {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Comment {
  id: number;
  authorId: string;
  content: string;
  timestamp: string; // ISO 8601 string
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface TimeLogEntry {
  id: string;
  startTime: string; // ISO 8601 string
  endTime: string; // ISO 8601 string
  duration: number; // milliseconds
}

export interface Task {
  id: number;
  title: string;
  description: string;
  assigneeId: string;
  dueDate: string; // YYYY-MM-DD
  status: TaskStatus;
  priority: Priority;
  comments: Comment[];
  subtasks: Subtask[];
  tags: string[];
  timeLogs: TimeLogEntry[];
  timerStartTime?: string | null; // ISO 8601 string if timer is running, null otherwise
  createdAt: string; // ISO 8601 string
  completedAt?: string | null; // ISO 8601 string
  blockedById?: number | null;
}

export type Role = 'user' | 'admin';

export interface User {
  username: string; // Will be the employee's full name
  role: Role;
  employeeId: string;
}

export interface ActivityLog {
  id: number;
  timestamp: string; // ISO 8601 string
  message: string;
  user: {
    name: string;
    avatarUrl: string;
  }
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}
