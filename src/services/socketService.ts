import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

let socket: Socket | null = null;
const readyCallbacks: (() => void)[] = [];

export const connectSocket = (userId: string): Socket => {
    if (socket?.connected) {
        // ✅ Already connected — userId emit karo aur callbacks fire karo
        socket.emit("user:online", userId);
        readyCallbacks.forEach(cb => cb());
        readyCallbacks.length = 0;
        return socket;
    }

    if (socket) {
        socket.disconnect();
        socket = null;
    }

    socket = io(SOCKET_URL, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
        console.log("Socket connected:", socket?.id);
        socket?.emit("user:online", userId);
        // ✅ Socket ready — sab pending callbacks fire karo
        readyCallbacks.forEach(cb => cb());
        readyCallbacks.length = 0;
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected");
    });

    // ✅ FIX - socket.ts mein reconnect handler:
    socket.on("reconnect", () => {
        console.log("Socket reconnected");
        socket?.emit("user:online", userId);
        // ✅ Reconnect pe bhi callbacks fire karo
        readyCallbacks.forEach(cb => cb());
        readyCallbacks.length = 0;
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
    readyCallbacks.length = 0;
};

export const getSocket = (): Socket | null => socket;

// ✅ Socket ready hone pe callback — agar already connected to turant fire karo
export const onSocketReady = (cb: () => void) => {
    if (socket?.connected) {
        cb();
    } else {
        readyCallbacks.push(cb);
    }
};

export const joinRoom = (roomId: string) => {
    socket?.emit("room:join", roomId);
};

export const leaveRoom = (roomId: string) => {
    socket?.emit("room:leave", roomId);
};

export const requestOnlineUsers = () => {
    socket?.emit("users:get_online");
};