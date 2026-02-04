
import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import SpaceSettingsView from './components/SpaceSettingsView';
import GanttChart from './components/GanttChart';
import Whiteboard from './components/Whiteboard';
import MembersView from './components/MembersView';
import HomeView from './components/HomeView';
import { Cog6ToothIcon } from './components/icons/Cog6ToothIcon';
import * as dataService from './services/supabaseService';
import { isSupabaseConfigured } from './lib/supabaseClient';

// Setup Required Screen Component
const SetupRequiredScreen: React.FC = () => (
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

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Main Dashboard Component (Protected)
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser, logout } = useAuth();
  const { showNotification } = useNotification();
  
  // Data State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // UI State
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeSpaceId, setActiveSpaceId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Derive current view from URL path
  const getCurrentViewFromPath = (): string => {
    const path = location.pathname;
    if (path.includes('/board')) return 'board';
    if (path.includes('/calendar')) return 'calendar';
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/gantt')) return 'gantt';
    if (path.includes('/whiteboard')) return 'whiteboard';
    if (path.includes('/overview')) return 'overview';
    if (path.includes('/settings')) return 'settings';
    if (path.includes('/home')) return 'home';
    return 'home';
  };
  
  const currentView = getCurrentViewFromPath();

  const setCurrentView = (view: string) => {
    navigate(`/app/${view}`);
  };
  
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
          
          // If no tasks exist, create mock data
          if (loadedTasks.length === 0) {
              const mockTasks: Partial<Task>[] = [
                  {
                      spaceId,
                      title: 'Setup Development Environment',
                      description: 'Install Node.js, VS Code, and configure project dependencies',
                      status: TaskStatus.TODO,
                      priority: Priority.HIGH,
                      assigneeId: employees.length > 0 ? employees[0].id : '',
                      tags: ['setup', 'development'],
                      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                      createdAt: new Date().toISOString(),
                      createdBy: user?.id || '',
                      comments: [],
                      subtasks: [],
                      timeLogs: []
                  },
                  {
                      spaceId,
                      title: 'Design UI Mockups',
                      description: 'Create wireframes and high-fidelity mockups for the dashboard',
                      status: TaskStatus.IN_PROGRESS,
                      priority: Priority.HIGH,
                      assigneeId: employees.length > 1 ? employees[1].id : employees[0]?.id || '',
                      tags: ['design', 'ui'],
                      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                      createdAt: new Date().toISOString(),
                      createdBy: user?.id || '',
                      comments: [],
                      subtasks: [],
                      timeLogs: []
                  },
                  {
                      spaceId,
                      title: 'API Integration',
                      description: 'Connect frontend with backend API endpoints',
                      status: TaskStatus.IN_PROGRESS,
                      priority: Priority.MEDIUM,
                      assigneeId: employees.length > 0 ? employees[0].id : '',
                      tags: ['backend', 'api'],
                      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
                      createdAt: new Date().toISOString(),
                      createdBy: user?.id || '',
                      comments: [],
                      subtasks: [],
                      timeLogs: []
                  },
                  {
                      spaceId,
                      title: 'Write Unit Tests',
                      description: 'Create comprehensive test coverage for core functionality',
                      status: TaskStatus.TODO,
                      priority: Priority.MEDIUM,
                      assigneeId: employees.length > 2 ? employees[2].id : employees[0]?.id || '',
                      tags: ['testing', 'quality'],
                      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                      createdAt: new Date().toISOString(),
                      createdBy: user?.id || '',
                      comments: [],
                      subtasks: [],
                      timeLogs: []
                  },
                  {
                      spaceId,
                      title: 'Deploy to Production',
                      description: 'Setup CI/CD pipeline and deploy application to production',
                      status: TaskStatus.TODO,
                      priority: Priority.LOW,
                      assigneeId: employees.length > 1 ? employees[1].id : employees[0]?.id || '',
                      tags: ['deployment', 'devops'],
                      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
                      createdAt: new Date().toISOString(),
                      createdBy: user?.id || '',
                      comments: [],
                      subtasks: [],
                      timeLogs: []
                  }
              ];
              
              // Save mock tasks to database
              try {
                  const savedTasks: Task[] = [];
                  for (const mockTask of mockTasks) {
                      const savedTask = await dataService.upsertTask(mockTask);
                      savedTasks.push(savedTask);
                  }
                  setTasks(savedTasks);
                  showNotification("Sample tasks added to workspace", 'success');
              } catch (saveErr) {
                  console.error("Failed to save mock tasks", saveErr);
                  showNotification("Failed to create sample tasks", 'error');
              }
          } else {
              setTasks(loadedTasks);
          }
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
    
    // First filter by active space
    let filtered = tasks.filter(task => task.spaceId === activeSpaceId);
    
    // Then filter by search term if present
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

  const handleCreateSpace = async (name: string, description?: string) => {
      if (!user) return;
      try {
          const newSpace = await dataService.createSpace(name, user.employeeId, description);
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
          
          // Check if space is already in the list
          const existingSpaceIndex = spaces.findIndex(s => s.id === joinedSpace.id);
          
          if (existingSpaceIndex >= 0) {
              // Update existing space (in case members changed)
              const updatedSpaces = [...spaces];
              updatedSpaces[existingSpaceIndex] = joinedSpace;
              setSpaces(updatedSpaces);
              showNotification(`Switched to "${joinedSpace.name}"`);
          } else {
              // Add new space
              setSpaces([...spaces, joinedSpace]);
              showNotification(`Joined "${joinedSpace.name}"`);
          }
          
          setActiveSpaceId(joinedSpace.id);
      } catch (err: any) {
          showNotification(err.message, 'error');
      }
  };

  const handleAddMemberToSpace = async (spaceId: string, memberId: string) => {
      try {
          await dataService.addMemberToSpace(spaceId, memberId);
          const updatedSpace = await dataService.getSpaceById(spaceId);
          setSpaces(spaces.map(s => s.id === spaceId ? updatedSpace : s));
          const memberName = employees.find(e => e.id === memberId)?.name || 'Member';
          showNotification(`${memberName} added to workspace`, 'success');
      } catch (err: any) {
          showNotification(err.message || 'Failed to add member', 'error');
      }
  };

  const handleRemoveMemberFromSpace = async (spaceId: string, memberId: string) => {
      try {
          await dataService.removeMemberFromSpace(spaceId, memberId);
          const updatedSpace = await dataService.getSpaceById(spaceId);
          setSpaces(spaces.map(s => s.id === spaceId ? updatedSpace : s));
          const memberName = employees.find(e => e.id === memberId)?.name || 'Member';
          showNotification(`${memberName} removed from workspace`, 'success');
      } catch (err: any) {
          showNotification(err.message || 'Failed to remove member', 'error');
      }
  };

  const handleDeleteSpace = async (spaceId: string) => {
      try {
          await dataService.deleteSpace(spaceId);
          setSpaces(spaces.filter(s => s.id !== spaceId));
          
          // If the deleted space was active, switch to another space or null
          if (activeSpaceId === spaceId) {
              const remainingSpaces = spaces.filter(s => s.id !== spaceId);
              setActiveSpaceId(remainingSpaces.length > 0 ? remainingSpaces[0].id : null);
              setCurrentView('dashboard');
          }
          
          showNotification('Workspace deleted successfully', 'success');
      } catch (err: any) {
          showNotification(err.message || 'Failed to delete workspace', 'error');
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
            showNotification(`Timer stopped: ${Math.floor(dur / 1000 / 60)}m ${Math.floor((dur / 1000) % 60)}s`, 'success');
        } catch(err) { showNotification("Failed to log time", 'error'); return; }
    } else {
        // Start
        try {
            await dataService.upsertTask({ ...task, timerStartTime: now.toISOString() });
            updated = { ...task, timerStartTime: now.toISOString() };
            logActivity(`started timer on "${task.title}"`);
            showNotification("Timer started!", 'success');
        } catch(err) { showNotification("Failed to start timer", 'error'); return; }
    }
    setTasks(tasks.map(t => t.id === id ? updated : t));
    
    // Update selectedTask if it's the same task being updated
    if (selectedTask && selectedTask.id === id) {
        setSelectedTask(updated);
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        activeSpaceId={activeSpaceId}
        spaces={spaces}
        currentView={currentView}
        onSelectSpace={(id) => {
          setActiveSpaceId(id);
          if (['home', 'overview', 'whiteboard'].includes(currentView)) {
            // Stay on same view when switching spaces
          }
        }}
        onViewChange={setCurrentView}
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
        {/* Header - Only show for workspace views */}
        {['list', 'board', 'calendar', 'gantt', 'dashboard', 'settings'].includes(currentView) && (
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
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
            
            {/* Home View - Always accessible */}
            {currentView === 'home' && (
                <HomeView 
                    tasks={filteredTasks}
                    employees={spaceMembers}
                    currentSpace={currentSpace}
                    user={{ username: user.username, employeeId: user.employeeId }}
                />
            )}

            {/* Overview/Dashboard View */}
            {currentView === 'overview' && (
                <AdminDashboard tasks={filteredTasks} employees={spaceMembers} activityLogs={activityLogs} />
            )}

            {/* Whiteboard - Daily Task (Standalone) */}
            {currentView === 'whiteboard' && (
                <div className="h-[calc(100vh-140px)]">
                    <Whiteboard />
                </div>
            )}

            {/* Space-specific views */}
            {!activeSpaceId && !['home', 'overview', 'whiteboard'].includes(currentView) ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
                    <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                        <Cog6ToothIcon className="w-10 h-10 text-neutral-400" />
                    </div>
                    <h2 className="text-xl font-bold text-neutral-800 dark:text-white mb-2">No Space Selected</h2>
                    <p className="text-neutral-500 dark:text-neutral-400 max-w-md mb-6">
                        Join an existing team space using a code, or create a new one to get started.
                    </p>
                    <div className="flex gap-4">
                        <button onClick={() => setCreateSpaceModalOpen(true)} className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-lg transition-all duration-300">Create Space</button>
                        <button onClick={() => setJoinSpaceModalOpen(true)} className="px-6 py-3 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-white font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-300">Join Space</button>
                    </div>
                </div>
            ) : activeSpaceId && (
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
                            allTasks={tasks}
                            employees={spaceMembers}
                            onEditTask={handleOpenAddTaskModal}
                            onDeleteTask={(id) => { setTaskToDeleteId(id); setDeleteModalOpen(true); }}
                            onUpdateTaskStatus={handleUpdateTaskStatus}
                            onViewTask={(task) => { setSelectedTask(task); setTaskDetailsModalOpen(true); }}
                            onToggleTimer={handleToggleTimer}
                        />
                    )}

                    {currentView === 'gantt' && (
                        <GanttChart 
                            tasks={filteredTasks}
                            employees={spaceMembers}
                            onViewTask={(task) => { setSelectedTask(task); setTaskDetailsModalOpen(true); }}
                        />
                    )}

                    {currentView === 'calendar' && (
                        <CalendarView 
                            tasks={filteredTasks}
                            onViewTask={(task) => { setSelectedTask(task); setTaskDetailsModalOpen(true); }}
                        />
                    )}

                    {currentView === 'settings' && currentSpace && (
                        <SpaceSettingsView 
                            space={currentSpace}
                            members={spaceMembers}
                            allEmployees={employees}
                            currentUserId={user?.employeeId}
                            onAddMember={handleAddMemberToSpace}
                            onRemoveMember={handleRemoveMemberFromSpace}
                            onDeleteSpace={handleDeleteSpace}
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

// Main App Component with Routes
const App: React.FC = () => {
  // Check configuration first
  if (!isSupabaseConfigured) {
    return <SetupRequiredScreen />;
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<LoginPage />} />
      
      {/* Protected App Routes */}
      <Route path="/app" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/app/:view" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/app/home" replace />} />
      <Route path="*" element={<Navigate to="/app/home" replace />} />
    </Routes>
  );
};

export default App;
