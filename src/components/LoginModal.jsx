import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  if (!isOpen) return null;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      console.log('Login successful:', userCredential.user.email);
      alert(`Tervetuloa takaisin, ${userCredential.user.email}!`);
      onClose();
      
      // Reload to update UI
      window.location.reload();
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error codes
      switch (error.code) {
        case 'auth/user-not-found':
          setError('Sähköpostiosoitetta ei löydy. Rekisteröidy ensin.');
          break;
        case 'auth/wrong-password':
          setError('Väärä salasana. Yritä uudelleen.');
          break;
        case 'auth/invalid-email':
          setError('Virheellinen sähköpostiosoite.');
          break;
        case 'auth/too-many-requests':
          setError('Liian monta yritystä. Odota hetki ja yritä uudelleen.');
          break;
        default:
          setError('Kirjautuminen epäonnistui. Yritä uudelleen.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Kirjaudu sisään</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Sähköposti:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Salasana:
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                autoComplete="current-password"
              />
            </div>
            
            {error && (
              <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>
                {error}
              </div>
            )}
            
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
              >
                Peruuta
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Kirjaudutaan...' : 'Kirjaudu'}
              </button>
            </div>
          </form>
          
          <div className="form-link">
            Ei vielä tiliä?{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToRegister();
              }}
            >
              Rekisteröidy tästä
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;