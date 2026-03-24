import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Users, Award, Download, Calendar, RefreshCw, IndianRupee } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

// Helper Icon for New Users
const UserPlus: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="20" y1="8" x2="20" y2="14"/>
    <line x1="23" y1="11" x2="17" y2="11"/>
  </svg>
);

const PlatformStats: React.FC = () => {
  const [dateRange, setDateRange] = useState('month');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { showToast } = useToast();

  // Helper to format currency in INR
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Helper to format numbers in Indian system
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  // Dynamic stats based on date range
  const getStats = () => {
    const multiplier = dateRange === 'week' ? 0.25 : dateRange === 'month' ? 1 : dateRange === 'quarter' ? 3 : 12;
    return [
      { title: 'Total Enrollments', value: formatNumber(Math.round(4230 * multiplier)), change: '+25%', up: true, icon: Users },
      { title: 'New Signups', value: formatNumber(Math.round(1234 * multiplier)), change: '+18%', up: true, icon: UserPlus },
      { title: 'Completion Rate', value: '78%', change: '+5%', up: true, icon: Award },
      { title: 'Revenue', value: formatCurrency(Math.round(350000 * multiplier)), change: '+12%', up: true, icon: IndianRupee },
    ];
  };

  const stats = getStats();

  const monthlyStats = [
    { month: 'Jan', active: 450, growth: 12 },
    { month: 'Feb', active: 580, growth: 28 },
    { month: 'Mar', active: 720, growth: 24 },
    { month: 'Apr', active: 890, growth: 23 },
    { month: 'May', active: 1050, growth: 18 },
    { month: 'Jun', active: 1200, growth: 14 },
  ];

  const topCourses = [
    { name: 'React.js Complete Guide', students: 156, rating: 4.8, completion: '92%', revenue: 45600 },
    { name: 'Python Data Science', students: 234, rating: 4.7, completion: '88%', revenue: 67800 },
    { name: 'Machine Learning A-Z', students: 178, rating: 4.6, completion: '85%', revenue: 53400 },
    { name: 'Cloud Computing (AWS)', students: 89, rating: 4.5, completion: '76%', revenue: 26700 },
  ];

  // Refresh Stats
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Stats refreshed successfully', 'success');
    }, 1000);
  };

  // Export Report
  const handleExport = (type: 'pdf' | 'excel') => {
    showToast(`Report exported as ${type.toUpperCase()} successfully`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Platform Statistics</h1>
          <p className="page-subtitle">Detailed analytics and growth metrics</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Date Range Filter */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border-none bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <Download className="w-4 h-4" /> PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport('excel')}>
              <Download className="w-4 h-4" /> Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="hover:border-black transition-all duration-300 cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-gray-100 rounded-lg text-gray-700 group-hover:bg-black group-hover:text-white transition-colors">
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                stat.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}>
                {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Growth Chart */}
        <Card className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">User Activity Growth</h3>
              <p className="text-sm text-gray-500">Monthly active users trend</p>
            </div>
            <div className="flex gap-4">
              <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
                <div className="w-2 h-2 bg-black rounded-full"></div> Active
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
                <div className="w-2 h-2 bg-gray-200 rounded-full"></div> Inactive
              </span>
            </div>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-3 h-64 px-2 pt-4">
            {monthlyStats.map((stat) => (
              <div key={stat.month} className="w-full flex flex-col justify-end gap-2 group cursor-pointer relative">
                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                  {stat.active} Users ({stat.growth}% growth)
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
                </div>
                
                {/* Bar */}
                <div 
                  className="w-full bg-black rounded-t-sm opacity-80 group-hover:opacity-100 transition-all group-hover:bg-emerald-600"
                  style={{ height: `${(stat.active / 1200) * 100}%` }}
                />
                
                {/* Label */}
                <span className="text-xs font-medium text-gray-400 text-center group-hover:text-black transition-colors">
                  {stat.month}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Courses */}
        <Card className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Top Performing Courses</h3>
              <p className="text-sm text-gray-500">Based on engagement and revenue</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => showToast('Redirecting to all courses...', 'info')}>
              View All
            </Button>
          </div>
          
          <div className="space-y-3 overflow-y-auto max-h-75 pr-2">
            {topCourses.map((course, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-300 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm ${
                    idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                    idx === 1 ? 'bg-gray-200 text-gray-700' :
                    idx === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-white text-gray-500 border border-gray-200'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{course.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {course.students} students • ⭐ {course.rating}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">{course.completion}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(course.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PlatformStats;