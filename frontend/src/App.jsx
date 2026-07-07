import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider }          from "./context/CartContext";
import { ToastProvider }         from "./context/ToastContext";
import Navbar  from "./components/Navbar";
import Home    from "./pages/Home";
import Login   from "./pages/Login";
import Signup  from "./pages/Signup";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
}

function Layout({ children }) {
  return (
    <div className="wrap">
      <Navbar />
      {children}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login"  element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={
                <Layout>
                  <Home />
                </Layout>
              } />
            </Routes>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}