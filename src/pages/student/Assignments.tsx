import React, { useEffect, useState } from 'react';
import { Search, Filter, Eye, Send, Calendar, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/common/Loader';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { getStudentAssignmentsApi } from '../../api/assignmentApi';

const StudentAssignments: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewAssignment, setViewAssignment] = useState<any | null>(null);
  const [viewFeedback, setViewFeedback] = useState<any | null>(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const res = await getStudentAssignmentsApi();
      const data = (res.data.assignments || []).map((a: any) => ({
        id: a._id,
        title: a.title,
        description: a.description,
        courseName: a.course?.title || a.courseName || '',
        dueDate: a.dueDate || 'N/A',
        totalMarks: a.totalMarks,
        obtainedMarks: a.obtainedMarks,
        status: a.status || 'pending',
        feedback: a.feedback,
      }));
      setAssignments(data);
    } catch (error) {
      showToast('Failed to load assignments', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = assignments.filter(a => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => a.status === 'pending').length,
    submitted: assignments.filter(a => a.status === 'submitted').length,
    graded: assignments.filter(a => a.status === 'graded').length,
    overdue: assignments.filter(a => a.status === 'overdue').length,
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-200 text-gray-700';
      case 'submitted': return 'bg-gray-300 text-gray-800';
      case 'graded': return 'bg-black text-white';
      case 'overdue': return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'submitted': return <Send className="w-4 h-4" />;
      case 'graded': return <CheckCircle className="w-4 h-4" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4" />;
      default: return null;
    }
  };

  const handleSubmit = (assignment: any) => {
    navigate(`/student/submit-assignment/${assignment.id}`);
  };

  if (isLoading) return <Loader text="Loading assignments..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
        <p className="text-gray-500 text-sm mt-1">View and submit your course assignments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Pending', value: stats.pending },
          { label: 'Submitted', value: stats.submitted },
          { label: 'Graded', value: stats.graded },
          { label: 'Overdue', value: stats.overdue },
        ].map((item, idx) => (
          <Card key={idx} className="text-center">
            <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            <p className="text-xs text-gray-500">{item.label}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="graded">Graded</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Assignments List */}
      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No assignments found</p>
          <p className="text-gray-400 text-sm">Check back later for new assignments</p>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Assignment</th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Marks</th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Score</th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{assignment.title}</p>
                        <p className="text-xs text-gray-500">{assignment.courseName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm text-gray-600 flex items-center justify-center gap-1">
                        <Calendar className="w-3 h-3" /> {assignment.dueDate}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-medium text-gray-900">{assignment.totalMarks}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {assignment.obtainedMarks !== undefined && assignment.obtainedMarks !== null ? (
                        <span className="font-bold text-gray-900">
                          {assignment.obtainedMarks}/{assignment.totalMarks}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${getStatusStyle(assignment.status)}`}>
                        {getStatusIcon(assignment.status)}
                        {assignment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {assignment.status === 'pending' ? (
                        <Button size="sm" onClick={() => handleSubmit(assignment)}>
                          <Send className="w-3 h-3" /> Submit
                        </Button>
                      ) : assignment.status === 'graded' ? (
                        <Button variant="outline" size="sm" onClick={() => setViewFeedback(assignment)}>
                          <Eye className="w-3 h-3" /> Feedback
                        </Button>
                      ) : assignment.status === 'overdue' ? (
                        <Button variant="outline" size="sm" disabled>
                          Overdue
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => setViewAssignment(assignment)}>
                          <Eye className="w-3 h-3" /> View
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* View Assignment Modal */}
      <Modal isOpen={!!viewAssignment} onClose={() => setViewAssignment(null)} title="Assignment Details">
        {viewAssignment && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-lg text-gray-900">{viewAssignment.title}</h3>
              <p className="text-sm text-gray-500">{viewAssignment.courseName}</p>
              <span className={`inline-block mt-2 text-xs font-medium px-2 py-1 rounded-full ${getStatusStyle(viewAssignment.status)}`}>
                {viewAssignment.status}
              </span>
            </div>

            {viewAssignment.description && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                <p className="text-sm text-gray-600">{viewAssignment.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <Calendar className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                <p className="font-bold text-gray-900">{viewAssignment.dueDate}</p>
                <p className="text-xs text-gray-500">Due Date</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <FileText className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                <p className="font-bold text-gray-900">{viewAssignment.totalMarks}</p>
                <p className="text-xs text-gray-500">Total Marks</p>
              </div>
            </div>

            <Button variant="outline" fullWidth onClick={() => setViewAssignment(null)}>Close</Button>
          </div>
        )}
      </Modal>

      {/* View Feedback Modal */}
      <Modal isOpen={!!viewFeedback} onClose={() => setViewFeedback(null)} title="Assignment Feedback">
        {viewFeedback && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-lg text-gray-900">{viewFeedback.title}</h3>
              <p className="text-sm text-gray-500">{viewFeedback.courseName}</p>
            </div>

            <div className="bg-gray-100 rounded-xl p-6 text-center">
              <p className="text-4xl font-bold text-gray-900">
                {viewFeedback.obtainedMarks}/{viewFeedback.totalMarks}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {Math.round(((viewFeedback.obtainedMarks || 0) / viewFeedback.totalMarks) * 100)}% Score
              </p>
            </div>

            {viewFeedback.feedback && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Teacher Feedback</h4>
                <p className="text-sm text-gray-700">{viewFeedback.feedback}</p>
              </div>
            )}

            <Button variant="outline" fullWidth onClick={() => setViewFeedback(null)}>Close</Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentAssignments;