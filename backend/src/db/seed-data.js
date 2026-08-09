/* Seed data used by both the PostgreSQL and JSON-file backends.
   The frontend (frontend/js/data.js) holds the richer catalogue used by the SPA;
   this is the canonical API-facing subset. */

// Fixed id for the seeded demo customer account (demo@servehub.com / demo123).
// Per-user collections below use high, collision-proof ids (50xxx) so they never
// clash with runtime/test records created against the same live database.
const DEMO_USER_ID = 9000;

const CATEGORIES = [
  'Cleaning', 'AC Repair', 'Electrician', 'Plumber', 'Carpenter', 'Painting',
  'Salon at Home', 'Massage', 'Appliance Repair', 'Pest Control', 'Home Cleaning',
  'RO Service', 'CCTV Installation', 'Laptop Repair', 'Beauty', 'Spa', 'Home Shifting',
];

const SERVICES = [
  { id: 's1',  name: 'Deep Home Cleaning',   category: 'Home Cleaning',    priceFrom: 1499, duration: '4-6 hrs', rating: 4.8, bookingsCount: 34210, image: '🧹', included: ['Full home dusting', 'Kitchen deep clean', 'Bathroom scrub', 'Floor mopping'] },
  { id: 's2',  name: 'AC Service & Repair',  category: 'AC Repair',        priceFrom: 399,  duration: '45-60 min', rating: 4.7, bookingsCount: 12890, image: '❄️', included: ['AC gas top-up check', 'Filter cleaning', 'Cooling test'] },
  { id: 's3',  name: 'Electrician — Wiring', category: 'Electrician',      priceFrom: 299,  duration: '1-2 hrs', rating: 4.6, bookingsCount: 23401, image: '⚡', included: ['Wiring inspection', 'Switchboard fix', 'Safety check'] },
  { id: 's4',  name: 'Plumber — Leak Fix',   category: 'Plumber',          priceFrom: 299,  duration: '1-2 hrs', rating: 4.5, bookingsCount: 19877, image: '🔧', included: ['Leak detection', 'Pipe repair', 'Tap replacement'] },
  { id: 's5',  name: 'Carpenter — Furniture',category: 'Carpenter',        priceFrom: 349,  duration: '2-3 hrs', rating: 4.6, bookingsCount: 8765,  image: '🪚', included: ['Furniture repair', 'Door fixing', 'Shelf installation'] },
  { id: 's6',  name: 'Full Home Painting',   category: 'Painting',         priceFrom: 4999, duration: '2-3 days', rating: 4.7, bookingsCount: 6540,  image: '🎨', included: ['Wall prep', 'Two coats of paint', 'Cleanup'] },
  { id: 's7',  name: 'Salon at Home — Women',category: 'Salon at Home',    priceFrom: 549,  duration: '1-2 hrs', rating: 4.9, bookingsCount: 45670, image: '💇‍♀️', included: ['Haircut & styling', 'Facial', 'Manicure'] },
  { id: 's8',  name: 'Salon at Home — Men',  category: 'Salon at Home',    priceFrom: 399,  duration: '1 hr', rating: 4.8, bookingsCount: 38900, image: '💈', included: ['Haircut', 'Beard trim', 'Face massage'] },
  { id: 's9',  name: 'Full Body Massage',    category: 'Massage',          priceFrom: 899,  duration: '60 min', rating: 4.7, bookingsCount: 15430, image: '💆', included: ['Aromatherapy oil', 'Full body massage', 'Hot towel'] },
  { id: 's10', name: 'Washing Machine Repair',category: 'Appliance Repair',priceFrom: 349,  duration: '1-2 hrs', rating: 4.5, bookingsCount: 9870,  image: '🧺', included: ['Diagnosis', 'Part replacement', 'Test run'] },
  { id: 's11', name: 'Pest Control — Home',  category: 'Pest Control',     priceFrom: 899,  duration: '2 hrs', rating: 4.6, bookingsCount: 7650,  image: '🦟', included: ['Cockroach treatment', 'Anti-termite spray', '3-month warranty'] },
  { id: 's12', name: 'Water Purifier (RO) Service', category: 'RO Service', priceFrom: 399, duration: '1 hr', rating: 4.7, bookingsCount: 5430, image: '💧', included: ['RO filter change', 'Tank cleaning', 'TDS check'] },
  { id: 's13', name: 'CCTV Installation',    category: 'CCTV Installation',priceFrom: 1499, duration: '2-3 hrs', rating: 4.6, bookingsCount: 3210,  image: '📹', included: ['Camera mounting', 'DVR setup', 'Mobile app pairing'] },
  { id: 's14', name: 'Laptop Repair',        category: 'Laptop Repair',    priceFrom: 499,  duration: '1-2 hrs', rating: 4.5, bookingsCount: 7890,  image: '💻', included: ['Diagnosis', 'Hardware repair', 'Software setup'] },
  { id: 's15', name: 'Bridal Makeup',        category: 'Beauty',           priceFrom: 2999, duration: '2-3 hrs', rating: 4.9, bookingsCount: 2345,  image: '💄', included: ['HD makeup', 'Hairstyling', 'Touch-up kit'] },
  { id: 's16', name: 'Spa at Home',          category: 'Spa',              priceFrom: 1199, duration: '90 min', rating: 4.8, bookingsCount: 4321,  image: '🕯️', included: ['Steam towel', 'Body scrub', 'Head & shoulder massage'] },
  { id: 's17', name: 'Home Shifting — Small',category: 'Home Shifting',    priceFrom: 2499, duration: '4-6 hrs', rating: 4.4, bookingsCount: 1876,  image: '📦', included: ['Packing material', '2 movers', 'Local transport'] },
  { id: 's18', name: 'Instant Deep Clean',   category: 'Home Cleaning',    priceFrom: 999,  duration: '2-3 hrs', rating: 4.6, bookingsCount: 22340, image: '✨', included: ['Instant dusting', 'Bathroom refresh', 'Floor cleaning'] },
];

const PROS = [
  { name: 'Rahul Verma',     email: 'rahul@servehub.in',      phone: '+91 98200 11223', services: ['s1', 's18'], city: 'Mumbai',    experience: 8,  rating: 4.9, bookingsCount: 1284, status: 'active', verified: true, bio: 'Certified deep-cleaning expert. 8+ years, 1200+ happy homes.' },
  { name: 'Priya Sharma',    email: 'priya@servehub.in',      phone: '+91 98111 22334', services: ['s7', 's15'], city: 'Mumbai',    experience: 6,  rating: 4.9, bookingsCount: 980,  status: 'active', verified: true, bio: 'Salon & bridal makeup artist. Trained at Lakmé Academy.' },
  { name: 'Amit Patel',      email: 'amit@servehub.in',       phone: '+91 99222 33445', services: ['s3'],       city: 'Delhi',     experience: 12, rating: 4.8, bookingsCount: 2103, status: 'active', verified: true, bio: 'Master electrician, wireman licence #DL-2291.' },
  { name: 'Sunil Kumar',     email: 'sunil@servehub.in',      phone: '+91 99333 44556', services: ['s4'],       city: 'Delhi',     experience: 10, rating: 4.7, bookingsCount: 1654, status: 'active', verified: true, bio: 'Plumbing specialist — leaks, geysers, sanitaryware.' },
  { name: 'Vikram Singh',    email: 'vikram@servehub.in',     phone: '+91 99444 55667', services: ['s2'],       city: 'Bengaluru', experience: 7,  rating: 4.8, bookingsCount: 1320, status: 'active', verified: true, bio: 'AC expert — split, window, inverter, all brands.' },
  { name: 'Neha Gupta',      email: 'neha@servehub.in',       phone: '+91 99555 66778', services: ['s9', 's16'], city: 'Bengaluru', experience: 5,  rating: 4.9, bookingsCount: 745,  status: 'active', verified: true, bio: 'Certified massage & spa therapist, ISO 9001 trained.' },
  { name: 'Rajesh Iyer',     email: 'rajesh@servehub.in',     phone: '+91 99666 77889', services: ['s5'],       city: 'Chennai',   experience: 15, rating: 4.8, bookingsCount: 1890, status: 'active', verified: true, bio: 'Third-generation carpenter — modular furniture expert.' },
  { name: 'Deepak Joshi',    email: 'deepak@servehub.in',     phone: '+91 99777 88990', services: ['s11'],      city: 'Pune',      experience: 6,  rating: 4.6, bookingsCount: 876,  status: 'active', verified: true, bio: 'Licensed pest control technician, safe for kids & pets.' },
];

const COUPONS = [
  { code: 'WELCOME20', type: 'percent', value: 20, minAmount: 499, active: true, description: '20% off your first booking', validUntil: '2026-12-31' },
  { code: 'FLAT100',   type: 'flat',    value: 100, minAmount: 999, active: true, description: 'Flat ₹100 off orders above ₹999', validUntil: '2026-12-31' },
  { code: 'SAVE50',    type: 'flat',    value: 50,  minAmount: 0,  active: true, description: 'Flat ₹50 off any order', validUntil: '2026-12-31' },
];

const PLANS = [
  { id: 'free', name: 'Free', price: 0, period: 'forever', featured: false, perks: ['Standard pricing', 'Instant booking & live tracking', '100% service warranty'], active: true },
  { id: 'plus', name: 'Plus', price: 299, period: 'month', featured: false, perks: ['5% discount on every service', 'Priority expert dispatch', 'Free rescheduling'], active: true },
  { id: 'pro', name: 'Pro', price: 599, period: 'month', featured: true, perks: ['10% discount + ₹500 monthly credit', 'Zero cancellation fees', 'Personal relationship manager'], active: true },
];

const REVIEWS = [
  { id: 1, bookingId: null, userId: null, proId: 1, serviceId: 's1', customerName: 'Ananya Rao', serviceName: 'Deep Home Cleaning', rating: 5, text: 'Outstanding deep clean — kitchen looks brand new and the expert was super professional.', status: 'published', verified: true, helpful: 128, createdAt: '2026-08-05T10:00:00.000Z' },
  { id: 2, bookingId: null, userId: null, proId: 2, serviceId: 's7', customerName: 'Sara Fernandes', serviceName: 'Salon at Home — Women', rating: 5, text: 'Salon-quality haircut at home, loved the hygiene kit!', status: 'published', verified: true, helpful: 210, createdAt: '2026-08-03T14:30:00.000Z' },
  { id: 3, bookingId: null, userId: null, proId: 3, serviceId: 's3', customerName: 'Mohit Agarwal', serviceName: 'Electrician — Wiring', rating: 4, text: 'Fixed the wiring quickly. Slight delay in arrival but great work.', status: 'pending', verified: true, helpful: 64, createdAt: '2026-07-28T09:00:00.000Z' },
  { id: 4, bookingId: null, userId: null, proId: 6, serviceId: 's9', customerName: 'Rahul Nair', serviceName: 'Full Body Massage', rating: 2, text: 'Therapist was late and rushed the session. Not worth the price.', status: 'pending', verified: false, helpful: 12, createdAt: '2026-07-25T18:00:00.000Z' },
  { id: 5, bookingId: null, userId: null, proId: 4, serviceId: 's4', customerName: 'Devang Joshi', serviceName: 'Plumber — Leak Fix', rating: 5, text: 'Leak fixed in 20 minutes, very professional. 100% recommended.', status: 'published', verified: true, helpful: 96, createdAt: '2026-07-20T11:00:00.000Z' },
];

const GIFT_CARDS = [
  { id: 1, code: 'GIFT500A', value: 500, balance: 500, status: 'active', expiresAt: '2027-01-31', createdAt: '2026-07-01T00:00:00.000Z' },
  { id: 2, code: 'GIFT1000B', value: 1000, balance: 400, status: 'active', expiresAt: '2027-03-15', createdAt: '2026-06-15T00:00:00.000Z' },
  { id: 3, code: 'GIFT250C', value: 250, balance: 0, status: 'redeemed', expiresAt: '2026-12-01', createdAt: '2026-05-10T00:00:00.000Z' },
];

const TICKETS = [
  { id: 1, userId: null, customerName: 'Kavya Menon', subject: 'Refund not received for cancelled booking SH1001', category: 'refund', status: 'open', priority: 'high', messages: [{ from: 'customer', text: 'I cancelled my booking SH1001 three days ago but the refund has not arrived in my wallet yet. Please help!', createdAt: '2026-08-06T08:00:00.000Z' }], createdAt: '2026-08-06T08:00:00.000Z' },
  { id: 2, userId: null, customerName: 'Arjun Patel', subject: 'Professional never showed up', category: 'booking', status: 'in-progress', priority: 'high', messages: [{ from: 'customer', text: 'The plumber I booked for 10 AM never arrived and nobody contacted me.', createdAt: '2026-08-05T12:00:00.000Z' }, { from: 'admin', text: 'We are escalating this to the regional team and will reschedule within 24 hours.', createdAt: '2026-08-05T15:00:00.000Z' }], createdAt: '2026-08-05T12:00:00.000Z' },
  { id: 3, userId: null, customerName: 'Meera Iyer', subject: 'How do I upgrade to the Plus plan?', category: 'other', status: 'resolved', priority: 'low', messages: [{ from: 'customer', text: 'I would like to upgrade my membership. How does billing work?', createdAt: '2026-08-01T10:00:00.000Z' }, { from: 'admin', text: 'Go to Membership in your dashboard — you can upgrade anytime and billing is prorated.', createdAt: '2026-08-01T12:00:00.000Z' }], createdAt: '2026-08-01T10:00:00.000Z' },
  // Demo customer tickets — so the Support section has content for the seeded account.
  { id: 50001, userId: DEMO_USER_ID, customerName: 'Demo Customer', subject: 'Gift card balance not applied', category: 'giftcard', status: 'in-progress', priority: 'medium', messages: [{ from: 'customer', text: 'I redeemed GIFT1000B but only 400 of the 1000 showed up in my wallet.', createdAt: '2026-08-04T09:30:00.000Z' }, { from: 'admin', text: 'Hi! GIFT1000B was partially redeemed earlier — the remaining 400 is being credited now. Give it a minute.', createdAt: '2026-08-04T10:15:00.000Z' }], createdAt: '2026-08-04T09:30:00.000Z' },
];

/* ============ demo customer + per-user collections ============
   A ready-to-log-in demo account (demo@servehub.com / demo123) with
   realistic per-user data so every dashboard section has content. */

const DEMO_USER = {
  id: DEMO_USER_ID,
  name: 'Demo Customer',
  email: 'demo@servehub.com',
  phone: '+91 98765 43210',
  role: 'customer',
  passwordHash: '$2a$10$2pB1kKNCrpZsjraz8f/DJehoONoPaevGEEMY31i7jNhQQ/S.qvdNy', // demo123
  walletBalance: 1250,
  rewardPoints: 340,
  emailVerified: true,
  phoneVerified: true,
  membershipPlan: 'plus',
  referralCode: 'SERVE-DEMO9000',
  createdAt: '2026-07-15T09:00:00.000Z',
};

const ADDRESSES = [
  { id: 50001, userId: DEMO_USER_ID, label: 'Home', line: 'B-402, Sunrise Residency, Linking Road', area: 'Bandra West', city: 'Mumbai', pincode: '400050', lat: 19.0596, lng: 72.8295, isDefault: true, createdAt: '2026-07-15T09:05:00.000Z' },
  { id: 50002, userId: DEMO_USER_ID, label: 'Work', line: '15th Floor, One Hub Tower, Bandra Kurla Complex', area: 'BKC', city: 'Mumbai', pincode: '400051', lat: 19.0661, lng: 72.8663, isDefault: false, createdAt: '2026-07-16T11:00:00.000Z' },
  { id: 50003, userId: DEMO_USER_ID, label: 'Parents Home', line: '27, Krishna Nagar, Kothrud', area: 'Kothrud', city: 'Pune', pincode: '411038', lat: 18.5074, lng: 73.8077, isDefault: false, createdAt: '2026-07-20T16:30:00.000Z' },
];

const NOTIFICATIONS = [
  { id: 50001, userId: DEMO_USER_ID, title: 'Welcome to Servehub! 🎉', body: 'Your account is ready. Here is a ₹150 signup bonus in your wallet.', type: 'system', channel: 'inapp', read: true, link: '/dashboard/wallet', createdAt: '2026-07-15T09:06:00.000Z' },
  { id: 50002, userId: DEMO_USER_ID, title: 'Booking confirmed', body: 'Your Deep Home Cleaning booking SH9001 is confirmed for Sat, 10:00 AM.', type: 'booking', channel: 'inapp', read: false, link: '/dashboard/live', createdAt: '2026-07-18T10:00:00.000Z' },
  { id: 50003, userId: DEMO_USER_ID, title: 'Professional assigned', body: 'Rahul Verma (★4.9) is on the way for booking SH9001. Track him live!', type: 'booking', channel: 'inapp', read: false, link: '/dashboard/live', createdAt: '2026-07-18T09:58:00.000Z' },
  { id: 50004, userId: DEMO_USER_ID, title: 'Cashback credited 💰', body: '₹150 cashback + 10 reward points added for completing SH9001.', type: 'payment', channel: 'inapp', read: false, link: '/dashboard/wallet', createdAt: '2026-07-18T14:00:00.000Z' },
  { id: 50005, userId: DEMO_USER_ID, title: 'Weekend offer — 20% off', body: 'Get 20% off salon & spa services this weekend with code WEEKEND20.', type: 'offer', channel: 'inapp', read: false, link: '/categories', createdAt: '2026-07-24T09:00:00.000Z' },
  { id: 50006, userId: DEMO_USER_ID, title: 'Support replied', body: 'Support replied to ticket TK-4: "Gift card balance is being credited now."', type: 'support', channel: 'inapp', read: false, link: '/dashboard/support', createdAt: '2026-08-04T10:16:00.000Z' },
];

const WALLET_TXNS = [
  { id: 50001, userId: DEMO_USER_ID, type: 'credit', amount: 150, balanceAfter: 150, reason: 'signup bonus', reference: 'WELCOME', createdAt: '2026-07-15T09:06:00.000Z' },
  { id: 50002, userId: DEMO_USER_ID, type: 'debit', amount: 1499, balanceAfter: 0, reason: 'payment', reference: 'SH9001', createdAt: '2026-07-18T10:01:00.000Z' },
  { id: 50003, userId: DEMO_USER_ID, type: 'credit', amount: 150, balanceAfter: 150, reason: 'cashback', reference: 'SH9001', createdAt: '2026-07-18T14:00:00.000Z' },
  { id: 50004, userId: DEMO_USER_ID, type: 'credit', amount: 100, balanceAfter: 250, reason: 'referral reward', reference: 'SERVE-DEMO9000', createdAt: '2026-07-21T12:00:00.000Z' },
  { id: 50005, userId: DEMO_USER_ID, type: 'credit', amount: 1000, balanceAfter: 1250, reason: 'gift card', reference: 'GIFT1000B', createdAt: '2026-08-04T10:20:00.000Z' },
];

const REFERRALS = [
  { id: 50001, referrerUserId: DEMO_USER_ID, refereeUserId: 9001, refereeName: 'Rahul Khanna', code: 'SERVE-DEMO9000', status: 'rewarded', reward: 100, createdAt: '2026-07-21T12:00:00.000Z' },
  { id: 50002, referrerUserId: DEMO_USER_ID, refereeUserId: 9002, refereeName: 'Sneha Reddy', code: 'SERVE-DEMO9000', status: 'rewarded', reward: 100, createdAt: '2026-07-28T18:00:00.000Z' },
  { id: 50003, referrerUserId: DEMO_USER_ID, refereeUserId: null, refereeName: 'Invite sent — awaiting signup', code: 'SERVE-DEMO9000', status: 'pending', reward: 100, createdAt: '2026-08-02T09:00:00.000Z' },
];

// A couple of reviews left by the demo customer (so Reviews has customer content).
const DEMO_REVIEWS = [
  { id: 50001, bookingId: 'SH9001', userId: DEMO_USER_ID, proId: 1, serviceId: 's1', customerName: 'Demo Customer', serviceName: 'Deep Home Cleaning', rating: 5, text: 'Rahul did an amazing job — kitchen sparkles and he was super polite. Highly recommend!', status: 'published', verified: true, helpful: 42, createdAt: '2026-07-18T14:05:00.000Z' },
  { id: 50002, bookingId: 'SH9002', userId: DEMO_USER_ID, proId: 4, serviceId: 's4', customerName: 'Demo Customer', serviceName: 'Plumber — Leak Fix', rating: 4, text: 'Fixed the kitchen sink leak in under an hour. Slightly late but the work was clean.', status: 'pending', verified: true, helpful: 5, createdAt: '2026-08-01T17:00:00.000Z' },
];

module.exports = { CATEGORIES, SERVICES, PROS, COUPONS, PLANS, REVIEWS, GIFT_CARDS, TICKETS, DEMO_USER, DEMO_USER_ID, ADDRESSES, NOTIFICATIONS, WALLET_TXNS, REFERRALS, DEMO_REVIEWS };
