import React, { useEffect, useState } from 'react';
import { Send, MessageSquare, Reply } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import {
    getDiscussionsApi,
    createDiscussionApi,
    addReplyApi,
} from '../../api/discussionApi';

interface Reply {
    _id: string;
    userName: string;
    userRole: string;
    text: string;
    createdAt: string;
}

interface Discussion {
    _id: string;
    userName: string;
    userRole: string;
    text: string;
    createdAt: string;
    replies: Reply[];
}

interface DiscussionBoardProps {
    courseId: string;
    topic?: string;
}

const timeAgo = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
};

const DiscussionBoard: React.FC<DiscussionBoardProps> = ({ courseId, topic }) => {
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [newComment, setNewComment] = useState('');
    const [replyText, setReplyText] = useState<Record<string, string>>({});
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        if (!courseId) return;
        fetchDiscussions();
    }, [courseId, topic]);

    const fetchDiscussions = async () => {
        try {
            setLoading(true);
            const res = await getDiscussionsApi(courseId, topic);
            setDiscussions(res.data?.discussions ?? []);
        } catch (err) {
            console.error('Discussion fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePost = async () => {
        if (!newComment.trim()) return;
        try {
            setPosting(true);
            const res = await createDiscussionApi(courseId, {
                text: newComment.trim(),
                topic: topic || 'general',
            });
            setDiscussions((prev) => [res.data.discussion, ...prev]);
            setNewComment('');
        } catch (err) {
            console.error('Post error:', err);
        } finally {
            setPosting(false);
        }
    };

    const handleReply = async (discussionId: string) => {
        const text = replyText[discussionId];
        if (!text?.trim()) return;
        try {
            const res = await addReplyApi(courseId, discussionId, text.trim());
            setDiscussions((prev) =>
                prev.map((d) =>
                    d._id === discussionId ? res.data.discussion : d
                )
            );
            setReplyText((prev) => ({ ...prev, [discussionId]: '' }));
            setReplyingTo(null);
        } catch (err) {
            console.error('Reply error:', err);
        }
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
                    <Button
                        size="sm"
                        onClick={handlePost}
                        disabled={!newComment.trim() || posting}
                    >
                        <Send className="w-4 h-4" />
                        {posting ? 'Posting...' : 'Post Comment'}
                    </Button>
                </div>
            </Card>

            {/* Comments List */}
            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                </div>
            ) : discussions.length === 0 ? (
                <Card>
                    <p className="text-center text-gray-400 py-8">
                        No discussions yet. Be the first to post!
                    </p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {discussions.map((comment) => (
                        <Card key={comment._id} padding="sm">
                            <div className="flex gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                    comment.userRole === 'Teacher' || comment.userRole === 'Admin'
                                        ? 'bg-black text-white'
                                        : 'bg-gray-100 text-gray-900'
                                }`}>
                                    {comment.userName.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="font-bold text-sm text-gray-900">
                                                {comment.userName}
                                            </span>
                                            {(comment.userRole === 'Teacher' || comment.userRole === 'Admin') && (
                                                <span className="ml-2 text-[10px] bg-gray-200 px-2 py-0.5 rounded-full font-medium">
                                                    Instructor
                                                </span>
                                            )}
                                            <p className="text-xs text-gray-500">
                                                {timeAgo(comment.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-2">{comment.text}</p>

                                    <div className="flex gap-4 mt-3">
                                        <button
                                            className="text-xs text-gray-500 hover:text-black flex items-center gap-1"
                                            onClick={() =>
                                                setReplyingTo(
                                                    replyingTo === comment._id ? null : comment._id
                                                )
                                            }
                                        >
                                            <Reply className="w-3 h-3" /> Reply
                                        </button>
                                    </div>

                                    {/* Reply Input */}
                                    {replyingTo === comment._id && (
                                        <div className="mt-3 flex gap-2">
                                            <input
                                                type="text"
                                                className="input-field text-sm"
                                                placeholder="Write a reply..."
                                                value={replyText[comment._id] || ''}
                                                onChange={(e) =>
                                                    setReplyText((prev) => ({
                                                        ...prev,
                                                        [comment._id]: e.target.value,
                                                    }))
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleReply(comment._id);
                                                }}
                                            />
                                            <Button
                                                size="sm"
                                                onClick={() => handleReply(comment._id)}
                                                disabled={!replyText[comment._id]?.trim()}
                                            >
                                                <Send className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    )}

                                    {/* Replies */}
                                    {comment.replies && comment.replies.length > 0 && (
                                        <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-4">
                                            {comment.replies.map((reply) => (
                                                <div key={reply._id} className="flex gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold shrink-0">
                                                        {reply.userName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-xs text-gray-900">
                                                            {reply.userName}
                                                        </span>
                                                        <span className="text-[10px] text-gray-500 ml-2">
                                                            {timeAgo(reply.createdAt)}
                                                        </span>
                                                        <p className="text-xs text-gray-600 mt-1">
                                                            {reply.text}
                                                        </p>
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
            )}
        </div>
    );
};

export default DiscussionBoard;