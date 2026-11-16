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

// Design notes: what each screen does and the principle behind it. These describe our design only.
export const NOTES = {
  home: [
    ['Jakob’s Law: keep what GCash users know', 'The blue header, balance with Cash in, the icon grid and the raised QR button all stay where a GCash user expects them.'],
    ['Hick’s Law: fewer choices up front', 'GCash shows 11 services plus View All on Home. CashG shows 7 plus View all, so the first screen asks for a smaller decision.'],
    ['Visibility of system status', 'In GCash, a ticket is checked under Profile, Help, Your Conversations. CashG puts your ticket’s live stage on Home.'],
    ['Help where people look', 'GCash reaches Help from the bottom of Home or inside Profile. CashG gives Help its own place in the main bar.'],
    ['Visual hierarchy', 'The balance is the largest figure on the screen because it answers the question people open a wallet with.'],
    ['Serial position effect', 'Home and Profile sit at the two ends of the bar, where items are remembered best; QR takes the centre under the thumb.'],
  ],
  services: [
    ['Recognition over recall', 'Every service is listed with its name and icon, so nothing has to be remembered.'],
    ['Gestalt: proximity and common region', 'GCash lists 42 functions in seven clusters. CashG groups them by what you want to do (move money, pay, save), in plain words.'],
    ['Flexibility and efficiency', 'Search filters the whole list as you type, for people who already know what they want.'],
  ],
  send: [
    ['Progressive disclosure', 'One decision per step: who, how much, then a final check.'],
    ['Error prevention', 'A review step shows the name, number and amount before anything is sent, and the amount cannot exceed the balance.'],
    ['User control and freedom', 'Back keeps what you typed, so changing your mind never costs you work.'],
    ['Fitts’s Law', 'The primary button is full width and within thumb reach on a phone.'],
    ['Postel’s Law', 'The mobile number is accepted with spaces, dashes or +63, then tidied into one format.'],
  ],
  activity: [
    ['Gestalt: proximity', 'Transactions are grouped by day so the list reads as a short story, not a wall of rows.'],
    ['Signs, not colour alone', 'Money in carries a plus sign and green; money out stays in plain ink. Red is kept for real problems.'],
    ['Help where the problem is', 'Every receipt has a "Report a problem" link that opens a ticket with the category already chosen.'],
  ],
  inbox: [
    ['Signal over noise', 'Account updates and offers are separate tabs, so a promo can never bury a security alert.'],
    ['Visibility of system status', 'Support ticket updates are pinned to the top with their current stage.'],
  ],
  profile: [
    ['Consistency and standards', 'Settings use the same rows, switches and labels everywhere.'],
    ['User control', 'Light, dark or match-device theme, chosen by the user and remembered.'],
    ['Honest limits', 'The wallet limit is drawn at its true ratio with both ends labelled.'],
  ],
  help: [
    ['Hick’s Law', 'Six plain-language categories, each with an example, in place of a long menu.'],
    ['Help and documentation', 'Common answers sit next to the ticket entry, so many people never need to file one.'],
    ['Match with the real world', 'Categories are named the way people describe the problem, not by internal team names.'],
  ],
  newticket: [
    ['Progressive disclosure', 'Three short steps keep the form from feeling like paperwork.'],
    ['Error prevention', 'Each field is checked as you leave it, with the fix written under the field.'],
    ['Recognition over recall', 'A hint tells you which details help for the category you chose.'],
    ['Security by design', 'The form never asks for an MPIN, OTP or password, and says so.'],
    ['Tesler’s Law', 'Reporting a problem from a receipt fills in the subject and transaction details for you, so the app carries that work.'],
    ['Zeigarnik effect', 'An unfinished ticket is kept as a draft, and Help reminds you to finish it.'],
    ['Goal-gradient effect', 'The bar and "Step 2 of 3" show how close you are to done.'],
  ],
  tickets: [
    ['Visibility of system status', 'Each ticket shows its stage as an icon and a label, never colour alone.'],
    ['Von Restorff effect', 'Only tickets that need you carry the amber "Action needed" mark, so they stand out.'],
    ['Flexibility and efficiency', 'Search by reference or subject, and filter by stage.'],
  ],
  ticket: [
    ['Jakob’s Law', 'The tracker borrows the parcel-delivery pattern people already know.'],
    ['What changed from GCash', 'GCash tickets are filed through the Gigi chatbot and updates arrive by email. CashG shows every stage in one place, with the time it happened.'],
    ['Visibility of system status', 'Every completed stage shows the real time it happened. Stages that have not happened show no time.'],
    ['Gestalt: continuity', 'One connected line carries the eye from submitted to closed.'],
    ['Von Restorff effect', 'The current stage is the only ringed step, so it is found at a glance.'],
    ['Closure and the peak-end rule', 'A resolved ticket pins what was done at the top, so the journey ends clearly and on a good note.'],
    ['Pull and push together', 'The tracker is there whenever you look; the badge and Inbox tell you when something changed.'],
  ],
  support: [
    ['Efficiency of use', 'The queue is sorted by latest activity, with counts per stage and one-tap filters.'],
    ['Aesthetic and minimalist design', 'The console drops the wallet styling: neutral surfaces, dense rows, colour only on status.'],
  ],
  supportticket: [
    ['Error prevention', 'Only the stages that can legally follow the current one are offered as buttons.'],
    ['Constraints', 'Asking for information and resolving both require a note the customer can read.'],
    ['Feedback', 'Every action confirms itself and appears in the history immediately.'],
  ],
};
