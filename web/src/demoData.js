// Sample content for the redesigned wallet screens. None of it is real and none of it is saved.
// Only support tickets use the database.

export const USER = { name: 'Bea Navarro', initials: 'BN', mobile: '0917 555 0142', verified: true, memberSince: 'March 2022' };

const hoursAgo = (h) => new Date(Date.now() - h * 3600e3).toISOString();

// Amounts are signed: money in is positive, money out is negative.
export const TRANSACTIONS = [
  { id: 't1', title: 'Cash in from Sample Bank', party: 'Sample Bank', kind: 'Cash in', amount: 3000, at: hoursAgo(5) },
  { id: 't2', title: 'Sent to Miguel R.', party: 'Miguel R.', kind: 'Send money', amount: -850, at: hoursAgo(8) },
  { id: 't3', title: 'Electric bill', party: 'Sample electric biller', kind: 'Bills', amount: -2340, at: hoursAgo(27) },
  { id: 't4', title: 'Received from Carla D.', party: 'Carla D.', kind: 'Receive money', amount: 1200, at: hoursAgo(30) },
  { id: 't5', title: 'Prepaid load, 0917', party: 'Sample telco', kind: 'Load', amount: -100, at: hoursAgo(52) },
  { id: 't6', title: 'Corner Coffee, QR payment', party: 'Corner Coffee', kind: 'QR payment', amount: -185.5, at: hoursAgo(56) },
  { id: 't7', title: 'Water bill', party: 'Sample water biller', kind: 'Bills', amount: -642.75, at: hoursAgo(100) },
  { id: 't8', title: 'Received from Lola Nena', party: 'Lola Nena', kind: 'Receive money', amount: 2000, at: hoursAgo(124) },
];

const OPENING_BALANCE = 10398.75;
// The balance is always the sum of the rows, so the screen can never disagree with itself.
export const BALANCE = Math.round((OPENING_BALANCE + TRANSACTIONS.reduce((sum, t) => sum + t.amount, 0)) * 100) / 100;

export const CONTACTS = [
  { name: 'Miguel R.', initials: 'MR', mobile: '0918 555 0111' },
  { name: 'Carla D.', initials: 'CD', mobile: '0927 555 0123' },
  { name: 'Lola Nena', initials: 'LN', mobile: '0905 555 0177' },
  { name: 'Paolo S.', initials: 'PS', mobile: '0939 555 0190' },
];

export const LIMITS = { label: 'Monthly wallet limit', used: 28450, total: 100000 };

// Every service has one home. Groups are named for what the user wants to do, not for product brands.
export const SERVICE_GROUPS = [
  { title: 'Move money', items: [
    { id: 'send', label: 'Send', icon: 'Send', to: '/send', about: 'Send money to a mobile number.' },
    { id: 'cashin', label: 'Cash in', icon: 'Plus', about: 'Add money from a bank, a card or a partner outlet.' },
    { id: 'bank', label: 'Transfer', icon: 'Landmark', about: 'Move money to a bank account.' },
    { id: 'qr', label: 'Scan QR', icon: 'QrCode', about: 'Pay a store by scanning its QR code.' },
  ] },
  { title: 'Pay and top up', items: [
    { id: 'bills', label: 'Bills', icon: 'Receipt', about: 'Pay electricity, water, internet and more.' },
    { id: 'load', label: 'Load', icon: 'Smartphone', about: 'Top up prepaid mobile numbers.' },
    { id: 'transport', label: 'Transport', icon: 'Bus', about: 'Reload transit cards and toll accounts.' },
    { id: 'shop', label: 'Shop', icon: 'Store', about: 'Vouchers and partner stores.' },
  ] },
  { title: 'Save and grow', items: [
    { id: 'save', label: 'Savings', icon: 'PiggyBank', about: 'Open a savings account inside the wallet.' },
    { id: 'invest', label: 'Invest', icon: 'TrendingUp', about: 'Start investing with small amounts.' },
    { id: 'credit', label: 'Borrow', icon: 'CreditCard', about: 'A credit line for everyday purchases.' },
    { id: 'insure', label: 'Insurance', icon: 'Umbrella', about: 'Affordable cover for health, travel and devices.' },
  ] },
  { title: 'More', items: [
    { id: 'rewards', label: 'Rewards', icon: 'Gift', about: 'Points and vouchers you have earned.' },
    { id: 'games', label: 'Games', icon: 'Gamepad2', about: 'Play and earn.' },
    { id: 'donate', label: 'Donate', icon: 'Heart', about: 'Give to partner charities.' },
  ] },
];

// The seven services on Home; the eighth tile is View all.
export const QUICK_ACTIONS = ['send', 'load', 'bank', 'bills', 'credit', 'save', 'invest'];

export const NOTICES = [
  { id: 'n1', tab: 'updates', title: 'Cash in successful', body: '₱3,000.00 from Sample Bank was added to your wallet.', at: hoursAgo(5) },
  { id: 'n2', tab: 'updates', title: 'You sent ₱850.00 to Miguel R.', body: 'Reference shown in your activity list.', at: hoursAgo(8) },
  { id: 'n3', tab: 'updates', title: 'New sign-in on this device', body: 'If this was not you, contact support right away.', at: hoursAgo(49) },
  { id: 'p1', tab: 'offers', title: 'Sample promo: zero fee on your next bank transfer', body: 'Placeholder offer for the demo.', at: hoursAgo(20) },
  { id: 'p2', tab: 'offers', title: 'Sample promo: double points on bills', body: 'Placeholder offer for the demo.', at: hoursAgo(70) },
];

export const CATEGORY_HELP = {
  cash_in: { example: 'Money you added has not arrived', hint: 'Tell us where you cashed in from, the amount and the time.' },
  send_money: { example: 'Sent to the wrong number, or a transfer is missing', hint: 'Tell us the amount, the time and the number you sent to.' },
  bills: { example: 'A bill was charged twice or not posted', hint: 'Tell us the biller, the amount and the date you paid.' },
  account: { example: 'Verification, login or profile problems', hint: 'Tell us what you were trying to do and what you saw on screen.' },
  unauthorized: { example: 'A transaction you did not make', hint: 'Tell us the amount and the time. Never share your MPIN or OTP, even with us.' },
  other: { example: 'Anything that does not fit above', hint: 'Describe what happened in your own words.' },
};

export const FAQS = [
  { q: 'How long does a cash in take to arrive?', a: 'Most cash ins arrive within a few minutes. If yours has not arrived after 30 minutes, send us a ticket with the amount and the time and we will trace it.' },
  { q: 'I sent money to the wrong number. What can I do?', a: 'Send us a ticket right away with the number and the amount. We will contact the receiver and ask them to return it. We cannot guarantee a return, but acting quickly helps.' },
  { q: 'Why was my bill payment charged twice?', a: 'This can happen when a payment is retried on a slow connection. Send us a ticket with the biller and the date, and we will return any duplicate charge.' },
  { q: 'How do I follow my ticket?', a: 'Open Help, then My tickets. Each ticket shows a step-by-step tracker with the time of every update, like following a parcel.' },
  { q: 'Will support ever ask for my MPIN or OTP?', a: 'No. Nobody from support will ever ask for your MPIN or a one-time code. If someone does, do not share it and report it to us.' },
];

// Design notes, written as the questions a curious person would ask about each screen.
// q: the question, a: what we did and why, law: the principle behind it,
// spot (optional): the data-note value of the part of the screen it explains, lit up when the note is open.
export const NOTES = {
  home: [
    { q: 'Why is my balance on a card?', spot: 'card', law: 'Jakob’s Law and visual hierarchy', a: 'GCash gives you a physical card, so the balance lives on one, and it is the biggest thing here because “how much do I have?” is why people open a wallet. Tap the card to see its back.' },
    { q: 'Why does the card move?', spot: 'card', law: 'Aesthetic-usability effect', a: 'A small physical response makes the card feel like an object you own, and things that feel well made are trusted more. Move your mouse over it, or drag a finger across it on a phone. It keeps still if your device asks for less motion.' },
    { q: 'What is the line with dots on my ticket?', spot: 'ticket', law: 'Visibility of system status and the goal-gradient effect', a: 'It is the route your ticket travels, like a parcel tracker. The ringed dot is where it is now and “Stop 4 of 6” says how far it has come. In GCash this lives three menus deep; here it is on Home. When support needs you it turns amber and, on a phone, moves to the top.' },
    { q: 'Why only seven services here?', spot: 'services', law: 'Hick’s Law', a: 'GCash shows 11 plus View all. Fewer choices on the first screen means a quicker decision, and everything else is one tap away in View all.' },
    { q: 'Why add up my spending?', spot: 'spend', law: 'Recognition over recall', a: 'A list of transactions leaves the maths to you. Grouping money out by kind shows the pattern at a glance: bills are most of it this week.' },
    { q: 'Why are some faces already here?', spot: 'people', law: 'Fitts’s Law', a: 'Most transfers go to the same few people. Tapping a face opens Send with that person already chosen, so the next question is just the amount.' },
    { q: 'Why are the tiles different sizes?', law: 'Visual hierarchy', a: 'When every box is the same size, everything looks equally important. Larger tiles hold your money and your ticket, smaller ones the shortcuts, so the eye knows where to start.' },
    { q: 'Why is QR in the middle of the bar?', spot: 'bar', law: 'Serial position effect and Fitts’s Law', a: 'Paying by QR is the most frequent job, so it sits under the thumb in the centre. Home and Profile take the two ends, where items are remembered best.' },
  ],
  services: [
    { q: 'Why group the services like this?', law: 'Gestalt: proximity and common region', a: 'GCash lists 42 functions in seven clusters. CashG groups them by what you want to do, move money, pay, save, in plain words.' },
    { q: 'Why does every service have a name and an icon?', law: 'Recognition over recall', a: 'Nothing has to be remembered: you scan for the word or the picture, whichever you notice first.' },
    { q: 'Why is there a search box?', law: 'Flexibility and efficiency of use', a: 'It filters the whole list as you type, for people who already know what they want.' },
  ],
  servicepage: [
    { q: 'Do these buttons work?', spot: 'demo', law: 'Honesty in a prototype', a: 'They respond like the real thing so the screen can be judged as a whole, then say plainly that nothing was charged, sent or saved. A demo should never pretend to move money.' },
    { q: 'Why does each service look different?', law: 'Match between system and the real world', a: 'Each page shows the thing it is about: a viewfinder to scan, cards to reload, goals filling up for savings, a chart for investments. You recognise the service before you read it.' },
    { q: 'Why are savings goals drawn as a route?', law: 'Goal-gradient effect', a: 'The same line with stops is used for tickets and goals, so “how far along am I?” always looks the same, and seeing the next stop close makes people keep going.' },
  ],
  send: [
    { q: 'Why one question per step?', spot: 'steps', law: 'Progressive disclosure', a: 'Who, how much, then a final check. One decision at a time is harder to get wrong than one long form.' },
    { q: 'Why a check screen before sending?', law: 'Error prevention', a: 'It shows the name, number and amount before anything happens, and the amount cannot go over your balance. Money sent to a wrong number is hard to get back.' },
    { q: 'What if I type the number with dashes or +63?', law: 'Postel’s Law', a: 'Any common format is accepted and tidied into one. The app does the fussy part, not you.' },
    { q: 'Why does Back keep what I typed?', law: 'User control and freedom', a: 'Changing your mind should never cost you work.' },
  ],
  activity: [
    { q: 'What is the summary for?', spot: 'summary', law: 'Recognition over recall', a: 'Money in, money out and the difference, added up from the list below, with a bar that shows the balance of the two at a glance.' },
    { q: 'Why group transactions by day?', law: 'Gestalt: proximity', a: 'Grouped by day, the list reads as a short story instead of a wall of rows.' },
    { q: 'Why is money out not red?', law: 'Signs, not colour alone', a: 'Spending is normal, not an error. Money in carries a plus and green; money out stays in plain ink. Red is kept for real problems.' },
    { q: 'What if something looks wrong?', law: 'Help where the problem is', a: 'Open any transaction: “Report a problem” starts a ticket with the details already filled in.' },
  ],
  inbox: [
    { q: 'Why separate updates and offers?', law: 'Signal over noise', a: 'A promo should never bury a security alert, so they live in different tabs.' },
    { q: 'Why are ticket updates on top?', law: 'Visibility of system status', a: 'A change to your ticket is the update you are most likely waiting for.' },
  ],
  profile: [
    { q: 'Why can I pick light, dark or device?', law: 'User control', a: 'CashG opens in dark, but the choice is yours and it is remembered.' },
    { q: 'Why is the limit drawn as a bar?', law: 'Honest data', a: 'The bar is the true share of your monthly limit, with both ends labelled, so it never exaggerates.' },
  ],
  help: [
    { q: 'Why six categories?', law: 'Hick’s Law', a: 'Six plain-language choices, each with an example, instead of a long menu.' },
    { q: 'Why are answers next to the ticket form?', law: 'Help and documentation', a: 'Many questions are answered before anyone needs to file a ticket.' },
    { q: 'Why these category names?', law: 'Match with the real world', a: 'They are named the way people describe the problem, not by internal team names.' },
  ],
  newticket: [
    { q: 'Why three short steps?', law: 'Progressive disclosure', a: 'Short steps keep a complaint from feeling like paperwork, and the bar shows how close you are to done.' },
    { q: 'Why does it check each field as I go?', law: 'Error prevention', a: 'The fix is written under the field as you leave it, not in a list at the end.' },
    { q: 'Why does it never ask for my MPIN?', law: 'Security by design', a: 'Support never needs it, and the form says so, which also teaches people to distrust anyone who asks.' },
    { q: 'What if I leave halfway?', law: 'Zeigarnik effect', a: 'An unfinished ticket is kept as a draft, and Help reminds you to finish it.' },
    { q: 'Why is it already filled in?', law: 'Tesler’s Law', a: 'If you came from a receipt, the subject and transaction details are copied for you. The app carries that work.' },
  ],
  tickets: [
    { q: 'Why does only one ticket stand out?', law: 'Von Restorff effect', a: 'Only tickets that need you carry the amber “Action needed” mark, so they are found at a glance.' },
    { q: 'What do the stops mean?', law: 'Visibility of system status', a: 'The panel beside the list explains every stop, with the same mark you see on each ticket.' },
  ],
  ticket: [
    { q: 'Why does this look like a parcel tracker?', spot: 'tracker', law: 'Jakob’s Law', a: 'People already know how to read a delivery tracker, so the ticket borrows it: one line, stops in order, the current one ringed.' },
    { q: 'Where do the times come from?', spot: 'tracker', law: 'Visibility of system status', a: 'Every finished stop shows the real time it happened. Stops that have not happened show no time, so nothing is guessed.' },
    { q: 'How is this different from GCash?', law: 'Pull and push together', a: 'GCash tickets go through a chatbot and updates arrive by email. Here every stage is in one place, and the badge and Inbox tell you when something changed.' },
    { q: 'What happens at the end?', law: 'Peak-end rule', a: 'A resolved ticket pins what was done at the top, so the journey ends clearly.' },
  ],
  support: [
    { q: 'Why does the console look plainer?', law: 'Aesthetic and minimalist design', a: 'Staff work through many tickets, so the wallet styling is dropped: dense rows, colour only on status.' },
    { q: 'How is the queue sorted?', law: 'Efficiency of use', a: 'By latest activity, with counts per stage and one-tap filters.' },
  ],
  supportticket: [
    { q: 'Why only some stage buttons?', law: 'Error prevention', a: 'Only the stages that can legally follow the current one are offered.' },
    { q: 'Why must I write a note?', law: 'Constraints', a: 'Asking for information and resolving both require a note the customer can read.' },
  ],
};
