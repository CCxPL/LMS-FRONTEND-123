import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, HelpCircle, Play, Trophy, Search, Filter, Eye, RotateCcw } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';
import { getMyQuizzesApi } from '../../api/quizApi';

const StudentQuizzes: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewQuiz, setViewQuiz] = useState<any | null>(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const res = await getMyQuizzesApi();
      const data = (res.data.quizzes || []).map((q: any) => ({
        id: q._id,
        title: q.title,
        courseName: q.course?.title || q.courseName || '',
        totalQuestions: q.questions?.length || q.totalQuestions || 0,
        totalMarks: q.totalMarks,
        duration: q.duration,
        passingPercentage: q.passingPercentage || 60,
        maxAttempts: q.maxAttempts || 1,
        attempts: q.userAttempts || 0,
        status: q.userAttempts > 0 ? 'completed' : 'not-started',
        obtainedMarks: q.lastScore ?? undefined,        // actual marks
        lastPercentage: q.lastPercentage ?? undefined,
      }));
      setQuizzes(data);
    } catch (error) {
      showToast('Failed to load quizzes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = quizzes.filter(q => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: quizzes.length,
    completed: quizzes.filter(q => q.status === 'completed').length,
    notStarted: quizzes.filter(q => q.status === 'not-started').length,
    avgScore: quizzes.filter(q => q.obtainedMarks !== undefined).length > 0
      ? Math.round(
        quizzes
          .filter(q => q.obtainedMarks !== undefined)
          .reduce((sum, q) => sum + q.lastPercentage!, 0) /
        quizzes.filter(q => q.obtainedMarks !== undefined).length
      )
      : 0,
  };

  const handleStartQuiz = (quiz: any) => {
    if (quiz.attempts >= quiz.maxAttempts) {
      showToast('Maximum attempts reached', 'error');
      return;
    }
    navigate(`/student/quiz/${quiz.id}`);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-black text-white';
      case 'in-progress': return 'bg-gray-200 text-gray-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (isLoading) return <Loader text="Loading quizzes..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Quizzes</h1>
        <p className="text-gray-500 text-sm mt-1">Attempt quizzes and view your scores</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </Card>
        <Card className="text-center bg-gray-50">
          <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </Card>
        <Card className="text-center bg-gray-50">
          <p className="text-2xl font-bold text-gray-900">{stats.notStarted}</p>
          <p className="text-xs text-gray-500">Not Started</p>
        </Card>
        <Card className="text-center bg-gray-50">
          <p className="text-2xl font-bold text-gray-900">{stats.avgScore}%</p>
          <p className="text-xs text-gray-500">Avg Score</p>
        </Card>
      </div>

      {/* Filters */}
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
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Status</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Quizzes Grid */}
      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No quizzes found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((quiz) => (
            <Card key={quiz.id} hover className="flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                  <p className="text-sm text-gray-500">{quiz.courseName}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusStyle(quiz.status)}`}>
                  {quiz.status}
                </span>
              </div>

              {/* Quiz Info */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <HelpCircle className="w-4 h-4" />
                  {quiz.totalQuestions} Questions
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {quiz.duration} Min
                </div>
              </div>

              {/* Score Card */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Marks</span>
                  <span className="font-medium text-gray-700">{quiz.totalMarks}</span>
                </div>
                {quiz.obtainedMarks !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Your Score</span>
                    <span className="font-bold text-gray-900">
                      {quiz.lastPercentage}%
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Attempts</span>
                  <span className="font-medium text-gray-700">
                    {quiz.attempts}/{quiz.maxAttempts}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto space-y-2">
                {quiz.status === 'completed' ? (
                  <div className="space-y-2">
                    <Button variant="outline" fullWidth onClick={() => setViewQuiz(quiz)}>
                      <Eye className="w-4 h-4" /> View Results
                    </Button>
                    {quiz.attempts < quiz.maxAttempts && (
                      <Button variant="outline" fullWidth onClick={() => handleStartQuiz(quiz)}>
                        <RotateCcw className="w-4 h-4" /> Retry
                      </Button>
                    )}
                  </div>
                ) : quiz.attempts >= quiz.maxAttempts ? (
                  <Button variant="outline" fullWidth disabled>
                    Max Attempts Reached
                  </Button>
                ) : (
                  <Button fullWidth onClick={() => handleStartQuiz(quiz)}>
                    <Play className="w-4 h-4" />
                    {quiz.status === 'in-progress' ? 'Continue' : 'Start Quiz'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* View Results Modal */}
      <Modal isOpen={!!viewQuiz} onClose={() => setViewQuiz(null)} title="Quiz Results">
        {viewQuiz && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <h3 className="font-bold text-lg text-gray-900">{viewQuiz.title}</h3>
              <p className="text-sm text-gray-500">{viewQuiz.courseName}</p>
            </div>

            <div className="bg-gray-100 rounded-xl p-8 text-center">
              <Trophy className={`w-16 h-16 mx-auto mb-4 ${(viewQuiz.lastPercentage ?? 0) >= viewQuiz.passingPercentage
                ? 'text-gray-900'
                : 'text-gray-400' 
                }`} />
              <p className="text-5xl font-bold text-gray-900">
                {viewQuiz.lastPercentage}%
              </p>
              <p className="text-lg text-gray-600 mt-2">
                {viewQuiz.obtainedMarks}/{viewQuiz.totalMarks} marks
              </p>
              <p className="text-sm mt-2 font-medium text-gray-700">
                {viewQuiz.obtainedMarks !== undefined &&
                  (viewQuiz.lastPercentage ?? 0) >= viewQuiz.passingPercentage
                  ? 'Passed!'
                  : `Need ${viewQuiz.passingPercentage}% to pass`}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{viewQuiz.totalQuestions}</p>
                <p className="text-xs text-gray-500">Questions</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{viewQuiz.duration}m</p>
                <p className="text-xs text-gray-500">Duration</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{viewQuiz.attempts}/{viewQuiz.maxAttempts}</p>
                <p className="text-xs text-gray-500">Attempts</p>
              </div>
            </div>

            <div className="flex gap-3">
              {viewQuiz.attempts < viewQuiz.maxAttempts && (
                <Button
                  fullWidth
                  onClick={() => {
                    setViewQuiz(null);
                    handleStartQuiz(viewQuiz);
                  }}
                >
                  <RotateCcw className="w-4 h-4" /> Retry Quiz
                </Button>
              )}
              <Button variant="outline" fullWidth onClick={() => setViewQuiz(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentQuizzes;