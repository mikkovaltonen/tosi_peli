// Vercel Serverless Function to update user preferences
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, preferences } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token || !userId || !preferences) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update preferences in Firestore
    const updateData = {
      fields: {
        preferences: {
          mapValue: {
            fields: {
              auto: { stringValue: preferences.auto || '' },
              home: { stringValue: preferences.home || '' },
              travel: { stringValue: preferences.travel || '' },
              updatedAt: { timestampValue: new Date().toISOString() }
            }
          }
        }
      }
    };

    // First, find the user's document
    const searchResponse = await fetch(
      `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/documents/registrations`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!searchResponse.ok) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const docs = await searchResponse.json();
    let docPath = null;

    // Find the document for this user (in production, store doc ID with user)
    if (docs.documents && docs.documents.length > 0) {
      docPath = docs.documents[0].name;
    }

    if (!docPath) {
      return res.status(404).json({ error: 'User document not found' });
    }

    // Update the document
    const updateResponse = await fetch(
      `https://firestore.googleapis.com/v1/${docPath}?updateMask.fieldPaths=preferences`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      }
    );

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      console.error('Update failed:', error);
      return res.status(500).json({ error: 'Failed to update preferences' });
    }

    return res.status(200).json({
      success: true,
      message: 'Preferences updated successfully'
    });

  } catch (error) {
    console.error('Update error:', error);
    return res.status(500).json({
      error: 'Failed to update preferences',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}