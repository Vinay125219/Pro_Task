export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  status: 'active' | 'completed' | 'on-hold';
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  createdBy: string;
  assignedTo?: string;
  startedBy?: string;
  completedBy?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface AppContextType {
  projects: Project[];
  tasks: Task[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'tasks'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  startTask: (taskId: string, userId: string) => void;
  completeTask: (taskId: string, userId: string) => void;
  assignTask: (taskId: string, assignedUserId: string, assignedByUserId: string) => void;
}

export interface MotivationalQuote {
  text: string;
  author: string;
}