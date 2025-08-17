import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import SlotMachine from './components/SlotMachine';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      alert('Uloskirjautuminen epäonnistui');
    }
  };
  
  const switchToRegister = () => {
    setLoginModalOpen(false);
    setRegisterModalOpen(true);
  };
  
  const switchToLogin = () => {
    setRegisterModalOpen(false);
    setLoginModalOpen(true);
  };
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Ladataan...</div>
      </div>
    );
  }
  
  return (
    <div className="app">
      <header className="site-header">
        <h1 className="title">Tosi peli</h1>
        <p className="subtitle">Pelillistetty vakuutusten kilpailutus – säästä jopa 1000 € vuodessa</p>
        <div className="header-buttons">
          {user ? (
            <div className="user-info">
              <span>Kirjautunut: {user.email}</span>
              <button
                className="btn btn-secondary"
                onClick={handleLogout}
              >
                Kirjaudu ulos
              </button>
            </div>
          ) : (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setLoginModalOpen(true)}
              >
                Loggaa sisään
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setRegisterModalOpen(true)}
              >
                Rekisteröidy
              </button>
            </>
          )}
        </div>
      </header>
      
      <main className="slot-container">
        <div className="container">
          <SlotMachine
            user={user}
            onRegisterClick={() => setRegisterModalOpen(true)}
          />
        </div>
      </main>
      
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSwitchToRegister={switchToRegister}
      />
      
      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSwitchToLogin={switchToLogin}
      />
    </div>
  );
}

export default App;