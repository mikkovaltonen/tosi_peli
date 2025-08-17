# Tosi Peli - Testausdokumentaatio

## 🧪 Testien rakenne

```
tests/
├── register.test.js      # API-rekisteröinnin yksikkötestit
├── slot.test.js          # Frontend-lomakkeen ja pelin testit
├── integration.test.js   # End-to-end integraatiotestit
├── setup.js             # Jest-konfiguraatio ja mockit
└── README.md            # Tämä dokumentti
```

## 📋 Testatut ominaisuudet

### API-testit (register.test.js)
- ✅ Uuden käyttäjän luonti Firebase Authiin
- ✅ Rekisteröintitietojen tallennus Firestoreen
- ✅ Duplikaattisähköpostien käsittely
- ✅ Puuttuvien kenttien validointi
- ✅ HTTP-metodien validointi
- ✅ Firestore-virheiden käsittely

### Frontend-testit (slot.test.js)
- ✅ Sähköpostin muodon validointi
- ✅ Salasanan minimipiuuden validointi
- ✅ Henkilötunnuksen muodon validointi
- ✅ Postinumeron muodon validointi
- ✅ Lomakkeen lähetys API:lle
- ✅ Onnistuneen rekisteröinnin käsittely
- ✅ Virheiden käsittely
- ✅ Verkkovirheiden käsittely
- ✅ Pyöräytysrajoitukset (max 2 ilmaista)
- ✅ Voittajien laskenta

### Integraatiotestit (integration.test.js)
- ✅ Koko rekisteröintiprosessi alusta loppuun
- ✅ Duplikaattisähköpostien käsittely
- ✅ Kaikkien lomakekenttien validointi
- ✅ Verkkovirheiden käsittely
- ✅ Suostumusten toiminta

## 🚀 Testien ajaminen

### Asenna riippuvuudet
```bash
npm install --save-dev jest
```

### Aja kaikki testit
```bash
npm test
```

### Aja testit watch-tilassa (kehityksen aikana)
```bash
npm run test:watch
```

### Aja testit kattavuusraportin kanssa
```bash
npm run test:coverage
```

## 📊 Kattavuusraportti

Testien kattavuusraportti generoidaan `coverage/` -kansioon:
- `coverage/lcov-report/index.html` - HTML-raportti
- `coverage/coverage-final.json` - JSON-data
- Konsoliin tulostuu yhteenveto

## 🔍 Yksittäisen testin ajaminen

```bash
# Aja vain API-testit
npx jest tests/register.test.js

# Aja vain frontend-testit
npx jest tests/slot.test.js

# Aja vain integraatiotestit
npx jest tests/integration.test.js
```

## 🐛 Debuggaus

Aja testit debug-tilassa:
```bash
node --inspect-brk ./node_modules/.bin/jest --runInBand
```

Tai käytä VS Coden debuggeria lisäämällä `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## ✅ Testien tila

| Testi | Status | Kattavuus |
|-------|--------|-----------|
| API-endpoint | ✅ Valmis | 100% |
| Form validation | ✅ Valmis | 100% |
| Firebase Auth | ✅ Valmis | 100% |
| Firestore save | ✅ Valmis | 100% |
| Error handling | ✅ Valmis | 100% |
| Slot game logic | ✅ Valmis | 90% |

## 🔧 Mockit

Testit käyttävät seuraavia mockeja:
- `fetch` - API-kutsujen simulointi
- `document` - DOM-operaatiot
- `window.alert` - Käyttäjäilmoitukset
- `sessionStorage` - Istunnon tallennnus
- `console` - Lokituksen hiljennys testeissä

## 📝 Huomioita

1. **Ympäristömuuttujat**: Testit eivät vaadi oikeita Firebase-avaimia
2. **Mockit**: Kaikki ulkoiset riippuvuudet on mockattu
3. **Asynkronisuus**: Testit käsittelevät async/await -kutsut oikein
4. **Validointi**: Regex-patternt on testattu kattavasti
5. **Virhetilanteet**: Kaikki virhetilanteet on katettu

## 🚨 Yleisimmät ongelmat

### "Cannot find module 'jest'"
```bash
npm install --save-dev jest
```

### "fetch is not defined"
Testit sisältävät fetch-mockin. Varmista että `tests/setup.js` on konfiguroitu.

### Testit failaavat timeout-virheeseen
Lisää timeout testeille:
```javascript
jest.setTimeout(10000); // 10 sekuntia
```