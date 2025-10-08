import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/redux/slice";

const appStore = configureStore({
  reducer: {
    counter: userReducer, // sample example for reducer
  },
});
export default appStore;
// Optional: Type definitions for TypeScript
export type RootState = ReturnType<typeof appStore.getState>;
export type AppDispatch = typeof appStore.dispatch;
