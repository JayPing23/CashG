// Designed pages for every wallet service. They look and respond like the real thing, but nothing is connected:
// every action ends in a toast that says so. All names, rates and balances here are sample data.
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { animate, motion, useReducedMotion } from 'motion/react';
import { Page } from '../App.jsx';
import { ALL_SERVICES } from './Wallet.jsx';
import { LIMITS, NOTICES, USER } from '../demoData.js';
import { initialsOf, money } from '../lib.js';
import { Button, Chips, Empty, Field, Icon, RouteLine, Segmented, useToast } from '../ui.jsx';

const EASE = [0.16, 1, 0.3, 1];
const rise = (i) => ({ initial: { opacity: 0, transform: 'translateY(10px)' }, animate: { opacity: 1, transform: 'translateY(0px)' }, transition: { delay: 0.05 * i, duration: 0.3, ease: EASE } });
const points = (n) => Math.round(n).toLocaleString('en-PH');

function useDemo() {
  const toast = useToast();
  return (action) => toast(`${action} is a demo. Nothing was charged, sent or saved.`, 'Info');
}

function CountUp({ value, format = money }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);
  useEffect(() => {
    if (reduce) return setShown(value);
    const run = animate(0, value, { duration: 0.7, ease: EASE, onUpdate: setShown });
    return () => run.stop();
  }, [value, reduce]);
  return (
    <>
      <span className="sr-only">{format(value)}</span>
      <span aria-hidden="true">{format(shown)}</span>
    </>
  );
}

function Section({ title, action, i = 0, children }) {
  return (
    <motion.section {...rise(i)}>
      <div className="section-head"><h2>{title}</h2>{action}</div>
      {children}
    </motion.section>
  );
}

const Badge = ({ icon, text }) => (
  <span className="avatar" aria-hidden="true" style={{ background: 'var(--accent-soft)', color: 'var(--accent-ink)' }}>
    {icon ? <Icon name={icon} size={18} /> : text}
  </span>
);

function Row({ icon, initials, title, sub, end, onClick }) {
  return (
    <button type="button" className="row" onClick={onClick}>
      <Badge icon={icon} text={initials} />
      <span className="row-main"><span className="row-title block">{title}</span>{sub && <span className="row-sub block">{sub}</span>}</span>
      {end ?? <Icon name="ChevronRight" size={18} style={{ color: 'var(--muted)', flex: 'none' }} />}
    </button>
  );
}

const AddButton = ({ label, onClick }) => <button type="button" className="dashed" onClick={onClick}><Icon name="Plus" size={18} />{label}</button>;

// ── Bills ──
const BILLERS = [
  { name: 'City Power', type: 'Electricity', icon: 'Zap' },
  { name: 'Metro Water', type: 'Water', icon: 'Droplets' },
  { name: 'FiberLink Home', type: 'Internet', icon: 'Wifi' },
  { name: 'StarView Cable', type: 'Cable TV', icon: 'Tv' },
  { name: 'Prime Card', type: 'Credit cards', icon: 'CreditCard' },
  { name: 'Northridge University', type: 'Schools', icon: 'GraduationCap' },
  { name: 'State Pension Fund', type: 'Government', icon: 'Landmark' },
];
const SAVED_BILLS = [
  { name: 'City Power', icon: 'Zap', account: '•••• 4821', due: 'Due Nov 28', amount: 2410.35 },
  { name: 'Metro Water', icon: 'Droplets', account: '•••• 1190', due: 'Due Dec 2', amount: 598.2 },
];
function Bills() {
  const demo = useDemo();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');
  const q = query.trim().toLowerCase();
  const shown = BILLERS.filter((b) => (type === 'All' || b.type === type) && (!q || `${b.name} ${b.type}`.toLowerCase().includes(q)));
  return (
    <>
      <Section title="Saved billers" i={0}>
        <div className="tile-grid">
          {SAVED_BILLS.map((b) => (
            <div key={b.name} className="product">
              <div className="flex items-center gap-3"><Badge icon={b.icon} /><span className="min-w-0"><span className="block font-semibold">{b.name}</span><span className="row-sub num block">{b.account}</span></span></div>
              <span className="pill warning" style={{ justifySelf: 'start' }}><Icon name="CalendarClock" size={14} />{b.due}</span>
              <div className="flex items-center justify-between gap-3">
                <span className="product-price num">{money(b.amount)}</span>
                <Button size="sm" onClick={() => demo('Paying a bill')}>Pay</Button>
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="All billers" i={1}>
        <div className="grid gap-3">
          <div className="search"><Icon name="Search" size={18} /><input className="input" type="search" placeholder="Search billers" aria-label="Search billers" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
          <Chips label="Biller type" value={type} onChange={setType} options={['All', ...new Set(BILLERS.map((b) => b.type))].map((t) => ({ value: t, label: t }))} />
          <div className="card">
            {shown.length ? shown.map((b) => <Row key={b.name} icon={b.icon} title={b.name} sub={b.type} onClick={() => demo('Paying a bill')} />) : <Empty icon="SearchX" title="No biller matches">Try a shorter word.</Empty>}
          </div>
        </div>
      </Section>
    </>
  );
}

// ── Load ──
const LOAD = {
  Data: [
    { name: 'Surf 50', detail: '2 GB for 3 days', price: 50 },
    { name: 'Surf 99', detail: '6 GB for 7 days', price: 99 },
    { name: 'Surf 299', detail: '24 GB for 30 days', price: 299 },
    { name: 'Video 149', detail: 'Unlimited video, 7 days', price: 149 },
  ],
  'Calls and texts': [
    { name: 'Talk 30', detail: 'Unli texts, 60 mins calls, 3 days', price: 30 },
    { name: 'Talk 100', detail: 'Unli calls and texts, 7 days', price: 100 },
  ],
  Regular: [20, 50, 100, 300, 500, 1000].map((p) => ({ name: `₱${p} load`, detail: 'Regular airtime', price: p })),
};
function Load() {
  const demo = useDemo();
  const [kind, setKind] = useState('Data');
  const [picked, setPicked] = useState(null);
  return (
    <>
      <motion.section {...rise(0)} className="card card-pad grid gap-3">
        <Field label="Mobile number" hint="Your own number is filled in. Change it to load someone else.">
          {(p) => <input {...p} className="input num" type="tel" inputMode="tel" defaultValue={USER.mobile} />}
        </Field>
        <span className="pill accent" style={{ justifySelf: 'start' }}><Icon name="Signal" size={14} />Sample network</span>
      </motion.section>
      <Section title="Choose a load" i={1}>
        <div className="grid gap-4">
          <Chips label="Load type" value={kind} onChange={(k) => { setKind(k); setPicked(null); }} options={Object.keys(LOAD).map((k) => ({ value: k, label: k }))} />
          <div className="tile-grid">
            {LOAD[kind].map((p) => (
              <button key={p.name} type="button" className="product" aria-pressed={picked === p.name} onClick={() => setPicked(p.name)}>
                <span className="font-semibold">{p.name}</span>
                <span className="row-sub">{p.detail}</span>
                <span className="product-price num">{money(p.price)}</span>
              </button>
            ))}
          </div>
          <Button block disabled={!picked} onClick={() => demo('Buying load')}>{picked ? `Buy ${picked}` : 'Choose a load first'}</Button>
        </div>
      </Section>
    </>
  );
}

// ── Transport ──
function Transport() {
  const demo = useDemo();
  const cards = [
    { name: 'Transit card', icon: 'TrainFront', number: '•••• 2041', balance: 185 },
    { name: 'Toll tag', icon: 'Car', number: 'Plate ABC 1234', balance: 720 },
  ];
  return (
    <Section title="Your cards" i={0}>
      <div className="grid gap-3">
        <div className="pass-grid">
          {cards.map((c, i) => (
            <motion.div key={c.name} {...rise(i + 1)} className={`pass ${i ? 'pass-b' : ''}`}>
              <div className="flex items-center justify-between"><span className="font-semibold">{c.name}</span><Icon name={c.icon} /></div>
              <div>
                <span className="pass-label">Balance</span>
                <span className="block figure-md num">{money(c.balance)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="pass-label num">{c.number}</span>
                <button type="button" className="pass-btn" onClick={() => demo('Reloading a card')}>Reload</button>
              </div>
            </motion.div>
          ))}
        </div>
        <AddButton label="Add a card" onClick={() => demo('Adding a card')} />
      </div>
    </Section>
  );
}

// ── Cash in and transfer ──
function CashIn() {
  const demo = useDemo();
  const used = Math.round((LIMITS.used / LIMITS.total) * 100);
  const groups = [
    { title: 'Online banks', items: [['Sample Bank', 'Free, arrives in minutes'], ['Metro Savings Bank', 'Free, arrives in minutes'], ['Island Bank', '₱10 fee, arrives in minutes']] },
    { title: 'Over the counter', items: [['Corner Mart', 'Show your QR at the counter'], ['Padala Center', 'Show your QR at the counter']] },
  ];
  return (
    <>
      <motion.section {...rise(0)} className="card card-pad grid gap-3">
        <div className="flex items-baseline justify-between gap-3"><h2 className="text-base">Monthly cash-in limit</h2><span className="num text-sm" style={{ color: 'var(--muted)' }}>{used}% used</span></div>
        <div className="meter" role="img" aria-label={`${used}% of the monthly limit used`}><span style={{ width: `${used}%` }} /></div>
        <p className="num text-sm" style={{ color: 'var(--muted)' }}>{money(LIMITS.total - LIMITS.used)} left this month</p>
      </motion.section>
      {groups.map((g, i) => (
        <Section key={g.title} title={g.title} i={i + 1}>
          <div className="card">{g.items.map(([name, sub]) => <Row key={name} initials={initialsOf(name)} title={name} sub={sub} onClick={() => demo('Cashing in')} />)}</div>
        </Section>
      ))}
    </>
  );
}

function Transfer() {
  const demo = useDemo();
  const banks = ['Sample Bank', 'Metro Savings Bank', 'Island Bank', 'Rural Coop Bank', 'Harbor Trust', 'Summit Bank'];
  return (
    <>
      <Section title="Recent" i={0}>
        <div className="card">
          <Row initials="CD" title="Carla D." sub="Island Bank, •••• 0098" onClick={() => demo('Transferring to a bank')} />
          <Row initials="BN" title="Bea Navarro" sub="Sample Bank, •••• 5521" onClick={() => demo('Transferring to a bank')} />
        </div>
      </Section>
      <Section title="Choose a bank" i={1}>
        <div className="tile-grid">
          {banks.map((b) => (
            <button key={b} type="button" className="product" onClick={() => demo('Transferring to a bank')}>
              <Badge text={initialsOf(b)} />
              <span className="font-semibold">{b}</span>
            </button>
          ))}
        </div>
      </Section>
    </>
  );
}

// ── Scan QR ──
// A QR-like pattern drawn from the mobile number: three finder squares and a seeded field. Decorative, not scannable.
function QrPattern({ seed }) {
  const N = 25;
  let x = [...seed].reduce((h, c) => h * 31 + c.charCodeAt(0), 7) >>> 0;
  const rand = () => (x = (x * 1103515245 + 12345) >>> 0) % 100;
  const finder = (r, c) => [[0, 0], [0, N - 7], [N - 7, 0]].some(([fr, fc]) => r >= fr && r < fr + 7 && c >= fc && c < fc + 7);
  const cells = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!finder(r, c) && rand() < 48) cells.push(<rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" />);
  const eye = (r, c) => (
    <g key={`${r}${c}`}>
      <rect x={c} y={r} width="7" height="7" rx="1.6" />
      <rect x={c + 1} y={r + 1} width="5" height="5" rx="1" fill="var(--qr-paper)" />
      <rect x={c + 2} y={r + 2} width="3" height="3" rx="0.6" />
    </g>
  );
  return (
    <svg viewBox={`-2 -2 ${N + 4} ${N + 4}`} className="qr-code" aria-hidden="true" shapeRendering="crispEdges">
      <rect x="-2" y="-2" width={N + 4} height={N + 4} fill="var(--qr-paper)" />
      <g fill="var(--camera)">{cells}{eye(0, 0)}{eye(0, N - 7)}{eye(N - 7, 0)}</g>
    </svg>
  );
}
function Qr() {
  const demo = useDemo();
  const [tab, setTab] = useState('scan');
  return (
    <div className="grid justify-items-center gap-5">
      <Segmented label="QR" value={tab} onChange={setTab} options={[{ value: 'scan', label: 'Scan', icon: 'ScanLine' }, { value: 'mine', label: 'My QR', icon: 'QrCode' }]} />
      {tab === 'scan' ? (
        <motion.div key="scan" {...rise(0)} className="grid w-full justify-items-center gap-4">
          <div className="viewfinder" role="img" aria-label="Camera viewfinder (demo)">
            <span className="vf-corner tl" /><span className="vf-corner tr" /><span className="vf-corner bl" /><span className="vf-corner br" />
            <span className="vf-track"><span className="vf-line" /></span>
            <span className="vf-hint">Point at a CashG QR code</span>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" icon="Image" onClick={() => demo('Uploading a QR image')}>Upload QR</Button>
            <Button variant="secondary" icon="Flashlight" onClick={() => demo('The flashlight')}>Flashlight</Button>
          </div>
        </motion.div>
      ) : (
        <motion.div key="mine" {...rise(0)} className="card card-pad grid w-full justify-items-center gap-3 text-center" style={{ maxWidth: 360 }}>
          <span className="avatar" style={{ width: 56, height: 56, fontSize: 18, background: 'var(--accent-soft)', color: 'var(--accent-ink)' }}>{USER.initials}</span>
          <div><p className="font-semibold">{USER.name}</p><p className="num text-sm" style={{ color: 'var(--muted)' }}>{USER.mobile.replace(/ \d{3} /, ' ••• ')}</p></div>
          <QrPattern seed={USER.mobile} />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Let someone scan this to send you money.</p>
          <div className="flex gap-3">
            <Button variant="secondary" icon="Share2" onClick={() => demo('Sharing your QR')}>Share</Button>
            <Button variant="secondary" icon="Download" onClick={() => demo('Saving your QR')}>Save image</Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Savings ──
const GOALS = [
  { name: 'Emergency fund', icon: 'ShieldCheck', saved: 6200, target: 10000 },
  { name: 'New laptop', icon: 'Laptop', saved: 1550, target: 45000 },
  { name: 'Baguio trip', icon: 'Plane', saved: 500, target: 6000 },
];
function Savings() {
  const demo = useDemo();
  const total = GOALS.reduce((s, g) => s + g.saved, 0);
  return (
    <>
      <motion.section {...rise(0)} className="feature">
        <span className="feature-label">Savings balance</span>
        <span className="figure-lg num"><CountUp value={total} /></span>
        <span className="feature-label">Earning 2.6% a year (sample rate), about {money(total * 0.026 / 12)} this month</span>
        <div className="mt-2 flex gap-3">
          <button type="button" className="cashin" onClick={() => demo('Adding money to savings')}><Icon name="Plus" size={18} />Add money</button>
          <button type="button" className="pass-btn" onClick={() => demo('Withdrawing savings')}>Withdraw</button>
        </div>
      </motion.section>
      <Section title="Your goals" i={1}>
        <div className="grid gap-3">
          {GOALS.map((g) => {
            const ratio = g.saved / g.target;
            return (
              <button key={g.name} type="button" className="product" onClick={() => demo('Opening a goal')}>
                <div className="flex items-center gap-3"><Badge icon={g.icon} /><span className="min-w-0 flex-1 font-semibold">{g.name}</span><span className="num text-sm" style={{ color: 'var(--muted)' }}>{Math.round(ratio * 100)}%</span></div>
                <RouteLine stops={5} reached={Math.min(4, Math.floor(ratio * 4))} />
                <span className="num text-sm" style={{ color: 'var(--muted)' }}>{money(g.saved)} of {money(g.target)}</span>
              </button>
            );
          })}
          <AddButton label="Start a new goal" onClick={() => demo('Creating a goal')} />
        </div>
      </Section>
    </>
  );
}

// ── Invest ──
const SERIES = {
  '1W': [100, 101, 100.5, 102, 101.8, 103, 102.6],
  '1M': [96, 97, 96.5, 98, 99, 98.2, 99.5, 100.4, 99.8, 101, 102.3, 101.6, 102.8, 103.5, 102.9, 104, 104.6, 104.1, 105.2, 106],
  '1Y': [88, 90, 89, 92, 95, 94, 97, 99, 98, 101, 103, 106],
};
const FUNDS = [
  { name: 'Peso Money Market', risk: 'Low risk', ret: 5.1 },
  { name: 'Balanced Growth', risk: 'Medium risk', ret: 8.4 },
  { name: 'Equity Index', risk: 'Higher risk', ret: 12.7 },
];
function Chart({ values }) {
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const xy = values.map((v, i) => [(i / (values.length - 1)) * 300, 84 - ((v - min) / span) * 76]);
  const line = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  return (
    <svg viewBox="0 0 300 90" className="chart" aria-hidden="true">
      <motion.path d={`${line} L300 90 L0 90 Z`} fill="var(--accent)" fillOpacity="0.1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.4 }} />
      <motion.path d={line} fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: EASE }} />
    </svg>
  );
}
function Invest() {
  const demo = useDemo();
  const [range, setRange] = useState('1M');
  const values = SERIES[range];
  const value = 15340.2;
  const change = value - value / (values[values.length - 1] / values[0]);
  return (
    <>
      <motion.section {...rise(0)} className="card card-pad grid gap-4">
        <div>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Portfolio value</p>
          <p className="figure-lg num"><CountUp value={value} /></p>
          <p className="num text-sm font-semibold" style={{ color: 'var(--positive)' }}>+{money(change)} over {range === '1W' ? 'the past week' : range === '1M' ? 'the past month' : 'the past year'}</p>
        </div>
        <Chart key={range} values={values} />
        <Segmented label="Chart range" value={range} onChange={setRange} options={Object.keys(SERIES).map((k) => ({ value: k, label: k }))} />
      </motion.section>
      <Section title="Funds" i={1}>
        <div className="card">
          {FUNDS.map((f) => <Row key={f.name} icon="TrendingUp" title={f.name} sub={`${f.risk}, sample fund`} onClick={() => demo('Buying a fund')} end={<span className="num font-semibold" style={{ color: 'var(--positive)' }}>+{f.ret}%<span className="block text-xs font-normal" style={{ color: 'var(--muted)' }}>1 year</span></span>} />)}
        </div>
      </Section>
      <Button block onClick={() => demo('Investing')}>Invest from ₱50</Button>
    </>
  );
}

// ── Borrow ──
function Borrow() {
  const demo = useDemo();
  const limit = 10000;
  const used = 2500;
  return (
    <>
      <motion.section {...rise(0)} className="feature">
        <span className="feature-label">Available credit</span>
        <span className="figure-lg num"><CountUp value={limit - used} /></span>
        <div className="meter on-dark" role="img" aria-label={`${money(used)} of ${money(limit)} used`}><motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.7, ease: EASE }} style={{ width: `${(used / limit) * 100}%`, transformOrigin: 'left' }} /></div>
        <span className="feature-label num">{money(used)} used of {money(limit)}</span>
      </motion.section>
      <Section title="Coming up" i={1}>
        <div className="card">
          <Row icon="CalendarClock" title="Dec 5 payment" sub="Grocery purchase, 1 of 2" end={<span className="num font-semibold">{money(1250)}</span>} onClick={() => demo('Paying early')} />
          <Row icon="CalendarClock" title="Jan 5 payment" sub="Grocery purchase, 2 of 2" end={<span className="num font-semibold">{money(1250)}</span>} onClick={() => demo('Paying early')} />
        </div>
      </Section>
      <Button block onClick={() => demo('Using your credit')}>Use credit at checkout</Button>
    </>
  );
}

// ── Insurance ──
function Insure() {
  const demo = useDemo();
  const plans = [
    { name: 'Health', icon: 'HeartPulse', cover: 'Hospital cash up to ₱20,000', price: 99 },
    { name: 'Travel', icon: 'Plane', cover: 'Trip delays and lost bags', price: 45 },
    { name: 'Gadget', icon: 'Smartphone', cover: 'Screen and theft cover', price: 129 },
    { name: 'Accident', icon: 'ShieldPlus', cover: 'Up to ₱100,000 cover', price: 35 },
  ];
  return (
    <Section title="Plans" i={0}>
      <div className="tile-grid">
        {plans.map((p) => (
          <div key={p.name} className="product">
            <Badge icon={p.icon} />
            <span className="font-semibold">{p.name}</span>
            <span className="row-sub">{p.cover}</span>
            <span><span className="product-price num">{money(p.price)}</span><span className="row-sub"> a month</span></span>
            <Button size="sm" variant="secondary" onClick={() => demo('Getting covered')}>Get covered</Button>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ── Rewards, shop, games, donate ──
function Rewards() {
  const demo = useDemo();
  const vouchers = [...NOTICES.filter((n) => n.tab === 'offers').map((n) => ({ name: n.title.replace('Sample promo: ', ''), cost: 300 })), { name: '₱50 off coffee', cost: 250 }, { name: 'Free movie ticket', cost: 900 }];
  return (
    <>
      <motion.section {...rise(0)} className="feature">
        <span className="feature-label">Your points</span>
        <span className="figure-lg num"><CountUp value={1240} format={points} /></span>
        <span className="feature-label">You earn 1 point for every ₱200 you pay.</span>
      </motion.section>
      <Section title="Redeem" i={1}>
        <div className="tile-grid">
          {vouchers.map((v) => (
            <div key={v.name} className="product">
              <Badge icon="Gift" />
              <span className="font-semibold cap">{v.name}</span>
              <span className="row-sub num">{points(v.cost)} points</span>
              <Button size="sm" variant="secondary" disabled={v.cost > 1240} onClick={() => demo('Redeeming points')}>{v.cost > 1240 ? 'Not enough points' : 'Redeem'}</Button>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

const CATALOG = {
  shop: { title: 'Vouchers', action: 'Buying a voucher', button: 'Buy', items: [['Corner Coffee', 'Coffee', '₱150 voucher', 150], ['FreshMart', 'ShoppingBasket', '₱500 grocery voucher', 500], ['CineHouse', 'Clapperboard', 'One movie pass', 280], ['QuickEats', 'UtensilsCrossed', '₱200 food delivery', 200]] },
  games: { title: 'Play and earn', action: 'Playing a game', button: 'Play', items: [['Daily spin', 'Dices', 'Win up to 50 points', 0], ['Coin catch', 'Coins', 'Catch coins for points', 0], ['Quiz night', 'Puzzle', 'Ten money questions', 0]] },
};
function Catalog({ id }) {
  const demo = useDemo();
  const c = CATALOG[id];
  return (
    <Section title={c.title} i={0}>
      <div className="tile-grid">
        {c.items.map(([name, icon, sub, price]) => (
          <div key={name} className="product">
            <Badge icon={icon} />
            <span className="font-semibold">{name}</span>
            <span className="row-sub">{sub}</span>
            {price > 0 && <span className="product-price num">{money(price)}</span>}
            <Button size="sm" variant="secondary" onClick={() => demo(c.action)}>{c.button}</Button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Donate() {
  const demo = useDemo();
  const causes = [
    { name: 'Typhoon relief packs', icon: 'CloudRain', raised: 182400, goal: 250000 },
    { name: 'School supplies drive', icon: 'Backpack', raised: 64100, goal: 80000 },
    { name: 'Mangrove planting', icon: 'Leaf', raised: 21900, goal: 60000 },
  ];
  return (
    <Section title="Causes" i={0}>
      <div className="grid gap-3">
        {causes.map((c) => {
          const pct = Math.round((c.raised / c.goal) * 100);
          return (
            <div key={c.name} className="product">
              <div className="flex items-center gap-3"><Badge icon={c.icon} /><span className="min-w-0 flex-1 font-semibold">{c.name}</span><span className="num text-sm" style={{ color: 'var(--muted)' }}>{pct}%</span></div>
              <div className="meter" role="img" aria-label={`${pct}% of the goal raised`}><span style={{ width: `${pct}%` }} /></div>
              <div className="flex items-center justify-between gap-3">
                <span className="num text-sm" style={{ color: 'var(--muted)' }}>{money(c.raised)} of {money(c.goal)}</span>
                <Button size="sm" onClick={() => demo('Donating')}>Donate</Button>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

const PAGES = {
  cashin: CashIn, bank: Transfer, qr: Qr, bills: Bills, load: Load, transport: Transport, save: Savings,
  invest: Invest, credit: Borrow, insure: Insure, rewards: Rewards, donate: Donate,
  shop: () => <Catalog id="shop" />, games: () => <Catalog id="games" />,
};

export function ServicePage() {
  const { id } = useParams();
  const service = ALL_SERVICES.find((s) => s.id === id);
  const Body = PAGES[id];
  if (!service || !Body) {
    return (
      <Page title="Service not found" narrow back="/services">
        <div className="card"><Empty icon="Compass" title="We could not find that service" action={<Link className="btn primary" to="/services">See all services</Link>} /></div>
      </Page>
    );
  }
  return (
    <Page title={service.label} subtitle={service.about} notes="servicepage" narrow back>
      <div className="grid gap-8">
        <Body />
        <p className="text-sm" data-note="demo" style={{ color: 'var(--muted)' }}>Design demonstration. Names, rates and balances on this page are samples, and no button here moves money.</p>
      </div>
    </Page>
  );
}
