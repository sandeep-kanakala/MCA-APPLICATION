import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes/routes';
import { Provider } from 'react-redux';
import appStore from './app/store';
import Loader from './features/Loader';

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
      </Suspense>
    </Provider>
  );
}

export default App;
