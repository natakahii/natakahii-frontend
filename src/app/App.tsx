import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/toast';
import { AuthProvider } from './providers/AuthProvider';
import { CartProvider } from './providers/CartProvider';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
        <Toaster />
      </CartProvider>
    </AuthProvider>
  );
}
