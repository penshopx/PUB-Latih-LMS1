import React, { useState } from 'react';
import { LmsProvider, useLms } from './context/LmsContext';
import Sidebar from './components/Sidebar';
import DashboardAdmin from './components/DashboardAdmin';
import DashboardInstructor from './components/DashboardInstructor';
import DashboardLearner from './components/DashboardLearner';
import AIChatbot from './components/AIChatbot';
import CoursePlayer from './components/CoursePlayer';
import CourseDetail from './components/CourseDetail';
import CertificateView from './components/CertificateView';
import { UserRole, Course, Certificate } from './types';
import { Menu, Bell, Search } from './components/ui/Icons';

// Inner App Component to consume Context
const AppContent = () => {
  const { currentUser, setCurrentUser, users, courses, certificates, enrollCourse, getStudentProgress } = useLms();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Routing State
  const [activeView, setActiveView] = useState<'dashboard' | 'player' | 'detail' | 'certificate'>('dashboard');
  
  // Use IDs to reference selected items ensures we always get the latest data from Context
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedCertificateId, setSelectedCertificateId] = useState<string | null>(null);

  // Derived State
  const selectedCourse = selectedCourseId ? courses.find(c => c.id === selectedCourseId) || null : null;
  const selectedCertificate = selectedCertificateId ? certificates.find(c => c.id === selectedCertificateId) || null : null;

  // Global Dashboard Tab State (Synced with Sidebar)
  const [dashboardTab, setDashboardTab] = useState<string>('overview');

  const handleNavigateToCourse = (course: Course) => {
    setSelectedCourseId(course.id);
    setActiveView('player');
  };

  const handleNavigateToDetail = (course: Course) => {
    setSelectedCourseId(course.id);
    setActiveView('detail');
  };

  const handleViewCertificate = (cert: Certificate) => {
    setSelectedCertificateId(cert.id);
    setActiveView('certificate');
  };

  const handleBackToDashboard = () => {
    setSelectedCourseId(null);
    setSelectedCertificateId(null);
    setActiveView('dashboard');
  };

  // Check enrollment status helper
  const isEnrolled = (courseId: string) => {
    return !!getStudentProgress(currentUser.id, courseId);
  };

  // Render Full Page Views
  const renderContent = () => {
    if (activeView === 'player' && selectedCourse) {
      return (
        <CoursePlayer 
          course={selectedCourse} 
          onBack={handleBackToDashboard} 
        />
      );
    }

    if (activeView === 'certificate' && selectedCertificate) {
      return (
        <CertificateView 
          certificate={selectedCertificate} 
          onBack={handleBackToDashboard} 
        />
      );
    }

    if (activeView === 'detail' && selectedCourse) {
      return (
        <CourseDetail
          course={selectedCourse}
          onBack={handleBackToDashboard}
          onEnroll={() => {
            enrollCourse(currentUser.id, selectedCourse.id);
            setActiveView('player');
          }}
          isEnrolled={isEnrolled(selectedCourse.id)}
        />
      );
    }

    // Default Dashboard Layout
    return (
      <div className="flex min-h-screen bg-slate-50">
        {/* Sidebar Navigation */}
        <Sidebar 
          role={currentUser.role} 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen}
          activeTab={dashboardTab}
          onNavigate={(tab) => {
            setDashboardTab(tab);
            setActiveView('dashboard'); // Ensure we are on dashboard when clicking sidebar
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 transition-all duration-300">
          
          {/* Top Header */}
          <header className="bg-white border-b border-slate-200 h-16 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg lg:hidden text-slate-600"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden md:flex items-center bg-slate-100 rounded-lg px-3 py-2 w-64">
                <Search className="w-4 h-4 text-slate-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search courses, users..." 
                  className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Role Switcher for Demo Purpose */}
              <select 
                value={currentUser.id}
                onChange={(e) => {
                  const user = users.find(u => u.id === e.target.value);
                  if (user) {
                    setCurrentUser(user);
                    setActiveView('dashboard'); // Reset view on role change
                    setDashboardTab(user.role === 'Admin' ? 'overview' : 'learning'); // Reset tab default
                  }
                }}
                className="hidden sm:block text-xs font-medium bg-slate-100 border border-slate-200 rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.role}: {u.name}</option>
                ))}
              </select>

              <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              
              <div className="h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 overflow-hidden cursor-pointer">
                <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              {currentUser.role === UserRole.ADMIN && (
                <DashboardAdmin activeTab={dashboardTab} setActiveTab={setDashboardTab} />
              )}
              {currentUser.role === UserRole.INSTRUCTOR && (
                <DashboardInstructor activeTab={dashboardTab} setActiveTab={setDashboardTab} />
              )}
              {currentUser.role === UserRole.LEARNER && (
                <DashboardLearner 
                  onNavigateToCourse={handleNavigateToCourse}
                  onNavigateToDetail={handleNavigateToDetail}
                  onViewCertificate={handleViewCertificate}
                  activeTab={dashboardTab}
                  setActiveTab={setDashboardTab}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    );
  };

  return (
    <>
      {renderContent()}
      <AIChatbot userRole={currentUser.role} />
    </>
  );
};

// Root App Component
function App() {
  return (
    <LmsProvider>
      <AppContent />
    </LmsProvider>
  );
}

export default App;