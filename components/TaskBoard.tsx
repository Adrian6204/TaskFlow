
import React from 'react';
import { Task, Employee, TaskStatus } from '../types';
import { TASK_STATUSES } from '../constants';
import TaskColumn from './TaskColumn';

interface TaskBoardProps {
  tasks: Task[];
  allTasks: Task[]; // For dependency checking
  employees: Employee[];
  onEditTask: (task: Task) => void;
  onDeleteTask?: (taskId: number) => void;
  onUpdateTaskStatus: (taskId: number, newStatus: TaskStatus) => void;
  onViewTask: (task: Task) => void;
  onToggleTimer: (taskId: number) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, allTasks, employees, onEditTask, onDeleteTask, onUpdateTaskStatus, onViewTask, onToggleTimer }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {TASK_STATUSES.map(status => (
        <TaskColumn
          key={status}
          status={status}
          tasks={tasks.filter(task => task.status === status)}
          allTasks={allTasks}
          employees={employees}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onUpdateTaskStatus={onUpdateTaskStatus}
          onViewTask={onViewTask}
          onToggleTimer={onToggleTimer}
        />
      ))}
    </div>
  );
};

export default TaskBoard;
