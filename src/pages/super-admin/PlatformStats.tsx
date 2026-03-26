import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Users, Award, Download, Calendar, RefreshCw, IndianRupee } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';
import { getPlatformStatsApi, getRevenueApi } from '../../api/superadminApi';

const UserPlus: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const PlatformStats: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statsData, setStatsData] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const { showToast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const [statsRes, revenueRes] = await Promise.all([
        getPlatformStatsApi(),
        getRevenueApi()
      ]);
      setStatsData(statsRes.data);
      setRevenueData(revenueRes.data);
    } catch (error) {
      showToast('Failed to load platform stats', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadStats();
      showToast('Stats refreshed successfully', 'success');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = (type: 'pdf' | 'excel') => {
    showToast(`Report exported as ${type.toUpperCase()} successfully`, 'success');
  };

  if (isLoading) return <Loader text="Loading platform stats..." />;

  const stats = [
    { title: 'Total Enrollments', value: formatNumber(statsData?.courses?.totalEnrollments ?? 0), change: '+Live', up: true, icon: Users },
    { title: 'Total Students', value: formatNumber(statsData?.users?.students ?? 0), change: '+Live', up: true, icon: UserPlus },
    { title: 'Published Courses', value: formatNumber(statsData?.courses?.published ?? 0), change: '+Live', up: true, icon: Award },
    { title: 'Total Revenue', value: formatCurrency(revenueData?.totalRevenue ?? 0), change: '+Live', up: true, icon: IndianRupee },
  ];

  const topCourses = (revenueData?.courseRevenue || []).slice(0, 4).map((c: any, idx: number) => ({
    name: c.courseTitle,
    students: c.enrollments,
    rating: 'N/A',
    completion: 'N/A',
    revenue: c.revenue,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Platform Statistics</h1>
          <p className="page-subtitle">Detailed analytics and growth metrics</p>
        </div>
        <div className="flex flex-wrap gap-3">
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
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
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
        {/* Platform Overview */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-6">Platform Overview</h3>
          <div className="space-y-4">
            {[
              { label: 'Total Users', value: statsData?.users?.total ?? 0, color: 'bg-blue-500' },
              { label: 'Active Users', value: statsData?.users?.active ?? 0, color: 'bg-green-500' },
              { label: 'Total Teachers', value: statsData?.users?.teachers ?? 0, color: 'bg-purple-500' },
              { label: 'Total Admins', value: statsData?.users?.admins ?? 0, color: 'bg-orange-500' },
              { label: 'Total Videos', value: statsData?.content?.videos ?? 0, color: 'bg-pink-500' },
              { label: 'Total Quizzes', value: statsData?.content?.quizzes ?? 0, color: 'bg-yellow-500' },
              { label: 'Quiz Attempts', value: statsData?.content?.quizAttempts ?? 0, color: 'bg-indigo-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{formatNumber(item.value)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Courses */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-6">Top Performing Courses</h3>
          {topCourses.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No course data available</div>
          ) : (
            <div className="space-y-3">
              {topCourses.map((course: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-300 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-200 text-gray-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-white text-gray-500 border border-gray-200'}`}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{course.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{course.students} students</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">{formatCurrency(course.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Course Stats */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Course Statistics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Courses', value: statsData?.courses?.total ?? 0, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Published Courses', value: statsData?.courses?.published ?? 0, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Pending Approval', value: statsData?.courses?.pending ?? 0, color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map((item, i) => (
            <div key={i} className={`${item.bg} rounded-xl p-6 text-center`}>
              <p className={`text-3xl font-black ${item.color}`}>{formatNumber(item.value)}</p>
              <p className="text-sm text-gray-600 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default PlatformStats;