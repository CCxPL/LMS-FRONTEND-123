// src/pages/teacher/TeacherLeaves.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { Umbrella, User, Calendar, Filter, Search, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import CourseFilter from '../../components/calendar/CourseFilter';
import Loader from '../../components/common/Loader';
import { getAllLeavesApi } from '../../api/leaveApi';

const TeacherLeaves: React.FC = () => {
  const { showToast } = useToast();

  const [leaves, setLeaves] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('approved');

  useEffect(() => {
    loadLeaves();
  }, []);

  // ─── REAL API ─────────────────────────────────────────────────────────────
  const loadLeaves = async () => {
    try {
      const res = await getAllLeavesApi({ status: statusFilter !== 'all' ? statusFilter : undefined });
      setLeaves(res.data?.leaves || []);
    } catch (error) {
      showToast('Failed to load leaves', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadLeaves();
    setIsRefreshing(false);
    showToast('Leaves refreshed', 'success');
  };
  // ─────────────────────────────────────────────────────────────────────────

  const filteredLeaves = useMemo(() => {
    let filtered = [...leaves];

    if (searchTerm) {
      filtered = filtered.filter(leave =>
        (leave.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (leave.reason || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => new Date(b.appliedAt || b.createdAt).getTime() - new Date(a.appliedAt || a.createdAt).getTime());
    return filtered;
  }, [leaves, searchTerm]);

  const totalDays = filteredLeaves.reduce((sum, leave) => sum + (leave.days?.length || 0), 0);
  const currentMonth = new Date().getMonth();
  const thisMonthLeaves = filteredLeaves.filter(leave =>
    new Date(leave.startDate || leave.start).getMonth() === currentMonth
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) return <Loader text="Loading student leaves..." />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Umbrella className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Leaves</h1>
            <p className="text-sm text-gray-500">View all student leave requests</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <RefreshCw className={`w-5 h-5 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Umbrella className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{filteredLeaves.length}</p>
              <p className="text-xs text-gray-500">Total Leaves</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalDays}</p>
              <p className="text-xs text-gray-500">Total Days</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(filteredLeaves.map(l => l.studentId)).size}
              </p>
              <p className="text-xs text-gray-500">Students</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{thisMonthLeaves.length}</p>
              <p className="text-xs text-gray-500">This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Search Student
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name or reason..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setTimeout(() => loadLeaves(), 0);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Filter by Course
            </label>
            <CourseFilter
              selectedCourseId={selectedCourse}
              onCourseChange={setSelectedCourse}
              showAllOption={true}
            />
          </div>
        </div>
      </div>

      {/* Leaves Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {filteredLeaves.length === 0 ? (
          <div className="p-12 text-center">
            <Umbrella className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Leaves Found</h3>
            <p className="text-gray-500 text-sm">No student leaves match your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Days</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeaves.map(leave => (
                  <tr key={leave.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{leave.studentName || 'Unknown'}</p>
                          {leave.studentEmail && (
                            <p className="text-xs text-gray-400">{leave.studentEmail}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(leave.startDate || leave.start).toLocaleDateString('en-GB')}
                        {' - '}
                        {new Date(leave.endDate || leave.end).toLocaleDateString('en-GB')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-[200px] truncate">
                      {leave.reason}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-bold">
                        {leave.days?.length || 0} working days
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(leave.appliedAt || leave.createdAt).toLocaleDateString('en-GB')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherLeaves;