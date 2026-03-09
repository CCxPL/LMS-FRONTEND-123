import React, { useState } from 'react';
import { Star, Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const GiveFeedback: React.FC = () => {
  const { user } = useAuth();
  const { submitFeedback, getFeedbackByStudent } = useData();
  const { showToast } = useToast();

  const [courseId, setCourseId] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const myFeedbacks = getFeedbackByStudent(user?.id || '');

  const courses = [
    { id: '1', name: 'React.js Complete Course', teacherId: '3', teacherName: 'Dr. Sarah' },
    { id: '2', name: 'Python for Data Science', teacherId: '3', teacherName: 'Dr. Sarah' },
    { id: '3', name: 'AWS Cloud Practitioner', teacherId: '5', teacherName: 'Eng. Hassan' },
  ];

  const handleSubmit = () => {
    if (!courseId) {
      showToast('Please select a course', 'error');
      return;
    }
    if (rating === 0) {
      showToast('Please select a rating', 'error');
      return;
    }
    if (!comment.trim()) {
      showToast('Please write a comment', 'error');
      return;
    }

    setIsSubmitting(true);
    const course = courses.find((c) => c.id === courseId);
    if (!course || !user) return;

    setTimeout(() => {
      submitFeedback({
        studentId: user.id, 
        studentName: user.name,
        teacherId: course.teacherId, 
        teacherName: course.teacherName,
        courseId: course.id, 
        courseName: course.name,
        rating, 
        comment,
      });

      showToast('Feedback submitted successfully!', 'success');
      setCourseId(''); 
      setRating(0); 
      setComment('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Give Feedback</h1>
        <p className="text-gray-500 text-sm mt-1">Share your experience with courses</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Submit Form */}
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Write a Review</h3>
              <p className="text-sm text-gray-500">Your feedback helps us improve.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
              <select 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                value={courseId} 
                onChange={(e) => setCourseId(e.target.value)}
              >
                <option value="">-- Choose a course --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} (by {c.teacherName})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-10 h-10 transition-colors ${
                        star <= (hoverRating || rating) 
                          ? 'fill-gray-900 text-gray-900' 
                          : 'text-gray-300'
                      }`} 
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Experience</label>
              <textarea 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                style={{ minHeight: 150 }}
                placeholder="What did you like? What can be improved?" 
                value={comment}
                onChange={(e) => setComment(e.target.value)} 
              />
            </div>

            <Button fullWidth isLoading={isSubmitting} onClick={handleSubmit}>
              <Send className="w-5 h-5" /> Submit Feedback
            </Button>
          </div>
        </Card>

        {/* My Feedbacks */}
        <div className="space-y-6">
          <h3 className="font-bold text-gray-900 text-xl">My Past Reviews</h3>
          
          {myFeedbacks.length === 0 ? (
            <Card className="text-center py-12">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No reviews given yet</p>
              <p className="text-xs text-gray-400 mt-1">Your reviews will appear here</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {myFeedbacks.map((fb) => (
                <Card key={fb.id} hover>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-gray-900">{fb.courseName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Instructor: {fb.teacherName}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-4 h-4 ${s <= fb.rating ? 'fill-gray-900 text-gray-900' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    "{fb.comment}"
                  </p>
                  
                  <div className="mt-3 flex justify-between items-center">
                    <p className="text-xs text-gray-400">
                      {new Date(fb.createdAt).toLocaleDateString()}
                    </p>
                    {fb.reply && (
                      <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                        Replied
                      </span>
                    )}
                  </div>

                  {fb.reply && (
                    <div className="mt-3 pl-4 border-l-4 border-gray-300">
                      <p className="text-xs font-bold text-gray-700 mb-1">Teacher's Reply:</p>
                      <p className="text-sm text-gray-600 italic">{fb.reply}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GiveFeedback;