import { createSlice } from "@reduxjs/toolkit";
//sample code for creating slice
const CounterSlice = createSlice({
  name: "counter",
  initialState: {
    value: 0,
  },
  reducers: {
    incremented: (state) => {
      state.value += 1;
    },
    decremented: (state) => {
      state.value -= 1;
    },
  },
});

//actions
export const { incremented, decremented } = CounterSlice.actions;

export default CounterSlice.reducer;
