# Tosi peli – Vakuutusten kilpailutus pelillistettynä

🎰 **Tosi peli** on innovatiivinen vakuutusten kilpailutuspalvelu, joka yhdistää pelillistämisen ja vakuutusten vertailun. Säästä jopa 1000 € vuodessa hauskalla ja visuaalisella tavalla!

## 🎮 Demo

Kokeile peliä: [Vercel Demo](https://tosi-peli.vercel.app/) *(tulossa pian)*

## 🌟 Ominaisuudet

### Pelillistetty kilpailutus
- **Kolme kelaa** vakuutuksille: Auto, Koti ja Matka
- **Visuaalinen slot-kone** -kokemus vakuutusten vertailuun
- **Dynaaminen hinnoittelu** perustuen käyttäjän valintoihin

### Interaktiiviset elementit
- Valitse vakuutusten laajuudet ennen pyöritystä
- Näe voittajat keskirivillä (korostettu sinisellä viivalla)
- Saat suuren keskittämisbonuksen jos sama yhtiö voittaa kaikki!

### Rajoitukset ja säännöt
- 2 ilmaista pyöritystä per sessio
- Toinen pyöritys vaatii preferenssien muuttamisen
- Rekisteröidy saadaksesi oikeat hinnat ja rajattomat pyöritykset

## 🛠 Teknologiat

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Tietokanta**: Firebase Firestore
- **Ääniefektit**: Mukautetut slot-äänet
- **Responsiivisuus**: Mobiiliystävällinen design
- **Hosting**: Vercel

## 📦 Asennus

1. Kloonaa repository:
```bash
git clone https://github.com/mikkovaltonen/tosi_peli.git
cd tosi_peli
```

2. Asenna riippuvuudet (HTTP-palvelin kehitykseen):
```bash
npm install -g http-server
```

3. Käynnistä kehityspalvelin:
```bash
npx http-server . -p 8080
```

4. Avaa selaimessa: `http://localhost:8080`

## 🎯 Käyttö

1. **Valitse vakuutuspreferenssit**:
   - Autovakuutus: Liikenne / Osakasko / Täyskasko
   - Kotivakuutus: Perus / Laaja + matkatavarat
   - Matkavakuutus: Vain lyhyet matkat / Laaja

2. **Pyöritä keloja** painamalla PYÖRITÄ-nappia

3. **Katso tulokset**:
   - Keskirivi näyttää voittajat
   - Sama yhtiö kaikissa = suuri keskittämisbonus!
   - Eri yhtiöt = hajauttamalla säästät


Uusinta eri valinnoilla
Käyttäjä voi halutessaan ajaa pelin uudelleen eri preferenssivalinnoilla. Jos hän yrittää ajaa samoilla valinnoilla, häntä ohjataan muuttamaan valintoja.

Tulokset ja tilikutsu
Aina kun käyttäjä ajaa pelin, avataan dialogi, joka selittää, mitkä yhtiöt voittivat. Samalla käyttäjälle tarjotaan mahdollisuus luoda tili ja pelata “tosipeliä” todellisilla vakuutustarjouksilla. Jos käyttäjä päättää luoda tilin, avataan rekisteröintidialogi.

4. **Rekisteröidy** tosipeliin saadaksesi oikeat hinnat

Rekisteröitymisen tai kirjautumisen jälkeen

Kun käyttäjä on rekisteröitynyt tai kirjautunut sisään, hänen tietonsa näytetään yläreunassa

5. **Oikeiden hintojen haku**
Tässä vaiheess pyydentään lupa hintojen hakuun 
“Hae autovakuutustarjouksia ja kotivakuutustarjouksia.” Tarjoukset haetaan API:lla.

6. **Oikeiden hintojen raakadata esitys***
Kun tarjoukset on haettu, ne päivittyvät taulukkoon ja käyttäjän tila muuttuu muotoon “Tarjoukset saatu.”

7. **Pyöritä kelloja oikeilla hinnoilla** eli tosipeli
Nyt käyttäjä voi vertailla tarjouksia pyörittämällä peliä. Kunkin kategorian voittaja on halvin tarjous, joka sisältää halutun laajuuden. Järjestölmö laskee kokonaihinnan ja säästön keskimääräisestä ja huonoimmasta tarjouksesta. 


## 📁 Projektin rakenne

```
tosi_peli/
├── index.html              # Pääsivu
├── slot.js                 # Pelin logiikka
├── styles.css              # Tyylit
├── vercel.json             # Vercel-konfiguraatio
├── public/                 # Julkiset tiedostot
│   ├── *_logo.png         # Vakuutusyhtiöiden logot
│   ├── *.wav/.mp3         # Ääniefektit
│   └── slot_background.jpg # Taustakuva
└── Product_protection_mapping/
    └── car insurance protections.xlsx
```

## 🚀 Julkaisu (Vercel)

Projekti on konfiguroitu Vercel-julkaisua varten:

```bash
vercel --prod
```

## 🔧 Kehitysominaisuudet

- **Dynaaminen tooltip**: Näyttää tarkan syyn miksi pyöritys ei onnistu
- **Visuaalinen keskirivi**: Korostettu sinisellä viivalla ja hehkuefektillä
- **Responsiivinen design**: Toimii mobiilissa ja tabletilla
- **Firebase-integraatio**: Valmis oikeiden hintojen hakuun

## 📝 Tulevat ominaisuudet

- [ ] Oikeat vakuutushinnat API:sta
- [ ] Käyttäjän kirjautuminen
- [ ] Tallennetut kilpailutukset
- [ ] Vertailu eri ajankohtina
- [ ] Lisää vakuutusyhtiöitä

## 🤝 Kehittäjälle

### Kommentoidut muutokset
Kaikki koodimuutokset on kommentoitu selkeästi laadunvarmistuksen vuoksi.

### PowerShell-komennot
Projekti käyttää PowerShell-komentoja Windows-ympäristössä.

### Firebase-konfiguraatio
Firebase-avaimet on määritelty `slot.js`-tiedostossa. Tuotantokäytössä siirrä ne ympäristömuuttujiin.

## 📄 Lisenssi

MIT License - Vapaasti käytettävissä ja muokattavissa

## 👨‍💻 Tekijä

Mikko Valtonen - [GitHub](https://github.com/mikkovaltonen)

---

💡 **Vinkki**: Kokeile eri vakuutusyhdistelmiä nähdäksesi miten keskittäminen vaikuttaa hintaan!
