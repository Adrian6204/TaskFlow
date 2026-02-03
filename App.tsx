
import React, { useState, useMemo, useEffect } from 'react';
import { Task, TaskStatus, Employee, Priority, Comment, ActivityLog, TimeLogEntry } from './types';
import { INITIAL_TASKS, EMPLOYEES } from './constants';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TaskBoard from './components/TaskBoard';
import TaskListView from './components/TaskListView';
import AddTaskModal from './components/AddTaskModal';
import GenerateTasksModal from './components/GenerateTasksModal';
import LoginPage from './components/LoginPage';
import { useAuth } from './auth/AuthContext';
import AdminDashboard from './components/AdminDashboard';
import TaskDetailsModal from './components/TaskDetailsModal';
import { useNotification } from './context/NotificationContext';
import CalendarView from './components/CalendarView';
import ConfirmationModal from './components/ConfirmationModal';
import ProfileModal from './components/ProfileModal';

const App: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { showNotification } = useNotification();
  
  // Data State
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedTasks = localStorage.getItem('taskflow_tasks');
      return savedTasks ? JSON.parse(savedTasks) : INITIAL_TASKS;
    } catch (error) {
      return INITIAL_TASKS;
    }
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const savedEmployees = localStorage.getItem('taskflow_employees');
      return savedEmployees ? JSON.parse(savedEmployees) : EMPLOYEES;
    } catch (error) {
      return EMPLOYEES;
    }
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const savedLogs = localStorage.getItem('taskflow_logs');
      return savedLogs ? JSON.parse(savedLogs) : [];
    } catch (error) {
       return [];
    }
  });

  // UI State
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<'list' | 'board' | 'calendar' | 'dashboard'>('list');
  const [activeSpace, setActiveSpace] = useState<string>('Everything');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isAddTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [isGenerateTaskModalOpen, setGenerateTaskModalOpen] = useState(false);
  const [isTaskDetailsModalOpen, setTaskDetailsModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Selection
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskToDeleteId, setTaskToDeleteId] = useState<number | null>(null);

  // Persistence
  useEffect(() => {
    if (user) {
        try {
            const savedEmployees = localStorage.getItem('taskflow_employees');
            if (savedEmployees) setEmployees(JSON.parse(savedEmployees));
        } catch (error) { console.error("Failed to refresh employees", error); }
    }
  }, [user]);

  useEffect(() => { localStorage.setItem('taskflow_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('taskflow_employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem('taskflow_logs', JSON.stringify(activityLogs)); }, [activityLogs]);

  // Filtering Logic
  const filteredTasks = useMemo(() => {
    let filtered = user?.role === 'admin' 
      ? tasks 
      : tasks.filter(task => task.assigneeId === user?.employeeId);

    // Filter by Space (using Tags as proxy for spaces in this demo)
    if (activeSpace !== 'Everything') {
      filtered = filtered.filter(t => t.tags?.some(tag => tag.toLowerCase() === activeSpace.toLowerCase()) || false);
    }

    // Filter by Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(task => 
          task.title.toLowerCase().includes(term) ||
          (task.tags && task.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }
    
    return filtered;
  }, [tasks, user, searchTerm, activeSpace]);
  
  const currentUserEmployee = useMemo(() => {
      return employees.find(e => e.id === user?.employeeId);
  }, [employees, user]);

  const logActivity = (message: string) => {
    if (!user) return;
    const currentEmp = employees.find(e => e.id === user.employeeId);
    if (!currentEmp) return;

    const newLog: ActivityLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      message,
      user: { name: currentEmp.name, avatarUrl: currentEmp.avatarUrl }
    };
    setActivityLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  // Handlers
  const handleOpenAddTaskModal = (task: Task | null = null) => {
    setTaskToEdit(task);
    setAddTaskModalOpen(true);
  };

  const handleUpdateTaskStatus = (taskId: number, newStatus: TaskStatus) => {
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate || taskToUpdate.status === newStatus) return;
    
    logActivity(`moved "${taskToUpdate.title}" to ${newStatus}`);
    const completedAt = newStatus === TaskStatus.DONE ? new Date().toISOString() : taskToUpdate.completedAt;
    
    // Unblock dependent tasks
    const unblockedTasks = tasks.map(t => (t.blockedById === taskId) ? {...t, blockedById: null} : t);

    setTasks(unblockedTasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus, completedAt } : task
    ));
    showNotification(`Moved to ${newStatus}`, 'success');
  };

  const handleToggleTimer = (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const now = new Date();
      let updated: Task;
      if (task.timerStartTime) {
        const start = new Date(task.timerStartTime);
        const dur = now.getTime() - start.getTime();
        updated = { ...task, timerStartTime: null, timeLogs: [{ id: Date.now().toString(), startTime: task.timerStartTime, endTime: now.toISOString(), duration: dur }, ...(task.timeLogs || [])] };
        logActivity(`logged time on "${task.title}"`);
      } else {
        updated = { ...task, timerStartTime: now.toISOString(), timeLogs: task.timeLogs || [] };
        logActivity(`started timer on "${task.title}"`);
      }
      setTasks(tasks.map(t => t.id === id ? updated : t));
    }
  };

  if (!user) return <LoginPage />;

  return (
    <div className="flex h-screen overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        activeSpace={activeSpace}
        onSelectSpace={(space) => {
          setActiveSpace(space);
          if (currentView === 'dashboard' && space !== 'Everything') setCurrentView('list');
        }}
        onToggle={() => setSidebarOpen(!isSidebarOpen)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onLogout={logout}
        currentUserEmployee={currentUserEmployee}
        user={user}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Header 
          activeSpace={activeSpace}
          currentView={currentView}
          onViewChange={setCurrentView}
          onAddTask={() => handleOpenAddTaskModal()} 
          onGenerateTasks={() => setGenerateTaskModalOpen(true)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          user={user}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
            
            {/* View Switching */}
            {currentView === 'dashboard' && user.role === 'admin' && (
               <AdminDashboard tasks={tasks} employees={employees} activityLogs={activityLogs} />
            )}

            {currentView === 'list' && (
              <TaskListView
                tasks={filteredTasks}
                employees={employees}
                onEditTask={handleOpenAddTaskModal}
                onViewTask={(task) => { setSelectedTask(task); setTaskDetailsModalOpen(true); }}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onToggleTimer={handleToggleTimer}
              />
            )}

            {currentView === 'board' && (
               <TaskBoard
                tasks={filteredTasks}
                allTasks={tasks}
                employees={employees}
                onEditTask={handleOpenAddTaskModal}
                onDeleteTask={user.role === 'admin' ? (id) => { setTaskToDeleteId(id); setDeleteModalOpen(true); } : undefined}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onViewTask={(task) => { setSelectedTask(task); setTaskDetailsModalOpen(true); }}
                onToggleTimer={handleToggleTimer}
              />
            )}

            {currentView === 'calendar' && (
              <CalendarView 
                  tasks={filteredTasks}
                  onViewTask={(task) => { setSelectedTask(task); setTaskDetailsModalOpen(true); }}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {isAddTaskModalOpen && (
        <AddTaskModal
          isOpen={isAddTaskModalOpen}
          onClose={() => setAddTaskModalOpen(false)}
          onSave={(data, id) => {
            if (id !== null) {
              setTasks(tasks.map(t => t.id === id ? { ...t, ...data } : t));
              logActivity(`updated "${data.title}"`);
            } else {
              const newTask: Task = { id: Date.now(), status: TaskStatus.TODO, comments: [], subtasks: [], tags: activeSpace !== 'Everything' ? [activeSpace] : [], timeLogs: [], timerStartTime: null, createdAt: new Date().toISOString(), ...data };
              setTasks([...tasks, newTask]);
              logActivity(`created "${newTask.title}"`);
            }
            setAddTaskModalOpen(false);
          }}
          employees={employees}
          taskToEdit={taskToEdit}
          allTasks={tasks}
        />
      )}

      {isGenerateTaskModalOpen && (
        <GenerateTasksModal 
          isOpen={isGenerateTaskModalOpen}
          onClose={() => setGenerateTaskModalOpen(false)}
          onTasksGenerated={(gen) => {
            const newTasks: Task[] = gen.map(t => ({ ...t, id: Date.now() + Math.random(), status: TaskStatus.TODO, priority: Priority.MEDIUM, comments: [], subtasks: [], tags: activeSpace !== 'Everything' ? [activeSpace] : [], timeLogs: [], timerStartTime: null, createdAt: new Date().toISOString() }));
            setTasks([...tasks, ...newTasks]);
            logActivity(`AI generated ${newTasks.length} tasks`);
          }}
          employees={employees}
        />
      )}

      {isTaskDetailsModalOpen && selectedTask && (
        <TaskDetailsModal
          isOpen={isTaskDetailsModalOpen}
          onClose={() => setTaskDetailsModalOpen(false)}
          task={selectedTask}
          employees={employees}
          allTasks={tasks}
          onAddComment={(id, content) => {
            const newComm: Comment = { id: Date.now(), authorId: user.employeeId, content, timestamp: new Date().toISOString() };
            const updated = { ...selectedTask, comments: [...selectedTask.comments, newComm] };
            setTasks(tasks.map(t => t.id === id ? updated : t));
            setSelectedTask(updated);
          }}
          onUpdateTask={(updated) => {
            setTasks(tasks.map(t => t.id === updated.id ? updated : t));
            setSelectedTask(updated);
          }}
          onToggleTimer={handleToggleTimer}
        />
      )}

      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={() => {
            if (taskToDeleteId) {
              setTasks(tasks.filter(t => t.id !== taskToDeleteId));
              showNotification('Deleted', 'success');
              setDeleteModalOpen(false);
            }
          }}
          title="Delete Task"
          message="This will permanently remove the task."
        />
      )}

      {isProfileModalOpen && (
          <ProfileModal 
            isOpen={isProfileModalOpen}
            onClose={() => setProfileModalOpen(false)}
            user={user}
            currentUserEmployee={currentUserEmployee}
            onSave={(name, avatar) => {
              setEmployees(employees.map(e => e.id === user.employeeId ? { ...e, name, avatarUrl: avatar } : e));
              updateUser({ username: name });
            }}
            onLogout={() => {
              setProfileModalOpen(false);
              logout();
            }}
          />
      )}
    </div>
  );
};

export default App;
