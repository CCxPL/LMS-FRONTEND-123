import React, { useState, useMemo } from 'react';
import { Send, Mail, Trash2, Search, Plus, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { DEMO_USERS } from '../../utils/constants';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const { messages, sendMessage, replyMessage, markMessageRead, deleteMessage } = useData();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  const [recipientId, setRecipientId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMessages = useMemo(() => {
    if (!user) return [];
    let msgs = activeTab === 'inbox' 
      ? messages.filter(m => m.toId === user.id || m.toId.startsWith(`all-${user.role}s`))
      : messages.filter(m => m.fromId === user.id);

    if (searchTerm) {
      msgs = msgs.filter(m => 
        m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.fromName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return msgs;
  }, [messages, activeTab, user, searchTerm]);

  const selectedMessage = messages.find(m => m.id === selectedMsgId);

  const handleSelectMessage = (id: string) => {
    setSelectedMsgId(id);
    const msg = messages.find(m => m.id === id);
    if (msg && !msg.read && msg.toId === user?.id) {
      markMessageRead(id);
    }
  };

  const handleSend = () => {
    if (!recipientId || !subject || !body) {
      showToast('Please fill all fields', 'error');
      return;
    }
    const recipient = DEMO_USERS.find(u => u.id === recipientId);
    let toName = recipient?.name || 'Unknown';
    let toRole = recipient?.role || 'student';

    if (recipientId === 'all-teachers') { toName = 'All Teachers'; toRole = 'teacher'; }
    if (recipientId === 'all-students') { toName = 'All Students'; toRole = 'student'; }

    sendMessage({
      fromId: user!.id,
      fromName: user!.name,
      fromRole: user!.role,
      toId: recipientId,
      toName,
      toRole,
      subject,
      body,
    });

    showToast('Message sent successfully', 'success');
    setShowCompose(false);
    setRecipientId(''); 
    setSubject(''); 
    setBody('');
  };

  const handleReply = () => {
    if (!replyText || !selectedMessage) return;
    replyMessage(selectedMessage.id, {
      fromId: user!.id,
      fromName: user!.name,
      fromRole: user!.role,
      body: replyText
    });
    setReplyText('');
    showToast('Reply sent', 'success');
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      deleteMessage(showDeleteConfirm);
      if (selectedMsgId === showDeleteConfirm) setSelectedMsgId(null);
      setShowDeleteConfirm(null);
      showToast('Message deleted', 'info');
    }
  };

  const getRecipients = () => {
    return DEMO_USERS.filter(u => u.id !== user?.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-500 text-sm mt-1">Communication Center</p>
        </div>
        <Button onClick={() => setShowCompose(true)} icon={<Plus className="w-4 h-4" />}>
          Compose
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: '600px' }}>
        {/* Sidebar List */}
        <Card padding="none" className="flex flex-col overflow-hidden">
          <div className="flex border-b border-gray-200">
            {(['inbox', 'sent'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => { setActiveTab(tab); setSelectedMsgId(null); }}
                className={`flex-1 py-3 text-sm font-medium transition-colors capitalize ${
                  activeTab === tab 
                    ? 'border-b-2 border-black bg-gray-50 text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="p-3 border-b border-gray-100">
            <Input 
              placeholder="Search messages..." 
              icon={<Search className="w-4 h-4" />} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Mail className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm">No messages</p>
              </div>
            ) : (
              filteredMessages.map(msg => (
                <div 
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg.id)}
                  className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${
                    selectedMsgId === msg.id 
                      ? 'bg-gray-100 border-l-4 border-l-black' 
                      : 'hover:bg-gray-50'
                  } ${!msg.read && activeTab === 'inbox' ? 'bg-gray-50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm truncate ${!msg.read && activeTab === 'inbox' ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                      {activeTab === 'inbox' ? msg.fromName : `To: ${msg.toName}`}
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{msg.subject}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Message Detail */}
        <Card padding="none" className="lg:col-span-2 flex flex-col overflow-hidden">
          {selectedMessage ? (
            <>
              <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <button 
                    onClick={() => setSelectedMsgId(null)}
                    className="lg:hidden mb-3 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <h2 className="text-lg font-bold text-gray-900 mb-1 truncate">{selectedMessage.subject}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User className="w-4 h-4" />
                    <span>{activeTab === 'inbox' ? selectedMessage.fromName : `To: ${selectedMessage.toName}`}</span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs capitalize">
                      {activeTab === 'inbox' ? selectedMessage.fromRole : selectedMessage.toRole}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDeleteConfirm(selectedMessage.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedMessage.body}</p>
                  <p className="text-xs text-gray-400 mt-3 text-right">
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>
                </div>

                {selectedMessage.replies.map(reply => (
                  <div 
                    key={reply.id} 
                    className={`flex flex-col max-w-[85%] ${
                      reply.fromId === user?.id ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}
                  >
                    <div className={`p-4 rounded-lg ${
                      reply.fromId === user?.id 
                        ? 'bg-black text-white rounded-br-none' 
                        : 'bg-white border border-gray-200 rounded-bl-none'
                    }`}>
                      <p className="text-xs font-medium mb-1 opacity-75">{reply.fromName}</p>
                      <p className="text-sm leading-relaxed">{reply.body}</p>
                    </div>
                    <span className="text-xs text-gray-400 mt-1">
                      {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-2">
                  <input 
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleReply()}
                  />
                  <Button onClick={handleReply} disabled={!replyText.trim()} icon={<Send className="w-4 h-4" />}>
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Mail className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-medium">Select a message to read</p>
              <p className="text-sm mt-1">Choose from your {activeTab}</p>
            </div>
          )}
        </Card>
      </div>

      {/* Compose Modal */}
      <Modal isOpen={showCompose} onClose={() => setShowCompose(false)} title="New Message" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">To</label>
            <select 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              value={recipientId} 
              onChange={(e) => setRecipientId(e.target.value)}
            >
              <option value="">Select Recipient</option>
              {(user?.role === 'super-admin' || user?.role === 'admin') && (
                <>
                  <option value="all-teachers">All Teachers</option>
                  <option value="all-students">All Students</option>
                </>
              )}
              {getRecipients().map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.replace('-', ' ')})
                </option>
              ))}
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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent min-h-30 resize-none"
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
        message="Are you sure you want to delete this message? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Messages;