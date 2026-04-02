import { Project, Task, TeamMember } from './types';

export const TEAM_MEMBERS: TeamMember[] = [
  { id: 'm1', name: 'Alex', avatar: 'https://i.pravatar.cc/150?u=alex' },
  { id: 'm2', name: 'Sarah', avatar: 'https://i.pravatar.cc/150?u=sarah' },
  { id: 'm3', name: 'Mike', avatar: 'https://i.pravatar.cc/150?u=mike' },
  { id: 'm4', name: 'Emma', avatar: 'https://i.pravatar.cc/150?u=emma' },
];

export const INITIAL_PROJECTS: Project[] = [
  { id: 'p1', name: 'Website Redesign', color: '#3b82f6', icon: 'Layout' },
  { id: 'p2', name: 'Mobile App', color: '#10b981', icon: 'Smartphone' },
  { id: 'p3', name: 'Marketing Campaign', color: '#f59e0b', icon: 'Megaphone' },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Design Hero Section',
    description: 'Create a high-fidelity mockup for the new website hero section.',
    status: 'in-progress',
    priority: 'high',
    assignee: TEAM_MEMBERS[0],
    dueDate: '2024-04-15',
    projectId: 'p1',
    subtasks: [
      { id: 's1', title: 'Sketch initial ideas', completed: true, assignee: TEAM_MEMBERS[0] },
      { id: 's2', title: 'Choose color palette', completed: true, assignee: TEAM_MEMBERS[3] },
      { id: 's3', title: 'Design desktop version', completed: false, assignee: TEAM_MEMBERS[0] },
    ],
  },
  {
    id: 't2',
    title: 'Implement Auth Flow',
    description: 'Set up Firebase authentication for the mobile app.',
    status: 'todo',
    priority: 'high',
    assignee: TEAM_MEMBERS[1],
    dueDate: '2024-04-20',
    projectId: 'p2',
    subtasks: [
      { id: 's4', title: 'Configure Firebase project', completed: false, assignee: TEAM_MEMBERS[1] },
      { id: 's5', title: 'Implement login screen', completed: false, assignee: TEAM_MEMBERS[2] },
    ],
  },
  {
    id: 't3',
    title: 'Social Media Assets',
    description: 'Prepare graphics for the upcoming Instagram launch.',
    status: 'review',
    priority: 'medium',
    assignee: TEAM_MEMBERS[2],
    dueDate: '2024-04-12',
    projectId: 'p3',
    subtasks: [],
  },
  {
    id: 't4',
    title: 'Fix Navigation Bug',
    description: 'The mobile menu is not closing on link click.',
    status: 'done',
    priority: 'low',
    assignee: TEAM_MEMBERS[0],
    dueDate: '2024-04-10',
    projectId: 'p1',
    subtasks: [
      { id: 's6', title: 'Identify cause', completed: true, assignee: TEAM_MEMBERS[0] },
      { id: 's7', title: 'Apply fix', completed: true, assignee: TEAM_MEMBERS[0] },
    ],
  },
];
