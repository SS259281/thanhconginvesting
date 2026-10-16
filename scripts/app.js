import { initNavigation } from './navigation.js';
import { initLeadForm } from './lead-form.js';
import { initChat } from './chat-ui.js';
import { initProofTabs } from './proof-tabs.js';
import { initOfferTimer } from './offer-timer.js';
import { initCourseSchedule } from './course-schedule.js';
import { initHeroThree } from './hero-three.js';
import { initPremiumInteractions } from './premium-interactions.js';
import { initJourney } from './journey.js';

initNavigation();
initLeadForm();
initChat();
const offer = initOfferTimer();
initCourseSchedule({ offer });
initPremiumInteractions();
void initHeroThree();
void initJourney();
await initProofTabs();
