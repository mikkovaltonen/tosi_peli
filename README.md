# Tosi Peli - Vakuutusten kilpailutus pelillistettynä 🎰

Interaktiivinen vakuutusvertailusovellus, joka pelillistää vakuutusten kilpailutuksen slot-koneen muodossa. Käyttäjät voivat simuloida eri vakuutusyhtiöiden kilpailutusta ja rekisteröityä saamaan oikeat tarjoukset.

## 🎯 Ominaisuudet

- **Pelillistetty käyttökokemus**: Slot-kone UI vakuutusten vertailuun
- **Reaaliaikaiset animaatiot**: Sujuvat pyöritysanimaatiot ja äänitehosteet
- **Preferenssipohjainen vertailu**: Käyttäjä valitsee vakuutusten laajuudet ennen pyöritystä
- **Turvallinen rekisteröinti**: Firebase-integraatio tietoturvallisella API-reitillä
- **Responsiivinen suunnittelu**: Toimii kaikilla laitteilla

## 🔒 Tietoturva

Sovellus käyttää **turvallista palvelinpuolen arkkitehtuuria** Firebase-integraatiossa:

### Arkkitehtuuri
```
Käyttäjän selain → Vercel API Route → Firebase
  (ei API-avaimia)    (turvallinen)    (suojattu)
```

### Tietoturvaominaisuudet

1. **API-avaimet piilossa**: Kaikki Firebase-avaimet säilytetään palvelimen ympäristömuuttujissa
2. **Palvelinpuolen validointi**: Kaikki data validoidaan ennen tallennusta
3. **REST API autentikointi**: Käyttää Firebase Authentication -tokeneita
4. **CORS-suojaus**: Vain sallitut domainit voivat käyttää API:a
5. **Ei client-side Firebase SDK:ta**: Vältetään API-avainten paljastuminen

### Tiedostorakenne
```
/
├── api/
│   └── register.js      # Turvallinen Vercel serverless function
├── public/              # Staattiset tiedostot (logot, äänet)
├── index.html           # Pääsivu
├── slot.js              # Pelin logiikka (ei API-avaimia!)
├── styles.css           # Tyylit
├── .env                 # Ympäristömuuttujat (EI commitoida!)
└── .env.example         # Esimerkki ympäristömuuttujista
```

## 🚀 Asennus ja käyttöönotto

### Esivalmistelut

1. Node.js (v18 tai uudempi)
2. Firebase-projekti ([luo tästä](https://console.firebase.google.com))
3. Vercel-tili ([rekisteröidy tästä](https://vercel.com))

### Paikallinen kehitys

1. **Kloonaa repositorio**
```bash
git clone https://github.com/mikkovaltonen/tosi_peli.git
cd tosi_peli
```

2. **Asenna riippuvuudet**
```bash
npm install
```

3. **Konfiguroi ympäristömuuttujat**
```bash
# Kopioi esimerkkitiedosto
cp .env.example .env

# Muokkaa .env-tiedostoa ja lisää omat Firebase-avaimesi
nano .env
```

4. **Käynnistä kehityspalvelin**
```bash
npm run dev
# Avaa http://localhost:3000
```

## 🔧 Ympäristömuuttujien konfigurointi

### .env-tiedoston sisältö

```env
# Firebase Configuration (Firebase Console > Project Settings)
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_API_ID=your-app-id
FIREBASE_MEASUREMENT_ID=your-measurement-id

# Firebase käyttäjätunnukset (luo Firebase Authenticationissa)
FIREBASE_USER=app@app.fi
FIREBASE_USER_PW=your-secure-password
```

### Firebase-projektin konfigurointi

1. **Luo Firebase-projekti**
   - Mene [Firebase Consoleen](https://console.firebase.google.com)
   - Luo uusi projekti tai valitse olemassa oleva

2. **Ota käyttöön Firestore**
   - Valitse "Firestore Database" vasemmasta valikosta
   - Klikkaa "Create database"
   - Valitse production mode
   - Valitse sijainti (europe-west1 Suomelle)

3. **Konfiguroi Authentication**
   - Valitse "Authentication" vasemmasta valikosta
   - Ota käyttöön "Email/Password" sign-in method
   - Lisää käyttäjä Users-välilehdessä (sama kuin .env:ssä)

4. **Hae projektin avaimet**
   - Project Settings > General > Your apps > Web app
   - Kopioi konfiguraatio .env-tiedostoon

## 📦 Vercel-julkaisu

### 1. Asenna Vercel CLI
```bash
npm install -g vercel
```

### 2. Kirjaudu Verceliin
```bash
vercel login
```

### 3. Konfiguroi ympäristömuuttujat Vercelissa

**Vaihtoehto A: Web-käyttöliittymä**
1. Mene projektin asetuksiin Vercelissa
2. Settings → Environment Variables
3. Lisää kaikki .env-tiedoston muuttujat

**Vaihtoehto B: CLI**
```bash
# Lisää jokainen muuttuja erikseen
vercel env add FIREBASE_API_KEY
vercel env add FIREBASE_PROJECT_ID
# jne...
```

### 4. Julkaise sovellus
```bash
# Kehitysversio
vercel

# Tuotantoversio
vercel --prod
```

## 🎮 Käyttöohje

1. **Valitse vakuutusten laajuudet**
   - Auto: Valitse mini/laaja/kasko
   - Koti: Valitse perus/normaali/laaja
   - Matka: Valitse perus/normaali/premium

2. **Pyöritä rulettia**
   - Klikkaa "PYÖRITÄ" -nappia
   - Maksimissaan 2 ilmaista pyöritystä per sessio
   - Vaihda preferenssejä saadaksesi toisen pyörityksen

3. **Katso tulokset**
   - Näet voittajat jokaiselle vakuutustyypille
   - Keskittämisbonus jos sama yhtiö voittaa kaikki

4. **Rekisteröidy**
   - Täytä tietosi saadaksesi oikeat tarjoukset
   - Tiedot tallennetaan turvallisesti Firebaseen

## 🛠️ Teknologiat

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Vercel Serverless Functions
- **Tietokanta**: Firebase Firestore
- **Autentikointi**: Firebase Authentication
- **Hosting**: Vercel
- **Versionhallinta**: Git & GitHub

## 📝 API-dokumentaatio

### POST /api/register

Tallentaa käyttäjän rekisteröintitiedot turvallisesti Firebaseen.

**Request body:**
```json
{
  "sotu": "010190-123A",
  "zip": "00100",
  "plate": "ABC-123",
  "homeSize": "75",
  "consentStore": true,
  "consentMarketing": false,
  "consentSale": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration saved successfully",
  "id": "documentId123"
}
```

**Virhetilanteet:**
- `400`: Puuttuvat pakolliset kentät
- `401`: Firebase-autentikointi epäonnistui
- `500`: Palvelinvirhe

## 🐛 Vianmääritys

### Yleisimmät ongelmat

1. **"Authentication failed" -virhe**
   - Tarkista että FIREBASE_USER ja FIREBASE_USER_PW ovat oikein
   - Varmista että käyttäjä on luotu Firebase Authenticationissa

2. **"Failed to save registration" -virhe**
   - Tarkista että Firestore on otettu käyttöön
   - Varmista että FIREBASE_PROJECT_ID on oikein

3. **Vercel-julkaisu epäonnistuu**
   - Varmista että kaikki ympäristömuuttujat on asetettu
   - Tarkista `vercel logs` virheilmoitukset

## 📁 Projektin rakenne

```
tosi_peli/
├── api/                    # Vercel serverless functions
│   └── register.js         # Turvallinen rekisteröinti-endpoint
├── public/                 # Julkiset tiedostot
│   ├── *_logo.png         # Vakuutusyhtiöiden logot
│   ├── *.wav/.mp3         # Ääniefektit
│   └── slot_background.jpg # Taustakuva
├── index.html             # Pääsivu
├── slot.js                # Pelin logiikka (ei API-avaimia!)
├── styles.css             # Tyylit
├── package.json           # Node.js riippuvuudet
├── vercel.json            # Vercel-konfiguraatio
├── .env                   # Ympäristömuuttujat (EI commitoida!)
├── .env.example           # Esimerkki ympäristömuuttujista
└── .gitignore            # Git ignore -säännöt
```

## 🔄 Viimeisimmät päivitykset

### v2.0.0 - Tietoturvaparannus (2025)
- ✅ Firebase-integraatio siirretty palvelinpuolelle
- ✅ Poistettu kovakoodatut API-avaimet
- ✅ Lisätty turvallinen Vercel API route
- ✅ Pyöräytyslaskuri nollautuu sivun päivityksessä

### v1.0.0 - Alkuperäinen julkaisu
- ✅ Pelillistetty vakuutusvertailu
- ✅ Dynaaminen tooltip
- ✅ Visuaalinen keskirivi korostuksella
- ✅ Responsiivinen design

## 🤝 Kehittäminen

### Kehitysympäristö

```bash
# Asenna riippuvuudet
npm install

# Käynnistä Vercel dev-palvelin
npm run dev

# Testaa API-reitti
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"sotu":"010190-123A","zip":"00100","plate":"ABC-123","homeSize":"75"}'
```

### Git-työnkulku

```bash
# Luo uusi feature branch
git checkout -b feature/ominaisuus-nimi

# Tee muutokset ja commitoi
git add .
git commit -m "feat: Lisää uusi ominaisuus"

# Pushaa GitHubiin
git push origin feature/ominaisuus-nimi

# Luo Pull Request GitHubissa
```

## 📝 Tulevat ominaisuudet

- [ ] Oikeat vakuutushinnat API:sta
- [ ] Käyttäjän kirjautuminen OAuth:lla
- [ ] Tallennetut kilpailutukset
- [ ] Vertailu eri ajankohtina
- [ ] Lisää vakuutusyhtiöitä
- [ ] Admin-paneeli tilastoille

## 📄 Lisenssi

MIT License - Vapaasti käytettävissä ja muokattavissa

## 👥 Kehittäjät

- Mikko Valtonen - [GitHub](https://github.com/mikkovaltonen)

## 📞 Yhteystiedot

Kysymykset ja palaute: [Luo issue GitHubissa](https://github.com/mikkovaltonen/tosi_peli/issues)

---

💡 **Vinkki**: Kokeile eri vakuutusyhdistelmiä nähdäksesi miten keskittäminen vaikuttaa hintaan!