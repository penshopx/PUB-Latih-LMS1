import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course, User, StudentProgress, Certificate, UserRole, Comment } from '../types';
import { COURSES, USERS, MOCK_STUDENT_PROGRESS, MOCK_CERTIFICATES, MOCK_COMMENTS } from '../constants';

interface LmsContextType {
  users: User[];
  courses: Course[];
  progressData: StudentProgress[];
  certificates: Certificate[];
  comments: Comment[];
  currentUser: User;
  setCurrentUser: (user: User) => void;
  // Actions
  addCourse: (course: Course) => void;
  updateCourse: (course: Course) => void;
  enrollCourse: (userId: string, courseId: string) => void;
  markModuleCompleted: (userId: string, courseId: string, moduleId: string, quizScore?: number) => void;
  getStudentProgress: (userId: string, courseId: string) => StudentProgress | undefined;
  addComment: (comment: Comment) => void;
  toggleUserStatus: (userId: string) => void;
}

const LmsContext = createContext<LmsContextType | undefined>(undefined);

export const LmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with Mock Constants
  const [users, setUsers] = useState<User[]>(USERS);
  const [courses, setCourses] = useState<Course[]>(COURSES);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [currentUser, setCurrentUser] = useState<User>(USERS[2]); // Default to John Learner

  // Initialize progress from local storage or fallback to mock
  const [progressData, setProgressData] = useState<StudentProgress[]>(() => {
    try {
      const saved = localStorage.getItem('pub_latih_progress');
      if (saved) {
        // Sanitize loaded data to ensure all fields exist
        return JSON.parse(saved).map((p: any) => ({
          ...p,
          lastActive: p.lastActive ? new Date(p.lastActive) : new Date(),
          completedModuleIds: Array.isArray(p.completedModuleIds) ? p.completedModuleIds : [],
          quizAverage: typeof p.quizAverage === 'number' ? p.quizAverage : 0,
          status: p.status || 'Active'
        }));
      }
      return MOCK_STUDENT_PROGRESS;
    } catch (e) {
      console.error("Failed to load progress:", e);
      return MOCK_STUDENT_PROGRESS;
    }
  });

  // Initialize certificates from local storage or fallback to mock
  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    try {
      const saved = localStorage.getItem('pub_latih_certificates');
      if (saved) {
        return JSON.parse(saved).map((c: any) => ({
          ...c,
          issueDate: c.issueDate ? new Date(c.issueDate) : new Date()
        }));
      }
      return MOCK_CERTIFICATES;
    } catch (e) {
      console.error("Failed to load certificates:", e);
      return MOCK_CERTIFICATES;
    }
  });

  // Persist progress to local storage
  useEffect(() => {
    try {
      localStorage.setItem('pub_latih_progress', JSON.stringify(progressData));
    } catch (e) {
      console.error("Failed to save progress:", e);
    }
  }, [progressData]);

  // Persist certificates to local storage
  useEffect(() => {
    try {
      localStorage.setItem('pub_latih_certificates', JSON.stringify(certificates));
    } catch (e) {
      console.error("Failed to save certificates:", e);
    }
  }, [certificates]);

  // Check for course completion and issue certificates
  useEffect(() => {
    progressData.forEach(p => {
      // Logic: If status is completed OR progress is 100, ensure certificate exists
      if (p.status === 'Completed' || p.progress === 100) {
        setCertificates(prevCerts => {
          // Check if certificate already exists for this student and course
          const exists = prevCerts.some(c => 
            c.courseTitle === p.courseTitle && 
            c.studentName === p.studentName
          );
          
          if (exists) return prevCerts;

          const course = courses.find(c => c.id === p.courseId);
          // Fallback if course deleted but progress remains
          const instructorName = course ? course.instructor : 'PUB-Latih AI Instructor';

          const newCert: Certificate = {
            id: `cert-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            courseTitle: p.courseTitle,
            studentName: p.studentName,
            instructor: instructorName,
            issueDate: new Date(),
            serialNumber: `LMS-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000)}`
          };
          
          return [newCert, ...prevCerts];
        });
      }
    });
  }, [progressData, courses]);

  const addCourse = (course: Course) => {
    setCourses(prev => [...prev, course]);
  };

  const updateCourse = (updatedCourse: Course) => {
    setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  };

  const enrollCourse = (userId: string, courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    const user = users.find(u => u.id === userId);
    
    if (!course || !user) return;

    // Check if already enrolled
    if (progressData.some(p => p.studentId === userId && p.courseId === courseId)) return;

    const newProgress: StudentProgress = {
      id: `sp-${Date.now()}`,
      studentId: userId,
      studentName: user.name,
      studentAvatar: user.avatar,
      courseId: courseId,
      courseTitle: course.title,
      progress: 0,
      completedModuleIds: [],
      lastActive: new Date(),
      quizAverage: 0,
      status: 'Active'
    };

    setProgressData(prev => [...prev, newProgress]);
    
    // Update course enrollment count
    setCourses(prev => prev.map(c => 
      c.id === courseId ? { ...c, studentsEnrolled: c.studentsEnrolled + 1 } : c
    ));
  };

  const markModuleCompleted = (userId: string, courseId: string, moduleId: string, quizScore?: number) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    // Use a callback to access the latest state safely
    setProgressData(prevData => {
      const index = prevData.findIndex(p => p.studentId === userId && p.courseId === courseId);
      if (index === -1) return prevData;

      const currentProgress = prevData[index];
      const wasAlreadyCompleted = currentProgress.completedModuleIds.includes(moduleId);
      
      const newCompletedIds = wasAlreadyCompleted 
        ? currentProgress.completedModuleIds 
        : [...currentProgress.completedModuleIds, moduleId];

      // Calculate new progress percentage
      const totalModules = course.modules.length;
      const progressPercentage = totalModules > 0 
        ? Math.round((newCompletedIds.length / totalModules) * 100)
        : 0;

      const isCourseComplete = progressPercentage === 100;
      const newStatus = isCourseComplete ? 'Completed' : 'Active';

      // Calculate Quiz Average
      let newQuizAvg = currentProgress.quizAverage;
      
      // Only update average if this is a new completion and a score was provided
      if (quizScore !== undefined && !wasAlreadyCompleted) {
         const quizModules = course.modules.filter(m => m.type === 'quiz');
         // Find how many quizzes were *previously* completed
         const previouslyCompletedQuizIds = currentProgress.completedModuleIds.filter(id => 
           quizModules.some(q => q.id === id)
         );
         const oldQuizCount = previouslyCompletedQuizIds.length;
         
         // Calculate weighted average
         // Formula: ((oldAvg * oldCount) + newScore) / (oldCount + 1)
         const currentTotalScore = currentProgress.quizAverage * oldQuizCount;
         newQuizAvg = Math.round((currentTotalScore + quizScore) / (oldQuizCount + 1));
      }

      const updatedProgress: StudentProgress = {
        ...currentProgress,
        completedModuleIds: newCompletedIds,
        progress: progressPercentage,
        status: newStatus,
        quizAverage: newQuizAvg,
        lastActive: new Date()
      };

      // Create new array with updated item
      const newProgressData = [...prevData];
      newProgressData[index] = updatedProgress;

      return newProgressData;
    });
  };

  const getStudentProgress = (userId: string, courseId: string) => {
    return progressData.find(p => p.studentId === userId && p.courseId === courseId);
  };

  const addComment = (comment: Comment) => {
    setComments(prev => [comment, ...prev]);
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
    ));
  };

  return (
    <LmsContext.Provider value={{
      users,
      courses,
      progressData,
      certificates,
      comments,
      currentUser,
      setCurrentUser,
      addCourse,
      updateCourse,
      enrollCourse,
      markModuleCompleted,
      getStudentProgress,
      addComment,
      toggleUserStatus
    }}>
      {children}
    </LmsContext.Provider>
  );
};

export const useLms = () => {
  const context = useContext(LmsContext);
  if (context === undefined) {
    throw new Error('useLms must be used within an LmsProvider');
  }
  return context;
};