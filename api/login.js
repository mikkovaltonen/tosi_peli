// Vercel Serverless Function for secure login
async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Authenticate with Firebase
    const authResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true
        })
      }
    );

    if (!authResponse.ok) {
      const error = await authResponse.json();
      console.error('Firebase Auth error:', error);
      
      if (error.error?.message === 'EMAIL_NOT_FOUND') {
        return res.status(401).json({ error: 'Sähköpostiosoitetta ei löydy. Rekisteröidy ensin.' });
      } else if (error.error?.message === 'INVALID_PASSWORD') {
        return res.status(401).json({ error: 'Väärä salasana. Yritä uudelleen.' });
      } else if (error.error?.message === 'INVALID_LOGIN_CREDENTIALS') {
        return res.status(401).json({ error: 'Väärä sähköposti tai salasana.' });
      } else if (error.error?.message === 'USER_DISABLED') {
        return res.status(401).json({ error: 'Käyttäjätili on poistettu käytöstä.' });
      }
      
      return res.status(401).json({ 
        error: 'Kirjautuminen epäonnistui', 
        details: error.error?.message || 'Tuntematon virhe'
      });
    }

    const authData = await authResponse.json();

    // Get user data from Firestore
    const userDataResponse = await fetch(
      `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/documents/registrations?pageSize=1`,
      {
        headers: {
          'Authorization': `Bearer ${authData.idToken}`
        }
      }
    );

    let userData = null;
    if (userDataResponse.ok) {
      const docs = await userDataResponse.json();
      if (docs.documents && docs.documents.length > 0) {
        // Convert Firestore format to simple object
        const doc = docs.documents[0];
        userData = {
          id: doc.name.split('/').pop(),
          sotu: doc.fields?.sotu?.stringValue,
          zip: doc.fields?.zip?.stringValue,
          plate: doc.fields?.plate?.stringValue,
          homeSize: doc.fields?.homeSize?.stringValue,
          preferences: doc.fields?.preferences ? {
            auto: doc.fields.preferences.mapValue?.fields?.auto?.stringValue,
            home: doc.fields.preferences.mapValue?.fields?.home?.stringValue,
            travel: doc.fields.preferences.mapValue?.fields?.travel?.stringValue
          } : null
        };
      }
    }

    return res.status(200).json({
      success: true,
      user: {
        email: authData.email,
        userId: authData.localId,
        token: authData.idToken,
        refreshToken: authData.refreshToken,
        expiresIn: authData.expiresIn,
        userData
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      error: 'Kirjautuminen epäonnistui',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Export for Vercel (ES6 modules)
export default handler;

// Also support CommonJS for local development
if (typeof module !== 'undefined' && module.exports) {
  module.exports = handler;
}