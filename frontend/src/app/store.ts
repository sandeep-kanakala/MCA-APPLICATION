import { configureStore } from '@reduxjs/toolkit';
import globalReducer from '../features/redux/slice';
import userRoleSlice from '../features/redux/layout';
const appStore = configureStore({
  reducer: {
    global: globalReducer, // sample example for reducer
    userRole: userRoleSlice,
  },
});
export default appStore;
// Optional: Type definitions for TypeScript
export type AppState = ReturnType<typeof appStore.getState>;
export type AppDispatch = typeof appStore.dispatch;
