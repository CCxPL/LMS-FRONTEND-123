import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Send, Mail, Trash2, Search, Plus, ArrowLeft, CheckCheck, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { useSearchParams } from 'react-router-dom';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/common/Loader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { messageApi } from '../../api/messageApi';
import { getSocket, joinRoom, leaveRoom, requestOnlineUsers, onSocketReady } from '../../services/socketService';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [inboxMessages, setInboxMessages] = useState<any[]>([]);
  const [sentMessages, setSentMessages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const [localReadIds, setLocalReadIds] = useState<Set<string>>(() => {
    try {
      const stored = sessionStorage.getItem('readMessageIds');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const [toId, setToId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const prevSelectedMsgId = useRef<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingMsgIdRef = useRef<string | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedMsgId, inboxMessages, sentMessages]);

  const silentRefresh = useCallback(async () => {
    try {
      const [inboxRes, sentRes] = await Promise.all([
        messageApi.getInbox(),
        messageApi.getSent(),
      ]);
      const newInbox = inboxRes.data?.messages ?? [];
      const newSent = sentRes.data?.messages ?? [];

      setLocalReadIds(prev => {
        const next = new Set(prev);
        newInbox.forEach((m: any) => {
          if (m.read) {
            next.delete(m._id);
          }
        });
        sessionStorage.setItem('readMessageIds', JSON.stringify(Array.from(next))); // ✅ ADD
        return next;
      });

      setInboxMessages(newInbox);
      setSentMessages(newSent);
    } catch { }
  }, []);

  useEffect(() => {
    loadData();

    // ✅ Socket ready hone pe turant listeners lagao
    onSocketReady(() => {
      const socket = getSocket();
      if (!socket) return;

      requestOnlineUsers();

      socket.on("users:online", (userIds: string[]) => setOnlineUsers(userIds));

      socket.on("message:new", ({ message }: any) => {
        if (
          String(message.toId) === String(user?.id) ||
          message.isBroadcast
        ) {
          setInboxMessages(prev => {
            const exists = prev.find(m => m._id === message._id);
            if (exists) return prev;
            return [message, ...prev];
          });
        }
      });

      socket.on("message:reply", ({ messageId, message }: any) => {
        setInboxMessages(prev => prev.map(m => m._id === messageId ? message : m));
        setSentMessages(prev => prev.map(m => m._id === messageId ? message : m));
        setLocalReadIds(prev => {
          const next = new Set(prev);
          next.delete(messageId);
          return next;
        });
      });

      socket.on("message:read_update", ({ messageId, message }: any) => {
        setInboxMessages(prev => prev.map(m => m._id === messageId ? message : m));
        setSentMessages(prev => prev.map(m => m._id === messageId ? message : m));
      });
    });

    pollingRef.current = setInterval(silentRefresh, 5000);

    return () => {
      const s = getSocket();
      if (s) {
        s.off("users:online");
        s.off("message:new");
        s.off("message:reply");
        s.off("message:read_update");
      }
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [user?.id]);

  // ✅ URL se msgId capture karo — turant ref mein store karo
  useEffect(() => {
    const msgId = searchParams.get('msgId');
    if (!msgId) return;
    pendingMsgIdRef.current = msgId;
    setSearchParams({});
  }, [searchParams]);

  // ✅ Jab bhi inbox ya sent update ho — pending msgId process karo
  useEffect(() => {
    if (!pendingMsgIdRef.current) return;
    const msgId = pendingMsgIdRef.current;

    // Pehle inbox mein dhundho
    const foundInInbox = inboxMessages.find(m => m._id === msgId);
    if (foundInInbox) {
      pendingMsgIdRef.current = null;
      setActiveTab('inbox');
      handleSelectMessage(msgId);
      return;
    }

    // Phir sent mein dhundho
    const foundInSent = sentMessages.find(m => m._id === msgId);
    if (foundInSent) {
      pendingMsgIdRef.current = null;
      setActiveTab('sent');
      handleSelectMessage(msgId);
    }
  }, [inboxMessages, sentMessages]);

  useEffect(() => {
    if (prevSelectedMsgId.current) leaveRoom(prevSelectedMsgId.current);
    if (selectedMsgId) joinRoom(selectedMsgId);
    prevSelectedMsgId.current = selectedMsgId;
  }, [selectedMsgId]);

  const loadData = async () => {
    try {
      const [inboxRes, sentRes, usersRes] = await Promise.all([
        messageApi.getInbox(),
        messageApi.getSent(),
        messageApi.getUsers(),
      ]);
      const inbox = inboxRes.data?.messages ?? [];
      setInboxMessages(inbox);
      setSentMessages(sentRes.data?.messages ?? []);
      setUsers(usersRes.data?.users ?? []);

      if (pendingMsgIdRef.current) {
        const msgId = pendingMsgIdRef.current;
        const sent = sentRes.data?.messages ?? [];
        const foundInInbox = inbox.find((m: any) => m._id === msgId);
        const foundInSent = sent.find((m: any) => m._id === msgId);
        if (foundInInbox) {
          pendingMsgIdRef.current = null;
          setActiveTab('inbox');
          handleSelectMessage(msgId);
        } else if (foundInSent) {
          pendingMsgIdRef.current = null;
          setActiveTab('sent');
          handleSelectMessage(msgId);
        }
      }
    } catch {
      showToast('Failed to load messages', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const currentMessages = activeTab === 'inbox' ? inboxMessages : sentMessages;

  const getAvatar = (name: string) => name?.charAt(0)?.toUpperCase() || '?';
  const getContactName = (msg: any) => activeTab === 'inbox' ? msg.fromName : msg.toName;
  const getContactKey = (msg: any) => activeTab === 'inbox' ? msg.fromId : msg.toId;
  const getContactId = (msg: any) => activeTab === 'inbox' ? msg.fromId : msg.toId;

  const getLastMessage = (msg: any) => {
    if (msg.replies?.length > 0) {
      const last = msg.replies[msg.replies.length - 1];
      return `${last.fromName}: ${last.body}`;
    }
    return msg.body;
  };

  // ✅ Inbox unread count — sirf jo messages maine nahi bheje aur nahi padhe
  const getUnreadCount = (msg: any): number => {
    if (localReadIds.has(msg._id)) return 0;
    // ✅ Main message unread — sirf agar maine nahi bheja
    if (!msg.read && String(msg.fromId).trim() !== String(user?.id).trim()) return 1;
    // ✅ Unread replies — sirf jo dusre ne bheje
    const unreadReplies = (msg.replies ?? []).filter(
      (r: any) =>
        String(r.fromId) !== String(user?.id) &&
        !(r.readBy ?? []).map(String).map((s: string) => s.trim()).includes(String(user?.id).trim())
    ).length;
    return unreadReplies;
  };

  // ✅ Sent unread count — SIRF replies jo dusre ne ki aur maine nahi padhi
  // Main message ka count KABHI nahi — vo maine khud bheja tha
  const getSentUnreadCount = (msg: any): number => {
    if (localReadIds.has(msg._id)) return 0;
    // ✅ Sirf wo replies jo kisi aur ne ki aur maine nahi padhi
    const unreadReplies = (msg.replies ?? []).filter(
      (r: any) =>
        String(r.fromId) !== String(user?.id) &&
        !(r.readBy ?? []).map(String).includes(String(user?.id))
    ).length;
    return unreadReplies;
  };

  // ✅ Tab badges
  const unreadCount = inboxMessages.filter(m => getUnreadCount(m) > 0).length;
  const sentUnreadCount = sentMessages.filter(m => getSentUnreadCount(m) > 0).length;

  const filteredMessages = useMemo(() => {
    const msgs = searchTerm
      ? currentMessages.filter(m =>
        m.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.fromName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.toName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      : currentMessages;

    const grouped = new Map<string, any>();
    msgs.forEach(m => {
      const key = getContactKey(m);
      if (!grouped.has(key)) grouped.set(key, m);
    });

    return Array.from(grouped.values());
  }, [currentMessages, searchTerm, activeTab]);

  const selectedMessage = currentMessages.find(m => m._id === selectedMsgId);

  const handleSelectMessage = async (id: string) => {
    setSelectedMsgId(id);
    setLocalReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      sessionStorage.setItem('readMessageIds', JSON.stringify(Array.from(next))); // ✅ ADD
      return next;
    });

    try {
      await messageApi.markRead(id);

      setInboxMessages(prev => prev.map(m => m._id === id ? {
        ...m,
        read: true,
        replies: m.replies?.map((r: any) => ({
          ...r,
          readBy: (r.readBy ?? []).map(String).includes(String(user?.id))
            ? r.readBy
            : [...(r.readBy ?? []), user?.id],
        }))
      } : m));

      setSentMessages(prev => prev.map(m => m._id === id ? {
        ...m,
        replies: m.replies?.map((r: any) => ({
          ...r,
          readBy: (r.readBy ?? []).map(String).includes(String(user?.id))
            ? r.readBy
            : [...(r.readBy ?? []), user?.id],
        }))
      } : m));

    } catch { }
  };

  const handleSend = async () => {
    if (!toId || !subject || !body) {
      showToast('Please fill all fields', 'error');
      return;
    }
    try {
      const res = await messageApi.sendMessage({ toId, subject, body });
      const newMsg = res.data?.message;
      setSentMessages(prev => [newMsg, ...prev]);
      showToast('Message sent successfully', 'success');
      setShowCompose(false);
      setToId(''); setSubject(''); setBody('');
      setActiveTab('sent');
      setSelectedMsgId(newMsg?._id);
    } catch {
      showToast('Failed to send message', 'error');
    }
  };

  const handleReply = async () => {
    if (!replyText || !selectedMsgId) return;
    try {
      const res = await messageApi.replyMessage(selectedMsgId, replyText);
      const updatedMsg = res.data?.message;
      if (activeTab === 'inbox') {
        setInboxMessages(prev => prev.map(m => m._id === selectedMsgId ? updatedMsg : m));
      } else {
        setSentMessages(prev => prev.map(m => m._id === selectedMsgId ? updatedMsg : m));
      }
      setLocalReadIds(prev => new Set(prev).add(selectedMsgId));
      setReplyText('');
    } catch {
      showToast('Failed to send reply', 'error');
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    try {
      await messageApi.deleteMessage(showDeleteConfirm);
      if (activeTab === 'inbox') {
        setInboxMessages(prev => prev.filter(m => m._id !== showDeleteConfirm));
      } else {
        setSentMessages(prev => prev.filter(m => m._id !== showDeleteConfirm));
      }
      if (selectedMsgId === showDeleteConfirm) setSelectedMsgId(null);
      setShowDeleteConfirm(null);
      showToast('Message deleted', 'info');
    } catch {
      showToast('Failed to delete message', 'error');
    }
  };

  // ✅ Per-reply seen indicator
  const getReplySeenIndicator = (reply: any, msg: any) => {
    if (String(reply.fromId) !== String(user?.id)) return null;
    const otherUserId = String(msg.fromId) === String(user?.id)
      ? String(msg.toId)
      : String(msg.fromId);
    const seen = (reply.readBy ?? []).map(String).includes(otherUserId);
    return seen ? 'seen' : 'sent';
  };

  // ✅ List mein last message ka seen indicator
  const getListSeenIndicator = (msg: any) => {
    if (msg.replies?.length > 0) {
      const lastReply = msg.replies[msg.replies.length - 1];
      if (String(lastReply.fromId) !== String(user?.id)) return null;
      const otherUserId = String(msg.fromId) === String(user?.id)
        ? String(msg.toId)
        : String(msg.fromId);
      const seen = (lastReply.readBy ?? []).map(String).includes(otherUserId);
      return seen ? 'seen' : 'sent';
    }
    if (String(msg.fromId) !== String(user?.id)) return null;
    return msg.read ? 'seen' : 'sent';
  };

  const isBroadcastOption = (role: string) => ['admin', 'super-admin'].includes(role);
  const isUserOnline = (userId: string) => onlineUsers.includes(userId);

  if (isLoading) return <Loader text="Loading messages..." />;

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Messages</h1>
          <p className="text-xs text-gray-500">Communication Center</p>
        </div>
        <Button onClick={() => setShowCompose(true)} icon={<Plus className="w-4 h-4" />}>
          New Message
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div className={`w-full lg:w-[360px] flex flex-col border-r border-gray-200 bg-white ${selectedMsgId ? 'hidden lg:flex' : 'flex'}`}>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {(['inbox', 'sent'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSelectedMsgId(null); }}
                className={`flex-1 py-3 text-sm font-medium transition-colors capitalize ${activeTab === tab
                  ? 'border-b-2 border-black bg-gray-50 text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Mail className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">No messages</p>
              </div>
            ) : (
              filteredMessages.map(msg => {
                const unread = activeTab === 'inbox' ? getUnreadCount(msg) : getSentUnreadCount(msg);
                const listIndicator = getListSeenIndicator(msg);
                return (
                  <div
                    key={msg._id}
                    onClick={() => handleSelectMessage(msg._id)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 ${selectedMsgId === msg._id
                      ? 'bg-gray-100 border-l-4 border-l-black'
                      : 'hover:bg-gray-50'
                      }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-lg">
                        {getAvatar(getContactName(msg))}
                      </div>
                      {getContactId(msg) && (
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isUserOnline(getContactId(msg)) ? 'bg-green-500' : 'bg-gray-300'}`} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className={`text-sm truncate ${unread > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {getContactName(msg)}
                        </span>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2 shrink-0">
                          {new Date(msg.createdAt).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500 truncate">{getLastMessage(msg)}</p>
                        <div className="ml-2 shrink-0 flex items-center">
                          {unread > 0 ? (
                            <span className="bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                              {unread}
                            </span>
                          ) : listIndicator === 'seen' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                          ) : listIndicator === 'sent' ? (
                            <Check className="w-3.5 h-3.5 text-gray-400" />
                          ) : null}
                        </div>
                      </div>
                      {msg.isBroadcast && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mt-0.5 inline-block">
                          Broadcast
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className={`flex-1 flex flex-col ${selectedMsgId ? 'flex' : 'hidden lg:flex'}`}>
          {selectedMessage ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
                <button
                  onClick={() => setSelectedMsgId(null)}
                  className="lg:hidden p-1 text-gray-500 hover:text-gray-900"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold">
                    {getAvatar(activeTab === 'inbox' ? selectedMessage.fromName : selectedMessage.toName)}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isUserOnline(activeTab === 'inbox' ? selectedMessage.fromId : selectedMessage.toId) ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {activeTab === 'inbox' ? selectedMessage.fromName : selectedMessage.toName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isUserOnline(activeTab === 'inbox' ? selectedMessage.fromId : selectedMessage.toId)
                      ? <span className="text-green-500 font-medium">Online</span>
                      : 'Offline'}
                    {' · '}
                    <span className="capitalize">{activeTab === 'inbox' ? selectedMessage.fromRole : selectedMessage.toRole}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full truncate max-w-[140px]">
                    {selectedMessage.subject}
                  </span>
                  <button
                    onClick={() => setShowDeleteConfirm(selectedMessage._id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-gray-50">
                {/* Main message */}
                <div className={`flex ${String(selectedMessage.fromId) === String(user?.id) ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${String(selectedMessage.fromId) === String(user?.id)
                    ? 'bg-black text-white rounded-br-none'
                    : 'bg-white border border-gray-200 rounded-bl-none'
                    }`}>
                    <p className={`text-xs font-semibold mb-1 ${String(selectedMessage.fromId) === String(user?.id) ? 'text-gray-300' : 'text-gray-500'}`}>
                      {selectedMessage.fromName}
                    </p>
                    <p className="text-sm leading-relaxed">{selectedMessage.body}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <p className="text-[10px] text-gray-400">
                        {new Date(selectedMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {String(selectedMessage.fromId) === String(user?.id) && (
                        selectedMessage.read
                          ? <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                          : <Check className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {selectedMessage.replies?.map((reply: any) => (
                  <div key={reply._id} className={`flex ${String(reply.fromId) === String(user?.id) ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${String(reply.fromId) === String(user?.id)
                      ? 'bg-black text-white rounded-br-none'
                      : 'bg-white border border-gray-200 rounded-bl-none'
                      }`}>
                      <p className={`text-xs font-semibold mb-1 ${String(reply.fromId) === String(user?.id) ? 'text-gray-300' : 'text-gray-500'}`}>
                        {reply.fromName}
                      </p>
                      <p className="text-sm leading-relaxed">{reply.body}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <p className="text-[10px] text-gray-400">
                          {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {String(reply.fromId) === String(user?.id) && (() => {
                          const indicator = getReplySeenIndicator(reply, selectedMessage);
                          if (indicator === 'seen') return <CheckCheck className="w-3.5 h-3.5 text-blue-400" />;
                          if (indicator === 'sent') return <Check className="w-3.5 h-3.5 text-gray-400" />;
                          return null;
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Reply Input */}
              <div className="px-4 py-3 bg-white border-t border-gray-200">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2">
                  <input
                    className="flex-1 text-sm focus:outline-none bg-transparent"
                    placeholder="Type a message..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleReply()}
                  />
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim()}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${replyText.trim() ? 'bg-black hover:bg-gray-800 text-white' : 'bg-gray-200 text-gray-400'}`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                <Mail className="w-12 h-12 opacity-30" />
              </div>
              <p className="text-xl font-light text-gray-500">Messages</p>
              <p className="text-sm text-gray-400 mt-1">Select a chat to start messaging</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      <Modal isOpen={showCompose} onClose={() => setShowCompose(false)} title="New Message" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">To</label>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              value={toId}
              onChange={(e) => setToId(e.target.value)}
            >
              <option value="">Select Recipient</option>
              {isBroadcastOption(user?.role || '') && (
                <optgroup label="Broadcast">
                  <option value="all-teachers">📢 All Teachers</option>
                  <option value="all-students">📢 All Students</option>
                  <option value="all">📢 Everyone</option>
                </optgroup>
              )}
              <optgroup label="Individual">
                {users.map(u => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role}) {isUserOnline(u._id) ? '🟢' : '⚫'}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
          <Input
            label="Subject"
            placeholder="Enter subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
            <textarea
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black min-h-[120px] resize-none"
              placeholder="Write your message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setShowCompose(false)}>Cancel</Button>
            <Button onClick={handleSend} icon={<Send className="w-4 h-4" />}>Send Message</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Message?"
        message="Are you sure you want to delete this message?"
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Messages;