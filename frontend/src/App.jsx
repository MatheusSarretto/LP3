import { useState } from 'react';
import { parseJwt } from './api/client';
import LoginScreen from './components/auth/LoginScreen';
import Sidebar from './components/common/Sidebar';
import AdminDashboard from './components/admin/AdminDashboard';
import ProfessorDashboard from './components/professor/ProfessorDashboard';
import StudentDashboard from './components/student/StudentDashboard';

function App() {
  const [authData, setAuthData] = useState(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      const payload = parseJwt(savedToken);
      if (payload) return { token: savedToken, role: payload.role, userEmail: payload.sub };
    }
    return { token: null, role: null, userEmail: '' };
  });

  const setAuth = (token) => {
    if (token) {
      const payload = parseJwt(token);
      if (payload) {
        localStorage.setItem('authToken', token);
        setAuthData({ token, role: payload.role, userEmail: payload.sub });
      }
    } else {
      localStorage.removeItem('authToken');
      setAuthData({ token: null, role: null, userEmail: '' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAuthData({ token: null, role: null, userEmail: '' });
  };

  if (!authData.token) {
    return <LoginScreen onLogin={setAuth} />;
  }

  return (
    <div className="flex w-full h-screen bg-slate-100 overflow-hidden font-sans">
      
      <Sidebar 
        userEmail={authData.userEmail} 
        role={authData.role} 
        onLogout={handleLogout} />
      
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
            {authData.role === 'ROLE_ADMINISTRADOR' && <AdminDashboard token={authData.token} />}
            {authData.role === 'ROLE_PROFESSOR' && <ProfessorDashboard token={authData.token} />}
            {authData.role === 'ROLE_ALUNO' && <StudentDashboard token={authData.token} />}
        </div>
      </main>
    </div>
  );
}

export default App;