import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getSocket, onSocketReady } from '../../services/socketService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { messageApi } from '../../api/messageApi';

const SocketListener: React.FC = () => {
    const { showToast } = useToast();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const locationRef = useRef(location.pathname);
    const userRoleRef = useRef(user?.role);
    const hasFetchedUnread = useRef(false);
    const listenersAttached = useRef(false);

    useEffect(() => {
        locationRef.current = location.pathname;
    }, [location.pathname]);

    useEffect(() => {
        userRoleRef.current = user?.role;
    }, [user?.role]);

    // ✅ Logout pe reset karo
    useEffect(() => {
        if (!user?.id) {
            hasFetchedUnread.current = false;
            listenersAttached.current = false;
        }
    }, [user?.id]);

    const getMessagesPath = () => {
        const role = userRoleRef.current;
        if (role === 'super-admin') return '/super-admin/messages';
        if (role === 'admin') return '/admin/messages';
        if (role === 'teacher') return '/teacher/messages';
        if (role === 'student') return '/student/messages';
        return '/student/messages';
    };

    // ✅ Login ke baad sirf ek baar unread fetch karo
    useEffect(() => {
        if (!user?.id) return;
        if (hasFetchedUnread.current) return;

        const isProtectedPage =
            !location.pathname.includes('/login') &&
            !location.pathname.includes('/register');
        if (!isProtectedPage) return;

        if (locationRef.current.includes('/messages')) return;

        hasFetchedUnread.current = true;

        const fetchUnread = async () => {
            try {
                const inboxRes = await messageApi.getInbox();
                const inboxMessages = inboxRes.data?.messages ?? [];
                const unreadInbox = inboxMessages.filter((m: any) => !m.read);

                const sentRes = await messageApi.getSent();
                const sentMessages = sentRes.data?.messages ?? [];
                const sentWithUnread = sentMessages.filter((m: any) =>
                    (m.replies ?? []).some(
                        (r: any) =>
                            String(r.fromId) !== String(user?.id) &&
                            !(r.readBy ?? []).map(String).includes(String(user?.id))
                    )
                );

                const allUnread = [
                    ...unreadInbox.map((m: any) => ({ ...m, _notifType: 'inbox' })),
                    ...sentWithUnread.map((m: any) => ({ ...m, _notifType: 'sent' })),
                ];

                allUnread.forEach((m: any, i: number) => {
                    setTimeout(() => {
                        if (!user?.id) return;
                        if (locationRef.current.includes('/messages')) return;

                        const path = getMessagesPath();
                        const label = m._notifType === 'sent'
                            ? `💬 ${m.replies?.[m.replies.length - 1]?.fromName ?? 'Someone'}: "${m.replies?.[m.replies.length - 1]?.body ?? ''}"`
                            : `📩 ${m.fromName}: "${m.body}"`;

                        showToast(label, 'info', () => navigate(`${path}?msgId=${m._id}`));
                    }, i * 800);
                });
            } catch { }
        };

        fetchUnread();
    }, [user?.id, location.pathname]);

    // ✅ Socket ready hone pe listeners lagao — setInterval nahi, onSocketReady use karo
    useEffect(() => {
        if (!user?.id) return;

        const attachListeners = () => {
            const socket = getSocket();
            if (!socket) return;

            // ✅ Pehle purane listeners remove karo — duplicate avoid karne ke liye
            socket.off('message:new');
            socket.off('message:reply_notification');

            listenersAttached.current = true;

            const handleNewMessage = ({ message }: any) => {
                if (!user?.id) return;
                if (locationRef.current.includes('/messages')) return;
                const path = getMessagesPath();
                showToast(
                    `📩 ${message.fromName}: "${message.body}"`,
                    'info',
                    () => navigate(`${path}?msgId=${message._id}`)
                );
            };

            const handleReplyNotification = ({ fromName, message }: any) => {
                if (!user?.id) return;
                if (locationRef.current.includes('/messages')) return;
                const path = getMessagesPath();
                const lastReply = message.replies?.[message.replies.length - 1]?.body ?? '';
                showToast(
                    `💬 ${fromName}: "${lastReply}"`,
                    'info',
                    () => navigate(`${path}?msgId=${message._id}`)
                );
            };

            socket.on('message:new', handleNewMessage);
            socket.on('message:reply_notification', handleReplyNotification);

            // ✅ Reconnect pe bhi listeners dobara lagao
            socket.on('reconnect', () => {
                listenersAttached.current = false;
                attachListeners();
            });
        };

        // ✅ Socket ready hone pe turant attach karo — koi delay nahi
        onSocketReady(attachListeners);

        return () => {
            const socket = getSocket();
            if (socket) {
                socket.off('message:new');
                socket.off('message:reply_notification');
                socket.off('reconnect');
            }
            listenersAttached.current = false;
        };
    }, [user?.id]);

    return null;
};

export default SocketListener;