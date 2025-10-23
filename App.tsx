import React, { useState } from 'react';
import { Task, TaskStatus, Employee, Priority, Comment } from './types';
import { INITIAL_TASKS, EMPLOYEES } from './constants';
import Header from './components/Header';
import TaskBoard from './components/TaskBoard';
import AddTaskModal from './components/AddTaskModal';
import GenerateTasksModal from './components/GenerateTasksModal';
import LoginPage from './components/LoginPage';
import { useAuth } from './auth/AuthContext';
import AdminDashboard from './components/AdminDashboard';
import TaskDetailsModal from './components/TaskDetailsModal';

const App: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [employees] = useState<Employee[]>(EMPLOYEES);
  const [isAddTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [isGenerateTaskModalOpen, setGenerateTaskModalOpen] = useState(false);
  const [isTaskDetailsModalOpen, setTaskDetailsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleOpenAddTaskModal = (task: Task | null = null) => {
    setTaskToEdit(task);
    setAddTaskModalOpen(true);
  };

  const handleCloseAddTaskModal = () => {
    setAddTaskModalOpen(false);
    setTaskToEdit(null);
  };

  const handleOpenGenerateTasksModal = () => {
    setGenerateTaskModalOpen(true);
  };

  const handleCloseGenerateTasksModal = () => {
    setGenerateTaskModalOpen(false);
  };

  const handleOpenTaskDetailsModal = (task: Task) => {
    setSelectedTask(task);
    setTaskDetailsModalOpen(true);
  };

  const handleCloseTaskDetailsModal = () => {
    setTaskDetailsModalOpen(false);
    setSelectedTask(null);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'status' | 'comments'>, id: number | null) => {
    if (id !== null) {
      setTasks(tasks.map(t => t.id === id ? { ...tasks.find(tsk => tsk.id === id)!, ...taskData } : t));
    } else {
      const newTask: Task = {
        id: Date.now(),
        status: TaskStatus.TODO,
        comments: [],
        ...taskData
      };
      setTasks([...tasks, newTask]);
    }
    handleCloseAddTaskModal();
  };
  
  const handleAddComment = (taskId: number, content: string) => {
    if (!user) return;
    const newComment: Comment = {
      id: Date.now(),
      authorId: user.employeeId,
      content,
      timestamp: new Date().toISOString(),
    };
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task, comments: [...task.comments, newComment] };
        if(selectedTask?.id === taskId) {
          setSelectedTask(updatedTask);
        }
        return updatedTask;
      }
      return task;
    });
    setTasks(updatedTasks);
  };


  const handleDeleteTask = (taskId: number) => {
    if (user?.role !== 'admin') {
      console.error("Permission denied: Only admins can delete tasks.");
      return;
    }
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleUpdateTaskStatus = (taskId: number, newStatus: TaskStatus) => {
    setTasks(tasks.map(task => task.id === taskId ? { ...task, status: newStatus } : task));
  };
  
  const addGeneratedTasks = (generatedTasks: Omit<Task, 'id' | 'status'>[]) => {
    const newTasks: Task[] = generatedTasks.map(task => ({
      ...task,
      id: Date.now() + Math.random(), // Add randomness to avoid collision
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM, // Default priority for generated tasks
      comments: [],
    }));
    setTasks(prevTasks => [...prevTasks, ...newTasks]);
  };

  if (!user) {
    return <LoginPage />;
  }

  const userTasks = tasks.filter(task => task.assigneeId === user.employeeId);

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200">
      <Header 
        onAddTask={() => handleOpenAddTaskModal()} 
        onGenerateTasks={handleOpenGenerateTasksModal} 
      />
      <main className="p-4 sm:p-6 lg:p-8">
        {user.role === 'admin' && (
          <AdminDashboard tasks={tasks} employees={employees} />
        )}
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">
          {user.role === 'admin' ? 'All Tasks' : 'My Tasks'}
        </h2>
        <TaskBoard
          tasks={user.role === 'admin' ? tasks : userTasks}
          employees={employees}
          onEditTask={handleOpenAddTaskModal}
          onDeleteTask={user.role === 'admin' ? handleDeleteTask : undefined}
          onUpdateTaskStatus={handleUpdateTaskStatus}
          onViewTask={handleOpenTaskDetailsModal}
        />
      </main>
      {isAddTaskModalOpen && (
        <AddTaskModal
          isOpen={isAddTaskModalOpen}
          onClose={handleCloseAddTaskModal}
          onSave={handleSaveTask}
          employees={employees}
          taskToEdit={taskToEdit}
        />
      )}
      {isGenerateTaskModalOpen && (
        <GenerateTasksModal 
          isOpen={isGenerateTaskModalOpen}
          onClose={handleCloseGenerateTasksModal}
          onTasksGenerated={addGeneratedTasks}
          employees={employees}
        />
      )}
      {isTaskDetailsModalOpen && selectedTask && (
        <TaskDetailsModal
          isOpen={isTaskDetailsModalOpen}
          onClose={handleCloseTaskDetailsModal}
          task={selectedTask}
          employees={employees}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
};

export default App;