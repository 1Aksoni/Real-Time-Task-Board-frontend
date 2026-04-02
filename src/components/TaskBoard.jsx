import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchTasks,
    createTask,
    updateTask,
    setSearchQuery,
    setFilterStatus,
    selectTasks,
    selectUnfilteredTasks,
} from "../store/slices/taskSlice";
import { initSocket, disconnectSocket } from "../services/socket";
import TaskCard from "./TaskCard";

export default function TaskBoard() {
    const dispatch = useDispatch();
    const tasks = useSelector(selectUnfilteredTasks);
    const filteredTasks = useSelector(selectTasks);
    const searchQuery = useSelector((state) => state.tasks.searchQuery);
    const filterStatus = useSelector((state) => state.tasks.filterStatus);
    const loading = useSelector((state) => state.tasks.loading);
    const error = useSelector((state) => state.tasks.error);

    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [draggedTask, setDraggedTask] = useState(null);

    useEffect(() => {
        dispatch(fetchTasks());
        initSocket();

        return () => {
            disconnectSocket();
        };
    }, [dispatch]);

    const handleCreateTask = (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        dispatch(
            createTask({
                title: newTaskTitle,
                description: newTaskDescription,
                status: "todo",
                createdAt: new Date(),
                updatedAt: new Date(),
            })
        );

        setNewTaskTitle("");
        setNewTaskDescription("");
    };

    const handleDragStart = (task) => {
        setDraggedTask(task);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (status) => {
        if (draggedTask && draggedTask.status !== status) {
            dispatch(
                updateTask({
                    id: draggedTask._id,
                    data: {
                        status,
                        updatedAt: new Date(),
                    },
                })
            );
        }
        setDraggedTask(null);
    };

    const getTasksByStatus = (status) => {
        return filteredTasks.filter((task) => task.status === status);
    };

    const handleSearch = (query) => {
        dispatch(setSearchQuery(query));
    };

    const handleFilterStatus = (status) => {
        dispatch(setFilterStatus(status === filterStatus ? null : status));
    };

    const statuses = [
        { key: "todo", label: "Todo", color: "bg-red-100" },
        { key: "in-progress", label: "In Progress", color: "bg-yellow-100" },
        { key: "done", label: "Done", color: "bg-green-100" },
    ];

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow-md p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Task Board</h1>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                        {statuses.map((status) => (
                            <button
                                key={status.key}
                                onClick={() => handleFilterStatus(status.key)}
                                className={`px-4 py-2 rounded-lg font-medium transition ${filterStatus === status.key
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Create Task Form */}
                <form onSubmit={handleCreateTask} className="flex flex-col md:flex-row gap-2">
                    <input
                        type="text"
                        placeholder="Task title..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Description (optional)..."
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition"
                    >
                        Add Task
                    </button>
                </form>

                {error && (
                    <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}
            </div>

            {/* Board */}
            <div className="flex-1 overflow-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-xl text-gray-600">Loading tasks...</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-max">
                        {statuses.map((status) => (
                            <div
                                key={status.key}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(status.key)}
                                className={`${status.color} rounded-lg p-4 min-h-96`}
                            >
                                <h2 className="font-bold text-lg text-gray-800 mb-4">
                                    {status.label}
                                </h2>
                                <div className="space-y-3">
                                    {getTasksByStatus(status.key).map((task) => (
                                        <div
                                            key={task._id}
                                            draggable
                                            onDragStart={() => handleDragStart(task)}
                                        >
                                            <TaskCard task={task} />
                                        </div>
                                    ))}
                                    {getTasksByStatus(status.key).length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            No tasks
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
