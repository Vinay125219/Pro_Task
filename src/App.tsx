import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import './App.css';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="app">
      <Dashboard />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
