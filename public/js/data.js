/* ============ SERVEHUB DATA LAYER ============ */
window.DATA = (() => {
  const C = {
    cleaning:   { name: 'Cleaning',     icon: 'sparkles', g: 'linear-gradient(135deg,#2563EB,#0EA5E9)', tag: 'Home Cleaning, Deep Clean, Sofa & Carpet, Bathroom, Kitchen' },
    ac:         { name: 'AC Repair',    icon: 'snowflake', g: 'linear-gradient(135deg,#0EA5E9,#6366F1)', tag: 'AC Service, Gas Refill, Installation, Uninstallation' },
    electrician:{ name: 'Electrician',  icon: 'zap', g: 'linear-gradient(135deg,#F59E0B,#F97316)', tag: 'Fans, Lights, Wiring, Inverter, MCB & Switches' },
    plumber:    { name: 'Plumber',      icon: 'droplet', g: 'linear-gradient(135deg,#06B6D4,#3B82F6)', tag: 'Tap & Pipe, Water Tank, Leakage, Bathroom Fittings' },
    carpenter:  { name: 'Carpenter',    icon: 'hammer', g: 'linear-gradient(135deg,#B45309,#D97706)', tag: 'Furniture, Doors, Modular Kitchen, Wardrobe' },
    painting:   { name: 'Painting',     icon: 'brush', g: 'linear-gradient(135deg,#EC4899,#8B5CF6)', tag: 'Interior & Exterior, Texture, Waterproofing' },
    salon:      { name: 'Salon at Home',icon: 'scissors', g: 'linear-gradient(135deg,#F43F5E,#EC4899)', tag: 'Haircut, Styling, Grooming, Spa at Home' },
    massage:    { name: 'Massage',      icon: 'leaf', g: 'linear-gradient(135deg,#10B981,#14B8A6)', tag: 'Relaxation, Aroma, Deep Tissue, Head & Shoulder' },
    appliance:  { name: 'Appliance Repair', icon: 'settings', g: 'linear-gradient(135deg,#64748B,#0EA5E9)', tag: 'Washing Machine, Refrigerator, Microwave, Geyser' },
    pest:       { name: 'Pest Control', icon: 'bug', g: 'linear-gradient(135deg,#84CC16,#10B981)', tag: 'Cockroach, Termite, Mosquito, Rodent Control' },
    homeclean:  { name: 'Home Cleaning',icon: 'home', g: 'linear-gradient(135deg,#8B5CF6,#6366F1)', tag: 'Move-in/out, Post-construction, Sofa, Carpet, Curtain' },
    ro:         { name: 'RO Service',   icon: 'droplets', g: 'linear-gradient(135deg,#38BDF8,#0284C7)', tag: 'RO AMC, Filter Change, Tank Cleaning, Installation' },
    cctv:       { name: 'CCTV Installation', icon: 'camera', g: 'linear-gradient(135deg,#334155,#0EA5E9)', tag: 'CCTV Setup, IP Cameras, NVR & DVR, Service & Repair' },
    laptop:     { name: 'Laptop Repair',icon: 'monitor', g: 'linear-gradient(135deg,#6366F1,#3B82F6)', tag: 'Screen, Battery, Keyboard, Virus Removal, Upgrade' },
    beauty:     { name: 'Beauty',       icon: 'flower', g: 'linear-gradient(135deg,#F472B6,#EC4899)', tag: 'Bridal, Facials, Makeup, Waxing, Manicure' },
    spa:        { name: 'Spa',          icon: 'lotus', g: 'linear-gradient(135deg,#14B8A6,#10B981)', tag: 'Ayurvedic, Thai, Reflexology, Couple Spa' },
    shifting:   { name: 'Home Shifting',icon: 'truck', g: 'linear-gradient(135deg,#F97316,#EF4444)', tag: 'Local & Intercity, Packing, Loading, Unpacking' },
  };
  const CAT_IMGS = {
    cleaning:   'images/home-cleaning.png',
    ac:         'images/ac-repair.png',
    electrician:'images/electrician.png',
    plumber:    'images/plumbing.png',
    carpenter:  'images/carpenter.png',
    painting:   'images/painting.png',
    salon:      'images/salon-men.png',
    massage:    'images/beauty-women.png',
    appliance:  'images/electrician.png',
    pest:       'images/pest-control.png',
    homeclean:  'images/home-cleaning.png',
    ro:         'images/plumbing.png',
    cctv:       'images/cctv.png',
    laptop:     'images/laptop.png',
    beauty:     'images/beauty-women.png',
    spa:        'images/beauty-women.png',
    shifting:   'images/home-shifting.png',
  };
  const categories = Object.keys(C).map((slug, i) => ({
    slug, name: C[slug].name, icon: C[slug].icon, g: C[slug].g, tag: C[slug].tag, img: CAT_IMGS[slug],
    price: [499, 349, 199, 249, 299, 999, 399, 599, 349, 499, 799, 299, 799, 299, 599, 899, 1499][i],
    rating: +(4.2 + (i % 8) * 0.1).toFixed(1), bookings: 12000 + (i * 7341 % 48000),
    desc: `Verified ${C[slug].name.toLowerCase()} experts for your home. Transparent pricing, on-time arrival, and a service warranty on every job.`,
  }));

  /* ---------- professionals ----------
     SAMPLE / DEMO provider profiles — names, ratings and job counts are
     illustrative demo data, not real individuals. phone is intentionally
     empty: the UI shows a "demo profile" notice instead of inventing a
     real person's private number. */
  const PROS = [
    { id:'p1',  name:'Rajesh Kumar',   role:'AC Technician',         cat:'ac',      rating:4.8, jobs:1250, exp:8,  dist:1.2, rate:249, verified:true, city:'Bengaluru', avail:'Available Today',  tags:['AC Service','Gas Refill','Installation'], slots:['09:00','11:00','14:00','17:00'] },
    { id:'p2',  name:'Priya Menon',    role:'Deep Cleaning Pro',     cat:'cleaning',rating:4.8, jobs:980,  exp:6,  dist:0.8, rate:349, verified:true, city:'Bengaluru', avail:'Available Today',  tags:['Full Home','Kitchen','Bathroom'], slots:['10:00','12:00','15:00','18:00'] },
    { id:'p3',  name:'Suresh Kumar',   role:'Electrician',           cat:'electrician',rating:4.7, jobs:900, exp:6, dist:2.1, rate:199, verified:true, city:'Bengaluru', avail:'Available Today', tags:['Wiring','Inverter','Fans'], slots:['09:30','13:00','16:00'] },
    { id:'p4',  name:'Sneha Kulkarni', role:'Salon & Beauty Pro',    cat:'salon',  rating:4.9, jobs:1520, exp:7,  dist:1.6, rate:399, verified:true, city:'Bengaluru', avail:'Available Today',  tags:['Haircut','Spa','Bridal'], slots:['10:00','14:00','17:30'] },
    { id:'p5',  name:'Manoj Kumar',    role:'Plumber',               cat:'plumber',rating:4.9, jobs:1100, exp:7,  dist:3.0, rate:199, verified:true, city:'Bengaluru', avail:'Available Today', tags:['Leakage','Bath Fitting','Tank'], slots:['08:30','11:30','15:00'] },
    { id:'p6',  name:'Meera Iyer',     role:'Massage Therapist',     cat:'massage',rating:4.8, jobs:540,  exp:5,  dist:2.4, rate:599, verified:true, city:'Bengaluru', avail:'Available Tomorrow', tags:['Aroma','Deep Tissue','Relaxation'], slots:['11:00','13:00','16:00','19:00'] },
    { id:'p7',  name:'Karan Mehta',    role:'Carpenter',             cat:'carpenter',rating:4.7, jobs:820, exp:12, dist:1.9, rate:299, verified:true, city:'Bengaluru', avail:'Available Today', tags:['Wardrobe','Doors','Modular'], slots:['09:00','12:00','15:30'] },
    { id:'p8',  name:'Anjali Verma',   role:'Spa Specialist',        cat:'spa',    rating:4.9, jobs:430,  exp:4,  dist:2.8, rate:699, verified:true, city:'Bengaluru', avail:'Available Tomorrow', tags:['Ayurvedic','Couple Spa','Thai'], slots:['10:30','14:30','17:00'] },
    { id:'p9',  name:'Rohit Nair',     role:'Painting Expert',       cat:'painting',rating:4.5, jobs:310, exp:10, dist:3.4, rate:999, verified:true, city:'Bengaluru', avail:'Available Today', tags:['Interior','Texture','Waterproof'], slots:['09:00','11:00','14:00'] },
    { id:'p10', name:'Divya Reddy',    role:'Beauty Artist',         cat:'beauty', rating:4.8, jobs:690,  exp:6,  dist:1.1, rate:499, verified:true, city:'Bengaluru', avail:'Available Today', tags:['Bridal','Facial','Makeup'], slots:['10:00','13:00','16:30'] },
    { id:'p11', name:'Imran Khan',     role:'Pest Control Specialist', cat:'pest', rating:4.7, jobs:380, exp:7, dist:2.2, rate:449, verified:true, city:'Bengaluru', avail:'Available Today', tags:['Termite','Cockroach','Rodent'], slots:['09:00','12:00','15:00'] },
    { id:'p12', name:'Neha Gupta',     role:'Home Cleaning Expert',  cat:'homeclean',rating:4.8, jobs:1120, exp:5, dist:0.9, rate:799, verified:true, city:'Bengaluru', avail:'Available Today', tags:['Move-in','Sofa','Curtain'], slots:['09:00','11:30','14:00','17:00'] },
  ];

  /* ---------- services ---------- */
  const inc = {
    cleaning: ['Professional cleaning expert','Standard cleaning products included','Complete home dusting & mopping','Bathroom & kitchen sanitization','Garbage disposal'],
    deep: ['Premium deep-cleaning expert','Equipment & eco products included','Kitchen de-greasing & chimney','Tile & grout deep scrub','2-hours of intensive cleaning'],
  };
  /* Image map: local AI image assets served by http://localhost:5501/images/ */
  const SVC_IMGS = {
    s1:  'images/home-cleaning.png', // home cleaning
    s2:  'images/home-cleaning.png', // deep clean kitchen
    s3:  'images/ac-repair.png',     // AC repair / technician
    s4:  'images/ac-repair.png',     // AC installation
    s35: 'images/ac-repair.png',     // AC gas filling
    s36: 'images/ac-repair.png',     // AC general cleaning
    s37: 'images/ac-repair.png',     // AC deep cleaning
    s38: 'images/ac-repair.png',     // AC maintenance
    s5:  'images/electrician.png',   // electrician
    s6:  'images/electrician.png',   // wiring
    s7:  'images/plumbing.png',      // plumber tap
    s8:  'images/plumbing.png',      // water tank
    s9:  'images/carpenter.png',     // carpenter furniture
    s10: 'images/carpenter.png',     // modular kitchen
    s11: 'images/painting.png',      // wall painting
    s12: 'images/painting.png',      // texture finish
    s13: 'images/salon-men.png',     // men haircut
    s14: 'images/beauty-women.png',  // women salon
    s15: 'images/beauty-women.png',  // massage
    s16: 'images/beauty-women.png',  // deep tissue
    s17: 'images/electrician.png',   // washing machine
    s18: 'images/electrician.png',   // refrigerator
    s19: 'images/pest-control.png',  // pest control
    s20: 'images/pest-control.png',  // termite
    s21: 'images/home-cleaning.png', // sofa cleaning
    s22: 'images/home-cleaning.png', // move-in cleaning
    s23: 'images/plumbing.png',      // RO purifier
    s24: 'images/plumbing.png',      // RO installation
    s25: 'images/cctv.png',          // CCTV camera
    s26: 'images/cctv.png',          // CCTV repair
    s27: 'images/laptop.png',        // laptop screen
    s28: 'images/laptop.png',        // laptop upgrade
    s29: 'images/beauty-women.png',  // bridal makeup
    s30: 'images/beauty-women.png',  // facial
    s31: 'images/beauty-women.png',  // ayurvedic spa
    s32: 'images/beauty-women.png',  // couple spa
    s33: 'images/home-shifting.png', // home shifting
    s34: 'images/home-shifting.png', // intercity shifting
    s39: 'images/laptop.png',        // TV repair (technician with a screen)
    s40: 'images/home-cleaning.png', // bathroom cleaning
  };

  const svcDefs = [
    { id:'s3',  cat:'ac', name:'AC Repair', img:SVC_IMGS.s3, desc:'Complete diagnosis and repair for split, window & cassette ACs. Fixes cooling failure, noise, leakage, and power faults.', price:399, unit:'per visit', dur:'60 mins', rating:4.8, bookings:24800, inc:['Technician inspection & fault diagnosis','Filter & coil cleaning','Cooling & airflow check','30-day work warranty'], popular:true, g:'linear-gradient(135deg,#0EA5E9,#6366F1)', icon:'snowflake', keywords:['ac repair','air conditioner repair','ac not working','ac not cooling','ac water leaking','ac making noise','fix ac','ac breakdown','repair ac'] },
    { id:'s36', cat:'ac', name:'AC Service', img:SVC_IMGS.s36, desc:'Standard servicing for healthy ACs — filter cleaning, drain tray wash, and operating pressure verification.', price:499, unit:'per AC', dur:'45 mins', rating:4.7, bookings:19200, inc:['Air filter wash & vacuuming','Indoor unit casing scrub','Drain pipe flushing','Performance report'], popular:true, g:'linear-gradient(135deg,#0EA5E9,#38BDF8)', icon:'snowflake', keywords:['ac service','ac general service','ac cleaning','ac checkup','ac maintenance','air conditioner service','ac service near me'] },
    { id:'s35', cat:'ac', name:'AC Gas Filling', img:SVC_IMGS.s35, desc:'Full refrigerant gas top-up (R32 / R410a / R22) with leak detection and pressure check.', price:699, unit:'per AC', dur:'60 mins', rating:4.9, bookings:14100, inc:['Leak testing & sealing','Full gas refill (R32/R410/R22)','Cooling efficiency test','60-day gas warranty'], popular:true, g:'linear-gradient(135deg,#38BDF8,#6366F1)', icon:'snowflake', keywords:['ac gas filling','ac gas refill','ac gas problem','ac low gas','refrigerant refill','air conditioner gas'] },
    { id:'s37', cat:'ac', name:'AC Deep Cleaning', img:SVC_IMGS.s37, desc:'Jet pump deep chemical cleaning of evaporator coils, blower fan, drain tray, and outdoor condenser unit.', price:799, unit:'per AC', dur:'90 mins', rating:4.9, bookings:11800, inc:['High-pressure jet wash','Anti-bacterial foam treatment','Outdoor condenser deep wash','Drain unclogging'], popular:false, g:'linear-gradient(135deg,#0284C7,#2563EB)', icon:'snowflake', keywords:['ac deep cleaning','ac foam jet service','ac jet wash','chemical cleaning ac'] },
    { id:'s4',  cat:'ac', name:'AC Installation', img:SVC_IMGS.s4, desc:'Professional wall mounting, copper piping connection, vacuuming, and testing for split & window ACs.', price:999, unit:'per unit', dur:'2 hrs', rating:4.7, bookings:6200, inc:['Bracket mounting & fixing','Piping connection & insulation','Electrical wiring check','90-day installation warranty'], popular:false, g:'linear-gradient(135deg,#6366F1,#8B5CF6)', icon:'snowflake', keywords:['ac installation','install split ac','window ac installation','ac uninstallation','fit ac'] },
    { id:'s38', cat:'ac', name:'AC Annual Maintenance (AMC)', img:SVC_IMGS.s38, desc:'Year-round peace of mind with 3 free services, 1 gas top-up, and priority emergency repairs.', price:1299, unit:'per year', dur:'1 year', rating:4.8, bookings:5300, inc:['3 Scheduled services/yr','1 Free gas top-up','Priority response < 2 hrs','Zero visit charges'], popular:false, g:'linear-gradient(135deg,#1E40AF,#3B82F6)', icon:'snowflake', keywords:['ac maintenance','ac amc','annual ac service','ac contract'] },

    { id:'s1',  cat:'cleaning', name:'Basic Home Cleaning', img:SVC_IMGS.s1, desc:'Complete refresh of your home — dusting, mopping and sanitization of every room by a verified cleaning expert.', price:499, unit:'per visit', dur:'2 hrs', rating:4.8, bookings:23400, inc:inc.cleaning, popular:true, g:'linear-gradient(135deg,#2563EB,#0EA5E9)', icon:'sparkles', keywords:['basic home cleaning','house cleaning','home cleaning','room cleaning','flat cleaning','dusting'] },
    { id:'s2',  cat:'cleaning', name:'Deep Cleaning', img:SVC_IMGS.s2, desc:'Intensive top-to-bottom cleaning for kitchens, bathrooms, tiles and grout. Perfect for spring cleaning or before festivals.', price:1199, unit:'per 2BHK', dur:'4 hrs', rating:4.9, bookings:15800, inc:inc.deep, popular:true, g:'linear-gradient(135deg,#0EA5E9,#6366F1)', icon:'sparkles', keywords:['deep cleaning','full home deep clean','kitchen deep clean','bathroom cleaning','house deep clean'] },

    { id:'s5',  cat:'electrician', name:'Electrician for Home', img:SVC_IMGS.s5, desc:'Certified electricians for fans, lights, wiring faults, inverter setup, MCB and switch replacements.', price:199, unit:'per visit', dur:'45 mins', rating:4.7, bookings:21400, inc:['On-time electrician visit','Inspection & fault diagnosis','Fixing minor electrical issues','Safety check of connections','30-day work warranty'], popular:true, g:'linear-gradient(135deg,#F59E0B,#F97316)', icon:'zap', keywords:['electrician','fan repair','switch repair','light repair','wiring','power issue','short circuit','mcb repair'] },
    { id:'s6',  cat:'electrician', name:'Complete House Wiring', img:SVC_IMGS.s6, desc:'Full rewiring for new or old homes with certified electricians and quality materials guidance.', price:1499, unit:'per room', dur:'4 hrs', rating:4.6, bookings:3900, inc:['Complete rewiring plan','Concealed wiring support','MCB & switch installation','Load balancing','Electrical safety certificate'], popular:false, g:'linear-gradient(135deg,#F97316,#EF4444)', icon:'zap', keywords:['house wiring','full wiring','rewiring','concealed wiring','electrical fitting'] },

    { id:'s7',  cat:'plumber', name:'Tap, Pipe & Leakage Fix', img:SVC_IMGS.s7, desc:'Quick fix for leaking taps, pipes, cisterns and bathroom fittings with a 30-day work guarantee.', price:199, unit:'per visit', dur:'45 mins', rating:4.7, bookings:17600, inc:['Plumber visit & diagnosis','Tap & fixture repair','Pipe & leakage fixing','Cistern & flush repair','30-day work warranty'], popular:true, g:'linear-gradient(135deg,#06B6D4,#3B82F6)', icon:'droplet', keywords:['plumber','water leakage','pipe repair','tap repair','sink blockage','bathroom plumbing','flush repair','plumbing','plumber near me'] },
    { id:'s8',  cat:'plumber', name:'Water Tank Cleaning', img:SVC_IMGS.s8, desc:'Complete cleaning of overhead and underground water tanks with disinfection and safe disposal.', price:699, unit:'per tank', dur:'2 hrs', rating:4.6, bookings:4800, inc:['Tank inspection & draining','High-pressure scrubbing','Disinfection & anti-bacterial wash','Safe water disposal','Post-service water test'], popular:false, g:'linear-gradient(135deg,#3B82F6,#2563EB)', icon:'droplet', keywords:['water tank cleaning','tank scrub','overhead tank clean','sump cleaning'] },

    { id:'s9',  cat:'carpenter', name:'Furniture & Door Repair', img:SVC_IMGS.s9, desc:'Expert carpenters to fix doors, drawers, locks, hinges and loose furniture around your home.', price:299, unit:'per visit', dur:'1 hr', rating:4.7, bookings:9200, inc:['Carpenter visit & assessment','Door & hinge repairs','Drawer & lock fixing','Furniture reinforcement','7-day work warranty'], popular:true, g:'linear-gradient(135deg,#B45309,#D97706)', icon:'hammer', keywords:['carpenter','door repair','furniture repair','lock fix','hinge repair','woodwork'] },
    { id:'s10', cat:'carpenter', name:'Modular Kitchen & Wardrobe', img:SVC_IMGS.s10, desc:'Design, installation and repair of modular kitchens and wardrobes with premium finishes.', price:1999, unit:'per unit', dur:'6 hrs', rating:4.8, bookings:3100, inc:['Free measurement & design','Premium material guidance','Unit installation','Hardware & fittings','6-month service warranty'], popular:false, g:'linear-gradient(135deg,#D97706,#F59E0B)', icon:'hammer', keywords:['modular kitchen','wardrobe design','carpenter installation','kitchen cabinets'] },

    { id:'s11', cat:'painting', name:'Interior Wall Painting', img:SVC_IMGS.s11, desc:'Crack-free interior painting with premium paints, complete surface prep and a spotless finish.', price:14, unit:'per sq.ft', dur:'2 days', rating:4.6, bookings:5600, inc:['Surface preparation & putty','Premium paint (Asian/Berger)','Primer + 2 coats','Masking & floor protection','Post-paint cleanup'], popular:true, g:'linear-gradient(135deg,#EC4899,#8B5CF6)', icon:'brush', keywords:['painting','wall painting','home painting','painter','interior paint'] },
    { id:'s12', cat:'painting', name:'Texture & Designer Finish', img:SVC_IMGS.s12, desc:'Premium textured and designer finishes to give your walls a stunning, modern look.', price:45, unit:'per sq.ft', dur:'3 days', rating:4.8, bookings:2100, inc:['Design consultation','Texture application','Metallic / matte finish options','Protective top coat','Designer touch-ups'], popular:false, g:'linear-gradient(135deg,#8B5CF6,#6366F1)', icon:'brush', keywords:['texture paint','designer wall','wall art painting'] },

    { id:'s13', cat:'salon', name:'Salon at Home — Men', img:SVC_IMGS.s13, desc:'Full grooming — haircut, beard styling and face care, delivered at your doorstep by a skilled stylist.', price:399, unit:'per session', dur:'1 hr', rating:4.8, bookings:16900, inc:['Expert male stylist','Haircut & styling','Beard shaping & trim','Face wash & cleanup','Premium products'], popular:true, g:'linear-gradient(135deg,#F43F5E,#EC4899)', icon:'scissors', keywords:['salon men','haircut men','beard trim','men grooming','barber at home'] },
    { id:'s14', cat:'salon', name:'Salon at Home — Women', img:SVC_IMGS.s14, desc:'Haircuts, coloring, spa and styling by professional female artists in the comfort of your home.', price:599, unit:'per session', dur:'1.5 hrs', rating:4.9, bookings:14100, inc:['Professional female artist','Haircut / color / spa','Skincare & cleanup','Premium products','Complimentary tips'], popular:true, g:'linear-gradient(135deg,#EC4899,#F472B6)', icon:'scissors', keywords:['salon women','haircut women','beauty parlour home','hair coloring','waxing'] },

    { id:'s15', cat:'massage', name:'Relaxation Massage', img:SVC_IMGS.s15, desc:'A therapeutic full-body relaxation massage that melts away stress, with premium oils.', price:599, unit:'per session', dur:'1 hr', rating:4.8, bookings:7300, inc:['Certified therapist','Premium aromatherapy oils','Full-body relaxation massage','Hot towel finish','Post-massage guidance'], popular:true, g:'linear-gradient(135deg,#10B981,#14B8A6)', icon:'leaf', keywords:['massage','body massage','relaxation massage','massage therapist'] },
    { id:'s16', cat:'massage', name:'Deep Tissue Massage', img:SVC_IMGS.s16, desc:'Targeted deep-tissue therapy for muscle pain, stiffness and recovery after workouts.', price:899, unit:'per session', dur:'1 hr', rating:4.7, bookings:3900, inc:['Advanced-certified therapist','Deep tissue techniques','Pain-point focus areas','Sports recovery care','Physio consultation'], popular:false, g:'linear-gradient(135deg,#14B8A6,#0EA5E9)', icon:'leaf', keywords:['deep tissue massage','muscle pain massage','sports massage'] },

    { id:'s17', cat:'appliance', name:'Washing Machine Repair', img:SVC_IMGS.s17, desc:'Expert repairs for top-load and front-load machines — drum, motor, drainage and electronics.', price:349, unit:'per visit', dur:'1 hr', rating:4.7, bookings:9800, inc:['Diagnosis & inspection','Motor / drum / PCB repair','Drainage & pump fixing','Spare parts with warranty','30-day service warranty'], popular:true, g:'linear-gradient(135deg,#64748B,#0EA5E9)', icon:'settings', keywords:['washing machine','washing machine repair','washer repair','front load repair','top load repair'] },
    { id:'s18', cat:'appliance', name:'Refrigerator Repair', img:SVC_IMGS.s18, desc:'Reliable fridge service — cooling issues, compressor faults, gas refills and door seal replacement at your doorstep.', price:349, unit:'per visit', dur:'1 hr', rating:4.6, bookings:8600, inc:['Cooling & compressor check','Gas refill support','Electronics & board repair','Door & seal replacement','30-day service warranty'], popular:true, g:'linear-gradient(135deg,#0EA5E9,#38BDF8)', icon:'settings', keywords:['refrigerator','fridge repair','fridge not cooling','refrigerator repair','gas refill','freezer not working'] },
    { id:'s39', cat:'appliance', name:'TV Repair', img:SVC_IMGS.s39, desc:'Doorstep repair for LED, LCD & smart TVs — display faults, no power, sound issues and panel problems.', price:299, unit:'per visit', dur:'60 mins', rating:4.6, bookings:7300, inc:['TV diagnosis & fault detection','Display / panel checks','Power & sound board repair','Smart TV software reset','7-day service warranty'], popular:true, g:'linear-gradient(135deg,#334155,#3B82F6)', icon:'monitor', keywords:['tv repair','led tv repair','tv not turning on','tv no sound','smart tv repair','television repair','tv screen problem'] },
    { id:'s40', cat:'cleaning', name:'Bathroom Cleaning', img:SVC_IMGS.s40, desc:'Deep scrub and sanitization of bathrooms — tiles, taps, mirrors, WC and grout, with eco-friendly products.', price:349, unit:'per bathroom', dur:'45 mins', rating:4.7, bookings:9100, inc:['Bathroom scrub & descaling','Tile & grout cleaning','Tap, mirror & basin shine','WC & sink sanitization','Anti-bacterial finish'], popular:true, g:'linear-gradient(135deg,#14B8A6,#0EA5E9)', icon:'droplet', keywords:['bathroom cleaning','toilet cleaning','washroom cleaning','bathroom scrub','tiles cleaning','bathroom sanitization'] },

    { id:'s19', cat:'pest', name:'Pest Control (Cockroach & Ants)', img:SVC_IMGS.s19, desc:'Safe, family-friendly pest control that eliminates cockroaches and ants for up to 3 months.', price:499, unit:'per 1BHK', dur:'90 mins', rating:4.7, bookings:6700, inc:['Pre-treatment inspection','Safe chemical application','Kitchen & bathroom focus','Eco-friendly options','90-day protection guarantee'], popular:true, g:'linear-gradient(135deg,#84CC16,#10B981)', icon:'bug', keywords:['pest control','cockroach control','ant control','insect spray'] },
    { id:'s20', cat:'pest', name:'Termite Treatment', img:SVC_IMGS.s20, desc:'Complete termite control with anti-termite barriers and long-term protection for your woodwork.', price:1499, unit:'per 1BHK', dur:'3 hrs', rating:4.8, bookings:2400, inc:['Termite inspection','Anti-termite chemical barrier','Wood treatment & injection','12-month protection','Post-treatment guidance'], popular:false, g:'linear-gradient(135deg,#10B981,#84CC16)', icon:'bug', keywords:['termite treatment','deemak treatment','wood termite'] },

    { id:'s21', cat:'homeclean', name:'Sofa & Carpet Cleaning', img:SVC_IMGS.s21, desc:'Deep steam cleaning for sofas, carpets and mattresses that removes stains, dust and odors.', price:999, unit:'per 3-seater', dur:'2 hrs', rating:4.8, bookings:8300, inc:['Pre-treatment inspection','Steam & deep extraction','Stain & odor removal','Anti-dust-mite treatment','Drying & finishing'], popular:true, g:'linear-gradient(135deg,#8B5CF6,#6366F1)', icon:'home', keywords:['sofa cleaning','carpet cleaning','mattress cleaning','upholstery clean'] },
    { id:'s22', cat:'homeclean', name:'Move-in / Move-out Cleaning', img:SVC_IMGS.s22, desc:'End-to-end deep cleaning for moving homes — floors, walls, kitchen, bathrooms and balconies.', price:1499, unit:'per 1BHK', dur:'4 hrs', rating:4.8, bookings:4100, inc:['Complete room deep-clean','Wall & ceiling dusting','Kitchen degreasing','Bathroom descaling','Balcony & window cleaning'], popular:false, g:'linear-gradient(135deg,#6366F1,#2563EB)', icon:'home', keywords:['move in cleaning','move out cleaning','tenant cleaning','post construction clean'] },

    { id:'s23', cat:'ro', name:'RO Service & Filter Change', img:SVC_IMGS.s23, desc:'Complete RO service — filter replacement, membrane cleaning and water quality testing.', price:299, unit:'per visit', dur:'45 mins', rating:4.7, bookings:7200, inc:['RO inspection & diagnosis','Filter & membrane service','Tank & UV lamp check','Water quality test','90-day filter warranty'], popular:true, g:'linear-gradient(135deg,#38BDF8,#0284C7)', icon:'droplets', keywords:['ro service','water purifier','filter change','ro filter','water filter'] },
    { id:'s24', cat:'ro', name:'RO Installation & AMC', img:SVC_IMGS.s24, desc:'New RO installation or a worry-free annual maintenance contract with priority service.', price:999, unit:'per AMC', dur:'2 hrs', rating:4.8, bookings:3100, inc:['RO unit installation','Annual maintenance contract','2 filter replacements','Priority service slots','Water quality guarantee'], popular:false, g:'linear-gradient(135deg,#0284C7,#2563EB)', icon:'droplets', keywords:['ro installation','ro amc','water purifier install'] },

    { id:'s25', cat:'cctv', name:'CCTV Installation', img:SVC_IMGS.s25, desc:'End-to-end CCTV setup — camera mounting, wiring, DVR configuration and mobile viewing access.', price:799, unit:'per camera', dur:'2 hrs', rating:4.8, bookings:5400, inc:['Camera mounting & wiring','DVR/NVR configuration','Mobile app setup','Remote viewing access','1-year installation warranty'], popular:true, g:'linear-gradient(135deg,#334155,#0EA5E9)', icon:'camera', keywords:['cctv installation','security camera','camera setup'] },
    { id:'s26', cat:'cctv', name:'CCTV Repair & Service', img:SVC_IMGS.s26, desc:'Diagnosis and repair of cameras, power issues, hard disks and connectivity for existing setups.', price:399, unit:'per visit', dur:'1 hr', rating:4.6, bookings:1800, inc:['Complete system diagnosis','Camera & lens repair','DVR / HDD service','Signal & connectivity fix','7-day service warranty'], popular:false, g:'linear-gradient(135deg,#0EA5E9,#6366F1)', icon:'camera', keywords:['cctv repair','camera repair','dvr fix'] },

    { id:'s27', cat:'laptop', name:'Laptop Screen & Battery Repair', img:SVC_IMGS.s27, desc:'Fast, doorstep laptop repairs — screens, batteries, keyboards and charging ports with genuine parts.', price:499, unit:'per visit', dur:'1 hr', rating:4.7, bookings:5200, inc:['Diagnosis at home','Screen / battery replacement','Keyboard & port repair','Genuine spare parts','90-day parts warranty'], popular:true, g:'linear-gradient(135deg,#6366F1,#3B82F6)', icon:'monitor', keywords:['laptop repair','laptop screen','laptop battery','computer repair'] },
    { id:'s28', cat:'laptop', name:'Laptop Tune-up & Upgrade', img:SVC_IMGS.s28, desc:'Speed up your laptop — SSD upgrade, RAM boost, virus removal and OS optimization.', price:299, unit:'per visit', dur:'1 hr', rating:4.8, bookings:6700, inc:['Performance diagnosis','SSD / RAM upgrade','Virus & malware removal','OS optimization','Data backup guidance'], popular:false, g:'linear-gradient(135deg,#3B82F6,#2563EB)', icon:'monitor', keywords:['laptop upgrade','ssd upgrade','ram upgrade','laptop virus removal'] },

    { id:'s29', cat:'beauty', name:'Bridal Makeup & Styling', img:SVC_IMGS.s29, desc:'Complete bridal look — makeup, hair styling, draping and touch-ups by experienced artists.', price:4999, unit:'per package', dur:'4 hrs', rating:4.9, bookings:1200, inc:['Pre-bridal consultation','HD bridal makeup','Hairstyle & draping','Nail art & mehndi touch-up','Premium products & kit'], popular:false, g:'linear-gradient(135deg,#F472B6,#EC4899)', icon:'flower', keywords:['bridal makeup','wedding makeup','bridal artist'] },
    { id:'s30', cat:'beauty', name:'Facial & Skincare', img:SVC_IMGS.s30, desc:'Glow-boosting facials and skin treatments customized to your skin type at home.', price:599, unit:'per session', dur:'1 hr', rating:4.8, bookings:8900, inc:['Skin type analysis','Cleanse & exfoliate','Custom facial massage','Face pack & serum','SPF finish'], popular:true, g:'linear-gradient(135deg,#EC4899,#F43F5E)', icon:'flower', keywords:['facial','skincare','face glow','cleanup'] },

    { id:'s31', cat:'spa', name:'Ayurvedic Spa', img:SVC_IMGS.s31, desc:'Traditional Ayurvedic therapies that balance body, mind and energy — with herbal oils.', price:899, unit:'per session', dur:'90 mins', rating:4.9, bookings:4600, inc:['Ayurvedic therapist','Warm herbal oil massage','Shirodhara (optional)','Steam & relaxation','Herbal tea ritual'], popular:false, g:'linear-gradient(135deg,#14B8A6,#10B981)', icon:'lotus', keywords:['ayurvedic spa','herbal massage','spa at home'] },
    { id:'s32', cat:'spa', name:'Couple Spa at Home', img:SVC_IMGS.s32, desc:'A romantic couple spa experience with two therapists, aromatherapy and a candle-lit setup.', price:1799, unit:'per couple', dur:'90 mins', rating:4.9, bookings:2100, inc:['Two professional therapists','Aromatherapy massage','Candle-lit ambience setup','Face pack & foot care','Herbal refreshments'], popular:false, g:'linear-gradient(135deg,#10B981,#14B8A6)', icon:'lotus', keywords:['couple spa','massage couple'] },

    { id:'s33', cat:'shifting', name:'Local Home Shifting', img:SVC_IMGS.s33, desc:'Stress-free local moves — packing, loading, transport and unpacking with insured moving crews.', price:2999, unit:'per 1BHK', dur:'1 day', rating:4.6, bookings:3300, inc:['Free pre-move survey','Quality packing materials','Covered transport','Loading & unloading crew','Unpacking & placement'], popular:true, g:'linear-gradient(135deg,#F97316,#EF4444)', icon:'truck', keywords:['home shifting','packers and movers','local shifting','moving house'] },
    { id:'s34', cat:'shifting', name:'Intercity Shifting', img:SVC_IMGS.s34, desc:'Safe, insured intercity relocation with GPS-tracked trucks and dedicated move managers.', price:8999, unit:'per 1BHK', dur:'2 days', rating:4.7, bookings:1400, inc:['Door-to-door relocation','Premium packing & crating','GPS-tracked transport','Transit insurance','Dedicated move manager'], popular:false, g:'linear-gradient(135deg,#EF4444,#F97316)', icon:'truck', keywords:['intercity shifting','long distance moving','relocation'] },
  ];

  /* Keep every category's "Starting from" price in sync with its cheapest
     service — the category card never promises less than the services it holds. */
  {
    const catMin = {};
    svcDefs.forEach(s => { catMin[s.cat] = Math.min(catMin[s.cat] ?? Infinity, s.price); });
    categories.forEach(c => { if (catMin[c.slug] !== undefined) c.price = catMin[c.slug]; });
  }

  /* ---------- reviews ---------- */
  const REVIEWS = [
    { name:'Ananya Rao',   date:'2 days ago', rating:5, v:true,  text:'The deep cleaning was outstanding. The expert arrived on time, was super professional, and the kitchen looks brand new. Highly recommend!', helpful:128, tags:['On time','Clean & tidy'], hasImg:true },
    { name:'Mohit Agarwal',date:'1 week ago',rating:4, v:true,  text:'AC service was quick and thorough. Technician explained the issue and shared photos before starting. Slight delay in arrival but great work.', helpful:64, tags:['Professional'], hasImg:false },
    { name:'Sara Fernandes',date:'3 weeks ago',rating:5, v:true, text:'The salon artist was brilliant! Got a haircut and spa at home, felt like a premium salon experience. Loved the hygiene kit.', helpful:210, tags:['Hygienic','Friendly'], hasImg:true },
    { name:'Devang Joshi', date:'1 month ago',rating:5, v:true, text:'Booked pest control at midnight through live tracking — the team reached right on time. No more cockroaches, 3 months strong!', helpful:96, tags:['On time','Effective'], hasImg:false },
    { name:'Kavya Menon',  date:'1 month ago',rating:4, v:false,text:'Sofa cleaning removed all the stains. The booking flow on the app was super smooth. Price was exactly as shown, no surprises.', helpful:31, tags:['Transparent pricing'], hasImg:true },
  ];

  /* ---------- testimonials ---------- */
  const TESTIMONIALS = [
    { name:'Ananya Rao', role:'Homeowner, Mumbai', rating:5, text:'Servehub has become my go-to for everything home. From AC service to deep cleaning, every expert has been punctual, professional and genuinely skilled.' },
    { name:'Mohit Agarwal', role:'Product Manager, Bengaluru', rating:5, text:'The live tracking and chat features are brilliant. I could watch my technician arrive, message him directly, and pay securely — all in one app.' },
    { name:'Sara Fernandes', role:'Salon Regular, Pune', rating:4, text:'Getting a salon-quality haircut at home is a game changer. The artists are amazing and the hygiene standards are the best I have seen.' },
    { name:'Devang Joshi', role:'Homeowner, Delhi', rating:5, text:'Emergency pest control at midnight? Servehub delivered. Fast, transparent pricing, and the 90-day guarantee gives me total peace of mind.' },
    { name:'Kavya Menon', role:'Working Mom, Hyderabad', rating:5, text:'I book everything through Servehub — cleaning, plumbing, salon. The membership plan saved me over ₹4,000 this year. Absolutely worth it.' },
    { name:'Rahul Nair', role:'Rental Owner, Chennai', rating:4, text:'Managing three rental properties used to be chaos. Servehub lets me schedule, track and pay for every service from one dashboard.' },
  ];

  /* ---------- faqs ---------- */
  const FAQS = [
    { q:'How are Servehub professionals verified?', a:'Every professional completes a multi-step verification — government ID check, police background verification, skill assessment and a practical training test — before they can accept bookings. 98.6% of them have 2+ years of field experience.' },
    { q:'What if I am not satisfied with the service?', a:'We offer a 100% service warranty on every booking. If something is not right, report it within 48 hours and we will re-serve the service for free or issue a full refund — no questions asked.' },
    { q:'How does pricing work?', a:'You see the exact final price before booking — no hidden charges. Prices are fixed per service and city. You can also apply coupons, membership discounts and wallet cashback at checkout.' },
    { q:'Can I reschedule or cancel a booking?', a:'Yes. You can reschedule for free up to 6 hours before the slot, and cancel for a full refund up to 24 hours before. Instant refunds go straight back to your wallet or bank account.' },
    { q:'Which cities does Servehub operate in?', a:'We currently serve 14+ cities including Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Pune, Kolkata and Ahmedabad — with 300+ serviceable areas. We are expanding every quarter.' },
    { q:'How do I become a professional on Servehub?', a:'Apply on the For Professionals page. Complete your KYC, upload certificates and take a quick skill assessment. Most applications are reviewed within 48 hours and you can start earning immediately after approval.' },
    { q:'Is my payment secure?', a:'All payments are processed through PCI-DSS compliant gateways (Stripe & Razorpay) with 256-bit encryption. We never store your card details, and every transaction is covered by our payment protection.' },
    { q:'Do you offer emergency services?', a:'Yes! Our Emergency Booking feature connects you to the nearest available expert within 60 minutes for issues like water leaks, power failures and lockouts — 24×7.' },
  ];

  /* ---------- cities & areas ---------- */
  const CITIES = [
    { name:'Bengaluru',  state:'Karnataka',     areas:['Indiranagar','Koramangala','Whitefield','HSR Layout','Jayanagar','Malleshwaram','Electronic City','Marathahalli'] },
    { name:'Mumbai',     state:'Maharashtra',   areas:['Andheri','Bandra','Powai','Dadar','Thane','Chembur','Borivali','Juhu'] },
    { name:'Delhi NCR',  state:'Delhi',         areas:['Gurgaon','Noida','Dwarka','Rohini','Saket','Lajpat Nagar','Ghaziabad','Faridabad'] },
    { name:'Hyderabad',  state:'Telangana',     areas:['Banjara Hills','Gachibowli','Madhapur','Kukatpally','Secunderabad','Jubilee Hills'] },
    { name:'Chennai',    state:'Tamil Nadu',    areas:['Adyar','Velachery','Anna Nagar','T.Nagar','OMR','Porur'] },
    { name:'Pune',       state:'Maharashtra',   areas:['Kothrud','Hinjewadi','Viman Nagar','Baner','Aundh','Hadapsar'] },
    { name:'Kolkata',    state:'West Bengal',   areas:['Salt Lake','New Town','Ballygunge','Howrah','Behala'] },
    { name:'Ahmedabad',  state:'Gujarat',       areas:['Satellite','Bodakdev','Vastrapur','Maninagar','Navrangpura'] },
  ];

  /* ---------- what's NOT included (per category) ---------- */
  const NOT_INC = {
    ac:      ['Spare parts beyond standard wear', 'Gas top-up when refrigerant is leaking from an unsealed pipe', 'Installation of new units during a repair visit', 'Repairs on ACs still under the manufacturer warranty'],
    appliance:['Major spare parts (quoted & approved before fitting)', 'Water heater / geyser element replacement parts', 'Appliances that cannot be serviced at the customer location', 'Work on units with warranty voided by third-party repairs'],
    cleaning:['Specialized equipment for industrial stains', 'Pest / termite treatment (book Pest Control separately)', 'Curtain & blind washing (add-on available)', 'Exterior / balcony grime removal'],
    homeclean:['Furniture moving & shifting', 'Ceiling repair or painting', 'Post-construction rubble removal', 'Deep stains requiring chemical treatment'],
    plumber: ['Major pipe rerouting or civil work', 'New fixture purchase (fixture cost billed separately)', 'Underground pipeline replacement', 'Water tank repair / replacement'],
    electrician:['Electrical materials (switches, wires — billed at actuals)', 'New wiring for rooms beyond the scope', 'Inverter / battery purchase', 'Work requiring municipal approval'],
    carpenter:['Raw material (wood, plywood — billed at actuals)', 'Custom furniture design beyond the quote', 'Lamination / polish of new surfaces', 'Structural wall work'],
    painting: ['Paint material (premium paints billed at actuals)', 'Waterproofing of external walls (add-on)', 'Furniture shifting by the crew', 'Repair of damaged plaster beneath paint'],
    pest:    ['Rodent removal from walls/ceilings', 'Post-treatment re-infestation due to unsealed entry points', 'Termite treatment on wet / damp woodwork', 'Cleaning of affected areas after treatment'],
    salon:   ['Hair color products (premium brands billed extra)', 'Nail art beyond basic manicure', 'Multiple members in a single session', 'Home salon for large groups (book separately)'],
    massage: ['Couple sessions (book Couple Spa)', 'Specialized physiotherapy', 'Therapies requiring medical clearance', 'Extended duration beyond the package'],
    spa:     ['Bridal / party packages', 'Use of imported premium oils', 'Couple sessions beyond package', 'Therapies requiring medical clearance'],
    ro:      ['RO membrane replacement (quoted before fitting)', 'New RO unit purchase', 'Tank replacement', 'Plumbing changes for installation'],
    cctv:    ['Camera hardware & storage drives (billed at actuals)', 'Wi-Fi / network infrastructure', 'Wall drilling on restricted surfaces', 'Remote monitoring subscription'],
    laptop:  ['New hardware parts (SSD, RAM, battery — billed at actuals)', 'Data recovery from damaged drives', 'Licensed software / OS purchase', 'In-warranty devices (use the OEM service)'],
    beauty:  ['Premium makeup kits beyond the package', 'Hair treatment products', 'Multiple members in one session', 'Outstation bridal travel charges'],
    shifting:['Packing of fragile high-value items (insurance applies)', 'Storage charges', 'Stairs / lift unavailable surcharge', 'Intercity customs & permits'],
    _default:['Spare parts or materials beyond standard scope', 'Work outside the booked address', 'Add-ons not selected at checkout', 'Third-party equipment under manufacturer warranty'],
  };
  const notIncOf = s => NOT_INC[s.cat] || NOT_INC._default;

  /* ---------- coupons / plans / blog ---------- */
  const COUPONS = [
    { code:'WELCOME50',  desc:'Flat ₹50 off on your first booking', type:'flat', value:50, min:199, valid:'31 Dec 2026' },
    { code:'SERVE10',    desc:'10% off up to ₹200 on all services', type:'pct', value:10, cap:200, min:499, valid:'31 Dec 2026' },
    { code:'CLEANUP',    desc:'₹100 off on all cleaning services', type:'flat', value:100, min:799, valid:'30 Sep 2026' },
    { code:'HUB20',      desc:'20% off on AC, Plumber & Electrician', type:'pct', value:20, cap:300, min:999, valid:'31 Aug 2026' },
    { code:'FESTIVE25',  desc:'Flat 25% off up to ₹500 this festive season', type:'pct', value:25, cap:500, min:1499, valid:'31 Oct 2026' },
  ];
  const PLANS = [
    { id:'free', name:'Free', price:0, per:'forever', perks:['Standard pricing on all services','Instant booking & live tracking','100% service warranty','Wallet cashback on every booking'] },
    { id:'plus', name:'Plus', price:299, per:'month', featured:false, perks:['5% discount on every service','Priority expert dispatch','Free rescheduling anytime','Quarterly free deep-clean add-on','Dedicated support line'] },
    { id:'pro', name:'Pro', price:599, per:'month', featured:true, perks:['10% discount + ₹500 monthly credit','Zero cancellation fees','2× priority booking slots','Free quarterly home inspection','Personal relationship manager','Premium gift cards each quarter'] },
  ];
  const BLOG = [
    { id:'b1', cat:'Cleaning', title:'10 Cleaning Habits That Save You 5 Hours Every Week', date:'Aug 2, 2026', read:'6 min', excerpt:'Professional cleaners reveal the tiny daily habits that keep a home spotless without weekend marathon scrubs.', g:'linear-gradient(135deg,#2563EB,#0EA5E9)', icon:'sparkles' },
    { id:'b2', cat:'Home Care', title:'AC Keeps Leaking Water? Here Is What The Technician Checks', date:'Jul 28, 2026', read:'4 min', excerpt:'From clogged drain pipes to refrigerant issues — a certified AC expert explains the top 5 causes and quick fixes.', g:'linear-gradient(135deg,#0EA5E9,#6366F1)', icon:'snowflake' },
    { id:'b3', cat:'Lifestyle', title:'The Ultimate Guide to a 30-Minute Home Salon Routine', date:'Jul 21, 2026', read:'8 min', excerpt:'Professional stylists share their fastest full-grooming routine that looks salon-fresh without leaving home.', g:'linear-gradient(135deg,#F43F5E,#EC4899)', icon:'scissors' },
    { id:'b4', cat:'Safety', title:'5 Electrical Safety Checks Every Home Needs This Monsoon', date:'Jul 14, 2026', read:'5 min', excerpt:'Water and electricity don’t mix. A certified electrician lists the monsoon-ready checks to protect your family.', g:'linear-gradient(135deg,#F59E0B,#F97316)', icon:'zap' },
    { id:'b5', cat:'Pest', title:'Cockroaches Keep Coming Back? Your Hidden Problem, Explained', date:'Jul 7, 2026', read:'7 min', excerpt:'Why DIY sprays fail and how professional barrier treatments give 90-day protection that actually works.', g:'linear-gradient(135deg,#84CC16,#10B981)', icon:'bug' },
    { id:'b6', cat:'Home Care', title:'How Often Should You Actually Service Your Washing Machine?', date:'Jun 30, 2026', read:'4 min', excerpt:'Experts say every 6 months — here is the full maintenance schedule for every major appliance in your home.', g:'linear-gradient(135deg,#64748B,#0EA5E9)', icon:'settings' },
  ];

  const helpers = {
    catBySlug: s => categories.find(c => c.slug === s),
    serviceById: id => svcDefs.find(s => s.id === id),
    servicesByCat: slug => svcDefs.filter(s => s.cat === slug),
    proById: id => PROS.find(p => p.id === id),
    prosForService: svc => PROS.filter(p => p.cat === svc.cat).slice(0, 4),
    related: (svc, n = 3) => svcDefs.filter(s => s.cat === svc.cat && s.id !== svc.id).concat(svcDefs.filter(s => s.cat !== svc.cat)).slice(0, n),
    notIncOf: notIncOf,
    trending: () => [...svcDefs].sort((a, b) => b.bookings - a.bookings).slice(0, 8),
    recommended: () => [...svcDefs].sort((a, b) => b.rating - a.rating).slice(0, 4),

    /* ---- Smart Search Engine with Natural Language & Cheapest Calculation ---- */
    searchServices: (query = '', options = {}) => {
      const q = String(query || '').toLowerCase().trim();
      const sortBy = options.sortBy || 'recommended'; // recommended | low | high | rating
      const catFilter = options.category || null;

      let results = [...svcDefs];

      if (catFilter && catFilter !== 'all') {
        results = results.filter(s => s.cat === catFilter);
      }

      if (q) {
        // Natural language synonym, typo tolerance & category intent mapping.
        const TYPOS = {
          'corpenter': 'carpenter', 'carpentor': 'carpenter', 'carptener': 'carpenter', 'carpanter': 'carpenter', 'corpentor': 'carpenter', 'woodwork': 'carpenter',
          'electrican': 'electrician', 'electricn': 'electrician', 'electical': 'electrician', 'electrian': 'electrician', 'electrcian': 'electrician', 'electritian': 'electrician',
          'plumberr': 'plumber', 'plumer': 'plumber', 'plumbingg': 'plumber',
          'cleanin': 'cleaning', 'claning': 'cleaning', 'cleaner': 'cleaning',
          'saloon': 'salon', 'sallon': 'salon', 'beautician': 'beauty', 'beuty': 'beauty',
          'refrigerater': 'fridge', 'refrig': 'fridge', 'washmachine': 'washing machine',
          'pesticide': 'pest', 'pestt': 'pest',
        };

        let normalizedQ = q;
        Object.keys(TYPOS).forEach(typo => {
          normalizedQ = normalizedQ.replace(new RegExp('\\b' + typo + '\\b', 'g'), TYPOS[typo]);
        });

        // exact = standalone words ('ac' must not match 'machine', 'packers');
        // prefix = stem words that also match plurals/derivatives ('plumb' → 'plumbing').
        const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const INTENTS = [
          { exact: ['ac', 'a.c.'],        prefix: ['air condition', 'cooling', 'compressor', 'freon', 'refrigerant', 'gas refill', 'hvac'], cat: 'ac' },
          { exact: [],                     prefix: ['plumb', 'pipe', 'tap', 'leak', 'sink', 'flush', 'drain', 'faucet', 'cistern', 'water tank'], cat: 'plumber' },
          { exact: ['mcb'],                prefix: ['electric', 'wire', 'switch', 'fan', 'light', 'socket', 'inverter', 'short circuit'], cat: 'electrician' },
          { exact: [],                     prefix: ['clean', 'dust', 'mop', 'carpet', 'washroom', 'house clean', 'room clean', 'sofa clean', 'bathroom clean'], cat: 'cleaning' },
          { exact: ['tv'],                 prefix: ['wash', 'washing machine', 'refrigerat', 'fridge', 'microwave', 'geyser', 'appliance', 'television'], cat: 'appliance' },
          { exact: [],                     prefix: ['paint', 'wall', 'colour', 'whitewash', 'texture'], cat: 'painting' },
          { exact: [],                     prefix: ['wood', 'door', 'lock', 'hinge', 'cabinet', 'furniture', 'carpenter', 'corpenter', 'wardrobe'], cat: 'carpenter' },
          { exact: [],                     prefix: ['pest', 'cockroach', 'termite', 'ant', 'bug', 'rat', 'insect'], cat: 'pest' },
          { exact: [],                     prefix: ['salon', 'hair', 'beard', 'beauty', 'facial', 'makeup', 'grooming'], cat: 'salon' },
          { exact: ['spa'],                prefix: ['massage', 'therap', 'relaxation'], cat: 'massage' },
          { exact: ['cctv'],               prefix: ['camera', 'surveillance'], cat: 'cctv' },
          { exact: ['ssd'],                prefix: ['laptop', 'computer', 'screen', 'ram', 'keyboard'], cat: 'laptop' },
          { exact: ['ro'],                 prefix: ['water purifier', 'purifier', 'filter'], cat: 'ro' },
          { exact: [],                     prefix: ['shift', 'move', 'pack', 'truck', 'relocat'], cat: 'shifting' },
        ];
        const testIntent = m =>
          m.exact.some(t => new RegExp('\\b' + escRe(t) + '\\b', 'i').test(normalizedQ)) ||
          m.prefix.some(t => new RegExp('\\b' + escRe(t), 'i').test(normalizedQ));
        const matchedIntents = INTENTS.filter(testIntent).map(m => m.cat);

        results = results.filter(s => {
          const matchCat = matchedIntents.includes(s.cat);
          // Short queries (<= 2 chars like "ac") must match word-INITIAL prefixes:
          // "ac" should hit "AC Repair" but NOT "crACK-free", "exact" or
          // "replacements". Longer queries match substrings anywhere so
          // "ac service near me" still works.
          const qLen = q.length;
          const hits = str => qLen <= 2
            ? new RegExp('(^|[^a-z])' + escRe(q), 'i').test(' ' + str.toLowerCase())
            : str.toLowerCase().includes(q);
          const matchName = hits(s.name);
          // Descriptions are only substring-matched for longer queries — for
          // 2-char queries they add noise ("ac" vs "access", "crack", …).
          const matchDesc = qLen > 2 ? hits(s.desc) : false;
          // Keyword tokens always match by prefix for short queries.
          const matchKw = (s.keywords || []).some(k => {
            const kl = k.toLowerCase();
            if (qLen <= 2) return kl.split(/[\s-]+/).some(w => w.startsWith(q));
            return kl.includes(q) || q.includes(kl);
          });
          const catObj = categories.find(c => c.slug === s.cat);
          const matchCatName = catObj && hits(catObj.name);
          return matchCat || matchName || matchDesc || matchKw || matchCatName;
        });
      }

      // Check if user specifically asked for "cheapest"
      const wantsCheapestFirst = /\b(cheap|cheapest|lowest|budget|affordable|low price|low cost)\b/i.test(q) || sortBy === 'low';

      // Dynamic calculation of cheapest service among the matched set
      if (results.length > 0) {
        let minPrice = Infinity;
        results.forEach(s => {
          if (s.price < minPrice) minPrice = s.price;
        });
        results = results.map(s => ({
          ...s,
          isCheapest: s.price === minPrice && results.length > 1,
        }));
      }

      // Sorting
      if (wantsCheapestFirst) {
        results.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'high') {
        results.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'rating') {
        results.sort((a, b) => b.rating - a.rating);
      } else {
        // Recommended sort: popular & cheapest first
        results.sort((a, b) => {
          if (a.isCheapest && !b.isCheapest) return -1;
          if (!a.isCheapest && b.isCheapest) return 1;
          return b.bookings - a.bookings;
        });
      }

      return results;
    },

    searchAll: q => {
      q = (q || '').toLowerCase().trim(); if (!q) return { services: [], categories: [], pros: [], cities: [] };
      const matchedServices = helpers.searchServices(q);
      return {
        services: matchedServices.slice(0, 6),
        categories: categories.filter(c => (c.name + ' ' + c.tag).toLowerCase().includes(q)).slice(0, 5),
        pros: PROS.filter(p => (p.name + ' ' + p.role + ' ' + p.tags.join(' ')).toLowerCase().includes(q)).slice(0, 4),
        cities: CITIES.filter(c => c.name.toLowerCase().includes(q)).map(c => c.name).slice(0, 3),
      };
    },
  };
  return { categories, services: svcDefs, pros: PROS, reviews: REVIEWS, testimonials: TESTIMONIALS, faqs: FAQS, cities: CITIES, coupons: COUPONS, plans: PLANS, blog: BLOG, ...helpers };
})();

