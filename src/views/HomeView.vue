<template>
  <div class="home">

    <!-- Hero -->
    <header class="hero">
      <div class="hero-inner">
        <p class="hero-label">Digitalne pozivnice za posebne trenutke</p>
        <h1>Pozovite goste<br>na pravi način</h1>
        <p class="hero-sub">
          Jednostavno upravljanje gostima, personalizirane email pozivnice i
          RSVP praćenje — sve na jednom mjestu.
        </p>
        <a href="/login" class="btn btn-primary">Prijava za administratore</a>
      </div>
      <div class="hero-decoration" aria-hidden="true">
        <span class="ring ring-1"></span>
        <span class="ring ring-2"></span>
        <span class="ring ring-3"></span>
      </div>
    </header>

    <!-- Features -->
    <section class="features">
      <div class="container">
        <h2>Sve što vam treba</h2>
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">📋</div>
            <h3>Uvoz gostiju</h3>
            <p>Jednostavno uvezite popis gostiju iz CSV datoteke. Grupiranje po emailu — jedna pozivnica, više gostiju.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">✉️</div>
            <h3>Personalizirane pozivnice</h3>
            <p>Svaki gost dobiva jedinstvenu pozivnicu s vlastitim linkom. Prilagodite izgled i sadržaj prema svom događaju.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">✅</div>
            <h3>RSVP praćenje</h3>
            <p>Pratite odgovore u realnom vremenu — tko dolazi, tko ne dolazi i tko još nije odgovorio.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <h3>Prilagodljiv izgled</h3>
            <p>Definirajte boje, slike i tekstove za svaki projekt. Svaki događaj ima vlastiti identitet.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">👥</div>
            <h3>Više administratora</h3>
            <p>Dodajte suradnike na projekt. Svaki administrator vidi i upravlja samo svojim projektima.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔗</div>
            <h3>Bez prijave za goste</h3>
            <p>Gosti pristupaju pozivnici putem jedinstvenog linka — bez potrebe za kreiranjem računa.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="how-it-works">
      <div class="container">
        <h2>Kako funkcionira?</h2>
        <ol class="steps">
          <li class="step">
            <span class="step-num">1</span>
            <div>
              <h3>Kreirajte projekt</h3>
              <p>Svaki događaj je zaseban projekt. Dodajte naziv, opis i prilagodite vizualni identitet.</p>
            </div>
          </li>
          <li class="step">
            <span class="step-num">2</span>
            <div>
              <h3>Uvezite goste</h3>
              <p>Pripremite CSV s imenima i email adresama. Uvezite jednim klikom — sustav automatski grupira goste po emailu.</p>
            </div>
          </li>
          <li class="step">
            <span class="step-num">3</span>
            <div>
              <h3>Pošaljite pozivnice</h3>
              <p>Jedan klik šalje personalizirane email pozivnice svim gostima s jedinstvenim RSVP linkom.</p>
            </div>
          </li>
          <li class="step">
            <span class="step-num">4</span>
            <div>
              <h3>Pratite odgovore</h3>
              <p>Gosti odgovaraju putem svog linka, a vi vidite status u stvarnom vremenu na nadzornoj ploči.</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <div class="container">
        <h2>Spremni za vaš poseban dan?</h2>
        <p>Prijavite se i počnite organizirati goste za vaš sljedeći događaj.</p>
        <a href="/login" class="btn btn-primary">Početak</a>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p>© {{ new Date().getFullYear() }} Pozivnice</p>
    </footer>

  </div>
</template>

<script setup>
// static page — no logic needed
</script>

<style scoped>
/* ── Hero ── */
.hero {
  position: relative;
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px 24px;
  background: linear-gradient(160deg, var(--purple-dark) 0%, var(--purple) 100%);
  overflow: hidden;
  color: white;
}

.hero-inner {
  position: relative;
  z-index: 2;
  max-width: 680px;
}

.hero-label {
  font-size: 13px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 20px;
  font-weight: 500;
}

.hero h1 {
  font-size: clamp(40px, 7vw, 72px);
  line-height: 1.1;
  margin-bottom: 24px;
  color: white;
}

.hero-sub {
  font-size: 18px;
  line-height: 1.7;
  color: rgba(255,255,255,0.8);
  margin-bottom: 40px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

/* decorative rings */
.hero-decoration {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.08);
}

.ring-1 { width: 600px; height: 600px; top: -150px; right: -150px; }
.ring-2 { width: 400px; height: 400px; bottom: -100px; left: -100px; }
.ring-3 { width: 200px; height: 200px; top: 40%; left: 10%; }

/* ── Shared ── */
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
}

section {
  padding: 80px 0;
}

section h2 {
  font-size: clamp(28px, 4vw, 42px);
  color: var(--purple-dark);
  text-align: center;
  margin-bottom: 56px;
}

/* ── Features ── */
.features {
  background: white;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 28px;
}

.feature-card {
  padding: 32px 28px;
  border-radius: 16px;
  background: var(--bg);
  border: 1px solid var(--purple-light);
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(92, 61, 143, 0.12);
}

.feature-icon {
  font-size: 32px;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 18px;
  color: var(--purple-dark);
  margin-bottom: 10px;
}

.feature-card p {
  font-size: 14px;
  color: var(--text-light);
  line-height: 1.7;
}

/* ── How it works ── */
.how-it-works {
  background: var(--bg);
}

.steps {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 36px;
  max-width: 640px;
  margin: 0 auto;
}

.step {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.step-num {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--purple-dark), var(--purple));
  color: white;
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step h3 {
  font-size: 18px;
  color: var(--purple-dark);
  margin-bottom: 6px;
}

.step p {
  font-size: 14px;
  color: var(--text-light);
  line-height: 1.7;
}

/* ── CTA ── */
.cta {
  background: linear-gradient(135deg, var(--purple-dark), var(--purple));
  color: white;
  text-align: center;
}

.cta h2 {
  color: white;
  margin-bottom: 16px;
}

.cta p {
  color: rgba(255,255,255,0.8);
  margin-bottom: 36px;
  font-size: 16px;
}

.cta .btn-primary {
  background: var(--gold);
  color: var(--purple-dark);
  font-weight: 700;
}

.cta .btn-primary:hover {
  background: var(--gold-dark);
  color: white;
}

/* ── Footer ── */
.footer {
  padding: 24px;
  text-align: center;
  font-size: 13px;
  color: var(--text-light);
  background: white;
  border-top: 1px solid var(--purple-light);
}
</style>
