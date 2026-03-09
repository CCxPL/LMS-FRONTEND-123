import React, { useState } from 'react';
import { CheckCircle, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import Button from './Button';
import type { QuizQuestion } from '../../types/course.types';

interface QuizPlayerProps {
  questions: QuizQuestion[];
  title: string;
  onComplete: (score: number, total: number) => void;
  onClose: () => void;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ questions, title, onComplete, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);

  const currentQ = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleSelect = (idx: number) => {
    setAnswers({ ...answers, [currentQ.id]: idx });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowResult(true);
      const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.correctAnswer ? q.marks : 0), 0);
      const total = questions.reduce((acc, q) => acc + q.marks, 0);
      onComplete(score, total);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (showResult) {
    const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.correctAnswer ? q.marks : 0), 0);
    const total = questions.reduce((acc, q) => acc + q.marks, 0);
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= 60;

    return (
      <div className="text-center py-10">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
          passed ? 'bg-gray-100' : 'bg-gray-100'
        }`}>
          {passed ? (
            <CheckCircle className="w-10 h-10 text-gray-900" />
          ) : (
            <XCircle className="w-10 h-10 text-gray-600" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
        <p className="text-4xl font-black text-gray-900 mb-2">{score} / {total}</p>
        <p className="text-lg text-gray-500 mb-6">
          {passed ? 'Great job! You passed.' : 'Keep practicing. You can do better!'}
        </p>
        <Button onClick={onClose}>Back to Quizzes</Button>
      </div>
    );
  }

  return (
    <div>
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-black transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <p className="text-lg font-medium text-gray-900 mb-4">{currentQ.question}</p>
        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                answers[currentQ.id] === idx 
                  ? 'border-black bg-gray-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-gray-900">{opt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Previous
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={answers[currentQ.id] === undefined}
          icon={<ArrowRight className="w-4 h-4" />}
          iconPosition="right"
        >
          {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default QuizPlayer;