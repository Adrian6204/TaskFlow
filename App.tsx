
import React, { useState, useMemo, useEffect } from 'react';
import { Task, TaskStatus, Employee, Priority, Comment, ActivityLog, TimeLogEntry, Space } from './types';
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
import CreateSpaceModal from './components/CreateSpaceModal';
import JoinSpaceModal from './components/JoinSpaceModal';
import SpaceSettingsModal from './components/SpaceSettingsModal';
import { Cog6ToothIcon } from './components/icons/Cog6ToothIcon';
import * as dataService from './services/supabaseService';
import { isSupabaseConfigured } from './lib/supabaseClient';

const App: React.FC = () => {
  // Check configuration first
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4 mb-6">
             <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
             </div>
             <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Setup Required</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Database connection missing.</p>
             </div>
          </div>
          
          <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2 font-medium">
                      To connect the database, add these variables to Vercel:
                  </p>
                  <div className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                    SUPABASE_URL<br/>
                    SUPABASE_ANON_KEY
                  </div>
              </div>

              <div className="text-xs text-center text-slate-400 dark:text-slate-500 mt-4">
                  After adding the variables, redeploy the project.
              </div>
          </div>
        </div>
      </div>
    );
  }

  const { user, updateUser, logout } = useAuth();
  const { showNotification } = useNotification();
  
  // Data State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // UI State
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<'list' | 'board' | 'calendar' | 'dashboard'>('list');
  const [activeSpaceId, setActiveSpaceId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isAddTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [isGenerateTaskModalOpen, setGenerateTaskModalOpen] = useState(false);
  const [isTaskDetailsModalOpen, setTaskDetailsModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isCreateSpaceModalOpen, setCreateSpaceModalOpen] = useState(false);
  const [isJoinSpaceModalOpen, setJoinSpaceModalOpen] = useState(false);
  const [isSpaceSettingsModalOpen, setSpaceSettingsModalOpen] = useState(false);
  
  // Selection
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskToDeleteId, setTaskToDeleteId] = useState<number | null>(null);

  // Load User Data
  useEffect(() => {
      if (user) {
          loadEmployees();
          loadSpaces();
      }
  }, [user]);

  // Load Tasks when Space Changes
  useEffect(() => {
      if (activeSpaceId) {
          loadTasks(activeSpaceId);
      } else {
          setTasks([]);
      }
  }, [activeSpaceId]);

  const loadEmployees = async () => {
      try {
          const emps = await dataService.getAllEmployees();
          setEmployees(emps);
      } catch (err) {
          console.error("Failed to load employees", err);
      }
  };

  const loadSpaces = async () => {
      if (!user) return;
      try {
          const loadedSpaces = await dataService.getSpaces(user.employeeId);
          setSpaces(loadedSpaces);
          
          if (loadedSpaces.length > 0 && !activeSpaceId) {
              setActiveSpaceId(loadedSpaces[0].id);
          }
      } catch (err) {
          console.error("Failed to load spaces", err);
      }
  };

  const loadTasks = async (spaceId: string) => {
      try {
          const loadedTasks = await dataService.getTasks(spaceId);
          setTasks(loadedTasks);
      } catch (err) {
          console.error("Failed to load tasks", err);
          showNotification("Failed to load tasks", 'error');
      }
  };

  const currentUserEmployee = useMemo(() => {
      return employees.find(e => e.id === user?.employeeId);
  }, [employees, user]);

  const currentSpace = spaces.find(s => s.id === activeSpaceId);

  const filteredTasks = useMemo(() => {
    if (!activeSpaceId) return [];
    let filtered = tasks;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(task => 
          task.title.toLowerCase().includes(term) ||
          (task.tags && task.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }
    return filtered;
  }, [tasks, activeSpaceId, searchTerm]);
  
  const spaceMembers = useMemo(() => {
      if (!currentSpace) return [];
      return employees.filter(e => currentSpace.members.includes(e.id));
  }, [currentSpace, employees]);

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

  const handleCreateSpace = async (name: string) => {
      if (!user) return;
      try {
          const newSpace = await dataService.createSpace(name, user.employeeId);
          setSpaces([...spaces, newSpace]);
          setActiveSpaceId(newSpace.id);
          showNotification(`Created space "${name}"`);
      } catch (err: any) {
          showNotification(err.message, 'error');
      }
  };

  const handleJoinSpace = async (code: string) => {
      if (!user) return;
      try {
          const joinedSpace = await dataService.joinSpace(code, user.employeeId);
          // Check if already in list to avoid duplicates
          if (!spaces.find(s => s.id === joinedSpace.id)) {
              setSpaces([...spaces, { ...joinedSpace, members: [...joinedSpace.members, user.employeeId] }]);
          }
          setActiveSpaceId(joinedSpace.id);
          showNotification(`Joined "${joinedSpace.name}"`);
      } catch (err: any) {
          showNotification(err.message, 'error');
      }
  };

  const handleOpenAddTaskModal = (task: Task | null = null) => {
    setTaskToEdit(task);
    setAddTaskModalOpen(true);
  };

  const handleSaveTask = async (data: any, id: number | null) => {
      if (!activeSpaceId || !user) return;
      
      const payload = {
          ...data,
          id: id || undefined,
          spaceId: activeSpaceId,
          assigneeId: data.assigneeId || user.employeeId 
      };

      try {
          const savedTask = await dataService.upsertTask(payload);
          
          if (id) {
              setTasks(tasks.map(t => t.id === id ? { ...t, ...savedTask } : t));
              logActivity(`updated "${data.title}"`);
          } else {
              setTasks([savedTask, ...tasks]);
              logActivity(`created "${savedTask.title}"`);
          }
          setAddTaskModalOpen(false);
      } catch (err: any) {
          console.error(err);
          showNotification("Failed to save task", 'error');
      }
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: TaskStatus) => {
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate || taskToUpdate.status === newStatus) return;
    
    // Optimistic UI Update
    const completedAt = newStatus === TaskStatus.DONE ? new Date().toISOString() : taskToUpdate.completedAt;
    const updatedTask = { ...taskToUpdate, status: newStatus, completedAt };
    
    // Optimistic unblocking
    const unblockedTasks = tasks.map(t => (t.blockedById === taskId) ? {...t, blockedById: null} : t);
    setTasks(unblockedTasks.map(t => t.id === taskId ? updatedTask : t));

    try {
        await dataService.upsertTask(updatedTask);
        logActivity(`moved "${taskToUpdate.title}" to ${newStatus}`);
        showNotification(`Moved to ${newStatus}`, 'success');
    } catch (err) {
        showNotification("Failed to update status", 'error');
        loadTasks(activeSpaceId); // Revert
    }
  };

  const handleToggleTimer = async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const now = new Date();
    let updated: Task;
    
    if (task.timerStartTime) {
        // Stop
        const start = new Date(task.timerStartTime);
        const dur = now.getTime() - start.getTime();
        try {
            await dataService.logTaskTime(task.id, task.timerStartTime, now.toISOString(), dur);
            await dataService.upsertTask({ ...task, timerStartTime: null });
            
            // Refetch or manual update? Manual for speed.
            updated = { ...task, timerStartTime: null, timeLogs: [{ id: 'temp', startTime: task.timerStartTime, endTime: now.toISOString(), duration: dur }, ...(task.timeLogs || [])] };
            logActivity(`logged time on "${task.title}"`);
        } catch(err) { showNotification("Failed to log time", 'error'); return; }
    } else {
        // Start
        try {
            await dataService.upsertTask({ ...task, timerStartTime: now.toISOString() });
            updated = { ...task, timerStartTime: now.toISOString() };
            logActivity(`started timer on "${task.title}"`);
        } catch(err) { showNotification("Failed to start timer", 'error'); return; }
    }
    setTasks(tasks.map(t => t.id === id ? updated : t));
  };

  if (!user) return <LoginPage />;

  return (
    <div className="flex h-screen overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        activeSpaceId={activeSpaceId}
        spaces={spaces}
        onSelectSpace={(id) => {
          setActiveSpaceId(id);
          if (currentView === 'dashboard') setCurrentView('list');
        }}
        onToggle={() => setSidebarOpen(!isSidebarOpen)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onLogout={logout}
        onCreateSpace={() => setCreateSpaceModalOpen(true)}
        onJoinSpace={() => setJoinSpaceModalOpen(true)}
        currentUserEmployee={currentUserEmployee}
        user={user}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Header 
          activeSpace={currentSpace ? currentSpace.name : 'No Space Selected'}
          currentView={currentView}
          onViewChange={setCurrentView}
          onAddTask={() => activeSpaceId ? handleOpenAddTaskModal() : showNotification("Select a space first", 'error')} 
          onGenerateTasks={() => activeSpaceId ? setGenerateTaskModalOpen(true) : showNotification("Select a space first", 'error')}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          user={user}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
            
            {/* Context Header for Space */}
            {activeSpaceId && (
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{currentSpace?.name}</h1>
                    <button 
                        onClick={() => setSpaceSettingsModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                    >
                        <Cog6ToothIcon className="w-4 h-4" />
                        Space Settings
                    </button>
                </div>
            )}

            {!activeSpaceId ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <Cog6ToothIcon className="w-10 h-10 text-slate-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Space Selected</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
                        Join an existing team space using a code, or create a new one to get started.
                    </p>
                    <div className="flex gap-4">
                        <button onClick={() => setCreateSpaceModalOpen(true)} className="px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/20">Create Space</button>
                        <button onClick={() => setJoinSpaceModalOpen(true)} className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">Join Space</button>
                    </div>
                </div>
            ) : (
                <>
                    {/* View Switching */}
                    {currentView === 'dashboard' && (
                        <AdminDashboard tasks={filteredTasks} employees={spaceMembers} activityLogs={activityLogs} />
                    )}

                    {currentView === 'list' && (
                        <TaskListView
                            tasks={filteredTasks}
                            employees={spaceMembers}
                            onEditTask={handleOpenAddTaskModal}
                            onViewTask={(task) => { setSelectedTask(task); setTaskDetailsModalOpen(true); }}
                            onUpdateTaskStatus={handleUpdateTaskStatus}
                            onToggleTimer={handleToggleTimer}
                        />
                    )}

                    {currentView === 'board' && (
                        <TaskBoard
                            tasks={filteredTasks}
                            allTasks={tasks} // Pass all to check dependencies even outside filter
                            employees={spaceMembers}
                            onEditTask={handleOpenAddTaskModal}
                            onDeleteTask={(id) => { setTaskToDeleteId(id); setDeleteModalOpen(true); }} // Allow deletion in space
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
                </>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {isAddTaskModalOpen && (
        <AddTaskModal
          isOpen={isAddTaskModalOpen}
          onClose={() => setAddTaskModalOpen(false)}
          onSave={handleSaveTask}
          employees={spaceMembers}
          taskToEdit={taskToEdit}
          allTasks={filteredTasks}
        />
      )}

      {isGenerateTaskModalOpen && (
        <GenerateTasksModal 
          isOpen={isGenerateTaskModalOpen}
          onClose={() => setGenerateTaskModalOpen(false)}
          onTasksGenerated={async (gen) => {
            if (!activeSpaceId || !user) return;
            // Iterate and save all
            for (const t of gen) {
                await handleSaveTask(t, null);
            }
            showNotification(`Generated ${gen.length} tasks`, 'success');
          }}
          employees={spaceMembers}
        />
      )}

      {isTaskDetailsModalOpen && selectedTask && (
        <TaskDetailsModal
          isOpen={isTaskDetailsModalOpen}
          onClose={() => setTaskDetailsModalOpen(false)}
          task={selectedTask}
          employees={spaceMembers}
          allTasks={filteredTasks}
          onAddComment={async (taskId, content) => {
              if(!user) return;
              try {
                  const newComment = await dataService.addTaskComment(taskId, user.employeeId, content);
                  const updatedTask = { ...selectedTask, comments: [...selectedTask.comments, newComment] };
                  setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
                  setSelectedTask(updatedTask);
              } catch(err) { console.error(err); }
          }}
          onUpdateTask={async (updated) => {
            try {
                await dataService.upsertTask(updated);
                setTasks(tasks.map(t => t.id === updated.id ? updated : t));
                setSelectedTask(updated);
            } catch(err) { console.error(err); }
          }}
          onToggleTimer={handleToggleTimer}
        />
      )}

      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={async () => {
            if (taskToDeleteId) {
              try {
                  await dataService.deleteTask(taskToDeleteId);
                  setTasks(tasks.filter(t => t.id !== taskToDeleteId));
                  showNotification('Deleted', 'success');
              } catch (err) { showNotification('Delete failed', 'error'); }
              setDeleteModalOpen(false);
            }
          }}
          title="Delete Task"
          message="This will permanently remove the task."
        />
      )}

      {isProfileModalOpen && user && (
          <ProfileModal 
            isOpen={isProfileModalOpen}
            onClose={() => setProfileModalOpen(false)}
            user={user}
            currentUserEmployee={currentUserEmployee}
            onSave={(name, avatar) => {
              updateUser({ username: name });
            }}
            onLogout={() => {
              setProfileModalOpen(false);
              logout();
            }}
          />
      )}

      <CreateSpaceModal 
        isOpen={isCreateSpaceModalOpen}
        onClose={() => setCreateSpaceModalOpen(false)}
        onCreate={handleCreateSpace}
      />

      <JoinSpaceModal
        isOpen={isJoinSpaceModalOpen}
        onClose={() => setJoinSpaceModalOpen(false)}
        onJoin={handleJoinSpace}
      />

      {currentSpace && (
          <SpaceSettingsModal 
            isOpen={isSpaceSettingsModalOpen}
            onClose={() => setSpaceSettingsModalOpen(false)}
            space={currentSpace}
            members={spaceMembers}
          />
      )}
    </div>
  );
};

export default App;
