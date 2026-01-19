
import React, { useState, useMemo, useEffect } from 'react';
import { Task, TaskStatus, Employee, Priority, Comment, ActivityLog, TimeLogEntry } from './types';
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
import ConfirmationModal from './components/ConfirmationModal';
import ProfileModal from './components/ProfileModal';

const App: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showNotification } = useNotification();
  
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

  useEffect(() => {
    if (user) {
        try {
            const savedEmployees = localStorage.getItem('taskflow_employees');
            if (savedEmployees) {
                setEmployees(JSON.parse(savedEmployees));
            }
        } catch (error) {
            console.error("Failed to refresh employees", error);
        }
    }
  }, [user]);

  const [isAddTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [isGenerateTaskModalOpen, setGenerateTaskModalOpen] = useState(false);
  const [isTaskDetailsModalOpen, setTaskDetailsModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState<number | null>(null);
  
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const savedLogs = localStorage.getItem('taskflow_logs');
      return savedLogs ? JSON.parse(savedLogs) : [];
    } catch (error) {
       return [];
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ assignee: 'all', priority: 'all' });
  const [currentView, setCurrentView] = useState<'board' | 'calendar'>('board');

  useEffect(() => {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  useEffect(() => {
    localStorage.setItem('taskflow_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('taskflow_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  const tasksForCurrentUser = useMemo(() => {
    if (!user) return [];
    return user.role === 'admin' 
      ? tasks 
      : tasks.filter(task => task.assigneeId === user.employeeId);
  }, [user, tasks]);
  
  const filteredTasks = useMemo(() => {
    return tasksForCurrentUser.filter(task => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = 
            task.title.toLowerCase().includes(term) ||
            (task.tags && task.tags.some(tag => tag.toLowerCase().includes(term)));
            
        const matchesAssignee = filters.assignee === 'all' || task.assigneeId === filters.assignee;
        const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
        return matchesSearch && matchesAssignee && matchesPriority;
    });
  }, [tasksForCurrentUser, searchTerm, filters]);
  
  const currentUserEmployee = useMemo(() => {
      return employees.find(e => e.id === user?.employeeId);
  }, [employees, user]);

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
    setActivityLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const handleOpenAddTaskModal = (task: Task | null = null) => {
    setTaskToEdit(task);
    setAddTaskModalOpen(true);
  };

  const handleUpdateTaskStatus = (taskId: number, newStatus: TaskStatus) => {
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;
    
    if (taskToUpdate.status !== newStatus) {
        logActivity(`moved "${taskToUpdate.title}" to ${newStatus}`);
        const completedAt = newStatus === TaskStatus.DONE ? new Date().toISOString() : taskToUpdate.completedAt;
        const unblockedTasks = tasks.map(t => (t.blockedById === taskId) ? {...t, blockedById: null} : t);

        setTasks(unblockedTasks.map(task => task.id === taskId ? { ...task, status: newStatus, completedAt } : task));
        showNotification(`Moved to ${newStatus}`, 'success');
    }
  };

  if (!user) return <LoginPage />;

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onAddTask={() => handleOpenAddTaskModal()} 
        onGenerateTasks={() => setGenerateTaskModalOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenProfile={() => setProfileModalOpen(true)}
        currentUserEmployee={currentUserEmployee}
      />
      <main className="flex-grow p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-700">
        {user.role === 'admin' && (
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 shadow-2xl">
            <AdminDashboard tasks={tasks} employees={employees} activityLogs={activityLogs} />
          </div>
        )}
        
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-4xl font-black text-white tracking-tight">
                {user.role === 'admin' ? 'Workspace' : 'My Roadmap'}
              </h2>
              <div className="flex items-center p-1.5 bg-white/5 rounded-2xl border border-white/10">
                  <button 
                      onClick={() => setCurrentView('board')} 
                      className={`px-6 py-2.5 text-sm font-bold rounded-xl flex items-center gap-2 transition-all ${currentView === 'board' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'}`}
                  >
                      <ViewColumnsIcon className="w-5 h-5"/> Board
                  </button>
                  <button 
                      onClick={() => setCurrentView('calendar')} 
                      className={`px-6 py-2.5 text-sm font-bold rounded-xl flex items-center gap-2 transition-all ${currentView === 'calendar' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'}`}
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
                onDeleteTask={user.role === 'admin' ? (id) => { setTaskToDeleteId(id); setDeleteModalOpen(true); } : undefined}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onViewTask={(task) => { setSelectedTask(task); setTaskDetailsModalOpen(true); }}
                onToggleTimer={(id) => {
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
                }}
              />
          ) : (
              <CalendarView 
                  tasks={filteredTasks}
                  onViewTask={(task) => { setSelectedTask(task); setTaskDetailsModalOpen(true); }}
              />
          )}
        </div>
      </main>

      {/* Modals remain mostly the same, their internal content handles glassmorphism */}
      {isAddTaskModalOpen && (
        <AddTaskModal
          isOpen={isAddTaskModalOpen}
          onClose={() => setAddTaskModalOpen(false)}
          onSave={(data, id) => {
            if (id !== null) {
              setTasks(tasks.map(t => t.id === id ? { ...t, ...data } : t));
              logActivity(`updated "${data.title}"`);
            } else {
              const newTask: Task = { id: Date.now(), status: TaskStatus.TODO, comments: [], subtasks: [], tags: [], timeLogs: [], timerStartTime: null, createdAt: new Date().toISOString(), ...data };
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
            const newTasks: Task[] = gen.map(t => ({ ...t, id: Date.now() + Math.random(), status: TaskStatus.TODO, priority: Priority.MEDIUM, comments: [], subtasks: [], tags: [], timeLogs: [], timerStartTime: null, createdAt: new Date().toISOString() }));
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
            setTasks(tasks.map(t => t.id === id ? { ...t, comments: [...t.comments, newComm] } : t));
            setSelectedTask(prev => prev ? { ...prev, comments: [...prev.comments, newComm] } : null);
          }}
          onUpdateTask={(updated) => {
            setTasks(tasks.map(t => t.id === updated.id ? updated : t));
            setSelectedTask(updated);
          }}
          onToggleTimer={(id) => {
            // Implementation inside details as well for consistency
          }}
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
          />
      )}
    </div>
  );
};

export default App;
