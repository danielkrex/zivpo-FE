<template>
  <div class="elegant-page">
    <div
      v-if="BackgroundImage"
      class="elegant-hero"
      :style="backgroundimageStyle"
    ></div>
    <div class="elegant-card">
      <div class="elegant-body">
        <!-- Monogram / heading -->
        <div class="elegant-monogram">{{ pageHeading }}</div>

        <!-- Welcome text used as subtitle -->
        <p class="elegant-pretitle">
          {{
            project.pageWelcomeText ||
            "PRIDRUŽITE NAM SE U PROSLAVI NAŠEG VJENČANJA"
          }}
        </p>

        <!-- Event name -->
        <h2 class="elegant-event-name" v-if="project.pageEventName">
          {{ project.pageEventName }}
        </h2>

        <!-- Date + Location -->
        <p class="elegant-meta" v-if="project.pageEventDate">
          {{ project.pageEventDate }}
        </p>

        <p class="elegant-meta" v-if="project.pageEventLocation">
          {{ project.pageEventLocation }}
        </p>

        <div class="elegant-divider"></div>

        <!-- Timeline -->
        <div class="elegant-timeline">
          <div class="timeline-left">
            <div class="item">
              <img :src="IconGlasses" alt="Glasses" />
              <p>OKUPLJANJE<br /><span>17:00H</span></p>
            </div>
            <div class="item"></div>
            <div class="item">
              <img :src="IconPlate" alt="Dinner" />
              <p>SVEČANA VEČERA<br /><span>OD 19H</span></p>
            </div>
            <div class="item"></div>
          </div>
          <div class="timeline-center">
            <div class="item">
              <div class="line hidden"></div>
              <div class="dot"></div>
              <div class="line"></div>
            </div>
            <div class="item">
              <div class="line"></div>
              <div class="dot"></div>
              <div class="line"></div>
            </div>
            <div class="item">
              <div class="line"></div>
              <div class="dot"></div>
              <div class="line"></div>
            </div>
            <div class="item">
              <div class="line"></div>
              <div class="dot"></div>
              <div class="line hidden"></div>
            </div>
          </div>
          <div class="timeline-right">
            <div class="item"></div>
            <div class="item">
              <img :src="IconRing" alt="Rings" />
              <p>CEREMONIJA VJENČANJA<br /><span>17:30H</span></p>
            </div>
            <div class="item"></div>
            <div class="item">
              <img :src="IconParty" alt="Party" />
              <p>PROSLAVA VJENČANJA<br /><span>DO 4:00H</span></p>
            </div>
          </div>
        </div>

        <div class="elegant-divider"></div>

        <!-- RSVP -->
        <div class="elegant-rsvp-section">
          <h3 class="elegant-section-title">Potvrda dolaska</h3>
          <p class="elegant-section-sub">
            {{
              store.group.guests.length > 1
                ? "Molimo potvrdite dolazak za svaku osobu:"
                : "Molimo odaberite Vaš odgovor:"
            }}
          </p>

          <div class="elegant-guests-list">
            <div
              v-for="guest in store.group.guests"
              :key="guest.id"
              class="elegant-guest-row"
            >
              <div class="elegant-guest-name">{{ guest.name }}</div>
              <div class="elegant-rsvp-btns">
                <button
                  v-for="option in rsvpOptions"
                  :key="option.value"
                  class="ersvp-btn"
                  :class="[
                    `ersvp-btn--${option.value.toLowerCase()}`,
                    { active: guest.status === option.value },
                  ]"
                  :disabled="store.rsvpLoading"
                  @click="handleRsvp(guest.id, option.value)"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
          </div>

          <Transition name="fade">
            <div
              v-if="successMessage"
              class="elegant-alert elegant-alert--success"
            >
              {{ successMessage }}
            </div>
          </Transition>
        </div>

        <div class="elegant-divider"></div>

        <!-- Add guest -->
        <div class="elegant-add-section">
          <h3 class="elegant-section-title">
            Dodavanje gostiju
          </h3>
          <p class="elegant-section-sub">
            {{
              canAddCompanion
                ? "Možete dodati pratnju i/ili djecu."
                : "Pratnja je već dodana. Možete dodati djecu."
            }}
          </p>
          <form class="elegant-add-form" @submit.prevent="handleAddGuest">
            <input
              v-model="newGuestName"
              type="text"
              placeholder="Ime i prezime"
              maxlength="80"
              class="elegant-input"
            />
            <div class="elegant-form-row">
              <div class="elegant-type-toggle" v-if="canAddCompanion">
                <label
                  :class="{ selected: !newGuestIsChild }"
                  @click="newGuestIsChild = false"
                  >Pratnja</label
                >
                <label
                  :class="{ selected: newGuestIsChild }"
                  @click="newGuestIsChild = true"
                  >Dijete</label
                >
              </div>
              <button
                type="submit"
                class="elegant-add-btn"
                :disabled="!newGuestName.trim() || store.rsvpLoading"
              >
                + Dodaj
              </button>
            </div>
          </form>
          <Transition name="fade">
            <div v-if="addError" class="elegant-alert elegant-alert--error">
              {{ addError }}
            </div>
          </Transition>
        </div>
      </div>
      <!-- end elegant-body -->

      <div class="elegant-footer">
        <p>
          Ova pozivnica je osobna i namijenjena samo Vama{{
            companions.length ? " i Vašoj pratnji" : ""
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useInvitationStore } from "../stores/invitation.js";
import BackgroundImage from "../assets/images/elegant-bkg-1.png";
import IconGlasses from "../assets/images/icon-glasses.png";
import IconRing from "../assets/images/icon-rings.png";
import IconPlate from "../assets/images/icon-plate.png";
import IconParty from "../assets/images/icon-party.png";

const props = defineProps({ token: { type: String, required: true } });

const store = useInvitationStore();
const successMessage = ref("");
const newGuestName = ref("");
const newGuestIsChild = ref(false);
const addError = ref("");

const backgroundimageStyle = {
  backgroundImage: `url(${BackgroundImage})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const rsvpOptions = [
  { value: "ATTENDING", label: "Dolazim" },
  { value: "NOT_ATTENDING", label: "Ne dolazim" },
  { value: "MAYBE", label: "Možda" },
];

const project = computed(() => store.group.project);
const companions = computed(() =>
  store.group.guests.filter((g) => !g.isPrimary),
);
const canAddCompanion = computed(() => store.group.guests.length < 2);
const pageHeading = computed(() => project.value.pageHeading || "Pozivnica");

async function handleRsvp(guestId, status) {
  const ok = await store.updateRsvp(props.token, guestId, status);
  if (ok) {
    const label = rsvpOptions.find((o) => o.value === status)?.label;
    successMessage.value = `Hvala! Odgovor "${label}" je zabilježen.`;
    setTimeout(() => (successMessage.value = ""), 3500);
  }
}

async function handleAddGuest() {
  addError.value = "";
  const isChild = canAddCompanion.value ? newGuestIsChild.value : true;
  const ok = await store.addGuest(props.token, newGuestName.value, isChild);
  if (ok) {
    newGuestName.value = "";
    newGuestIsChild.value = false;
  } else {
    addError.value = store.error;
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Qwigley&display=swap');

.elegant-page {
  min-height: 100vh;
  background: #2d3b2d;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 0 0 60px;
  position: relative;
}

.elegant-hero {
  position: absolute;
  inset: 0;
  z-index: 0;
  height: 100vh;
}

.elegant-card {
  width: 100%;
  max-width: 560px;
  background: #f2f1ef;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
  position: relative;
  z-index: 1;
  top: 150px;
  margin-bottom: 150px;
}

.elegant-body {
  padding: 48px 48px 40px;
  text-align: center;
  font-family: "CrimsonPro", Georgia, serif;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.elegant-monogram {
    font-family: "Qwigley", "Anthony Gilford", serif;
    font-style: normal;
    font-size: 208px;
    font-weight: normal;
    color: #262627;
    line-height: 1;
    margin-bottom: 24px;
    letter-spacing: -12px;
    text-align: left;
    align-self: flex-start;
}

.elegant-pretitle {
  font-size: 15px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #8d8d8d;
  margin: 0 0 16px;
  font-family: "CrimsonPro", Georgia, serif;
  font-weight: 400;
  line-height: 1.6;
  text-align: right;
  width: 260px;
  align-self: flex-end;
}

.elegant-event-name {
  font-size: 30px;
  font-weight: 600;
  letter-spacing: 5px;
  text-transform: uppercase;
  color: #262627;
  margin: 0 0 8px;
  font-family: "CrimsonPro", Georgia, serif;
  text-align: right;
  align-self: flex-end;
}

.elegant-meta {
  font-size: 15px;
  color: #999;
  letter-spacing: 3px;
  margin: 0;
  font-family: "CrimsonPro", Georgia, serif;
  font-weight: 300;
  text-align: right;
  align-self: flex-end;
  font-style: italic;
  margin-top: 5px;
}

.elegant-divider {
  width: 80px;
  height: 1px;
  background: #d4c9b9;
  margin: 32px auto;
}

/* ── Timeline ─────────────────────────────────────── */
.elegant-timeline {
  display: flex;
  padding: 8px 0;
}

.timeline-left {
  flex: 1;
}

.timeline-center {
  flex: 1;
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
}

.timeline-right {
  flex: 1;
}

.elegant-timeline .item {
  height: 140px;
}

.elegant-timeline .item p {
  font-size: 15px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #8d8d8d;
  margin: 0 0 16px;
  font-family: "CrimsonPro", Georgia, serif;
  font-weight: 400;
  line-height: 1.6;
}

.elegant-timeline .timeline-center .item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.elegant-timeline .timeline-center .item .dot {
  width: 7px;
  height: 7px;
  border-radius: 50px;
  background: #887f73;
}

.elegant-timeline .timeline-center .item .line {
  height: 70px;
  width: 1px;
  background: #d4c9b9;
}

.elegant-timeline .timeline-center .item .line.hidden {
  background: transparent;
}

/* ── RSVP ─────────────────────────────────────────── */
.elegant-rsvp-section {
  width: 100%;
}

.elegant-section-title {
  font-size: 15px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #8d8d8d;
  margin: 0 0 16px;
  font-family: "CrimsonPro", Georgia, serif;
  font-weight: 400;
  line-height: 1.6;
}

.elegant-section-sub {
  font-size: 15px;
  color: #999;
  letter-spacing: 3px;
  margin: 0;
  font-family: "CrimsonPro", Georgia, serif;
  font-weight: 300;
  text-align: center;
  align-self: flex-end;
  font-style: italic;
  margin-top: 5px;
}

.elegant-guests-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.elegant-guest-row {
  padding: 20px 0;
}

.elegant-guest-name {
  font-size: 20px;
  color: #262627;
  font-family: "CrimsonPro", Georgia, serif;
  font-style: italic;
  font-weight: 400;
  margin-bottom: 14px;
  letter-spacing: 1px;
}

.elegant-rsvp-btns {
  display: flex;
  gap: 0;
}

.ersvp-btn {
  flex: 1;
  padding: 12px 8px;
  border: 1px solid #d4c9b9;
  background: transparent;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #8d8d8d;
  cursor: pointer;
  transition: all 0.2s;
  font-family: "CrimsonPro", Georgia, serif;
}

.ersvp-btn:last-child {
  border-right: 1px solid #d4c9b9;
}

.ersvp-btn:hover {
  background: #e8e5df;
  color: #262627;
  border-color: #887f73;
}

.ersvp-btn--attending.active {
  border-color: #5a7a5a;
  background: #edf2ed;
  color: #3d5c3d;
}
.ersvp-btn--not_attending.active {
  border-color: #8a4a4a;
  background: #f2ecec;
  color: #7a3535;
}
.ersvp-btn--maybe.active {
  border-color: #887f73;
  background: #e8e5df;
  color: #4a4540;
}

.elegant-alert {
  margin-top: 16px;
  padding: 12px 0;
  font-size: 14px;
  font-family: "CrimsonPro", Georgia, serif;
  letter-spacing: 0.5px;
  font-style: italic;
}
.elegant-alert--success {
  color: #3d5c3d;
  border-top: 1px solid #5a7a5a;
}
.elegant-alert--error {
  color: #7a3535;
  border-top: 1px solid #8a4a4a;
}

/* ── Add guest ────────────────────────────────────── */
.elegant-add-section {
  width: 100%;
}

.elegant-add-form {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: 16px;
}

.elegant-input {
  width: 100%;
  padding: 14px 0;
  border: none;
  border-bottom: 1px solid #d4c9b9;
  font-size: 15px;
  font-family: "CrimsonPro", Georgia, serif;
  font-style: italic;
  outline: none;
  transition: border-color 0.2s;
  background: transparent;
  color: #262627;
  letter-spacing: 0.5px;
  box-sizing: border-box;
}

.elegant-input::placeholder {
  color: #c0b9af;
  font-style: italic;
}

.elegant-input:focus {
  border-color: #887f73;
}

.elegant-form-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}

.elegant-type-toggle {
  display: flex;
  gap: 0;
  flex: 1;
}

.elegant-type-toggle label {
  flex: 1;
  padding: 11px 8px;
  border: 1px solid #d4c9b9;
  border-right: none;
  font-size: 12px;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  color: #636363;
  transition: all 0.15s;
  font-family: "CrimsonPro", Georgia, serif;
  text-align: center;
}

.elegant-type-toggle label:last-child {
  border-right: 1px solid #d4c9b9;
}

.elegant-type-toggle label.selected {
  border-color: #887f73;
  color: #262627;
  background: #e8e5df;
}

.elegant-add-btn {
  padding: 11px 24px;
  border: 1px solid #262627;
  background: transparent;
  font-size: 13px;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-weight: 400;
  cursor: pointer;
  color: #262627;
  transition: all 0.2s;
  font-family: "CrimsonPro", Georgia, serif;
  white-space: nowrap;
}

.elegant-add-btn:hover:not(:disabled) {
  background: #262627;
  color: #f2f1ef;
}

.elegant-add-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.elegant-footer {
  padding: 20px 48px;
  background: #e8e5df;
  text-align: center;
  font-size: 13px;
  color: #8d8d8d;
  font-family: "CrimsonPro", Georgia, serif;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

@media (max-width: 600px) {
  .elegant-body {
    padding: 36px 24px 32px;
  }
  .elegant-monogram {
    font-size: 56px;
  }
  .elegant-event-name {
    font-size: 18px;
    letter-spacing: 3px;
  }
  .elegant-footer {
    padding: 16px 24px;
  }
  .tl-label {
    font-size: 8px;
    letter-spacing: 1.2px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
