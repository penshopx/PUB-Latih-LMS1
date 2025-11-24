
export enum UserRole {
  ADMIN = 'Admin',
  INSTRUCTOR = 'Instructor',
  LEARNER = 'Learner'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  email?: string;
  status?: 'active' | 'inactive';
  lastLogin?: Date;
}

export interface Question {
  id: string;
  text: string;
  type: 'mcq' | 'essay';
  options?: string[];
  correctAnswer?: number; // index for mcq
  // Essay specific
  rubric?: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

export interface CourseModule {
  id: string;
  title: string;
  type: 'video' | 'quiz' | 'text' | 'live';
  duration: string;
  isCompleted: boolean; // Base state (for syllabus preview), overridden by user progress
  // Content specific fields
  videoUrl?: string;
  transcript?: string;
  textContent?: string;
  quizData?: Quiz;
  liveDate?: Date; // For live sessions
  liveUrl?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  progress?: number;
  category: string;
  modules: CourseModule[];
  studentsEnrolled: number;
  rating: number;
}

export interface Certificate {
  id: string;
  courseTitle: string;
  studentName: string;
  issueDate: Date;
  instructor: string;
  serialNumber: string;
}

export interface StudentProgress {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  courseId: string;
  courseTitle: string;
  progress: number; // 0-100
  completedModuleIds: string[]; // List of IDs of completed modules
  lastActive: Date;
  quizAverage: number;
  status: 'Active' | 'At Risk' | 'Completed';
}

export interface AnalyticsData {
  name: string;
  value: number;
  uv?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  image?: string; // Base64 string
  timestamp: Date;
}

export interface Comment {
  id: string;
  courseId: string; // Linked to course
  moduleId?: string; // Optionally linked to specific module
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: Date;
  likes: number;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  points: number;
  trend: 'up' | 'down' | 'neutral';
}
