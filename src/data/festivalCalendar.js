// ═══════════════════════════════════════════════════════════════════════════════
// festivalCalendar.js — Indian, Regional, Cultural, National & Social Media Festival Calendar
//
// Key Features:
// 1. Automatic Dynamic Rolling Calendar (generates at least 1.5 - 2+ full years
//    of accurate Indian holidays, solar/lunar festivals, and social days from current date)
// 2. Automatic removal of completed / past festivals from active reminders & calendar view
// 3. Optional toggle to view past completed festivals with distinct completed badges
// 4. Automatic recurrence calculation for repeating holidays
// 5. User custom events with persistent storage and optional auto-repeat
// ═══════════════════════════════════════════════════════════════════════════════

import { storageService } from '../services/storageService'

// Base recurring definition template for Indian, regional & social media festivals
// type: 'fixed' (fixed solar date MM-DD) | 'dynamic' (year-specific dates for tithi/lunar/moon holidays)
export const FESTIVAL_DEFINITIONS = [
  // ── FIXED ANNUAL CELEBRATIONS & NATIONAL DAYS ──
  {
    code: 'new-year',
    name: "New Year's Day",
    hindiName: 'नव वर्ष',
    month: 1,
    day: 1,
    category: 'Celebration',
    icon: '🎉',
    type: 'fixed'
  },
  {
    code: 'national-youth-day',
    name: 'National Youth Day (Swami Vivekananda Jayanti)',
    hindiName: 'राष्ट्रीय युवा दिवस',
    month: 1,
    day: 12,
    category: 'National Day',
    icon: '🧘'
  },
  {
    code: 'makar-sankranti',
    name: 'Makar Sankranti / Pongal / Maghi',
    hindiName: 'मकर संक्रांति (दही-चूड़ा, तिलकुट) / पोंगल',
    month: 1,
    day: 14,
    category: 'Major Festival',
    icon: '🪁'
  },
  {
    code: 'army-day',
    name: 'Indian Army Day',
    hindiName: 'भारतीय सेना दिवस (15 जनवरी)',
    month: 1,
    day: 15,
    category: 'National Day',
    icon: '🇮🇳'
  },
  {
    code: 'netaji-jayanti',
    name: 'Parakram Diwas (Netaji Subhash Jayanti)',
    hindiName: 'पराक्रम दिवस (नेताजी सुभाष चंद्र बोस जयंती)',
    month: 1,
    day: 23,
    category: 'National Day',
    icon: '🇮🇳'
  },
  {
    code: 'national-voters-day',
    name: 'National Voters Day',
    hindiName: 'राष्ट्रीय मतदाता दिवस (25 जनवरी)',
    month: 1,
    day: 25,
    category: 'Special Day',
    icon: '🗳️'
  },
  {
    code: 'republic-day',
    name: 'Republic Day',
    hindiName: 'गणतंत्र दिवस (26 जनवरी)',
    month: 1,
    day: 26,
    category: 'National Day',
    icon: '🇮🇳'
  },
  {
    code: 'martyrs-day',
    name: 'Martyrs Day (Shaheed Diwas)',
    hindiName: 'शहीद दिवस (30 जनवरी)',
    month: 1,
    day: 30,
    category: 'National Day',
    icon: '🕯️'
  },
  {
    code: 'valentines-day',
    name: "Valentine's Day",
    hindiName: 'वैलेंटाइन डे',
    month: 2,
    day: 14,
    category: 'Social Media / Celebration',
    icon: '💖'
  },
  {
    code: 'national-science-day',
    name: 'National Science Day (C.V. Raman)',
    hindiName: 'राष्ट्रीय विज्ञान दिवस (28 फरवरी)',
    month: 2,
    day: 28,
    category: 'Special Day',
    icon: '🔬'
  },
  {
    code: 'international-womens-day',
    name: "International Women's Day",
    hindiName: 'अंतर्राष्ट्रीय महिला दिवस (8 मार्च)',
    month: 3,
    day: 8,
    category: 'Social Media / Special Day',
    icon: '👩'
  },
  {
    code: 'bihar-diwas',
    name: 'Bihar Diwas',
    hindiName: 'बिहार दिवस (22 मार्च)',
    month: 3,
    day: 22,
    category: 'State Day',
    icon: '🏛️'
  },
  {
    code: 'shaheed-diwas-bhagat-singh',
    name: 'Shaheed Diwas (Bhagat Singh, Sukhdev, Rajguru)',
    hindiName: 'शहीद दिवस (भगत सिंह बलिदान दिवस)',
    month: 3,
    day: 23,
    category: 'National Day',
    icon: '🇮🇳'
  },
  {
    code: 'world-health-day',
    name: 'World Health Day',
    hindiName: 'विश्व स्वास्थ्य दिवस (7 अप्रैल)',
    month: 4,
    day: 7,
    category: 'Special Day',
    icon: '🩺'
  },
  {
    code: 'baisakhi',
    name: 'Baisakhi / Poila Boishakh / Pana Sankranti',
    hindiName: 'बैसाखी / सत्तू संक्रांति / नव वर्ष',
    month: 4,
    day: 14,
    category: 'Cultural Festival',
    icon: '🌾'
  },
  {
    code: 'ambedkar-jayanti',
    name: 'Dr. B.R. Ambedkar Jayanti',
    hindiName: 'डॉ. भीमराव अंबेडकर जयंती (14 अप्रैल)',
    month: 4,
    day: 14,
    category: 'National Day',
    icon: '📜'
  },
  {
    code: 'earth-day',
    name: 'World Earth Day',
    hindiName: 'पृथ्वी दिवस (22 अप्रैल)',
    month: 4,
    day: 22,
    category: 'Special Day',
    icon: '🌍'
  },
  {
    code: 'international-labour-day',
    name: 'International Labour Day (May Day)',
    hindiName: 'अंतर्राष्ट्रीय मजदूर दिवस (1 मई)',
    month: 5,
    day: 1,
    category: 'Special Day',
    icon: '⚒️'
  },
  {
    code: 'mothers-day',
    name: "Mother's Day (Second Sunday in May)",
    hindiName: 'मातृ दिवस (मदर्स डे)',
    month: 5,
    day: 10,
    category: 'Social Media / Celebration',
    icon: '💐'
  },
  {
    code: 'world-milk-day',
    name: 'World Milk Day',
    hindiName: 'विश्व दुग्ध दिवस (1 जून)',
    month: 6,
    day: 1,
    category: 'Special Day',
    icon: '🥛'
  },
  {
    code: 'world-environment-day',
    name: 'World Environment Day',
    hindiName: 'विश्व पर्यावरण दिवस (5 जून)',
    month: 6,
    day: 5,
    category: 'Special Day',
    icon: '🌱'
  },
  {
    code: 'fathers-day',
    name: "Father's Day (Third Sunday in June)",
    hindiName: 'फादर्स डे',
    month: 6,
    day: 20,
    category: 'Social Media / Celebration',
    icon: '👨'
  },
  {
    code: 'international-yoga-day',
    name: 'International Yoga Day',
    hindiName: 'अंतर्राष्ट्रीय योग दिवस (21 जून)',
    month: 6,
    day: 21,
    category: 'Special Day',
    icon: '🧘'
  },
  {
    code: 'doctors-day',
    name: 'National Doctors Day (Dr. B.C. Roy)',
    hindiName: 'राष्ट्रीय चिकित्सक दिवस (1 जुलाई)',
    month: 7,
    day: 1,
    category: 'Special Day',
    icon: '🩺'
  },
  {
    code: 'kargil-vijay-diwas',
    name: 'Kargil Vijay Diwas',
    hindiName: 'कारगिल विजय दिवस (26 जुलाई)',
    month: 7,
    day: 26,
    category: 'National Day',
    icon: '🇮🇳'
  },
  {
    code: 'friendship-day',
    name: 'Friendship Day (First Sunday in August)',
    hindiName: 'फ्रेंडशिप डे',
    month: 8,
    day: 2,
    category: 'Social Media / Celebration',
    icon: '🤝'
  },
  {
    code: 'independence-day',
    name: 'Independence Day',
    hindiName: 'स्वतंत्रता दिवस (15 अगस्त)',
    month: 8,
    day: 15,
    category: 'National Day',
    icon: '🇮🇳'
  },
  {
    code: 'national-sports-day',
    name: 'National Sports Day (Major Dhyan Chand)',
    hindiName: 'राष्ट्रीय खेल दिवस (29 अगस्त)',
    month: 8,
    day: 29,
    category: 'Special Day',
    icon: '🏆'
  },
  {
    code: 'teachers-day',
    name: 'Teachers Day (Dr. S. Radhakrishnan)',
    hindiName: 'शिक्षक दिवस (5 सितंबर)',
    month: 9,
    day: 5,
    category: 'Special Day',
    icon: '📚'
  },
  {
    code: 'hindi-diwas',
    name: 'Hindi Diwas',
    hindiName: 'हिंदी दिवस (14 सितंबर)',
    month: 9,
    day: 14,
    category: 'Special Day',
    icon: '🇮🇳'
  },
  {
    code: 'engineers-day',
    name: 'Engineers Day (M. Visvesvaraya)',
    hindiName: 'अभियंता दिवस (15 सितंबर)',
    month: 9,
    day: 15,
    category: 'Special Day',
    icon: '📐'
  },
  {
    code: 'vishwakarma-puja',
    name: 'Vishwakarma Puja',
    hindiName: 'विश्वकर्मा पूजा (17 सितंबर)',
    month: 9,
    day: 17,
    category: 'Puja',
    icon: '⚙️'
  },
  {
    code: 'gandhi-jayanti',
    name: 'Mahatma Gandhi & Lal Bahadur Shastri Jayanti',
    hindiName: 'गांधी जयंती एवं लाल बहादुर शास्त्री जयंती (2 अक्टूबर)',
    month: 10,
    day: 2,
    category: 'National Day',
    icon: '🇮🇳'
  },
  {
    code: 'indian-air-force-day',
    name: 'Indian Air Force Day',
    hindiName: 'भारतीय वायु सेना दिवस (8 अक्टूबर)',
    month: 10,
    day: 8,
    category: 'National Day',
    icon: '✈️'
  },
  {
    code: 'national-milk-day',
    name: 'National Milk Day (Dr. Verghese Kurien)',
    hindiName: 'राष्ट्रीय दुग्ध दिवस (श्वेत क्रांति)',
    month: 11,
    day: 26,
    category: 'Special Day',
    icon: '🥛'
  },
  {
    code: 'constitution-day',
    name: 'Constitution Day (Samvidhan Diwas)',
    hindiName: 'संविधान दिवस (26 नवंबर)',
    month: 11,
    day: 26,
    category: 'National Day',
    icon: '📜'
  },
  {
    code: 'indian-navy-day',
    name: 'Indian Navy Day',
    hindiName: 'भारतीय नौसेना दिवस (4 दिसंबर)',
    month: 12,
    day: 4,
    category: 'National Day',
    icon: '⚓'
  },
  {
    code: 'kisan-diwas',
    name: 'National Farmers Day (Kisan Diwas - Ch. Charan Singh)',
    hindiName: 'राष्ट्रीय किसान दिवस (23 दिसंबर)',
    month: 12,
    day: 23,
    category: 'Special Day',
    icon: '🌾'
  },
  {
    code: 'christmas',
    name: 'Christmas',
    hindiName: 'क्रिसमस (बड़ा दिन)',
    month: 12,
    day: 25,
    category: 'Holiday',
    icon: '🎄'
  },
  {
    code: 'new-years-eve',
    name: "New Year's Eve",
    hindiName: 'नव वर्ष पूर्व संध्या (31 दिसंबर)',
    month: 12,
    day: 31,
    category: 'Celebration',
    icon: '🎆'
  }
]

// ── EXACT YEAR-SPECIFIC LUNAR / TITHI FESTIVALS (2026, 2027, 2028+) ──
export const YEAR_SPECIFIC_FESTIVALS = [
  // ── 2026 ──
  { name: 'Sawan Somwar Vrat', hindiName: 'सावन सोमवार व्रत', date: '2026-08-17', category: 'Fasting & Puja', icon: '🌿' },
  { name: 'Sawan Somwar Vrat (2)', hindiName: 'सावन सोमवार व्रत (अंतिम)', date: '2026-08-24', category: 'Fasting & Puja', icon: '🌿' },
  { name: 'Eid-e-Milad (Milad-un-Nabi)', hindiName: 'ईद-ए-मिलाद', date: '2026-08-25', category: 'Religious Festival', icon: '🌙' },
  { name: 'Onam', hindiName: 'ओणम पर्व', date: '2026-08-26', category: 'Cultural Festival', icon: '🌺' },
  { name: 'Raksha Bandhan', hindiName: 'रक्षाबंधन (राखी)', date: '2026-08-28', category: 'Major Festival', icon: '🎁' },
  { name: 'Shri Krishna Janmashtami', hindiName: 'श्री कृष्ण जन्माष्टमी (रोहिणी नक्षत्र)', date: '2026-09-04', category: 'Major Festival', icon: '🦚' },
  { name: 'Hartalika Teej', hindiName: 'हरतालिका तीज व्रत', date: '2026-09-14', category: 'Fasting & Puja', icon: '🌸' },
  { name: 'Ganesh Chaturthi', hindiName: 'गणेश चतुर्थी (गणेशोत्सव)', date: '2026-09-14', endDate: '2026-09-24', category: 'Major Festival', icon: '🐘' },
  { name: 'Anant Chaturdashi / Ganesh Visarjan', hindiName: 'अनंत चतुर्दशी / गणेश विसर्जन', date: '2026-09-24', category: 'Major Festival', icon: '🐘' },
  { name: 'Pitru Paksha Shraddha Begins', hindiName: 'पितृ पक्ष श्राद्ध प्रारंभ (अनंत पूर्णिमा)', date: '2026-09-25', category: 'Spiritual', icon: '🌾' },
  { name: 'Mahalaya / Sarva Pitru Amavasya', hindiName: 'महालया / सर्वपितृ अमावस्या', date: '2026-10-10', category: 'Spiritual', icon: '🌾' },
  { name: 'Navratri & Durga Puja Begins (Kalash Sthapana)', hindiName: 'शारदीय नवरात्रि एवं कलश स्थापना', date: '2026-10-11', endDate: '2026-10-20', category: 'Major Festival', icon: '🔱' },
  { name: 'Maha Saptami Puja', hindiName: 'महा सप्तमी पूजन (पत्रिका प्रवेश)', date: '2026-10-18', category: 'Major Festival', icon: '🔱' },
  { name: 'Maha Ashtami & Navami', hindiName: 'महा अष्टमी एवं महानवमी पूजन (हवन व कन्या पूजन)', date: '2026-10-19', category: 'Major Festival', icon: '🔱' },
  { name: 'Dussehra / Vijayadashami', hindiName: 'दशहरा / विजयादशमी (रावण दहन)', date: '2026-10-20', category: 'Major Festival', icon: '🏹' },
  { name: 'Sharad Purnima / Kojagiri', hindiName: 'शरद पूर्णिमा (अमृत खीर)', date: '2026-10-25', category: 'Fasting & Puja', icon: '🌕' },
  { name: 'Karwa Chauth', hindiName: 'करवा चौथ व्रत', date: '2026-10-29', category: 'Fasting & Puja', icon: '🌕' },
  { name: 'Ahoi Ashtami', hindiName: 'अहोई अष्टमी व्रत (संतान सुख)', date: '2026-11-02', category: 'Fasting & Puja', icon: '🌸' },
  { name: 'Rama Ekadashi', hindiName: 'रमा एकादशी व्रत', date: '2026-11-05', category: 'Fasting & Puja', icon: '🪷' },
  { name: 'Dhanteras', hindiName: 'धनतेरस (धनतेरस खरीदारी)', date: '2026-11-06', category: 'Diwali Festival', icon: '🪔' },
  { name: 'Narak Chaturdashi / Choti Diwali', hindiName: 'नरक चतुर्दशी / छोटी दीपावली (रूप चौदस)', date: '2026-11-07', category: 'Diwali Festival', icon: '🪔' },
  { name: 'Diwali (Deepawali)', hindiName: 'दीपावली (लक्ष्मी-गणेश महापूजन)', date: '2026-11-08', category: 'Major Festival', icon: '🪔' },
  { name: 'Govardhan Puja & Annakut', hindiName: 'गोवर्धन पूजा एवं अन्नकूट उत्सव', date: '2026-11-09', category: 'Major Festival', icon: '🌸' },
  { name: 'Bhai Dooj / Chitragupta Puja', hindiName: 'भाई दूज एवं श्री चित्रगुप्त पूजा (यम द्वितीया)', date: '2026-11-10', category: 'Major Festival', icon: '🌸' },
  { name: 'Chhath Puja (Nahay-Khay)', hindiName: 'छठ महापर्व (नहाय-खाय - कद्दू भात)', date: '2026-11-13', category: 'Chhath Mahaparv', icon: '☀️' },
  { name: 'Chhath Puja (Kharna)', hindiName: 'छठ महापर्व (खरना - गुड़ खीर व दूध)', date: '2026-11-14', category: 'Chhath Mahaparv', icon: '☀️' },
  { name: 'Chhath Puja (Sandhya Arghya)', hindiName: 'छठ महापर्व (संध्या अर्घ्य - डूबते सूर्य को अर्घ्य)', date: '2026-11-15', category: 'Chhath Mahaparv', icon: '☀️' },
  { name: 'Chhath Puja (Pratah Arghya)', hindiName: 'छठ महापर्व (प्रातः अर्घ्य एवं पारण)', date: '2026-11-16', category: 'Chhath Mahaparv', icon: '☀️' },
  { name: 'Gopashtami', hindiName: 'गोपाष्टमी (गौ माता पूजन)', date: '2026-11-17', category: 'Puja', icon: '🐄' },
  { name: 'Dev Uthani Ekadashi / Tulsi Vivah', hindiName: 'देवउठनी एकादशी / तुलसी विवाह प्रारंभ', date: '2026-11-20', category: 'Fasting & Puja', icon: '🌿' },
  { name: 'Kartik Purnima / Dev Deepawali', hindiName: 'कार्तिक पूर्णिमा / देव दीपावली / गुरु नानक जयंती', date: '2026-11-24', category: 'Puja & Spiritual', icon: '🪔' },
  { name: 'Sonepur Mela Begins', hindiName: 'सोनपुर मेला (हरिहर क्षेत्र मेला)', date: '2026-11-25', category: 'Bihar Festival', icon: '🎪' },
  { name: 'Margashirsha Purnima / Dattatreya Jayanti', hindiName: 'दत्तात्रेय जयंती / मार्गशीर्ष पूर्णिमा', date: '2026-12-23', category: 'Puja', icon: '🪷' },

  // ── 2027 ──
  { name: 'Putrada Ekadashi', hindiName: 'पौष पुत्रदा एकादशी', date: '2027-01-18', category: 'Fasting & Puja', icon: '🪷' },
  { name: 'Paush Purnima', hindiName: 'पौष पूर्णिमा (माघ स्नान प्रारंभ)', date: '2027-01-22', category: 'Puja', icon: '🌕' },
  { name: 'Shattila Ekadashi', hindiName: 'षट्तिला एकादशी (तिल पूजन)', date: '2027-02-02', category: 'Fasting & Puja', icon: '🪷' },
  { name: 'Mauni Amavasya', hindiName: 'मौनी अमावस्या (शाही स्नान)', date: '2027-02-06', category: 'Puja & Spiritual', icon: '🌊' },
  { name: 'Basant Panchami / Saraswati Puja', hindiName: 'बसंत पंचमी / माँ सरस्वती पूजा', date: '2027-02-11', category: 'Major Festival', icon: '🌼' },
  { name: 'Jaya Ekadashi', hindiName: 'जया एकादशी व्रत', date: '2027-02-17', category: 'Fasting & Puja', icon: '🪷' },
  { name: 'Magha Purnima / Ravidas Jayanti', hindiName: 'माघ पूर्णिमा / संत रविदास जयंती', date: '2027-02-21', category: 'Puja', icon: '🌕' },
  { name: 'Vijaya Ekadashi', hindiName: 'विजया एकादशी व्रत', date: '2027-03-04', category: 'Fasting & Puja', icon: '🪷' },
  { name: 'Maha Shivratri', hindiName: 'महाशिवरात्रि (भोलेनाथ दुग्धाभिषेक)', date: '2027-03-06', category: 'Major Festival', icon: '🔱' },
  { name: 'Holika Dahan', hindiName: 'होलिका दहन (संवत)', date: '2027-03-22', category: 'Major Festival', icon: '🔥' },
  { name: 'Holi (Dhulandi)', hindiName: 'होली (रंग व दही-पुआ उत्सव)', date: '2027-03-23', category: 'Major Festival', icon: '🎨' },
  { name: 'Chaitra Navratri & Hindu New Year (Vikram Samvat)', hindiName: 'चैत्र नवरात्रि एवं नव संवत्सर प्रारंभ', date: '2027-04-07', endDate: '2027-04-15', category: 'Major Festival', icon: '🔱' },
  { name: 'Eid-ul-Fitr', hindiName: 'ईद-उल-फितर (मीठी ईद)', date: '2027-04-08', category: 'Major Festival', icon: '🌙' },
  { name: 'Ram Navami', hindiName: 'श्री राम नवमी', date: '2027-04-15', category: 'Major Festival', icon: '🏹' },
  { name: 'Chaitra Chhath Puja (Nahay Khay)', hindiName: 'चैती छठ (नहाय खाय)', date: '2027-04-11', category: 'Chhath Mahaparv', icon: '☀️' },
  { name: 'Chaitra Chhath Puja (Kharna)', hindiName: 'चैती छठ (खरना)', date: '2027-04-12', category: 'Chhath Mahaparv', icon: '☀️' },
  { name: 'Chaitra Chhath Puja (Sandhya Arghya)', hindiName: 'चैती छठ (संध्या अर्घ्य)', date: '2027-04-13', category: 'Chhath Mahaparv', icon: '☀️' },
  { name: 'Chaitra Chhath Puja (Pratah Arghya)', hindiName: 'चैती छठ (प्रातः अर्घ्य)', date: '2027-04-14', category: 'Chhath Mahaparv', icon: '☀️' },
  { name: 'Hanuman Jayanti', hindiName: 'हनुमान जन्मोत्सव', date: '2027-04-20', category: 'Puja', icon: '🚩' },
  { name: 'Akshaya Tritiya', hindiName: 'अक्षय तृतीया (स्वर्ण व मांगलिक कार्य)', date: '2027-05-08', category: 'Puja & Shubh Muhurat', icon: '🪙' },
  { name: 'Buddha Purnima', hindiName: 'बुद्ध पूर्णिमा (वैशाख पूर्णिमा)', date: '2027-05-20', category: 'Spiritual Festival', icon: '🪷' },
  { name: 'Nirjala Ekadashi', hindiName: 'निर्जला एकादशी (भीमसेनी एकादशी)', date: '2027-06-15', category: 'Fasting & Puja', icon: '🏺' },
  { name: 'Eid-ul-Adha (Bakrid)', hindiName: 'ईद-उल-अजहा (बकरीद)', date: '2027-06-16', category: 'Major Festival', icon: '🌙' },
  { name: 'Jagannath Puri Rath Yatra', hindiName: 'भगवान जगन्नाथ रथ यात्रा', date: '2027-07-05', category: 'Major Festival', icon: '🚩' },
  { name: 'Muharram (Ashura)', hindiName: 'मोहर्रम (आशूरा)', date: '2027-07-16', category: 'Religious Festival', icon: '🌙' },
  { name: 'Guru Purnima', hindiName: 'गुरु पूर्णिमा (व्यास पूर्णिमा)', date: '2027-07-18', category: 'Spiritual Festival', icon: '🪷' },
  { name: 'Sawan Somwar Vrat (1)', hindiName: 'सावन सोमवार व्रत प्रारंभ', date: '2027-07-26', category: 'Fasting & Puja', icon: '🌿' },
  { name: 'Nag Panchami', hindiName: 'नाग पंचमी पूजन', date: '2027-08-07', category: 'Puja', icon: '🐍' },
  { name: 'Raksha Bandhan', hindiName: 'रक्षाबंधन (राखी)', date: '2027-08-17', category: 'Major Festival', icon: '🎁' },
  { name: 'Krishna Janmashtami', hindiName: 'श्री कृष्ण जन्माष्टमी', date: '2027-08-25', category: 'Major Festival', icon: '🦚' },
  { name: 'Hartalika Teej', hindiName: 'हरतालिका तीज व्रत', date: '2027-09-03', category: 'Fasting & Puja', icon: '🌸' },
  { name: 'Ganesh Chaturthi', hindiName: 'गणेश चतुर्थी', date: '2027-09-04', endDate: '2027-09-14', category: 'Major Festival', icon: '🐘' },
  { name: 'Navratri & Durga Puja Begins', hindiName: 'शारदीय नवरात्रि प्रारंभ', date: '2027-09-30', endDate: '2027-10-09', category: 'Major Festival', icon: '🔱' },
  { name: 'Maha Ashtami & Navami', hindiName: 'महाष्टमी एवं महानवमी पूजन', date: '2027-10-08', category: 'Major Festival', icon: '🔱' },
  { name: 'Dussehra / Vijayadashami', hindiName: 'दशहरा / विजयादशमी', date: '2027-10-09', category: 'Major Festival', icon: '🏹' },
  { name: 'Sharad Purnima', hindiName: 'शरद पूर्णिमा', date: '2027-10-14', category: 'Fasting & Puja', icon: '🌕' },
  { name: 'Karwa Chauth', hindiName: 'करवा चौथ व्रत', date: '2027-10-18', category: 'Fasting & Puja', icon: '🌕' },
  { name: 'Dhanteras', hindiName: 'धनतेरस', date: '2027-10-27', category: 'Diwali Festival', icon: '🪔' },
  { name: 'Diwali (Deepawali)', hindiName: 'दीपावली महापूजन', date: '2027-10-29', category: 'Major Festival', icon: '🪔' },
  { name: 'Govardhan Puja & Bhai Dooj', hindiName: 'गोवर्धन पूजा एवं भाई दूज', date: '2027-10-31', category: 'Major Festival', icon: '🌸' },
  { name: 'Chhath Puja (Nahay-Khay)', hindiName: 'छठ महापर्व (नहाय-खाय)', date: '2027-11-03', category: 'Chhath Mahaparv', icon: '☀️' },
  { name: 'Chhath Puja (Kharna)', hindiName: 'छठ महापर्व (खरना)', date: '2027-11-04', category: 'Chhath Mahaparv', icon: '☀️' },
  { name: 'Chhath Puja (Sandhya Arghya)', hindiName: 'छठ महापर्व (संध्या अर्घ्य)', date: '2027-11-05', category: 'Chhath Mahaparv', icon: '☀️' },
  { name: 'Chhath Puja (Pratah Arghya)', hindiName: 'छठ महापर्व (प्रातः अर्घ्य)', date: '2027-11-06', category: 'Chhath Mahaparv', icon: '☀️' },
  { name: 'Dev Uthani Ekadashi', hindiName: 'देवउठनी एकादशी / तुलसी विवाह', date: '2027-11-09', category: 'Fasting & Puja', icon: '🌿' },
  { name: 'Kartik Purnima / Dev Deepawali', hindiName: 'कार्तिक पूर्णिमा / देव दीपावली', date: '2027-11-13', category: 'Puja & Spiritual', icon: '🪔' },

  // ── 2028 (Expanded Auto 1-2 Years Range) ──
  { name: 'Basant Panchami / Saraswati Puja', hindiName: 'बसंत पंचमी / माँ सरस्वती पूजा', date: '2028-01-31', category: 'Major Festival', icon: '🌼' },
  { name: 'Maha Shivratri', hindiName: 'महाशिवरात्रि', date: '2028-02-24', category: 'Major Festival', icon: '🔱' },
  { name: 'Holi (Dhulandi)', hindiName: 'होली (रंगोत्सव)', date: '2028-03-12', category: 'Major Festival', icon: '🎨' },
  { name: 'Chaitra Navratri Begins', hindiName: 'चैत्र नवरात्रि प्रारंभ', date: '2028-03-27', category: 'Major Festival', icon: '🔱' },
  { name: 'Eid-ul-Fitr', hindiName: 'ईद-उल-फितर', date: '2028-03-28', category: 'Major Festival', icon: '🌙' },
  { name: 'Ram Navami', hindiName: 'श्री राम नवमी', date: '2028-04-04', category: 'Major Festival', icon: '🏹' },
  { name: 'Akshaya Tritiya', hindiName: 'अक्षय तृतीया', date: '2028-04-27', category: 'Puja & Shubh Muhurat', icon: '🪙' },
  { name: 'Raksha Bandhan', hindiName: 'रक्षाबंधन', date: '2028-08-05', category: 'Major Festival', icon: '🎁' },
  { name: 'Janmashtami', hindiName: 'श्री कृष्ण जन्माष्टमी', date: '2028-08-13', category: 'Major Festival', icon: '🦚' },
  { name: 'Ganesh Chaturthi', hindiName: 'गणेश चतुर्थी', date: '2028-08-24', category: 'Major Festival', icon: '🐘' },
  { name: 'Dussehra', hindiName: 'दशहरा / विजयादशमी', date: '2028-09-28', category: 'Major Festival', icon: '🏹' },
  { name: 'Diwali', hindiName: 'दीपावली', date: '2028-10-17', category: 'Major Festival', icon: '🪔' },
  { name: 'Chhath Puja', hindiName: 'छठ महापर्व (संध्या अर्घ्य)', date: '2028-10-24', category: 'Chhath Mahaparv', icon: '☀️' }
]

/**
 * Generates rolling festival items across a target multi-year window (e.g. current year to +2 years)
 * ensuring at least 1-2 years of future festivals and events are always active and updated.
 * @param {number} startYear 
 * @param {number} endYear 
 * @returns {Array} Array of formatted festival objects with unique IDs
 */
export const generateRollingCalendar = (startYear, endYear) => {
  const generated = []
  const addedKeys = new Set()

  // 1. Add all year-specific lunar / tithi events in the target window
  YEAR_SPECIFIC_FESTIVALS.forEach((item, index) => {
    const yr = parseInt(item.date.substring(0, 4), 10)
    if (yr >= startYear && yr <= endYear) {
      const key = `${item.date}_${item.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`
      if (!addedKeys.has(key)) {
        addedKeys.add(key)
        generated.push({
          id: `lunar_${item.date}_${index}`,
          name: item.name,
          hindiName: item.hindiName || item.name,
          date: item.date,
          endDate: item.endDate,
          category: item.category || 'Festival',
          icon: item.icon || '🎉',
          isRecurring: true
        })
      }
    }
  })

  // 2. Add fixed annual celebrations & national days for each year in the range
  for (let yr = startYear; yr <= endYear; yr++) {
    FESTIVAL_DEFINITIONS.forEach(def => {
      const monthStr = String(def.month).padStart(2, '0')
      const dayStr = String(def.day).padStart(2, '0')
      const dateStr = `${yr}-${monthStr}-${dayStr}`
      const key = `${dateStr}_${def.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`

      if (!addedKeys.has(key)) {
        addedKeys.add(key)
        generated.push({
          id: `fixed_${def.code}_${yr}`,
          name: def.name,
          hindiName: def.hindiName || def.name,
          date: dateStr,
          category: def.category || 'Special Day',
          icon: def.icon || '🎉',
          isRecurring: true
        })
      }
    })
  }

  return generated
}

/**
 * Calculates reminder status relative to a reference ISO date (YYYY-MM-DD)
 * Features:
 * - Automatically rolls at least 1-2 years forward from reference date
 * - Automatically filters out completed / expired events by default
 * - Can optionally supply `includeCompleted: true` to view past completed events
 * 
 * @param {string} dateIso - Reference date in YYYY-MM-DD format
 * @param {Array} customFestivals - Optional user added festivals list
 * @param {boolean} includeCompleted - Whether to include past completed festivals in output
 */
export const getFestivalAdvisor = (dateIso, customFestivals = null, includeCompleted = false) => {
  const refDateStr = dateIso || new Date().toISOString().split('T')[0]
  const refDate = new Date(`${refDateStr}T00:00:00`)
  const currentYear = refDate.getFullYear()

  // Generate at least current year + next 2 years (minimum 1.5 - 2+ years of events)
  const dynamicDatabase = generateRollingCalendar(currentYear, currentYear + 2)

  // Get custom festivals from storage
  const customs = customFestivals !== null ? customFestivals : storageService.getCustomFestivals()

  // Combined master festival database
  const allRaw = [...dynamicDatabase, ...(Array.isArray(customs) ? customs : [])]

  // Map and calculate exact distance in days
  const scoredFestivals = allRaw.map(item => {
    const festDate = new Date(`${item.date}T00:00:00`)
    const diffTime = festDate.getTime() - refDate.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

    let isDuringMultiDay = false
    if (item.endDate) {
      const festEndDate = new Date(`${item.endDate}T00:00:00`)
      if (refDate >= festDate && refDate <= festEndDate) {
        isDuringMultiDay = true
      }
    }

    let timingLabel = ''
    let isImminent = false // 0, 1, or 2 days before
    let badgeType = 'upcoming'
    const isCompleted = diffDays < 0 && !isDuringMultiDay

    if (diffDays === 0 || isDuringMultiDay) {
      timingLabel = 'TODAY (आज)'
      isImminent = true
      badgeType = 'today'
    } else if (diffDays === 1) {
      timingLabel = 'TOMORROW (कल)'
      isImminent = true
      badgeType = 'tomorrow'
    } else if (diffDays === 2) {
      timingLabel = 'In 2 Days (परसों)'
      isImminent = true
      badgeType = '2days'
    } else if (diffDays > 2 && diffDays <= 7) {
      timingLabel = `In ${diffDays} days`
      badgeType = 'week'
    } else if (diffDays > 7 && diffDays <= 30) {
      timingLabel = `In ${diffDays} days`
      badgeType = 'month'
    } else if (diffDays < 0) {
      timingLabel = `${Math.abs(diffDays)}d ago (Completed)`
      badgeType = 'completed'
    } else {
      timingLabel = `In ${diffDays} days`
      badgeType = 'future'
    }

    return {
      ...item,
      diffDays,
      timingLabel,
      isImminent,
      badgeType,
      isCompleted,
      isDuringMultiDay
    }
  })

  // Sort chronologically
  scoredFestivals.sort((a, b) => a.diffDays - b.diffDays)

  // 1. Automatic Removal: Active Upcoming Festivals (diffDays >= 0 or ongoing multi-day)
  // Past completed festivals are excluded from upcoming alerts and default calendar view!
  const upcomingFestivals = scoredFestivals.filter(f => !f.isCompleted)

  // 2. Active Reminders (Within 2 days: 0, 1, or 2 days away; otherwise blank)
  const activeAlerts = upcomingFestivals.filter(f => f.diffDays >= 0 && f.diffDays <= 2)

  // 3. Past Completed Festivals (for archive or reference)
  const completedFestivals = scoredFestivals
    .filter(f => f.isCompleted)
    .sort((a, b) => b.diffDays - a.diffDays) // most recent past first

  // Prioritize next day (tomorrow, diffDays === 1) if today also has a festival or if tomorrow is upcoming
  let primaryAlert = null
  if (activeAlerts.length > 0) {
    const tomorrowFest = activeAlerts.find(f => f.diffDays === 1)
    const todayFest = activeAlerts.find(f => f.diffDays === 0)
    const in2DaysFest = activeAlerts.find(f => f.diffDays === 2)

    if (tomorrowFest) {
      primaryAlert = tomorrowFest
    } else if (todayFest) {
      primaryAlert = todayFest
    } else if (in2DaysFest) {
      primaryAlert = in2DaysFest
    } else {
      primaryAlert = activeAlerts[0]
    }
  }

  const nextClosestFestival = upcomingFestivals[0] || null

  return {
    referenceDate: refDateStr,
    hasActiveAlert: activeAlerts.length > 0,
    activeAlerts,
    primaryAlert,
    nextClosestFestival,
    // Default active upcoming list (automatically removes completed past events)
    allUpcoming: upcomingFestivals,
    completedFestivals,
    allFestivals: scoredFestivals,
    totalActiveCount: upcomingFestivals.length,
    totalCompletedCount: completedFestivals.length,
    customFestivalsCount: customs.length
  }
}
