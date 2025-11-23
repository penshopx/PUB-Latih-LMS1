import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { Users, BookOpen, Award, TrendingUp, Search, Filter, MoreHorizontal, UserCheck, Ban, Mail } from './ui/Icons';
import { MOCK_ANALYTICS, COURSE_DISTRIBUTION } from '../constants';
import { useLms } from '../context/LmsContext';

interface DashboardAdminProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${change >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
        {change > 0 ? '+' : ''}{change}%
      </span>
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

const DashboardAdmin: React.FC<DashboardAdminProps> = ({ activeTab, setActiveTab }) => {
  const { users, toggleUserStatus, certificates, courses } = useLms();
  const [searchTerm, setSearchTerm] = useState('');

  // Default to overview if activeTab is not 'users'
  const currentView = activeTab === 'users' ? 'users' : 'overview';

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Portal</h1>
          <p className="text-slate-500">Manage system, users, and analytics.</p>
        </div>
        
        {/* Tabs */}
        <div className="flex p-1 bg-slate-200 rounded-xl self-start sm:self-auto">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'overview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'users' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            User Management
          </button>
        </div>
      </div>

      {currentView === 'overview' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Users" value={users.length} change={12} icon={Users} color="bg-blue-500" />
            <StatCard title="Active Courses" value={courses.length} change={5} icon={BookOpen} color="bg-indigo-500" />
            <StatCard title="Certificates Issued" value={certificates.length} change={24} icon={Award} color="bg-amber-500" />
            <StatCard title="AI Interactions" value="150k+" change={35} icon={TrendingUp} color="bg-purple-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">User Engagement Trend</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_ANALYTICS}>
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="uv" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Course Category Distribution</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={COURSE_DISTRIBUTION}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px' }} />
                    <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                      {COURSE_DISTRIBUTION.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#d946ef', '#ec4899'][index % 4]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table Actions */}
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between gap-4">
             <div className="relative max-w-sm w-full">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search users..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
               />
             </div>
             <div className="flex gap-2">
               <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
                 <Filter className="w-4 h-4" />
                 Filter
               </button>
               <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                 Add User
               </button>
             </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Last Login</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <p className="font-medium text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 
                          user.role === 'Instructor' ? 'bg-blue-100 text-blue-800' : 
                          'bg-emerald-100 text-emerald-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-slate-400'}`} />
                         <span className="capitalize text-slate-600">{user.status || 'active'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Email">
                          <Mail className="w-4 h-4" />
                        </button>
                        {user.status === 'active' ? (
                          <button 
                            onClick={() => toggleUserStatus(user.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" 
                            title="Deactivate"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                           <button 
                             onClick={() => toggleUserStatus(user.id)}
                             className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg" 
                             title="Activate"
                           >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
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

export default DashboardAdmin;