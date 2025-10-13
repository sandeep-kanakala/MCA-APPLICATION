import { createSlice } from '@reduxjs/toolkit';

// Global state interface
export interface GlobalState {
  value: number;
  loader: boolean;
}

// Initial state
const initialState: GlobalState = {
  value: 0,
  loader: false,
};

// Create slice
const globalSlice = createSlice({
  name: 'global', // common slice name for the app
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    setLoader: (state, action: any) => {
      state.loader = action.payload;
    },
  },
});

// Export actions
export const { increment, decrement, setLoader } = globalSlice.actions;

// Export reducer
export default globalSlice.reducer;
