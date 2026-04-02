export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'review' | 'done';

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  assignee?: TeamMember;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assignee: TeamMember;
  dueDate: string;
  projectId: string;
  subtasks: SubTask[];
  comments?: Comment[];
}

export interface Project {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export type ViewType = 'kanban' | 'list' | 'table' | 'team' | 'calendar';
