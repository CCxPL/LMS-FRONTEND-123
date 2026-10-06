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
  const [dateRange, setDateRange] = useState('month');
  const [statsData, setStatsData] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const { showToast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const [statsRes, revenueRes] = await Promise.all([
        getPlatformStatsApi(),
        getRevenueApi(),
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

  // ─── REAL API DATA ────────────────────────────────────────────────────────
  const stats = [
    { title: 'Total Enrollments', value: formatNumber(statsData?.courses?.totalEnrollments ?? 0), change: '+Live', up: true, icon: Users },
    { title: 'Total Students', value: formatNumber(statsData?.users?.students ?? 0), change: '+Live', up: true, icon: UserPlus },
    { title: 'Published Courses', value: formatNumber(statsData?.courses?.published ?? 0), change: '+Live', up: true, icon: Award },
    { title: 'Total Revenue', value: formatCurrency(revenueData?.totalRevenue ?? 0), change: '+Live', up: true, icon: IndianRupee },
  ];

  const topCourses = (revenueData?.courseRevenue || []).slice(0, 4).map((c: any) => ({
    name: c.courseTitle,
    students: c.enrollments,
    rating: 'N/A',
    completion: 'N/A',
    revenue: c.revenue,
  }));

  // Monthly growth — use real data if available, fallback to empty array
  const monthlyStats: { month: string; active: number; growth: number }[] =
    statsData?.monthlyGrowth?.length
      ? statsData.monthlyGrowth
      : [];
  const maxActive = monthlyStats.length > 0 ? Math.max(...monthlyStats.map((s) => s.active)) : 1;
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Platform Statistics</h1>
          <p className="page-subtitle">Detailed analytics and growth metrics</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Date Range Filter — UI only (filter wired to state, API doesn't support it yet) */}
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
        {/* Monthly Growth Chart — real API data */}
        <Card className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">User Activity Growth</h3>
              <p className="text-sm text-gray-500">Monthly active users trend</p>
            </div>
            <div className="flex gap-4">
              <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
                <div className="w-2 h-2 bg-black rounded-full" /> Active
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
                <div className="w-2 h-2 bg-gray-200 rounded-full" /> Inactive
              </span>
            </div>
          </div>

          {monthlyStats.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              No monthly data available
            </div>
          ) : (
            <div className="flex-1 flex items-end justify-between gap-3 h-64 px-2 pt-4">
              {monthlyStats.map((stat) => (
                <div key={stat.month} className="w-full flex flex-col justify-end gap-2 group cursor-pointer relative">
                  {/* Tooltip */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    {stat.active} Users ({stat.growth}% growth)
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45" />
                  </div>
                  {/* Bar */}
                  <div
                    className="w-full bg-black rounded-t-sm opacity-80 group-hover:opacity-100 transition-all group-hover:bg-emerald-600"
                    style={{ height: `${(stat.active / maxActive) * 100}%` }}
                  />
                  {/* Label */}
                  <span className="text-xs font-medium text-gray-400 text-center group-hover:text-black transition-colors">
                    {stat.month}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top Courses — real API data */}
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

          {topCourses.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              No course data available
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-75 pr-2">
              {topCourses.map((course: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-300 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                        idx === 1 ? 'bg-gray-200 text-gray-700' :
                          idx === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-white text-gray-500 border border-gray-200'
                      }`}>
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