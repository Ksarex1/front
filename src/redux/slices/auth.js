import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";

export const fetchAuth = createAsyncThunk('/auth/fetchAuth', async (params) => {
    const { data } = await axios.post('/auth/login', params);
    return data;
});

export const fetchRegister = createAsyncThunk('/auth/fetchRegister', async (params) => {
    const { data } = await axios.post('/auth/register', params);
    return data;
});

export const fetchAuthMe = createAsyncThunk('/auth/fetchAuthMe', async () => {
    const { data } = await axios.get('/auth/me');
    return data;
});

const initialState = {
    data: null,
    status: 'loading',
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.data = null;
            window.localStorage.removeItem("token"); // Очищаем токен при логауте
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAuth.pending, (state) => {
                state.status = "loading";
                state.data = null;
            })
            .addCase(fetchAuth.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload;
                window.localStorage.setItem("token", action.payload.token); // Сохраняем токен
            })
            .addCase(fetchAuth.rejected, (state) => {
                state.status = 'error';
                state.data = null;
            })
            .addCase(fetchAuthMe.pending, (state) => {
                state.status = "loading";
                state.data = null;
            })
            .addCase(fetchAuthMe.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload;
            })
            .addCase(fetchAuthMe.rejected, (state) => {
                state.status = 'error';
                state.data = null;
            })
            .addCase(fetchRegister.pending, (state) => {
                state.status = "loading";
                state.data = null;
            })
            .addCase(fetchRegister.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload;
                window.localStorage.setItem("token", action.payload.token); // Сохраняем токен
            })
            .addCase(fetchRegister.rejected, (state) => {
                state.status = 'error';
                state.data = null;
            });
    },
});

export const selectIsAuth = state => Boolean(state.auth.data);
export const authReducer = authSlice.reducer;

export const { logout } = authSlice.actions;