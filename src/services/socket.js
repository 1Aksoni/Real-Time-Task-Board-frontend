import io from "socket.io-client";
import store from "../store/store";
import {
    updateTaskLocally,
    addTaskLocally,
    deleteTaskLocally,
} from "../store/slices/taskSlice";

let socket = null;

export const initSocket = () => {
    const token = localStorage.getItem("token");
    if (!token) {
        console.log("No token available, socket connection skipped");
        return null;
    }

    if (socket && socket.connected) {
        console.log("Socket already connected");
        return socket;
    }

    const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

    socket = io(apiUrl, {
        auth: {
            token,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected");
    });

    socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
    });

    socket.on("task:created", (task) => {
        console.log("Task created event received:", task);
        store.dispatch(addTaskLocally(task));
    });

    socket.on("task:updated", (task) => {
        console.log("Task updated event received:", task);
        store.dispatch(updateTaskLocally(task));
    });

    socket.on("task:deleted", (taskId) => {
        console.log("Task deleted event received:", taskId);
        store.dispatch(deleteTaskLocally(taskId._id || taskId));
    });

    return socket;
};

export const getSocket = () => {
    if (!socket) {
        return initSocket();
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log("Socket disconnected");
    }
};

export const emitTaskEvent = (event, data) => {
    const socket = getSocket();
    if (socket && socket.connected) {
        socket.emit(event, data);
    } else {
        console.warn("Socket not connected, event not emitted:", event);
    }
};