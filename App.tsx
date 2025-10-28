import React, { useState, useMemo } from 'react';
import { Task, TaskStatus, Employee, Priority, Comment, ActivityLog } from './types';
import { INITIAL_TASKS, EMPLOYEES } from './constants';
import Header from './components/Header';
import TaskBoard from './components/TaskBoard';
import AddTaskModal from './components/AddTaskModal';
import GenerateTasksModal from './components/GenerateTasksModal';
import LoginPage from './components/LoginPage';
import { useAuth } from './auth/AuthContext';
import AdminDashboard from './components/AdminDashboard';
import TaskDetailsModal from './components/TaskDetailsModal';
import { useNotification } from './context/NotificationContext';
import FilterBar from './components/FilterBar';
import CalendarView from './components/CalendarView';
import { ViewColumnsIcon } from './components/icons/ViewColumnsIcon';
import { CalendarIcon } from './components/icons/CalendarIcon';

const App: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [employees] = useState<Employee[]>(EMPLOYEES);
  const [isAddTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [isGenerateTaskModalOpen, setGenerateTaskModalOpen] = useState(false);
  const [isTaskDetailsModalOpen, setTaskDetailsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ assignee: 'all', priority: 'all' });
  const [currentView, setCurrentView] = useState<'board' | 'calendar'>('board');

  const tasksForCurrentUser = useMemo(() => {
    if (!user) {
      return [];
    }
    return user.role === 'admin' 
      ? tasks 
      : tasks.filter(task => task.assigneeId === user.employeeId);
  }, [user, tasks]);
  
  const filteredTasks = useMemo(() => {
    return tasksForCurrentUser.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAssignee = filters.assignee === 'all' || task.assigneeId === filters.assignee;
        const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
        return matchesSearch && matchesAssignee && matchesPriority;
    });
  }, [tasksForCurrentUser, searchTerm, filters]);

  const logActivity = (message: string) => {
    if (!user) return;
    const currentUserEmployee = employees.find(e => e.id === user.employeeId);
    if (!currentUserEmployee) return;

    const newLog: ActivityLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      message,
      user: {
        name: currentUserEmployee.name,
        avatarUrl: currentUserEmployee.avatarUrl
      }
    };
    setActivityLogs(prev => [newLog, ...prev].slice(0, 20)); // Keep last 20 activities
  };

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

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'status' | 'comments' | 'createdAt'>, id: number | null) => {
    if (id !== null) {
      setTasks(tasks.map(t => t.id === id ? { ...tasks.find(tsk => tsk.id === id)!, ...taskData } : t));
      logActivity(`updated task "${taskData.title}"`);
    } else {
      const newTask: Task = {
        id: Date.now(),
        status: TaskStatus.TODO,
        comments: [],
        createdAt: new Date().toISOString(),
        ...taskData
      };
      setTasks([...tasks, newTask]);
      logActivity(`created task "${newTask.title}"`);
    }
    handleCloseAddTaskModal();
  };
  
  const handleAddComment = (taskId: number, content: string) => {
    if (!user) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newComment: Comment = {
      id: Date.now(),
      authorId: user.employeeId,
      content,
      timestamp: new Date().toISOString(),
    };
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        const updatedTask = { ...t, comments: [...t.comments, newComment] };
        if(selectedTask?.id === taskId) {
          setSelectedTask(updatedTask);
        }
        return updatedTask;
      }
      return t;
    });
    setTasks(updatedTasks);
    logActivity(`commented on task "${task.title}"`);
  };


  const handleDeleteTask = (taskId: number) => {
    if (user?.role !== 'admin') {
      console.error("Permission denied: Only admins can delete tasks.");
      return;
    }
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (taskToDelete) {
      logActivity(`deleted task "${taskToDelete.title}"`);
    }
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleUpdateTaskStatus = (taskId: number, newStatus: TaskStatus) => {
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;
    
    if (taskToUpdate.status !== newStatus) {
        logActivity(`moved "${taskToUpdate.title}" from ${taskToUpdate.status} to ${newStatus}`);
        const completedAt = newStatus === TaskStatus.DONE ? new Date().toISOString() : taskToUpdate.completedAt;
        const unblockedTasks = tasks.map(t => (t.blockedById === taskId) ? {...t, blockedById: null} : t);

        setTasks(unblockedTasks.map(task => task.id === taskId ? { ...task, status: newStatus, completedAt } : task));
        showNotification(`Moved "${taskToUpdate.title}" to ${newStatus}`, 'success');
    }
  };
  
  const addGeneratedTasks = (generatedTasks: Pick<Task, 'title' | 'description' | 'assigneeId' | 'dueDate'>[]) => {
    const newTasks: Task[] = generatedTasks.map(task => ({
      ...task,
      id: Date.now() + Math.random(),
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      comments: [],
      createdAt: new Date().toISOString(),
    }));
    setTasks(prevTasks => [...prevTasks, ...newTasks]);
    logActivity(`generated ${newTasks.length} tasks with AI`);
  };

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200">
      <Header 
        onAddTask={() => handleOpenAddTaskModal()} 
        onGenerateTasks={handleOpenGenerateTasksModal}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <main className="p-4 sm:p-6 lg:p-8">
        {user.role === 'admin' && (
          <AdminDashboard tasks={tasks} employees={employees} activityLogs={activityLogs} />
        )}
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              {user.role === 'admin' ? 'All Tasks' : 'My Tasks'}
            </h2>
            <div className="flex items-center p-1 bg-slate-200 dark:bg-slate-700 rounded-lg">
                <button 
                    onClick={() => setCurrentView('board')} 
                    className={`px-3 py-1 text-sm font-semibold rounded-md flex items-center gap-2 ${currentView === 'board' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}
                >
                    <ViewColumnsIcon className="w-5 h-5"/> Board
                </button>
                <button 
                    onClick={() => setCurrentView('calendar')} 
                    className={`px-3 py-1 text-sm font-semibold rounded-md flex items-center gap-2 ${currentView === 'calendar' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}
                >
                    <CalendarIcon className="w-5 h-5"/> Calendar
                </button>
            </div>
        </div>

        <FilterBar 
            employees={employees} 
            filters={filters} 
            setFilters={setFilters} 
            showAssigneeFilter={user.role === 'admin'}
        />

        {currentView === 'board' ? (
             <TaskBoard
              tasks={filteredTasks}
              allTasks={tasks}
              employees={employees}
              onEditTask={handleOpenAddTaskModal}
              onDeleteTask={user.role === 'admin' ? handleDeleteTask : undefined}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onViewTask={handleOpenTaskDetailsModal}
            />
        ) : (
            <CalendarView 
                tasks={filteredTasks}
                onViewTask={handleOpenTaskDetailsModal}
            />
        )}
      </main>
      {isAddTaskModalOpen && (
        <AddTaskModal
          isOpen={isAddTaskModalOpen}
          onClose={handleCloseAddTaskModal}
          onSave={handleSaveTask}
          employees={employees}
          taskToEdit={taskToEdit}
          allTasks={tasks}
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
          allTasks={tasks}
        />
      )}
    </div>
  );
};

export default App;