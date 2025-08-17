// Simple client-side slot logic for three reels: auto, koti, matka

const logos = [
	{ id: "if", name: "If", src: "public/if_logo.png" },
	{ id: "op", name: "OP", src: "public/OP_logo.png" },
	{ id: "fennia", name: "Fennia", src: "public/fennia_logo.png" },
	{ id: "lahitapiola", name: "LähiTapiola", src: "public/lahitapiola_logo.png" },
	{ id: "pop", name: "POP Vakuutus", src: "public/POP_Vakuutus_logo.png" },
	{ id: "pohjantahti", name: "Pohjantähti", src: "public/pohjantahti_logo.png" }
];

const reels = [
	{ key: "auto", stripId: "strip-auto" },
	{ key: "koti", stripId: "strip-koti" },
	{ key: "matka", stripId: "strip-matka" }
];

const spinBtn = document.getElementById("spinBtn");
const resultEl = document.getElementById("result");
const adviceEl = document.getElementById("advice");
const ctaRegisterBtn = document.getElementById("ctaRegister");
const winLineAuto = document.getElementById("win-auto");
const winLineKoti = document.getElementById("win-koti");
const winLineMatka = document.getElementById("win-matka");
const slicerAuto = document.getElementById("slicer-auto");
const slicerHome = document.getElementById("slicer-home");
const slicerTravel = document.getElementById("slicer-travel");
let autoCoverValue = "";
let homeCoverValue = "";
let travelCoverValue = "";
let playCount = 0; // Pyöräytyslaskuri - nollautuu sivun päivityksessä
// confirmBtn removed with simplified UI

function buildStrip(stripId){
	const ul = document.getElementById(stripId);
	ul.innerHTML = "";
	// Repeat the sequence to make the loop longer for animation smoothness
	const longList = [...logos, ...logos, ...logos];
	for(const logo of longList){
		const li = document.createElement("li");
		const img = document.createElement("img");
		img.src = logo.src;
		img.dataset.id = logo.id;
		img.alt = logo.name;
		li.appendChild(img);
		ul.appendChild(li);
	}
	return ul;
}

function randomChoice(){
	const idx = Math.floor(Math.random() * logos.length);
	return logos[idx];
}

// Bias towards all-three-the-same (keskittämisvoitto) by CENTER_WIN_PROB
const CENTER_WIN_PROB = 0.1; // 10% chance that one yhtiö wins all three
function pickBiasedWinners(){
    if(Math.random() < CENTER_WIN_PROB){
        const winner = randomChoice();
        return [winner, winner, winner];
    }
    // Otherwise independent winners per line
    return [randomChoice(), randomChoice(), randomChoice()];
}

function spinReel(ul, durationMs){
	ul.style.setProperty("--dur", `${durationMs}ms`);
	ul.classList.add("animate-spin");
}

function stopReel(ul){
	ul.classList.remove("animate-spin");
	ul.style.removeProperty("--dur");
}

function ensureCentered(ul, targetId){
	// Adjust to show one symbol above and one below the center winner within a taller window
	const items = Array.from(ul.children);
	
	// Poista aiemmat winner-highlight luokat
	items.forEach(li => li.classList.remove("winner-highlight"));
	
	let index = items.findIndex(li => (li.querySelector("img")?.dataset.id) === targetId);
	if(index === -1) {
		// If not found in first cycle, search in the repeated parts
		index = items.findIndex((li, i) => i > logos.length && (li.querySelector("img")?.dataset.id) === targetId);
		if(index === -1) return;
	}
	
	// Lisää winner-highlight luokka keskirivissä olevalle logolle
	if(items[index]) {
		items[index].classList.add("winner-highlight");
	}
	
	const itemHeight = items[0].getBoundingClientRect().height;
	// Center the target: offset to show one above, target in middle, one below
	const centerOffset = (index - 1) * itemHeight; // Assuming window shows 3 items
	ul.style.transform = `translateY(-${centerOffset}px)`;
}

function evaluateOutcome(chosen){
	const [a,b,c] = chosen;
	if(a.id === b.id && b.id === c.id){
		return { type: "win", message: `Suuri keskittämisbonus! Kaikki: ${a.name}`, advice: `Jatkamalla saman yhtiön tuotteilla saat isoimman bonuksen.` };
	}
	// Build a concrete summary using the three winners
	return {
		type: "tip",
		message: `Säästät rahaa ottamalla Autovakuutuksen ${a.name}:sta, Kotivakuutuksen ${b.name}sta ja Matkavakuutuksen ${c.name}sta.`,
		advice: `Valitettavasti et saa suurta keskittämisbonusta tai keskittäminen ei tuota säästöä.`
	};
}

// Initialize strips
const stripElements = reels.map(r => buildStrip(r.stripId));

// No gating step: user can spin immediately

// Add sound effects
const spinSound = new Audio('public/204486__gthall__slot_play_ng.wav');
const winSound = new Audio('public/810755__mokasza__level-up-03.mp3');

function slicersReady(){
	return Boolean(autoCoverValue && homeCoverValue && travelCoverValue);
}

function updateSpinEnable(){
	spinBtn.disabled = !slicersReady();
}

function bindSlicer(rootEl, onPick){
	if(!rootEl) return;
	rootEl.addEventListener("click", (e) => {
		const btn = e.target.closest(".slicer-option");
		if(!btn) return;
		rootEl.querySelectorAll(".slicer-option").forEach(b => b.classList.remove("active"));
		btn.classList.add("active");
		onPick(btn.dataset.value);
		updateSpinEnable();
	});
}

bindSlicer(slicerAuto, (val)=> {
	autoCoverValue = val;
	updateSpinButtonTooltip();
});
bindSlicer(slicerHome, (val)=> {
	homeCoverValue = val;
	updateSpinButtonTooltip();
});
bindSlicer(slicerTravel, (val)=> {
	travelCoverValue = val;
	updateSpinButtonTooltip();
});
updateSpinEnable();

// Add a function to show info modal
function showInfoModal(title, message) {
    const modal = document.getElementById("infoModal");
    if (!modal) {
        const newModal = document.createElement("div");
        newModal.id = "infoModal";
        newModal.className = "modal hidden";
        newModal.innerHTML = `
            <div class="modal-card">
                <div class="modal-header">
                    <h3 id="infoTitle"></h3>
                    <button class="modal-close" data-close-modal>&times;</button>
                </div>
                <div class="modal-body">
                    <p id="infoMessage"></p>
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" data-close-modal>OK</button>
                </div>
            </div>
        `;
        document.body.appendChild(newModal);
    }
    document.getElementById("infoTitle").textContent = title;
    // Convert line breaks to HTML
    document.getElementById("infoMessage").innerHTML = message.replace(/\n/g, '<br>');
    toggleModal("infoModal", true);
}

// Dynamic tooltip functionality
function updateSpinButtonTooltip() {
	const tooltipIcon = spinBtn.querySelector('.tooltip-icon');
	
	// Create or update tooltip content
	let tooltipContent = spinBtn.querySelector('.tooltip-content');
	if (!tooltipContent) {
		tooltipContent = document.createElement('div');
		tooltipContent.className = 'tooltip-content';
		spinBtn.appendChild(tooltipContent);
	}
	
	let tooltipHTML = '<strong>Pyörityksen tila:</strong><ul>';
	
	if (!slicersReady()) {
		tooltipHTML += '<li style="color: var(--danger);">❌ Valitse ensin kaikki vakuutuspreferenssit</li>';
	} else if (playCount >= 2) {
		tooltipHTML += '<li style="color: var(--danger);">❌ Olet käyttänyt kaikki ilmaiset pyöritykset (2/2)</li>';
		tooltipHTML += '<li>💡 Rekisteröidy jatkaaksesi peliä oikeilla hinnoilla</li>';
	} else if (playCount >= 1 && !hasSlicerChangesSinceLastPlay()) {
		tooltipHTML += '<li style="color: var(--danger);">❌ Muuta preferenssejä pelataksesi uudelleen</li>';
		tooltipHTML += '<li>📊 Pyörityksiä käytetty: 1/2</li>';
	} else {
		tooltipHTML += '<li style="color: var(--win);">✓ Voit pyörittää!</li>';
		tooltipHTML += '<li>📊 Pyörityksiä jäljellä: ' + (2 - playCount) + '/2</li>';
		if (playCount > 0) {
			tooltipHTML += '<li>✓ Preferenssit muutettu</li>';
		}
	}
	
	tooltipHTML += '</ul>';
	tooltipContent.innerHTML = tooltipHTML;
}

// Update tooltip on page load and after preference changes
updateSpinButtonTooltip();
spinBtn.addEventListener("mouseenter", updateSpinButtonTooltip);

spinBtn.addEventListener("click", async () => {
	// Check if preferences are selected
	if (!slicersReady()) {
		console.log("Showing info modal for missing preferences");
		showInfoModal("Pyöritys ei onnistu", "Valitse ensin kaikki vakuutuspreferenssit:\n• Autovakuutuksen laajuus\n• Kotivakuutuksen laajuus\n• Matkavakuutuksen laajuus");
		return;
	}

	// Enforce per-session play count limits (unless user is logged in)
	const unlimitedSpins = sessionStorage.getItem('unlimitedSpins') === 'true';
	console.log("Play count:", playCount, "Slicer changes:", hasSlicerChangesSinceLastPlay(), "Unlimited:", unlimitedSpins);
	
	if(!unlimitedSpins && playCount >= 2){
		console.log("Showing info for playCount >=2");
		showInfoModal("Ilmaiset pyöritykset käytetty", "Olet käyttänyt molemmat ilmaiset pyöritykset (2/2).\n\nKirjaudu sisään tai rekisteröidy jatkaaksesi peliä oikeilla vakuutushinnoilla!");
		setTimeout(() => openLoginModal(), 2000);
		return;
	}
	if(playCount >= 1 && !hasSlicerChangesSinceLastPlay()){
		console.log("Showing info for second spin without changes");
		showInfoModal("Muuta preferenssejä toiselle pyöritykselle", "Saat toisen ilmaisen pyörityksen muuttamalla vähintään yhtä vakuutuspreferenssiä.\n\n💡 Kokeile eri yhdistelmiä nähdäksesi miten se vaikuttaa hintaan!\n\nVoit myös rekisteröityä pelataksesi oikeilla vakuutushinnoilla.");
		return;
	}

	spinBtn.disabled = true;
	if(resultEl) {
		resultEl.textContent = "Pyörii...";
		resultEl.className = "result";
	}
	if(adviceEl) {
		adviceEl.textContent = "";
	}

	// Play spin sound
	spinSound.play();

	// For each insurance line, pick a competition winner (biased towards same for all three)
	const chosen = pickBiasedWinners();

	// Start spinning with staggered durations
	const durations = [1600, 2000, 2400].map(ms => ms + Math.floor(Math.random()*400));
	stripElements.forEach((ul, i) => {
		ul.style.transform = "translateY(0)";
		spinReel(ul, durations[i]);
	});

	// Stop reels sequentially and align target
	await new Promise(res => setTimeout(res, durations[0]));
	stopReel(stripElements[0]);
	ensureCentered(stripElements[0], chosen[0].id);
	if(winLineAuto){ winLineAuto.textContent = `${chosen[0].name} voitti autovakuutuksen kilpailutuksen`; }

	await new Promise(res => setTimeout(res, durations[1]-durations[0]));
	stopReel(stripElements[1]);
	ensureCentered(stripElements[1], chosen[1].id);
	if(winLineKoti){ winLineKoti.textContent = `${chosen[1].name} voitti kotivakuutuksen kilpailutuksen`; }

	await new Promise(res => setTimeout(res, durations[2]-durations[1]));
	stopReel(stripElements[2]);
	ensureCentered(stripElements[2], chosen[2].id);
	if(winLineMatka){ winLineMatka.textContent = `${chosen[2].name} voitti matkavakuutuksen kilpailutuksen`; }

	const outcome = evaluateOutcome(chosen);
	if(resultEl) {
		resultEl.textContent = outcome.message;
		resultEl.classList.add(outcome.type === "win" ? "win" : outcome.type === "tip" ? "tip" : "lose");
		const coinIcon = document.querySelector('.coin-icon');
		if(coinIcon) {
			if(outcome.type === "win") {
				coinIcon.classList.remove('hidden');
			} else {
				coinIcon.classList.add('hidden');
			}
		}
	}
	if(adviceEl) {
		if(outcome.advice){ 
			adviceEl.textContent = outcome.advice; 
		}
		if(outcome.type !== "win"){
			adviceEl.textContent = "Et saanut valitettavasti suurta keskittämisbonusta koska sinun hajauttaminen kolmeen eri yhtiöön tuottaa säästöä.";
		}
	}
	if(outcome.type === "win") {
		// Play win sound on win
		winSound.play();
	}
	if(adviceEl) {
		adviceEl.textContent += " Muuta painoja simuloidaksesi kilpailutusta eri preferensseillä tai rekisteröidy palveluun tehdäksesi oikean kilpailutuksen oikeilla hinnoilla.";
	}

	// Add specific message after first spin
	if (playCount === 0 && adviceEl) {
		adviceEl.textContent += " Muuta preferenssejä ja pelaa uudelleen tai rekisteröi tili ja pelaa tosipeliä oikeilla vakuutus tarjouksilla.";
	}

	spinBtn.disabled = false;

	// Increment play count
	playCount++;
	localStorage.setItem("tosiPeliLastSlicers", JSON.stringify({ auto:autoCoverValue, home:homeCoverValue, travel:travelCoverValue }));
	
	// Update tooltip to reflect new state
	updateSpinButtonTooltip();

	// Show CTA after a play
	if(ctaRegisterBtn){ ctaRegisterBtn.classList.remove("hidden"); }
});
// CTA opens registration modal
if(ctaRegisterBtn){
    ctaRegisterBtn.addEventListener("click", () => openRegisterModal());
}

// Add header button listeners
const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
	loginBtn.addEventListener("click", () => {
		openLoginModal();
	});
}

// Open login modal
function openLoginModal() {
	toggleModal("loginModal", true);
}

// Switch from login to register modal
function switchToRegister(event) {
	event.preventDefault();
	toggleModal("loginModal", false);
	toggleModal("registerModal", true);
}
window.switchToRegister = switchToRegister;

// Switch from register to login modal
function switchToLogin(event) {
	event.preventDefault();
	toggleModal("registerModal", false);
	toggleModal("loginModal", true);
}
window.switchToLogin = switchToLogin;

const registerBtn = document.getElementById("registerBtn");
if (registerBtn) {
	registerBtn.addEventListener("click", () => openRegisterModal());
}
// Track slicer changes
function hasSlicerChangesSinceLastPlay(){
	try{
		const last = JSON.parse(localStorage.getItem("tosiPeliLastSlicers") || "null");
		if(!last) return true;
		return last.auto !== autoCoverValue || last.home !== homeCoverValue || last.travel !== travelCoverValue;
	}catch{ return true; }
}

// Modals helpers
function openPrefModal(){ toggleModal("prefModal", true); }
function openRegisterModal(){ toggleModal("registerModal", true); }
function toggleModal(id, open){
	const el = document.getElementById(id);
	if(!el) return;
	el.classList.toggle("hidden", !open);
}

document.addEventListener("click", (e) => {
	const btn = e.target.closest("[data-close-modal]");
	if(!btn) return;
	const modal = btn.closest(".modal");
	if(modal) modal.classList.add("hidden");
});

// Handle registration submit (mock)
const registerForm = document.getElementById("registerForm");
if(registerForm){
	registerForm.addEventListener("submit", (e) => {
		e.preventDefault();
		const formData = new FormData(registerForm);
		// In production: send to backend API securely
		alert("Kiitos! Luomme sinulle henkilökohtaisen kilpailutuksen ja haemme oikeat hinnat.");
		toggleModal("registerModal", false);
	});
}

// Future hooks for user session & pricing API
// window.app = { login:()=>{}, fetchPrices:()=>{} };

// Initialize secure registration handler after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	// Handle registration submit using secure API route
	const registerForm = document.getElementById("registerForm");
	if(registerForm){
		registerForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			const formData = new FormData(registerForm);
			const userData = {
				email: formData.get('email'),
				password: formData.get('password'),
				sotu: formData.get('sotu'),
				zip: formData.get('zip'),
				plate: formData.get('plate'),
				homeSize: formData.get('homeSize'),
				consentStore: document.getElementById('consent-store').checked,
				consentMarketing: document.getElementById('consent-marketing').checked,
				consentSale: document.getElementById('consent-sale').checked
			};

			try {
				// Use secure server-side API route instead of direct Firebase access
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
					toggleModal("registerModal", false);
					registerForm.reset();
				} else {
					console.error("Registration error:", result.error);
					// Show specific error message if available
					if (result.error === 'Sähköpostiosoite on jo rekisteröity') {
						alert("Tämä sähköpostiosoite on jo rekisteröity!\n\nVaihtoehdot:\n1. Kirjaudu sisään tällä sähköpostilla\n2. Käytä toista sähköpostiosoitetta rekisteröintiin");
						// Automatically switch to login modal after 3 seconds
						setTimeout(() => {
							toggleModal("registerModal", false);
							toggleModal("loginModal", true);
							// Pre-fill the email in login form
							const loginEmail = document.getElementById("login-email");
							const regEmail = document.getElementById("reg-email");
							if (loginEmail && regEmail) {
								loginEmail.value = regEmail.value;
							}
						}, 3000);
					} else {
						alert("Virhe tallennuksessa. Yritä uudelleen.");
					}
				}
			} catch (error) {
				console.error("Error submitting registration:", error);
				alert("Verkkovirhe. Tarkista yhteytesi ja yritä uudelleen.");
			}
		});
	}
});

// Handle login form submission
const loginForm = document.getElementById("loginForm");
if (loginForm) {
	loginForm.addEventListener("submit", async (e) => {
		e.preventDefault();
		const formData = new FormData(loginForm);
		const loginData = {
			email: formData.get('email'),
			password: formData.get('password')
		};

		try {
			const response = await fetch('/api/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(loginData)
			});

			const result = await response.json();

			if (response.ok) {
				// Store user data in sessionStorage
				sessionStorage.setItem('user', JSON.stringify(result.user));
				sessionStorage.setItem('isLoggedIn', 'true');
				
				alert(`Tervetuloa takaisin, ${result.user.email}!`);
				toggleModal("loginModal", false);
				loginForm.reset();
				
				// Update UI to show logged in state
				updateUIForLoggedInUser(result.user);
			} else {
				console.error("Login error:", result.error, result.details);
				// Show more specific error message
				if (result.details) {
					console.log("Firebase error details:", result.details);
				}
				alert(result.error || "Kirjautuminen epäonnistui. Tarkista sähköposti ja salasana.");
			}
		} catch (error) {
			console.error("Error during login:", error);
			alert("Verkkovirhe. Tarkista yhteytesi ja yritä uudelleen.");
		}
	});
}

// Update UI when user is logged in
function updateUIForLoggedInUser(user) {
	// Hide login/register buttons
	const loginBtn = document.getElementById("loginBtn");
	const registerBtn = document.getElementById("registerBtn");
	if (loginBtn) loginBtn.style.display = 'none';
	if (registerBtn) registerBtn.style.display = 'none';
	
	// Show user info in header
	const headerButtons = document.querySelector('.header-buttons');
	if (headerButtons) {
		const userInfo = document.createElement('div');
		userInfo.className = 'user-info';
		userInfo.innerHTML = `
			<span style="margin-right: 1rem;">Kirjautunut: ${user.email}</span>
			<button id="logoutBtn" class="btn-secondary">Kirjaudu ulos</button>
		`;
		headerButtons.appendChild(userInfo);
		
		// Add logout handler
		document.getElementById('logoutBtn').addEventListener('click', logout);
	}
	
	// Remove spin limitations for logged in users
	sessionStorage.setItem('unlimitedSpins', 'true');
}

// Logout function
function logout() {
	sessionStorage.removeItem('user');
	sessionStorage.removeItem('isLoggedIn');
	sessionStorage.removeItem('unlimitedSpins');
	location.reload();
}

// Check if user is already logged in on page load
window.addEventListener('load', () => {
	const isLoggedIn = sessionStorage.getItem('isLoggedIn');
	if (isLoggedIn === 'true') {
		const user = JSON.parse(sessionStorage.getItem('user'));
		updateUIForLoggedInUser(user);
	}
});

// Populate profile selects with logo companies
function populateProfileSelects(){
	const ids = logos.map(l => ({ id: l.id, name: l.name }));
	const selAuto = document.getElementById("sel-auto");
	const selKoti = document.getElementById("sel-koti");
	const selMatka = document.getElementById("sel-matka");
	for(const sel of [selAuto, selKoti, selMatka]){
		if(!sel) continue;
		sel.innerHTML = ids.map(o => `<option value="${o.id}">${o.name}</option>`).join("");
	}
}

populateProfileSelects();


