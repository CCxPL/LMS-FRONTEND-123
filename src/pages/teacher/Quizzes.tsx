import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, Search, RefreshCw, Download, Copy, Clock, HelpCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/common/Loader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import type { Quiz } from '../../types/course.types';
import { courseService } from '../../services/courseService';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const TeacherQuizzes: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewQuiz, setViewQuiz] = useState<Quiz | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Quiz | null>(null);

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const data = await courseService.getQuizzes();
      setQuizzes(data);
    } catch (error) {
      showToast('Failed to load quizzes', 'error');
    }
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadQuizzes();
    setIsRefreshing(false);
    showToast('Quizzes refreshed', 'success');
  };

  // Filter quizzes
  const filtered = quizzes.filter(q => 
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Delete quiz
  const handleDelete = () => {
    if (!deleteConfirm) return;
    setQuizzes(prev => prev.filter(q => q.id !== deleteConfirm.id));
    showToast('Quiz deleted successfully', 'info');
    setDeleteConfirm(null);
  };

  // Duplicate quiz
  const handleDuplicate = (quiz: Quiz) => {
    const duplicated: Quiz = {
      ...quiz,
      id: `quiz-${Date.now()}`,
      title: `${quiz.title} (Copy)`
    };
    setQuizzes(prev => [duplicated, ...prev]);
    showToast('Quiz duplicated', 'success');
  };

  // Export quiz
  const handleExport = () => {
    const csv = [
      ['Title', 'Course', 'Questions', 'Duration', 'Marks', 'Passing %'].join(','),
      ...filtered.map(q => [q.title, q.courseName, q.totalQuestions, q.duration, q.totalMarks, q.passingPercentage].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quizzes.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Quizzes exported', 'success');
  };

  // Stats
  const stats = {
    total: quizzes.length,
    totalQuestions: quizzes.reduce((sum, q) => sum + q.totalQuestions, 0),
    avgDuration: quizzes.length > 0 
      ? Math.round(quizzes.reduce((sum, q) => sum + q.duration, 0) / quizzes.length)
      : 0
  };

  if (isLoading) return <Loader text="Loading quizzes..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Quizzes</h1>
          <p className="page-subtitle">Create and manage course quizzes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4" />
          </Button>
          <Button onClick={() => navigate('/teacher/create-quiz')}>
            <Plus className="w-4 h-4" /> Create Quiz
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center p-4">
          <p className="text-2xl font-black text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total Quizzes</p>
        </Card>
        <Card className="text-center p-4 bg-blue-50 border-blue-100">
          <p className="text-2xl font-black text-blue-600">{stats.totalQuestions}</p>
          <p className="text-xs text-blue-600">Total Questions</p>
        </Card>
        <Card className="text-center p-4 bg-purple-50 border-purple-100">
          <p className="text-2xl font-black text-purple-600">{stats.avgDuration}m</p>
          <p className="text-xs text-purple-600">Avg Duration</p>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <span className="text-sm text-gray-500 self-center">
            {filtered.length} quiz(zes)
          </span>
        </div>
      </Card>

      {/* Quizzes Grid */}
      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No quizzes found</p>
          <p className="text-gray-400 text-sm mb-4">Create your first quiz to get started</p>
          <Button onClick={() => navigate('/teacher/create-quiz')}>
            <Plus className="w-4 h-4" /> Create Quiz
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((quiz) => (
            <Card key={quiz.id} hover>
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 text-lg">{quiz.title}</h3>
                <p className="text-sm text-gray-500">{quiz.courseName}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <p className="font-bold text-gray-900">{quiz.totalQuestions}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Questions</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <p className="font-bold text-gray-900">{quiz.duration}m</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Duration</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <p className="font-bold text-gray-900">{quiz.totalMarks}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Marks</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <p className="font-bold text-gray-900">{quiz.passingPercentage}%</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Passing</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setViewQuiz(quiz)}
                >
                  <Eye className="w-4 h-4" /> View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/teacher/create-quiz')}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDuplicate(quiz)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setDeleteConfirm(quiz)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* View Quiz Modal */}
      <Modal
        isOpen={!!viewQuiz}
        onClose={() => setViewQuiz(null)}
        title="Quiz Details"
        size="md"
      >
        {viewQuiz && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-lg text-gray-900">{viewQuiz.title}</h3>
              <p className="text-sm text-gray-500">{viewQuiz.courseName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <HelpCircle className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{viewQuiz.totalQuestions}</p>
                <p className="text-sm text-gray-500">Questions</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <Clock className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{viewQuiz.duration}m</p>
                <p className="text-sm text-gray-500">Duration</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total Marks</span>
                <span className="font-bold text-gray-900">{viewQuiz.totalMarks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Passing Percentage</span>
                <span className="font-bold text-gray-900">{viewQuiz.passingPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Max Attempts</span>
                <span className="font-bold text-gray-900">{viewQuiz.maxAttempts || 3}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => { setViewQuiz(null); navigate('/teacher/create-quiz'); }}>
                <Edit className="w-4 h-4" /> Edit Quiz
              </Button>
              <Button variant="secondary" onClick={() => setViewQuiz(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
            {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Quiz?"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default TeacherQuizzes;