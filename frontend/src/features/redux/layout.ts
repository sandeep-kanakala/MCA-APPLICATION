import { ROLE_API_URL } from '@/utils/apiUrls';
import fetchApiClient from '@/utils/fetchApiClient';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for API call
export const fetchUserRole = createAsyncThunk(
  'userRole/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchApiClient.get(ROLE_API_URL);
      return response?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);
interface UserRoleState {
  data: any[];
  loading: boolean;
  error: string | null;
}

const initialState: UserRoleState = {
  data: [],
  loading: false,
  error: null,
};

const userRoleSlice = createSlice({
  name: 'userRole',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserRole.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Something went wrong';
      });
  },
});

export default userRoleSlice.reducer;
