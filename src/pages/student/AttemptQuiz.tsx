import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { getQuizByIdApi, attemptQuizApi } from '../../api/quizApi';

const AttemptQuiz: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(1800);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadQuizData();
  }, [id]);

  useEffect(() => {
    if (submitted) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const loadQuizData = async () => {
    if (!id) return;
    try {
      const res = await getQuizByIdApi(id);
      const quiz = res.data.quiz;
      setQuizTitle(quiz.title);
      setTimeLeft((quiz.timeLimit || quiz.duration || 30) * 60);
      const mapped = (quiz.questions || []).map((q: any) => ({
        id: q._id || q.id,
        question: q.question,
        options: q.options,
        marks: q.marks || q.points || 10,
      }));
      setQuestions(mapped);
    } catch (error) {
      showToast('Failed to load quiz', 'error');
      navigate('/student/quizzes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting || submitted) return;
    setIsSubmitting(true);
    setSubmitted(true);
    setShowConfirmSubmit(false);

    try {
      const answersPayload = questions.map(q => ({
        questionId: q.id,
        selectedAnswer: answers[q.id] ?? -1,
      }));

      const res = await attemptQuizApi(id!, { answers: answersPayload });

      // ✅ Fix: backend res.data.attempt mein data bhejta hai
      const attempt = res.data?.attempt ?? res.data ?? {};
      const score = attempt.score ?? 0;
      const totalPoints = attempt.totalPoints ?? questions.reduce((sum: number, q: any) => sum + q.marks, 0);
      const percentage = attempt.percentage ?? (totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0);
      const passed = attempt.passed ?? percentage >= 60;

      if (passed) {
        showToast(`Passed! You scored ${score}/${totalPoints} (${percentage}%) 🎉`, 'success');
      } else {
        showToast(`You scored ${score}/${totalPoints} (${percentage}%). Keep practicing!`, 'info');
      }

      navigate('/student/quizzes');
    } catch (error) {
      showToast('Failed to submit quiz. Please try again.', 'error');
      setIsSubmitting(false);
      setSubmitted(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) return <Loader text="Loading quiz..." fullScreen />;

  if (questions.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">No questions found for this quiz.</p>
        <Button className="mt-4" onClick={() => navigate('/student/quizzes')}>
          Back to Quizzes
        </Button>
      </div>
    );
  }

  const progress = (Object.keys(answers).length / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-gray-900">{quizTitle}</h1>
            <span className="text-sm text-gray-500">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <div className={`flex items-center gap-2 font-mono font-bold text-lg ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-gray-700'
            }`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100">
          <div
            className="h-full bg-black transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full p-6 flex flex-col justify-center">
        <Card className="p-8 shadow-lg border-t-4 border-t-black">
          <div className="mb-8">
            <h2 className="text-xl font-medium text-gray-900 leading-relaxed">
              {questions[currentQuestion].question}
            </h2>
            <p className="text-sm text-gray-400 mt-2 text-right">
              {questions[currentQuestion].marks} Marks
            </p>
          </div>

          <div className="space-y-3">
            {questions[currentQuestion].options.map((option: string, idx: number) => {
              const isSelected = answers[questions[currentQuestion].id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${isSelected
                      ? 'border-black bg-gray-50 text-black font-medium'
                      : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                >
                  <span>{option}</span>
                  {isSelected && <CheckCircle className="w-5 h-5 text-black" />}
                </button>
              );
            })}
          </div>
        </Card>
      </main>

      {/* Footer Navigation */}
      <footer className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentQuestion === 0}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          {currentQuestion === questions.length - 1 ? (
            <Button onClick={() => setShowConfirmSubmit(true)}>
              Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Next
            </Button>
          )}
        </div>
      </footer>

      {/* Confirm Submit Modal */}
      <Modal
        isOpen={showConfirmSubmit}
        onClose={() => setShowConfirmSubmit(false)}
        title="Submit Quiz?"
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-gray-700" />
          </div>
          <p className="text-gray-600 mb-6">
            You have answered <strong>{Object.keys(answers).length}</strong> out of{' '}
            <strong>{questions.length}</strong> questions. Are you sure you want to submit?
          </p>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setShowConfirmSubmit(false)}>
              Review Answers
            </Button>
            <Button fullWidth onClick={handleSubmit} isLoading={isSubmitting}>
              Yes, Submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AttemptQuiz;