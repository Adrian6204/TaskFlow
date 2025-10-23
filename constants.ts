

import { Task, Employee, TaskStatus, Priority } from './types';

export const EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: 'Alice Johnson', avatarUrl: 'https://picsum.photos/seed/alice/40/40' },
  { id: 'emp-2', name: 'Bob Williams', avatarUrl: 'https://picsum.photos/seed/bob/40/40' },
  { id: 'emp-3', name: 'Charlie Brown', avatarUrl: 'https://picsum.photos/seed/charlie/40/40' },
  { id: 'emp-4', name: 'Diana Miller', avatarUrl: 'https://picsum.photos/seed/diana/40/40' },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 1,
    title: 'Design new landing page mockup',
    description: 'Create a high-fidelity mockup in Figma based on the new brand guidelines. Include mobile and desktop versions.',
    assigneeId: 'emp-1',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: TaskStatus.TODO,
    priority: Priority.HIGH,
    comments: [],
  },
  {
    id: 2,
    title: 'Develop API for user authentication',
    description: 'Set up JWT-based authentication endpoints: /login, /register, /logout. Use bcrypt for password hashing.',
    assigneeId: 'emp-2',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: TaskStatus.IN_PROGRESS,
    priority: Priority.URGENT,
    comments: [],
  },
  {
    id: 3,
    title: 'Write blog post about Q3 results',
    description: 'Draft a 1000-word blog post summarizing the key achievements and financial results from the third quarter.',
    assigneeId: 'emp-3',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: TaskStatus.DONE,
    priority: Priority.MEDIUM,
    comments: [],
  },
  {
    id: 4,
    title: 'Fix bug in payment processing',
    description: 'Users are reporting a 500 error when using PayPal. Investigate logs and resolve the issue.',
    assigneeId: 'emp-2',
    dueDate: new Date().toISOString().split('T')[0],
    status: TaskStatus.IN_PROGRESS,
    priority: Priority.URGENT,
    comments: [],
  },
  {
    id: 5,
    title: 'Plan team offsite event',
    description: 'Research venues, get quotes for catering, and create a schedule of activities for the annual team offsite.',
    assigneeId: 'emp-4',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: TaskStatus.TODO,
    priority: Priority.LOW,
    comments: [],
  },
];

export const TASK_STATUSES = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE];

export const PRIORITIES = [Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.URGENT];