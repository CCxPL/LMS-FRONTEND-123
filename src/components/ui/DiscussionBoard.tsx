import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Reply, Trash2 } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { useAuth } from '../../hooks/useAuth';
import axiosInstance from '../../api/axiosInstance';

interface ReplyItem {
  _id: string;
  user: string;
  userName: string;
  userRole: string;
  text: string;
  createdAt: string;
}

interface Discussion {
  _id: string;
  user: string;
  userName: string;
  userRole: string;
  text: string;
  topic: string;
  createdAt: string;
  replies: ReplyItem[];
}

interface DiscussionBoardProps {
  courseId: string;
  topic?: string;
}

const DiscussionBoard: React.FC<DiscussionBoardProps> = ({ courseId, topic = 'general' }) => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [newText, setNewText] = useState('');
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (courseId) fetchDiscussions();
  }, [courseId, topic]);

  // ─── REAL API ─────────────────────────────────────────────────────────────
  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/discussions/${courseId}`, {
        params: topic ? { topic } : {},
      });
      setDiscussions(res.data?.data?.discussions || []);
    } catch (err) {
      console.error('Failed to fetch discussions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!newText.trim()) return;
    setPosting(true);
    try {
      await axiosInstance.post(`/discussions/${courseId}`, {
        text: newText.trim(),
        topic,
      });
      setNewText('');
      await fetchDiscussions();
    } catch (err) {
      console.error('Failed to post discussion:', err);
    } finally {
      setPosting(false);
    }
  };

  const handleReply = async (discussionId: string) => {
    const text = replyText[discussionId];
    if (!text?.trim()) return;
    try {
      await axiosInstance.post(`/discussions/${courseId}/${discussionId}/reply`, {
        text: text.trim(),
      });
      setReplyText(prev => ({ ...prev, [discussionId]: '' }));
      setReplyingTo(null);
      await fetchDiscussions();
    } catch (err) {
      console.error('Failed to post reply:', err);
    }
  };

  const handleDelete = async (discussionId: string) => {
    try {
      await axiosInstance.delete(`/discussions/${courseId}/${discussionId}`);
      await fetchDiscussions();
    } catch (err) {
      console.error('Failed to delete discussion:', err);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Input Area */}
      <Card>
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" /> Course Discussion
        </h3>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none min-h-20"
          placeholder="Ask a question or start a discussion..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
        />
        <div className="flex justify-end mt-3">
          <Button size="sm" onClick={handlePost} disabled={!newText.trim() || posting}>
            <Send className="w-4 h-4" /> {posting ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      )}

      {/* Empty */}
      {!loading && discussions.length === 0 && (
        <Card className="text-center py-10">
          <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No discussions yet. Start the conversation!</p>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {discussions.map((disc) => {
          const isOwner = disc.user === user?.id;
          const isTeacher = disc.userRole === 'Teacher';

          return (
            <Card key={disc._id} padding="sm">
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isTeacher ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'
                  }`}>
                  {disc.userName?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-sm text-gray-900">{disc.userName}</span>
                      {isTeacher && (
                        <span className="ml-2 text-[10px] bg-gray-200 px-2 py-0.5 rounded-full font-medium">Instructor</span>
                      )}
                      <p className="text-xs text-gray-500">{formatTime(disc.createdAt)}</p>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => handleDelete(disc._id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-2">{disc.text}</p>

                  <button
                    className="text-xs text-gray-500 hover:text-black flex items-center gap-1 mt-3"
                    onClick={() => setReplyingTo(replyingTo === disc._id ? null : disc._id)}
                  >
                    <Reply className="w-3 h-3" /> Reply
                  </button>

                  {/* Reply Input */}
                  {replyingTo === disc._id && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                        placeholder="Write a reply..."
                        value={replyText[disc._id] || ''}
                        onChange={(e) => setReplyText(prev => ({ ...prev, [disc._id]: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && handleReply(disc._id)}
                      />
                      <Button size="sm" onClick={() => handleReply(disc._id)}>
                        <Send className="w-3 h-3" />
                      </Button>
                    </div>
                  )}

                  {/* Replies */}
                  {disc.replies && disc.replies.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-3">
                      {disc.replies.map((reply) => (
                        <div key={reply._id} className="flex gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${reply.userRole === 'Teacher' ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'
                            }`}>
                            {reply.userName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-gray-900">{reply.userName}</span>
                            {reply.userRole === 'Teacher' && (
                              <span className="ml-1 text-[10px] bg-gray-200 px-1.5 py-0.5 rounded-full">Instructor</span>
                            )}
                            <span className="text-[10px] text-gray-500 ml-2">{formatTime(reply.createdAt)}</span>
                            <p className="text-xs text-gray-600 mt-1">{reply.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DiscussionBoard;