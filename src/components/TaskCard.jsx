import { useState } from "react";
import { useDispatch } from "react-redux";
import { updateTask, deleteTask } from "../store/slices/taskSlice";

export default function TaskCard({ task }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDescription, setEditDescription] = useState(task.description || "");
    const dispatch = useDispatch();

    const handleSave = () => {
        dispatch(
            updateTask({
                id: task._id,
                data: {
                    title: editTitle,
                    description: editDescription,
                    updatedAt: new Date(),
                },
            })
        );
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this task?")) {
            dispatch(deleteTask(task._id));
        }
    };

    const formatDate = (date) => {
        const d = new Date(date);
        return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const getCreatorName = () => {
        if (typeof task.createdBy === 'object') {
            return task.createdBy?.name || 'Unknown';
        }
        return 'Someone';
    };

    const getEditorName = () => {
        if (typeof task.lastEditedBy === 'object') {
            return task.lastEditedBy?.name || 'Unknown';
        }
        return 'Unknown';
    };

    if (isEditing) {
        return (
            <div className="bg-white p-4 rounded-lg shadow-md border border-blue-300">
                <textarea
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-2 border rounded mb-2 font-semibold"
                    placeholder="Task title"
                />
                <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full p-2 border rounded mb-3 text-sm h-16"
                    placeholder="Description (optional)"
                />
                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition"
                    >
                        Save
                    </button>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded transition"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-l-blue-500 cursor-grab active:cursor-grabbing">
            <h3 className="font-semibold text-gray-800 mb-2 break-words">{task.title}</h3>
            {task.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2 break-words">{task.description}</p>
            )}
            <div className="text-xs text-gray-500 mb-3 space-y-1">
                <div>Created by: <span className="font-medium text-gray-700">{getCreatorName()}</span></div>
                <div>Updated: {formatDate(task.updatedAt)}</div>
                {getEditorName() !== getCreatorName() && (
                    <div>Last edited by: <span className="font-medium text-gray-700">{getEditorName()}</span></div>
                )}
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm transition"
                >
                    Edit
                </button>
                <button
                    onClick={handleDelete}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm transition"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}
