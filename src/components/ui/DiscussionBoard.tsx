import React, { useState } from 'react';
import { Send, MessageSquare, Reply,} from 'lucide-react';
import Button from './Button';
import Card from './Card';

interface Comment {
  id: string;
  user: string;
  role: 'student' | 'teacher';
  text: string;
  time: string;
  replies?: Comment[];
}

const DiscussionBoard: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1', user: 'Dr. Anjali Mehta', role: 'teacher', text: 'Welcome to the Python course! Feel free to ask any doubts here.', time: '2 days ago',
      replies: [
        { id: '2', user: 'Arjun Sharma', role: 'student', text: 'Thank you ma\'am! Excited to start.', time: '1 day ago' }
      ]
    },
    { id: '3', user: 'Priya Verma', role: 'student', text: 'I am stuck at Loop logic in Lesson 3. Can anyone help?', time: '5 hours ago' }
  ]);
  const [newComment, setNewComment] = useState('');

  const handlePost = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Date.now().toString(),
      user: 'You',
      role: 'student',
      text: newComment,
      time: 'Just now',
      replies: []
    };
    setComments([comment, ...comments]);
    setNewComment('');
  };

  return (
    <div className="space-y-6">
      {/* Input Area */}
      <Card>
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" /> Course Discussion
        </h3>
        <div className="flex gap-3">
          <textarea
            className="input-field min-h-[80px]"
            placeholder="Ask a question or start a discussion..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
        </div>
        <div className="flex justify-end mt-3">
          <Button size="sm" onClick={handlePost} disabled={!newComment.trim()}>
            <Send className="w-4 h-4" /> Post Comment
          </Button>
        </div>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id} padding="sm">
            <div className="flex gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                comment.role === 'teacher' ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'
              }`}>
                {comment.user.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-sm text-gray-900">{comment.user}</span>
                    {comment.role === 'teacher' && (
                      <span className="ml-2 text-[10px] bg-gray-200 px-2 py-0.5 rounded-full font-medium">Instructor</span>
                    )}
                    <p className="text-xs text-gray-500">{comment.time}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-2">{comment.text}</p>
                
                <div className="flex gap-4 mt-3">
                  <button className="text-xs text-gray-500 hover:text-black flex items-center gap-1">
                    <Reply className="w-3 h-3" /> Reply
                  </button>
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-4">
                    {comment.replies.map(reply => (
                      <div key={reply.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold shrink-0">
                          {reply.user.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-xs text-gray-900">{reply.user}</span>
                          <span className="text-[10px] text-gray-500 ml-2">{reply.time}</span>
                          <p className="text-xs text-gray-600 mt-1">{reply.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DiscussionBoard;