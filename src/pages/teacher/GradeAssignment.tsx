import React, { useEffect, useState, useMemo } from 'react';
import { CheckCircle, Send, FileText, Clock, User, Search, Download } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { getTeacherAssignmentsApi, getAssignmentSubmissionsApi, gradeSubmissionApi } from '../../api/assignmentApi';

const GradeAssignment: React.FC = () => {
  const { showToast } = useToast();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'graded'>('all');
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [isGrading, setIsGrading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const assignRes = await getTeacherAssignmentsApi();
      const allAssignments = assignRes.data?.assignments || [];
      setAssignments(allAssignments);

      const allSubmissions: any[] = [];
      await Promise.all(
        allAssignments.map(async (a: any) => {
          try {
            const res = await getAssignmentSubmissionsApi(a._id || a.id);
            const subs = (res.data?.submissions || []).map((s: any) => ({
              ...s,
              assignmentTitle: a.title,
              courseName: a.course?.title || '',
              totalMarks: a.totalMarks,
            }));
            allSubmissions.push(...subs);
          } catch { }
        })
      );
      setSubmissions(allSubmissions);
    } catch (error) {
      showToast('Failed to load submissions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = submissions;
    if (searchTerm) {
      result = result.filter(s =>
        (s.student?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.assignmentTitle || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(s => s.status === statusFilter);
    }
    return result;
  }, [submissions, searchTerm, statusFilter]);

  const selected = selectedSub ? submissions.find(s => (s._id || s.id) === selectedSub) : null;

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'submitted').length,
    graded: submissions.filter(s => s.status === 'graded').length,
  };

  const openGradeModal = (subId: string) => {
    const sub = submissions.find(s => (s._id || s.id) === subId);
    if (sub) {
      setSelectedSub(subId);
      setGrade(sub.obtainedMarks?.toString() || '');
      setFeedback(sub.feedback || '');
      setShowGradeModal(true);
    }
  };

  const handleGrade = async () => {
    if (!selectedSub || !grade) {
      showToast('Please enter a grade', 'error');
      return;
    }
    const gradeNum = parseInt(grade);
    if (isNaN(gradeNum) || gradeNum < 0) {
      showToast('Please enter a valid grade', 'error');
      return;
    }
    if (selected && gradeNum > selected.totalMarks) {
      showToast(`Grade cannot exceed total marks (${selected.totalMarks})`, 'error');
      return;
    }
    setIsGrading(true);
    try {
      await gradeSubmissionApi(selectedSub, { obtainedMarks: gradeNum, feedback });
      showToast('Assignment graded successfully!', 'success');
      setShowGradeModal(false);
      setGrade('');
      setFeedback('');
      setSelectedSub(null);
      await loadData();
    } catch (error) {
      showToast('Failed to grade assignment', 'error');
    } finally {
      setIsGrading(false);
    }
  };

  const handleExport = () => {
    const csv = [
      ['Student', 'Assignment', 'Course', 'Status', 'Grade', 'Max Grade'].join(','),
      ...filtered.map(s => [
        s.student?.name || 'Unknown',
        s.assignmentTitle || '',
        s.courseName || '',
        s.status,
        s.obtainedMarks ?? 'N/A',
        s.totalMarks,
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'submissions.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Submissions exported', 'success');
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grade Assignments</h1>
          <p className="text-sm text-gray-500 mt-1">Review and grade student submissions</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4" /> Export
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center p-4">
          <p className="text-2xl font-black text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </Card>
        <Card className="text-center p-4 bg-amber-50">
          <p className="text-2xl font-black text-amber-600">{stats.pending}</p>
          <p className="text-xs text-amber-600">Pending</p>
        </Card>
        <Card className="text-center p-4 bg-emerald-50">
          <p className="text-2xl font-black text-emerald-600">{stats.graded}</p>
          <p className="text-xs text-emerald-600">Graded</p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by student or assignment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'submitted', 'graded'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${statusFilter === f ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {f === 'submitted' ? 'Pending' : f}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No submissions found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((sub) => (
            <Card key={sub._id || sub.id} className="border-l-4 border-l-black">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{sub.assignmentTitle}</h4>
                    <p className="text-sm text-gray-500">
                      {sub.student?.name || 'Unknown'} • {sub.courseName || ''}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${sub.status === 'graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                        {sub.status === 'graded' ? 'Graded' : 'Pending Review'}
                      </span>
                      {sub.submittedAt && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(sub.submittedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {sub.status === 'graded' ? (
                    <div className="text-right">
                      <p className="text-2xl font-black text-gray-900">
                        {sub.obtainedMarks}<span className="text-sm text-gray-400 font-normal">/{sub.totalMarks}</span>
                      </p>
                      <button onClick={() => openGradeModal(sub._id || sub.id)} className="text-xs text-blue-600 hover:underline">
                        Edit Grade
                      </button>
                    </div>
                  ) : (
                    <Button onClick={() => openGradeModal(sub._id || sub.id)}>
                      <CheckCircle className="w-4 h-4" /> Grade Now
                    </Button>
                  )}
                </div>
              </div>

              {(sub.submittedText || sub.link || sub.fileUrl) && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Submission:
                  </p>
                  {sub.fileUrl && (
                    <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline">
                      View File
                    </a>
                  )}
                  {sub.link && (
                    <a href={sub.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline">
                      {sub.link}
                    </a>
                  )}
                  {sub.submittedText && <p className="text-sm text-gray-700">{sub.submittedText}</p>}
                </div>
              )}

              {sub.feedback && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                  <p className="text-xs font-bold text-emerald-700 mb-1">Your Feedback:</p>
                  <p className="text-sm text-emerald-800">{sub.feedback}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showGradeModal}
        onClose={() => { setShowGradeModal(false); setSelectedSub(null); setGrade(''); setFeedback(''); }}
        title="Grade Assignment"
        size="md"
      >
        {selected && (
          <div className="space-y-5">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Student</p>
                  <p className="font-medium text-gray-900">{selected.student?.name || 'Unknown'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-500 uppercase">Assignment</p>
                  <p className="font-medium text-gray-900">{selected.assignmentTitle}</p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Score (Max: {selected.totalMarks})
              </label>
              <input
                type="number"
                className="input-field text-lg font-bold text-center"
                placeholder="0"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                max={selected.totalMarks}
                min={0}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Feedback</label>
              <textarea
                className="input-field min-h-[120px]"
                placeholder="Write feedback..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleGrade} className="flex-1" isLoading={isGrading}>
                <Send className="w-4 h-4" /> Submit Grade
              </Button>
              <Button variant="secondary" onClick={() => { setShowGradeModal(false); setSelectedSub(null); setGrade(''); setFeedback(''); }}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GradeAssignment;