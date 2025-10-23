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

export interface Task {
  id: number;
  title: string;
  description: string;
  assigneeId: string;
  dueDate: string; // YYYY-MM-DD
  status: TaskStatus;
  priority: Priority;
  comments: Comment[];
}

export type Role = 'user' | 'admin';

export interface User {
  username: string; // Will be the employee's full name
  role: Role;
  employeeId: string;
}