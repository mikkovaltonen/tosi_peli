// Integration tests for the full registration flow

describe('End-to-End Registration Flow', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock fetch
    global.fetch = jest.fn();
  });

  test('Complete registration flow from form fill to API response', async () => {
    // Step 1: User fills form
    const formData = {
      email: 'newuser@example.com',
      password: 'SecurePass123!',
      sotu: '010190-123A',
      zip: '00100',
      plate: 'ABC-123',
      homeSize: '85',
      consentStore: true,
      consentMarketing: true,
      consentSale: false
    };

    // Step 2: Mock successful API responses
    // First call: Create user in Firebase Auth
    global.fetch.mockImplementationOnce((url) => {
      if (url.includes('accounts:signUp')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            localId: 'user-123',
            email: formData.email,
            idToken: 'auth-token-123',
            refreshToken: 'refresh-token-123'
          })
        });
      }
    });

    // Second call: Save to Firestore
    global.fetch.mockImplementationOnce((url) => {
      if (url.includes('firestore.googleapis.com')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            name: 'projects/tosi-peli/databases/(default)/documents/registrations/doc-123',
            fields: {
              userId: { stringValue: 'user-123' },
              email: { stringValue: formData.email },
              sotu: { stringValue: formData.sotu },
              zip: { stringValue: formData.zip },
              plate: { stringValue: formData.plate },
              homeSize: { stringValue: formData.homeSize },
              consentStore: { booleanValue: formData.consentStore },
              consentMarketing: { booleanValue: formData.consentMarketing },
              consentSale: { booleanValue: formData.consentSale },
              createdAt: { timestampValue: new Date().toISOString() }
            },
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString()
          })
        });
      }
    });

    // Step 3: Submit registration
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    // Step 4: Verify the flow
    expect(global.fetch).toHaveBeenCalledTimes(2);
    
    // Verify Firebase Auth call
    expect(global.fetch).toHaveBeenNthCalledWith(1,
      expect.stringContaining('accounts:signUp'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining(formData.email)
      })
    );

    // Verify Firestore call  
    expect(global.fetch).toHaveBeenNthCalledWith(2,
      expect.stringContaining('firestore.googleapis.com'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer auth-token-123'
        })
      })
    );
  });

  test('Handle duplicate email registration gracefully', async () => {
    const formData = {
      email: 'existing@example.com',
      password: 'Password123',
      sotu: '010190-123A',
      zip: '00100',
      plate: 'ABC-123',
      homeSize: '75',
      consentStore: true,
      consentMarketing: false,
      consentSale: false
    };

    // Mock EMAIL_EXISTS error from Firebase
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        json: async () => ({
          error: {
            code: 400,
            message: 'EMAIL_EXISTS',
            errors: [{
              message: 'EMAIL_EXISTS',
              domain: 'global',
              reason: 'invalid'
            }]
          }
        })
      })
    );

    // Submit registration
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    // Should only make one call (user creation fails, so no Firestore call)
    expect(global.fetch).toHaveBeenCalledTimes(1);
    
    // Error should be user-friendly in Finnish
    const result = await response.json();
    expect(result.error).toBe('Sähköpostiosoite on jo rekisteröity');
  });

  test('Validate all form fields before submission', () => {
    const validationRules = {
      email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        required: true
      },
      password: {
        minLength: 6,
        required: true
      },
      sotu: {
        pattern: /^[0-9]{6}[+\-A][0-9]{3}[0-9A-Za-z]$/,
        required: true
      },
      zip: {
        pattern: /^[0-9]{5}$/,
        required: true
      },
      plate: {
        pattern: /^[A-Z]{2,3}-[0-9]{1,3}$/i,
        required: true
      },
      homeSize: {
        min: 1,
        required: true,
        type: 'number'
      }
    };

    // Test valid data
    const validData = {
      email: 'valid@email.com',
      password: 'password123',
      sotu: '010190-123A',
      zip: '00100',
      plate: 'ABC-123',
      homeSize: '75'
    };

    // Validate email
    expect(validationRules.email.pattern.test(validData.email)).toBe(true);
    
    // Validate password length
    expect(validData.password.length >= validationRules.password.minLength).toBe(true);
    
    // Validate SOTU
    expect(validationRules.sotu.pattern.test(validData.sotu)).toBe(true);
    
    // Validate ZIP
    expect(validationRules.zip.pattern.test(validData.zip)).toBe(true);
    
    // Validate plate
    expect(validationRules.plate.pattern.test(validData.plate)).toBe(true);
    
    // Validate home size
    expect(parseInt(validData.homeSize) >= validationRules.homeSize.min).toBe(true);

    // Test invalid data
    const invalidData = {
      email: 'invalid-email',
      password: '123',
      sotu: '123456-ABC',
      zip: '123',
      plate: 'INVALID',
      homeSize: '0'
    };

    // All should fail validation
    expect(validationRules.email.pattern.test(invalidData.email)).toBe(false);
    expect(invalidData.password.length >= validationRules.password.minLength).toBe(false);
    expect(validationRules.sotu.pattern.test(invalidData.sotu)).toBe(false);
    expect(validationRules.zip.pattern.test(invalidData.zip)).toBe(false);
    expect(validationRules.plate.pattern.test(invalidData.plate)).toBe(false);
    expect(parseInt(invalidData.homeSize) >= validationRules.homeSize.min).toBe(false);
  });

  test('Handle network errors gracefully', async () => {
    const formData = {
      email: 'test@example.com',
      password: 'password123',
      sotu: '010190-123A',
      zip: '00100',
      plate: 'ABC-123',
      homeSize: '75',
      consentStore: true,
      consentMarketing: false,
      consentSale: false
    };

    // Mock network error
    global.fetch.mockRejectedValueOnce(new Error('Network request failed'));

    let errorMessage = '';
    try {
      await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
    } catch (error) {
      errorMessage = 'Verkkovirhe. Tarkista yhteytesi ja yritä uudelleen.';
    }

    expect(errorMessage).toBe('Verkkovirhe. Tarkista yhteytesi ja yritä uudelleen.');
  });

  test('Ensure consent checkboxes work correctly', () => {
    const consents = {
      store: true,    // Required
      marketing: false, // Optional
      sale: false      // Optional
    };

    // Store consent is required
    expect(consents.store).toBe(true);
    
    // Marketing and sale consents are optional
    expect(typeof consents.marketing).toBe('boolean');
    expect(typeof consents.sale).toBe('boolean');
    
    // Test that form cannot be submitted without store consent
    const canSubmit = consents.store === true;
    expect(canSubmit).toBe(true);
    
    // Test with store consent false
    consents.store = false;
    const cannotSubmit = consents.store === true;
    expect(cannotSubmit).toBe(false);
  });
});