import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    sotu: '',
    zip: '',
    plate: '',
    homeSize: '',
    consentStore: false,
    consentMarketing: false,
    consentSale: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  if (!isOpen) return null;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      // Save additional data to Firestore
      await setDoc(doc(db, 'registrations', userCredential.user.uid), {
        email: formData.email,
        sotu: formData.sotu,
        zip: formData.zip,
        plate: formData.plate,
        homeSize: formData.homeSize,
        consentStore: formData.consentStore,
        consentMarketing: formData.consentMarketing,
        consentSale: formData.consentSale,
        createdAt: new Date().toISOString(),
        userId: userCredential.user.uid
      });
      
      console.log('Registration successful:', userCredential.user.email);
      alert('Kiitos! Tietosi on tallennettu turvallisesti. Luomme sinulle henkilökohtaisen kilpailutuksen.');
      onClose();
      
      // Reload to update UI
      window.location.reload();
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific error codes
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('Sähköpostiosoite on jo rekisteröity. Kirjaudu sisään tai käytä toista osoitetta.');
          setTimeout(() => onSwitchToLogin(), 3000);
          break;
        case 'auth/invalid-email':
          setError('Virheellinen sähköpostiosoite.');
          break;
        case 'auth/weak-password':
          setError('Salasana on liian heikko. Käytä vähintään 6 merkkiä.');
          break;
        default:
          setError('Rekisteröinti epäonnistui. Yritä uudelleen.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Rekisteröidy</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">
                Sähköposti:
              </label>
              <input
                type="email"
                id="reg-email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">
                Salasana (väh. 6 merkkiä):
              </label>
              <input
                type="password"
                id="reg-password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                autoComplete="new-password"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="sotu">
                Henkilötunnus:
              </label>
              <input
                type="text"
                id="sotu"
                name="sotu"
                className="form-input"
                value={formData.sotu}
                onChange={handleChange}
                required
                placeholder="PPKKVV-XXXX"
                pattern="^[0-9]{6}[+\-A][0-9]{3}[0-9A-Za-z]$"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="zip">
                Postinumero:
              </label>
              <input
                type="text"
                id="zip"
                name="zip"
                className="form-input"
                value={formData.zip}
                onChange={handleChange}
                required
                pattern="[0-9]{5}"
                maxLength="5"
                placeholder="00100"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="plate">
                Rekisterinumero:
              </label>
              <input
                type="text"
                id="plate"
                name="plate"
                className="form-input"
                value={formData.plate}
                onChange={handleChange}
                required
                placeholder="ABC-123"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="homeSize">
                Asunnon koko (m²):
              </label>
              <input
                type="number"
                id="homeSize"
                name="homeSize"
                className="form-input"
                value={formData.homeSize}
                onChange={handleChange}
                required
                min="10"
                max="500"
                placeholder="75"
              />
            </div>
            
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="consent-store"
                name="consentStore"
                checked={formData.consentStore}
                onChange={handleChange}
                required
              />
              <label htmlFor="consent-store">
                Hyväksyn tietojeni tallennuksen vakuutustarjousten hakemiseen
              </label>
            </div>
            
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="consent-marketing"
                name="consentMarketing"
                checked={formData.consentMarketing}
                onChange={handleChange}
              />
              <label htmlFor="consent-marketing">
                Hyväksyn markkinointiviestit (valinnainen)
              </label>
            </div>
            
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="consent-sale"
                name="consentSale"
                checked={formData.consentSale}
                onChange={handleChange}
              />
              <label htmlFor="consent-sale">
                Tietojani saa käyttää muiden tuotteiden myyntiin (valinnainen)
              </label>
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
                {loading ? 'Rekisteröidään...' : 'Rekisteröidy'}
              </button>
            </div>
          </form>
          
          <div className="form-link">
            Onko sinulla jo tili?{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToLogin();
              }}
            >
              Kirjaudu sisään
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;