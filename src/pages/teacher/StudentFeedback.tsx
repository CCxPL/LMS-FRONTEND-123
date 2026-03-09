import React, { useState, useMemo } from 'react';
import { Star, Reply, MessageSquare, Search, Filter } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

interface Feedback {
  id: string;
  studentName: string;
  courseName: string;
  rating: number;
  comment: string;
  createdAt: string;
  reply?: string;
  repliedAt?: string;
}

const StudentFeedback: React.FC = () => {
  const { user } = useAuth();
  const { getFeedbackForTeacher, replyToFeedback } = useData();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const mockFeedbacks: Feedback[] = [
    {
      id: '1',
      studentName: 'Ali Ahmed',
      courseName: 'React.js Complete',
      rating: 5,
      comment: 'Excellent course!',
      createdAt: '2024-01-20T10:30:00'
    },
    {
      id: '2',
      studentName: 'Fatima Khan',
      courseName: 'Node.js Backend',
      rating: 4,
      comment: 'Great course overall.',
      createdAt: '2024-01-19T14:00:00',
      reply: 'Thank you!',
      repliedAt: '2024-01-19T16:00:00'
    },
  ];

  const feedbacks = getFeedbackForTeacher?.(user?.id || '') || mockFeedbacks;

  const filtered = useMemo(() => {
    let result = feedbacks;
    if (searchTerm) {
      result = result.filter(f => 
        f.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.courseName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (ratingFilter !== 'all') {
      result = result.filter(f => f.rating === ratingFilter);
    }
    return result;
  }, [feedbacks, searchTerm, ratingFilter]);

  const handleReply = (fbId: string) => {
    if (!replyText.trim()) {
      showToast('Please enter a reply', 'error');
      return;
    }
    if (replyToFeedback) {
      replyToFeedback(fbId, replyText);
    }
    showToast('Reply sent!', 'success');
    setReplyingTo(null);
    setReplyText('');
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star 
          key={s} 
          className={`w-4 h-4 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Student Feedback</h1>
        <p className="page-subtitle">View and respond to reviews</p>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="input-field w-auto"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No reviews found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((fb) => (
            <Card key={fb.id}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                    {fb.studentName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{fb.studentName}</p>
                    <p className="text-sm text-gray-500">{fb.courseName}</p>
                  </div>
                </div>
                <div className="text-right">
                  {renderStars(fb.rating)}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(fb.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-4">{fb.comment}</p>

              {fb.reply ? (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Reply className="w-4 h-4 text-gray-500" />
                    <p className="text-xs font-medium text-gray-500">Your Reply</p>
                  </div>
                  <p className="text-sm text-gray-700">{fb.reply}</p>
                </div>
              ) : replyingTo === fb.id ? (
                <div className="space-y-3">
                  <textarea 
                    className="input-field min-h-[80px]"
                    placeholder="Write your reply..." 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleReply(fb.id)}>
                      <Reply className="w-3 h-3" /> Send
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => { setReplyingTo(null); setReplyText(''); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setReplyingTo(fb.id)}>
                  <MessageSquare className="w-3 h-3" /> Reply
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentFeedback;