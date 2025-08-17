// Vercel Serverless Function for secure Firebase registration
// Uses Firebase REST API with existing .env credentials

async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { email, password, sotu, zip, plate, homeSize, consentStore, consentMarketing, consentSale } = req.body;

    // Validate required fields
    if (!email || !password || !sotu || !zip || !plate || !homeSize) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Step 1: Create new user account in Firebase Auth
    const createUserResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true
        })
      }
    );

    if (!createUserResponse.ok) {
      const error = await createUserResponse.json();
      console.error('User creation failed:', error);
      // Check if user already exists
      if (error.error && error.error.message === 'EMAIL_EXISTS') {
        return res.status(400).json({ error: 'Sähköpostiosoite on jo rekisteröity' });
      }
      return res.status(400).json({ error: 'Käyttäjän luonti epäonnistui' });
    }

    const userData = await createUserResponse.json();
    const userId = userData.localId;
    const idToken = userData.idToken;

    // Step 2: Save to Firestore using user's own token
    // Note: This requires Firestore rules to allow authenticated users to write
    const firestoreData = {
      fields: {
        userId: { stringValue: userId },
        email: { stringValue: email },
        sotu: { stringValue: sotu },
        zip: { stringValue: zip },
        plate: { stringValue: plate },
        homeSize: { stringValue: homeSize },
        consentStore: { booleanValue: consentStore },
        consentMarketing: { booleanValue: consentMarketing },
        consentSale: { booleanValue: consentSale },
        createdAt: { timestampValue: new Date().toISOString() }
      }
    };

    const firestoreResponse = await fetch(
      `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/documents/registrations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(firestoreData)
      }
    );

    if (!firestoreResponse.ok) {
      const error = await firestoreResponse.json();
      console.error('Firestore save failed:', error);
      return res.status(500).json({ error: 'Failed to save registration' });
    }

    const savedDoc = await firestoreResponse.json();
    const docId = savedDoc.name.split('/').pop();

    return res.status(200).json({
      success: true,
      message: 'Registration saved successfully',
      id: docId
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      error: 'Failed to save registration',
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