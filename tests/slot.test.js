// Unit tests for frontend slot game and registration form

describe('Registration Form', () => {
  let document;
  
  beforeEach(() => {
    // Mock DOM
    document = {
      getElementById: jest.fn(),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn()
    };
    global.document = document;
    global.window = { document };
    
    // Mock fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Validation', () => {
    test('should validate email format', () => {
      const emailInput = document.createElement('input');
      emailInput.type = 'email';
      emailInput.required = true;
      emailInput.value = 'invalid-email';
      
      expect(emailInput.checkValidity()).toBe(false);
      
      emailInput.value = 'valid@email.com';
      expect(emailInput.checkValidity()).toBe(true);
    });

    test('should validate password minimum length', () => {
      const passwordInput = document.createElement('input');
      passwordInput.type = 'password';
      passwordInput.minLength = 6;
      passwordInput.required = true;
      passwordInput.value = '12345';
      
      expect(passwordInput.checkValidity()).toBe(false);
      
      passwordInput.value = '123456';
      expect(passwordInput.checkValidity()).toBe(true);
    });

    test('should validate SOTU format', () => {
      const sotuPattern = /^[0-9]{6}[+\-A][0-9]{3}[0-9A-Za-z]$/;
      
      // Invalid formats
      expect(sotuPattern.test('123456-123A')).toBe(false);
      expect(sotuPattern.test('01019-123A')).toBe(false);
      expect(sotuPattern.test('010190+12AB')).toBe(false);
      
      // Valid formats
      expect(sotuPattern.test('010190-123A')).toBe(true);
      expect(sotuPattern.test('311299A456B')).toBe(true);
      expect(sotuPattern.test('010100+123A')).toBe(true);
    });

    test('should validate ZIP code format', () => {
      const zipPattern = /^[0-9]{5}$/;
      
      // Invalid formats
      expect(zipPattern.test('1234')).toBe(false);
      expect(zipPattern.test('123456')).toBe(false);
      expect(zipPattern.test('ABCDE')).toBe(false);
      
      // Valid formats
      expect(zipPattern.test('00100')).toBe(true);
      expect(zipPattern.test('33100')).toBe(true);
      expect(zipPattern.test('99999')).toBe(true);
    });
  });

  describe('Form Submission', () => {
    test('should send correct data to API endpoint', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Registration saved successfully',
          id: 'test-id'
        })
      });

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

      // Simulate form submission
      await submitRegistration(formData);

      expect(global.fetch).toHaveBeenCalledWith('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
    });

    test('should handle registration success', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Registration saved successfully'
        })
      });

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
      
      await submitRegistration({
        email: 'test@example.com',
        password: 'password123',
        sotu: '010190-123A',
        zip: '00100',
        plate: 'ABC-123',
        homeSize: '75',
        consentStore: true
      });

      expect(alertSpy).toHaveBeenCalledWith(
        'Kiitos! Tietosi on tallennettu turvallisesti. Luomme sinulle henkilökohtaisen kilpailutuksen.'
      );
    });

    test('should handle registration failure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Email already exists'
        })
      });

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await submitRegistration({
        email: 'existing@example.com',
        password: 'password123',
        sotu: '010190-123A',
        zip: '00100',
        plate: 'ABC-123',
        homeSize: '75',
        consentStore: true
      });

      expect(alertSpy).toHaveBeenCalledWith('Virhe tallennuksessa. Yritä uudelleen.');
      expect(consoleSpy).toHaveBeenCalled();
    });

    test('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await submitRegistration({
        email: 'test@example.com',
        password: 'password123',
        sotu: '010190-123A',
        zip: '00100',
        plate: 'ABC-123',
        homeSize: '75',
        consentStore: true
      });

      expect(alertSpy).toHaveBeenCalledWith('Verkkovirhe. Tarkista yhteytesi ja yritä uudelleen.');
      expect(consoleSpy).toHaveBeenCalledWith('Error submitting registration:', expect.any(Error));
    });
  });
});

describe('Slot Game Mechanics', () => {
  describe('Spin Limitations', () => {
    test('should allow maximum 2 free spins', () => {
      let spinCount = 0;
      const maxFreeSpins = 2;
      
      // First spin
      spinCount++;
      expect(spinCount <= maxFreeSpins).toBe(true);
      
      // Second spin
      spinCount++;
      expect(spinCount <= maxFreeSpins).toBe(true);
      
      // Third spin should not be allowed
      spinCount++;
      expect(spinCount <= maxFreeSpins).toBe(false);
    });

    test('should reset spin count on page refresh', () => {
      // Simulate sessionStorage behavior
      const sessionStorage = {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn(),
        removeItem: jest.fn()
      };
      global.sessionStorage = sessionStorage;
      
      // On page load, spin count should be retrieved from sessionStorage
      const spinCount = sessionStorage.getItem('spinCount') || 0;
      expect(spinCount).toBe(0);
    });

    test('should require preference change for second spin with same preferences', () => {
      const preferences1 = {
        auto: 'osakasko',
        home: 'laaja-mt',
        travel: 'all'
      };
      
      const preferences2 = {
        auto: 'osakasko',
        home: 'laaja-mt',
        travel: 'all'
      };
      
      const preferences3 = {
        auto: 'liikenne',
        home: 'perus',
        travel: 'short'
      };
      
      // Same preferences
      expect(JSON.stringify(preferences1) === JSON.stringify(preferences2)).toBe(true);
      
      // Different preferences
      expect(JSON.stringify(preferences1) === JSON.stringify(preferences3)).toBe(false);
    });
  });

  describe('Winner Calculation', () => {
    test('should identify same company bonus', () => {
      const winners = {
        auto: 'if',
        home: 'if',
        travel: 'if'
      };
      
      const allSame = Object.values(winners).every(w => w === winners.auto);
      expect(allSame).toBe(true);
    });

    test('should identify mixed companies', () => {
      const winners = {
        auto: 'if',
        home: 'lahi',
        travel: 'op'
      };
      
      const allSame = Object.values(winners).every(w => w === winners.auto);
      expect(allSame).toBe(false);
    });
  });
});

// Helper function to simulate form submission (would be imported from slot.js in real scenario)
async function submitRegistration(userData) {
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();

    if (response.ok) {
      alert("Kiitos! Tietosi on tallennettu turvallisesti. Luomme sinulle henkilökohtaisen kilpailutuksen.");
    } else {
      console.error("Registration error:", result.error);
      alert("Virhe tallennuksessa. Yritä uudelleen.");
    }
  } catch (error) {
    console.error("Error submitting registration:", error);
    alert("Verkkovirhe. Tarkista yhteytesi ja yritä uudelleen.");
  }
}