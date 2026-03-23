import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, HelpCircle, Play, Trophy, Search, Filter, Eye, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';
import type { Quiz } from '../../types/course.types';
import { courseService } from '../../services/courseService';

const StudentQuizzes: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewQuiz, setViewQuiz] = useState<Quiz | null>(null);

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

  const filtered = quizzes.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
            .reduce((sum, q) => sum + ((q.obtainedMarks! / q.totalMarks) * 100), 0) /
          quizzes.filter(q => q.obtainedMarks !== undefined).length
        )
      : 0
  };

  const handleStartQuiz = (quiz: Quiz) => {
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

  // Calculate correct and incorrect answers
  const getAnswerStats = (quiz: Quiz) => {
    if (quiz.obtainedMarks === undefined) return { correct: 0, incorrect: 0 };
    
    const marksPerQuestion = quiz.totalMarks / quiz.totalQuestions;
    const correct = Math.round((quiz.obtainedMarks || 0) / marksPerQuestion);
    const incorrect = quiz.totalQuestions - correct;
    
    return { correct, incorrect };
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
                      {quiz.obtainedMarks}/{quiz.totalMarks}
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
                    <Button fullWidth onClick={() => setViewQuiz(quiz)}>
                      <Eye className="w-4 h-4" /> Preview Answers
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

      {/* View Results Modal - FULL SCREEN */}
      {viewQuiz && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 overflow-y-auto">
          <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              {/* Header Card */}
              <Card className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{viewQuiz.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">{viewQuiz.courseName}</p>
                  </div>
                  <button
                    onClick={() => setViewQuiz(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </Card>

              {/* Score Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Score Card */}
                <Card className="bg-gradient-to-br from-gray-50 to-gray-100 text-center py-8">
                  <Trophy className={`w-16 h-16 mx-auto mb-4 ${
                    viewQuiz.obtainedMarks !== undefined && 
                    (viewQuiz.obtainedMarks / viewQuiz.totalMarks) >= (viewQuiz.passingPercentage / 100)
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  }`} />
                  <p className="text-4xl font-bold text-gray-900">
                    {viewQuiz.obtainedMarks}/{viewQuiz.totalMarks}
                  </p>
                  <p className="text-2xl font-bold text-gray-700 mt-2">
                    {Math.round(((viewQuiz.obtainedMarks || 0) / viewQuiz.totalMarks) * 100)}%
                  </p>
                  <p className={`text-sm font-medium mt-3 ${
                    viewQuiz.obtainedMarks !== undefined && 
                    (viewQuiz.obtainedMarks / viewQuiz.totalMarks) >= (viewQuiz.passingPercentage / 100)
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {viewQuiz.obtainedMarks !== undefined && 
                    (viewQuiz.obtainedMarks / viewQuiz.totalMarks) >= (viewQuiz.passingPercentage / 100)
                      ? '✓ Passed'
                      : `✗ Need ${viewQuiz.passingPercentage}% to pass`
                    }
                  </p>
                </Card>

                {/* Stats Card */}
                <Card className="py-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="flex items-center gap-2 text-green-700 font-medium">
                        <CheckCircle className="w-5 h-5" />
                        Correct Answers
                      </span>
                      <span className="text-2xl font-bold text-green-600">{getAnswerStats(viewQuiz).correct}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <span className="flex items-center gap-2 text-red-700 font-medium">
                        <XCircle className="w-5 h-5" />
                        Wrong Answers
                      </span>
                      <span className="text-2xl font-bold text-red-600">{getAnswerStats(viewQuiz).incorrect}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-gray-700 font-medium">Total Questions</span>
                      <span className="text-2xl font-bold text-gray-900">{viewQuiz.totalQuestions}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-gray-700 font-medium">Duration</span>
                      <span className="text-2xl font-bold text-gray-900">{viewQuiz.duration}m</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* All Questions */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-bold text-gray-900 px-4">Question-wise Review</h3>
                
                {viewQuiz.questions && viewQuiz.questions.length > 0 ? (
                  viewQuiz.questions.map((question, index) => {
                    const isCorrect = question.isCorrect;
                    return (
                      <Card key={question.id} className={`border-l-4 ${
                        isCorrect ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'
                      }`}>
                        {/* Question Header */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`flex-shrink-0 mt-1 ${
                            isCorrect ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isCorrect ? (
                              <CheckCircle className="w-6 h-6" />
                            ) : (
                              <XCircle className="w-6 h-6" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              Q{index + 1}. {question.questionText || question.question}
                            </p>
                            <p className={`text-sm font-medium mt-2 ${
                              isCorrect ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                            </p>
                          </div>
                          <div className={`flex-shrink-0 text-sm font-bold px-3 py-1 rounded-full ${
                            isCorrect 
                              ? 'bg-green-200 text-green-800' 
                              : 'bg-red-200 text-red-800'
                          }`}>
                            {isCorrect ? `+${question.marks}` : '0'}/{question.marks}
                          </div>
                        </div>

                        {/* Options */}
                        <div className="space-y-2 mb-4 pl-10">
                          {question.options && question.options.map((option, optionIndex) => {
                            const isCorrectOption = optionIndex === question.correctAnswer;
                            const isStudentAnswer = option === question.studentAnswer;
                            
                            let bgColor = 'bg-white border-gray-200';
                            let borderColor = 'border';
                            let textColor = 'text-gray-700';
                            
                            if (isCorrectOption) {
                              bgColor = 'bg-green-100';
                              borderColor = 'border-2 border-green-500';
                              textColor = 'text-green-900 font-semibold';
                            } else if (isStudentAnswer && !isCorrect) {
                              bgColor = 'bg-red-100';
                              borderColor = 'border-2 border-red-500';
                              textColor = 'text-red-900 font-semibold';
                            }
                            
                            return (
                              <div key={optionIndex} className={`${borderColor} ${bgColor} rounded-lg p-3`}>
                                <p className={`text-sm ${textColor}`}>
                                  {String.fromCharCode(65 + optionIndex)}. {option}
                                  {isCorrectOption && <span className="ml-2">✓</span>}
                                  {isStudentAnswer && !isCorrect && <span className="ml-2">✗ (Your Answer)</span>}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        {question.explanation && (
                          <div className="pl-10 bg-white rounded-lg p-4 border border-gray-200">
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Explanation:</p>
                            <p className="text-sm text-gray-700">{question.explanation}</p>
                          </div>
                        )}
                      </Card>
                    );
                  })
                ) : (
                  <Card className="text-center py-12">
                    <p className="text-gray-500">No question details available</p>
                  </Card>
                )}
              </div>

              {/* Action Buttons */}
              <Card className="flex gap-3 sticky bottom-0">
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
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentQuizzes;