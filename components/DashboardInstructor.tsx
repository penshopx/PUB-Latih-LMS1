import React, { useState, useEffect } from 'react';
import { Plus, Video, FileText, Brain, MoreVertical, Users, Radio, Search, Filter, Mail, AlertCircle } from './ui/Icons';
import { COURSES, MOCK_STUDENT_PROGRESS } from '../constants';
import { Course } from '../types';
import CourseBuilder from './CourseBuilder';
import { useLms } from '../context/LmsContext';

interface DashboardInstructorProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DashboardInstructor: React.FC<DashboardInstructorProps> = ({ activeTab, setActiveTab }) => {
  const { courses } = useLms();
  const [view, setView] = useState<'dashboard' | 'builder'>('dashboard');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Sync internal view with top-level tabs if needed
  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'courses') {
      setView('dashboard');
    }
  }, [activeTab]);

  const handleCreateNew = () => {
    setEditingCourse(null);
    setView('builder');
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setView('builder');
  };

  if (view === 'builder') {
    return (
      <CourseBuilder 
        initialData={editingCourse}
        onBack={() => {
          setView('dashboard');
          setEditingCourse(null);
        }} 
        onSave={(data) => {
          console.log('Saved Course:', data);
          setView('dashboard');
          setEditingCourse(null);
        }} 
      />
    );
  }

  // Determine which sub-tab content to show based on activeTab
  // 'dashboard' and 'courses' show the course list. 'students' shows students.
  const showCourses = activeTab === 'dashboard' || activeTab === 'courses' || activeTab === 'content';
  const showStudents = activeTab === 'students';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Instructor Dashboard</h1>
          <p className="text-slate-500">Manage your courses, students, and live sessions.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex p-1 bg-slate-200 rounded-lg">
            <button 
              onClick={() => setActiveTab('courses')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${showCourses ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              My Courses
            </button>
            <button 
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${showStudents ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Students
            </button>
          </div>

          {showCourses && (
            <button 
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Course</span>
            </button>
          )}
        </div>
      </div>

      {showCourses ? (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">+12%</span>
                </div>
                <h3 className="text-indigo-100 text-sm font-medium">Total Students</h3>
                <p className="text-3xl font-bold">2,845</p>
             </div>
             <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                    <Radio className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium text-slate-400">Next Session</span>
                </div>
                <h3 className="text-slate-500 text-sm font-medium">Upcoming Live Class</h3>
                <p className="text-lg font-bold text-slate-900">AI Ethics Panel</p>
                <p className="text-xs text-slate-400">Today, 4:00 PM</p>
             </div>
             <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                    <Brain className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-slate-500 text-sm font-medium">Avg. Quiz Score</h3>
                <p className="text-3xl font-bold text-slate-900">88%</p>
             </div>
          </div>

          {/* Course Grid */}
          <h2 className="text-lg font-bold text-slate-900 pt-4">My Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map((course: Course) => (
              <div key={course.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                <div className="relative h-40 bg-slate-200">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-xs font-semibold text-slate-700">
                    {course.category}
                  </div>
                  {/* Edit Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                     <button 
                       onClick={() => handleEditCourse(course)}
                       className="px-4 py-2 bg-white rounded-lg text-sm font-bold text-slate-900 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all hover:bg-slate-50"
                     >
                       Manage Course
                     </button>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">{course.title}</h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.studentsEnrolled}
                      </span>
                      <span className="flex items-center gap-1">
                        <Video className="w-4 h-4" />
                        {course.modules.length}
                      </span>
                    </div>
                    <button className="p-1 hover:bg-slate-100 rounded-full">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
           {/* Student Toolbar */}
           <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between gap-4">
             <div className="relative max-w-sm w-full">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search student name..." 
                 className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
               />
             </div>
             <div className="flex gap-2">
               <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
                 <Filter className="w-4 h-4" />
                 Status: All
               </button>
             </div>
           </div>

           {/* Student Table */}
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">Student</th>
                    <th className="px-6 py-4 font-medium">Enrolled Course</th>
                    <th className="px-6 py-4 font-medium">Progress</th>
                    <th className="px-6 py-4 font-medium">Quiz Avg.</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_STUDENT_PROGRESS.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                           <img src={student.studentAvatar} alt="" className="w-10 h-10 rounded-full" />
                           <span className="font-medium text-slate-900">{student.studentName}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {student.courseTitle}
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-32">
                           <div className="flex justify-between text-xs mb-1">
                             <span className="font-medium">{student.progress}%</span>
                           </div>
                           <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                             <div className={`h-full rounded-full ${
                               student.progress === 100 ? 'bg-green-500' : 'bg-indigo-600'
                             }`} style={{ width: `${student.progress}%` }} />
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className={`font-bold ${
                           student.quizAverage >= 80 ? 'text-green-600' : 
                           student.quizAverage < 50 ? 'text-red-500' : 'text-amber-600'
                         }`}>
                           {student.quizAverage > 0 ? `${student.quizAverage}%` : 'N/A'}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                           student.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                           student.status === 'At Risk' ? 'bg-red-50 text-red-700 border-red-200' :
                           'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {student.status === 'At Risk' && <AlertCircle className="w-3 h-3" />}
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors">
                          <Mail className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
           </div>
        </div>
      )}
    </div>
  );
};

export default DashboardInstructor;