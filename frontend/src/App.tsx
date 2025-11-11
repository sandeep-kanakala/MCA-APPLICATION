import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes/routes';
import { Provider } from 'react-redux';
import appStore from './app/store';
import Loader from './features/Loader';
import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <Provider store={appStore}>
      <Suspense
        fallback={
          <div>
            <Loader />
          </div>
        }
      >
        <RouterProvider router={router} />
        <Toaster />
      </Suspense>
    </Provider>
  );
}

export default App;
