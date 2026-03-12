import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Main from './pages/Main';
import Board from './pages/Board';
import Dashboard from './pages/Dashboard';
import Detail from './pages/Detail';
import OCR from './pages/OCR';
import Schedule from './pages/Schedule';
import MyPage from './pages/MyPage';
import Unauthorized from './pages/Unauthorized';
import Admin from './pages/Admin';
import JWTLogin from './pages/JWTLogin';
import JWTDashboard from './pages/JWTDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Protected Routes */}
                <Route path="/main" element={<ProtectedRoute><Main /></ProtectedRoute>} />
                <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
                <Route path="/meeting/:id/board" element={<ProtectedRoute><Board /></ProtectedRoute>} />
                <Route path="/meeting/:id/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/meeting/:id/detail/:eventId" element={<ProtectedRoute><Detail /></ProtectedRoute>} />
                <Route path="/meeting/:id/ocr" element={<ProtectedRoute><OCR /></ProtectedRoute>} />
                <Route path="/meeting/:id/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
                <Route path="/meeting/:id/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                <Route path="/jwt-login" element={<JWTLogin />} />
                <Route path="/jwt-dashboard" element={<JWTDashboard />} />

                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/main" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
