import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  user_id: string; name: string; staff_id: string; department: string; role: string; township?: string;
}

interface AppState {
  user: User | null; token: string | null; tasks: any[]; loading: boolean;
}

const initialState: AppState = { user: null, token: null, tasks: [], loading: false };

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => { state.user = action.payload; },
    setToken: (state, action: PayloadAction<string | null>) => { state.token = action.payload; },
    setTasks: (state, action: PayloadAction<any[]>) => { state.tasks = action.payload; },
    setLoading: (state, action: PayloadAction<boolean>) => { state.loading = action.payload; },
    clearAuth: (state) => { state.user = null; state.token = null; state.tasks = []; },
  },
});

export const { setUser, setToken, setTasks, setLoading, clearAuth } = appSlice.actions;

export const store = configureStore({ reducer: { app: appSlice.reducer } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
