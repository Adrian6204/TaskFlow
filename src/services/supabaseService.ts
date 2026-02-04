
import { supabase } from '../lib/supabaseClient';
import { Task, Space, Employee, TaskStatus, Priority, Comment, Subtask, TimeLogEntry } from '../types';

// --- Types for DB Insert/Update ---
interface DbTask {
  id?: number;
  space_id: string;
  title: string;
  description: string;
  assignee_id: string;
  due_date: string;
  status: string;
  priority: string;
  tags: string[];
  timer_start_time: string | null;
  blocked_by_id: number | null;
  completed_at: string | null;
}

// --- Mappers (CamelCase <-> SnakeCase) ---

const mapDbTaskToApp = (dbTask: any): Task => ({
  id: dbTask.id,
  spaceId: dbTask.space_id,
  title: dbTask.title,
  description: dbTask.description || '',
  assigneeId: dbTask.assignee_id,
  dueDate: dbTask.due_date,
  status: dbTask.status as TaskStatus,
  priority: dbTask.priority as Priority,
  tags: dbTask.tags || [],
  timerStartTime: dbTask.timer_start_time,
  createdAt: dbTask.created_at,
  completedAt: dbTask.completed_at,
  blockedById: dbTask.blocked_by_id,
  comments: dbTask.comments ? dbTask.comments.map(mapDbCommentToApp) : [],
  subtasks: dbTask.subtasks ? dbTask.subtasks.map(mapDbSubtaskToApp) : [],
  timeLogs: dbTask.time_logs ? dbTask.time_logs.map(mapDbTimeLogToApp) : [],
});

const mapDbCommentToApp = (dbComment: any): Comment => ({
  id: dbComment.id,
  authorId: dbComment.author_id,
  content: dbComment.content,
  timestamp: dbComment.created_at,
});

const mapDbSubtaskToApp = (dbSubtask: any): Subtask => ({
  id: dbSubtask.id,
  title: dbSubtask.title,
  isCompleted: dbSubtask.is_completed,
});

const mapDbTimeLogToApp = (dbLog: any): TimeLogEntry => ({
  id: dbLog.id,
  startTime: dbLog.start_time,
  endTime: dbLog.end_time,
  duration: dbLog.duration,
});

const mapDbSpaceToApp = (dbSpace: any): Space => ({
  id: dbSpace.id,
  name: dbSpace.name,
  joinCode: dbSpace.join_code,
  ownerId: dbSpace.owner_id,
  members: [], 
});

const mapDbProfileToEmployee = (dbProfile: any): Employee => ({
  id: dbProfile.id,
  name: dbProfile.username || 'Unknown',
  avatarUrl: dbProfile.avatar_url || 'https://via.placeholder.com/150',
});

// --- Services ---

export const getSpaces = async (userId: string) => {
  const { data, error } = await supabase
    .from('spaces')
    .select('*, space_members!inner(user_id)')
    .eq('space_members.user_id', userId);

  if (error) throw error;
  
  const spacesWithMembers = await Promise.all(data.map(async (s: any) => {
      const { data: memberData } = await supabase.from('space_members').select('user_id').eq('space_id', s.id);
      return {
          ...mapDbSpaceToApp(s),
          members: memberData ? memberData.map((m: any) => m.user_id) : []
      };
  }));

  return spacesWithMembers;
};

export const createSpace = async (name: string, userId: string) => {
  const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  const { data: spaceData, error: spaceError } = await supabase
    .from('spaces')
    .insert({ name, join_code: joinCode, owner_id: userId })
    .select()
    .single();

  if (spaceError) throw spaceError;

  const { error: memberError } = await supabase
    .from('space_members')
    .insert({ space_id: spaceData.id, user_id: userId, role: 'admin' });

  if (memberError) throw memberError;

  return { ...mapDbSpaceToApp(spaceData), members: [userId] };
};

export const joinSpace = async (code: string, userId: string) => {
  // Use the new RPC function for secure joining
  const cleanCode = code.trim().replace(/\s/g, '').toUpperCase();
  console.log('Attempting to join space via RPC:', cleanCode);

  const { data: spaceData, error } = await supabase.rpc('join_space_v2', { input_code: cleanCode });

  if (error) {
    console.error('RPC Error:', error);
    throw new Error(error.message || 'Failed to join space. Please verify the code.');
  }

  if (!spaceData) {
      throw new Error('Space not found');
  }

  // Fetch full member list to ensure UI is up to date immediately
  const { data: memberData } = await supabase.from('space_members').select('user_id').eq('space_id', spaceData.id);
  const memberIds = memberData ? memberData.map((m: any) => m.user_id) : [userId];

  return { 
      ...mapDbSpaceToApp(spaceData), 
      members: memberIds 
  };
};

export const getTasks = async (spaceId: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      subtasks(*),
      comments(*),
      time_logs(*)
    `)
    .eq('space_id', spaceId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(mapDbTaskToApp);
};

export const upsertTask = async (task: Partial<Task> & { spaceId: string, title: string }) => {
  const payload: DbTask = {
    space_id: task.spaceId,
    title: task.title,
    description: task.description || '',
    assignee_id: task.assigneeId || '', 
    due_date: task.dueDate || new Date().toISOString(),
    status: task.status || 'To Do',
    priority: task.priority || 'Medium',
    tags: task.tags || [],
    timer_start_time: task.timerStartTime || null,
    blocked_by_id: task.blockedById || null,
    completed_at: task.completedAt || null,
  };

  if (task.id) payload.id = task.id;

  const { data, error } = await supabase
    .from('tasks')
    .upsert(payload)
    .select()
    .single();

  if (error) throw error;
  
  const savedTask = mapDbTaskToApp(data);

  if (task.subtasks) {
      if (task.id) {
          await supabase.from('subtasks').delete().eq('task_id', task.id);
      }
      if (task.subtasks.length > 0) {
          await supabase.from('subtasks').insert(
              task.subtasks.map(st => ({ task_id: data.id, title: st.title, is_completed: st.isCompleted }))
          );
      }
  }

  return savedTask;
};

export const addTaskComment = async (taskId: number, authorId: string, content: string) => {
    const { data, error } = await supabase
        .from('comments')
        .insert({ task_id: taskId, author_id: authorId, content })
        .select()
        .single();
    if (error) throw error;
    return mapDbCommentToApp(data);
};

export const logTaskTime = async (taskId: number, startTime: string, endTime: string, duration: number) => {
    const { error } = await supabase
        .from('time_logs')
        .insert({ task_id: taskId, start_time: startTime, end_time: endTime, duration });
    if (error) throw error;
};

export const getAllEmployees = async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return data.map(mapDbProfileToEmployee);
};

export const deleteTask = async (taskId: number) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) throw error;
};
