import { configureStore } from '@reduxjs/toolkit';
import globalReducer from '../features/redux/slice';

const appStore = configureStore({
  reducer: {
    global: globalReducer, // sample example for reducer
  },
});
export default appStore;
// Optional: Type definitions for TypeScript
export type RootState = ReturnType<typeof appStore.getState>;
export type AppDispatch = typeof appStore.dispatch;
