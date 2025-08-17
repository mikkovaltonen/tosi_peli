import { useState, useEffect, useRef } from 'react';
import SlotReel from './SlotReel';
import PreferenceSelector from './PreferenceSelector';
import '../styles/SlotMachine.css';

const logos = [
  { id: "if", name: "If", src: "/assets/if_logo.png" },
  { id: "op", name: "OP", src: "/assets/OP_logo.png" },
  { id: "fennia", name: "Fennia", src: "/assets/fennia_logo.png" },
  { id: "lahitapiola", name: "LähiTapiola", src: "/assets/lahitapiola_logo.png" },
  { id: "pop", name: "POP Vakuutus", src: "/assets/POP_Vakuutus_logo.png" },
  { id: "pohjantahti", name: "Pohjantähti", src: "/assets/pohjantahti_logo.png" }
];

const SlotMachine = ({ user, onRegisterClick }) => {
  const [preferences, setPreferences] = useState({
    auto: '',
    home: '',
    travel: ''
  });
  
  const [spinning, setSpinning] = useState(false);
  const [winners, setWinners] = useState(null);
  const [result, setResult] = useState(null);
  const [playCount, setPlayCount] = useState(0);
  const [lastPreferences, setLastPreferences] = useState(null);
  
  // Sound refs
  const spinSoundRef = useRef(new Audio('/assets/204486__gthall__slot_play_ng.wav'));
  const winSoundRef = useRef(new Audio('/assets/810755__mokasza__level-up-03.mp3'));
  
  // Check if all preferences are selected
  const canSpin = preferences.auto && preferences.home && preferences.travel;
  
  // Check if preferences have changed since last spin
  const preferencesChanged = JSON.stringify(preferences) !== JSON.stringify(lastPreferences);
  
  // Determine if user can spin
  const canPlay = () => {
    if (!canSpin) return false;
    if (user) return true; // Unlimited spins for logged-in users
    if (playCount === 0) return true; // First spin
    if (playCount === 1 && preferencesChanged) return true; // Second spin with changed preferences
    return false;
  };
  
  // Center win probability
  const CENTER_WIN_PROB = 0.1;
  
  const pickBiasedWinners = () => {
    if (Math.random() < CENTER_WIN_PROB) {
      const winner = logos[Math.floor(Math.random() * logos.length)];
      return [winner, winner, winner];
    }
    return [
      logos[Math.floor(Math.random() * logos.length)],
      logos[Math.floor(Math.random() * logos.length)],
      logos[Math.floor(Math.random() * logos.length)]
    ];
  };
  
  const evaluateOutcome = (chosen) => {
    const [auto, home, travel] = chosen;
    if (auto.id === home.id && home.id === travel.id) {
      return {
        type: "win",
        message: `Suuri keskittämisbonus! Kaikki: ${auto.name}`,
        advice: "Jatkamalla saman yhtiön tuotteilla saat isoimman bonuksen."
      };
    }
    return {
      type: "tip",
      message: `Säästät rahaa ottamalla Autovakuutuksen ${auto.name}:sta, Kotivakuutuksen ${home.name}sta ja Matkavakuutuksen ${travel.name}sta.`,
      advice: "Valitettavasti et saa suurta keskittämisbonusta koska sinun hajauttaminen kolmeen eri yhtiöön tuottaa säästöä."
    };
  };
  
  const handleSpin = async () => {
    if (!canPlay()) {
      if (!canSpin) {
        alert("Valitse ensin kaikki vakuutuspreferenssit!");
      } else if (playCount >= 2 && !user) {
        alert("Olet käyttänyt molemmat ilmaiset pyöritykset. Kirjaudu sisään jatkaaksesi!");
      } else if (!preferencesChanged) {
        alert("Muuta vähintään yhtä preferenssiä pelataksesi uudelleen!");
      }
      return;
    }
    
    setSpinning(true);
    setResult(null);
    
    // Play spin sound
    spinSoundRef.current.play();
    
    // Pick winners
    const chosen = pickBiasedWinners();
    setWinners(chosen);
    
    // Wait for animation
    setTimeout(() => {
      const outcome = evaluateOutcome(chosen);
      setResult(outcome);
      
      if (outcome.type === "win") {
        winSoundRef.current.play();
      }
      
      setSpinning(false);
      setPlayCount(playCount + 1);
      setLastPreferences({...preferences});
    }, 2400);
  };
  
  const getSpinButtonTooltip = () => {
    if (!canSpin) {
      return "Valitse ensin kaikki vakuutuspreferenssit";
    }
    if (!user && playCount >= 2) {
      return "Olet käyttänyt kaikki ilmaiset pyöritykset (2/2)";
    }
    if (!user && playCount === 1 && !preferencesChanged) {
      return "Muuta preferenssejä pelataksesi uudelleen";
    }
    if (!user) {
      return `Pyörityksiä jäljellä: ${2 - playCount}/2`;
    }
    return "Voit pyörittää!";
  };
  
  return (
    <div className="slot-machine">
      <div className="preferences-section">
        <h2 className="preferences-title">Valitse vakuutuspreferenssit</h2>
        
        <PreferenceSelector
          label="Autovakuutuksen laajuus"
          value={preferences.auto}
          onChange={(value) => setPreferences({...preferences, auto: value})}
          options={[
            { value: "liikenne", label: "Liikenne" },
            { value: "osakasko", label: "Osakasko" },
            { value: "kasko", label: "Kasko" }
          ]}
        />
        
        <PreferenceSelector
          label="Kotivakuutuksen laajuus"
          value={preferences.home}
          onChange={(value) => setPreferences({...preferences, home: value})}
          options={[
            { value: "perus", label: "Perus" },
            { value: "laaja", label: "Laaja" },
            { value: "laaja-mt", label: "Laaja + MT" }
          ]}
        />
        
        <PreferenceSelector
          label="Matkavakuutuksen laajuus"
          value={preferences.travel}
          onChange={(value) => setPreferences({...preferences, travel: value})}
          options={[
            { value: "short", label: "Lyhyt" },
            { value: "normal", label: "Normaali" },
            { value: "all", label: "Vuosi" }
          ]}
        />
      </div>
      
      <div className="reels-container">
        <SlotReel
          title="Autovakuutus"
          logos={logos}
          winner={winners?.[0]}
          spinning={spinning}
          duration={1600}
        />
        <SlotReel
          title="Kotivakuutus"
          logos={logos}
          winner={winners?.[1]}
          spinning={spinning}
          duration={2000}
        />
        <SlotReel
          title="Matkavakuutus"
          logos={logos}
          winner={winners?.[2]}
          spinning={spinning}
          duration={2400}
        />
      </div>
      
      <div className="spin-button-container">
        <button
          className="spin-button tooltip"
          onClick={handleSpin}
          disabled={!canPlay() || spinning}
        >
          {spinning ? "PYÖRII..." : "PYÖRITÄ"}
          <span className="tooltip-content">{getSpinButtonTooltip()}</span>
        </button>
      </div>
      
      {result && (
        <div className="results-section">
          <div className={`result ${result.type}`}>
            {result.message}
            {result.type === "win" && (
              <img src="/assets/coin.png" alt="coin" className="coin-icon" />
            )}
          </div>
          <div className="advice">{result.advice}</div>
          
          {!user && playCount > 0 && (
            <button
              className="btn btn-primary cta-button"
              onClick={onRegisterClick}
            >
              Rekisteröidy - Pelaa oikeilla hinnoilla
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SlotMachine;