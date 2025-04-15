import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";

export const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
  const { data } = await axios.get("/posts");
  return data;
});

export const fetchTags = createAsyncThunk("posts/fetchTags", async () => {
  const { data } = await axios.get("/tags");
  return data;
});

export const fetchRemovePost = createAsyncThunk(
  "posts/fetchRemovePost",
  async (id) => {
    axios.delete(`/posts/${id}`);
  }
);

const initialState = {
  posts: {
    items: [],
    status: "loading",
  },
  tags: {
    items: [],
    status: "loading",
  },
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.posts.items = [];
        state.posts.status = "loading";
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.posts.items = action.payload;
        state.posts.status = "succeeded";
      })
      .addCase(fetchPosts.rejected, (state) => {
        state.posts.items = [];
        state.posts.status = "failed";
      })

      .addCase(fetchTags.pending, (state) => {
        state.tags.items = [];
        state.tags.status = "loading";
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.tags.items = action.payload;
        state.tags.status = "succeeded";
      })
      .addCase(fetchTags.rejected, (state) => {
        state.tags.items = [];
        state.tags.status = "failed";
      })

      .addCase(fetchRemovePost.pending, (state) => {
        state.posts.status = "loading"; // Указываем, что идет удаление
      })
      .addCase(fetchRemovePost.fulfilled, (state, action) => {
        state.posts.items = state.posts.items.filter(
          (obj) => obj._id !== action.payload // Удаляем пост с указанным ID
        );
        state.posts.status = "succeeded";
      })
      .addCase(fetchRemovePost.rejected, (state) => {
        state.posts.status = "failed"; // Обрабатываем ошибку
      });

  },
});

export const postsReducer = postsSlice.reducer;
