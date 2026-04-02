import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchTasks = createAsyncThunk(
    "tasks/fetchTasks",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/api/v1/task");
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch tasks");
        }
    }
);

export const createTask = createAsyncThunk(
    "tasks/createTask",
    async (taskData, { rejectWithValue }) => {
        try {
            const response = await api.post("/api/v1/task", taskData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create task");
        }
    }
);

export const updateTask = createAsyncThunk(
    "tasks/updateTask",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/api/v1/task/${id}`, data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update task");
        }
    }
);

export const deleteTask = createAsyncThunk(
    "tasks/deleteTask",
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/api/v1/task/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete task");
        }
    }
);

const initialState = {
    tasks: [],
    loading: false,
    error: null,
    searchQuery: "",
    filterStatus: null,
};

const taskSlice = createSlice({
    name: "tasks",
    initialState,
    reducers: {
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },
        setFilterStatus: (state, action) => {
            state.filterStatus = action.payload;
        },
        updateTaskLocally: (state, action) => {
            const index = state.tasks.findIndex((t) => t._id === action.payload._id);
            if (index !== -1) {
                const existingTask = state.tasks[index];
                if (new Date(action.payload.updatedAt) > new Date(existingTask.updatedAt)) {
                    state.tasks[index] = action.payload;
                }
            } else {
                // If task doesn't exist but we got an update, add it
                state.tasks.push(action.payload);
            }
        },
        addTaskLocally: (state, action) => {
            // Check if task already exists to prevent duplicates
            const exists = state.tasks.some((t) => t._id === action.payload._id);
            if (!exists) {
                state.tasks.push(action.payload);
            }
        },
        deleteTaskLocally: (state, action) => {
            state.tasks = state.tasks.filter((t) => t._id !== action.payload);
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.loading = false;
                state.tasks = action.payload;
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createTask.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                const index = state.tasks.findIndex((t) => t._id === action.payload._id);
                if (index !== -1) {
                    const existingTask = state.tasks[index];
                    if (new Date(action.payload.updatedAt) > new Date(existingTask.updatedAt)) {
                        state.tasks[index] = action.payload;
                    }
                }
            })
            .addCase(updateTask.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.tasks = state.tasks.filter((t) => t._id !== action.payload);
            })
            .addCase(deleteTask.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const {
    setSearchQuery,
    setFilterStatus,
    updateTaskLocally,
    addTaskLocally,
    deleteTaskLocally,
    clearError,
} = taskSlice.actions;

export const selectTasks = (state) => {
    const tasks = state.tasks.tasks;
    let filtered = tasks;

    if (state.tasks.filterStatus) {
        filtered = filtered.filter((t) => t.status === state.tasks.filterStatus);
    }

    if (state.tasks.searchQuery) {
        const query = state.tasks.searchQuery.toLowerCase();
        filtered = filtered.filter(
            (t) =>
                t.title.toLowerCase().includes(query) ||
                t.description?.toLowerCase().includes(query)
        );
    }

    return filtered;
};

export const selectUnfilteredTasks = (state) => state.tasks.tasks;

export default taskSlice.reducer;
