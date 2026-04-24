import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/toast';
import { AuthProvider } from './providers/AuthProvider';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster />
    </AuthProvider>
  );
}
