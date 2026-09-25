import { DIMENSIONS } from '@/constants/content';
import { PROFESSIONALS } from '@/constants/workspace-data';
import { SPEND } from '@/constants/workspace-data';
import { IconGlyph } from '@/components/ui/Icon';
import type { DeliveryPod, Professional, SpendMonth } from '@/types';

const F = { fontFamily: 'Inter, sans-serif' };
const NAVY = '#151132';
const BLUE = '#5B4BE8';
const GREY = '#E4E1F1';
const LGREY = '#F7F6FC';
const SLATE = '#5D5880';

function DropShadow({ id }: { id: string }) {
  return (
    <filter id={id} x="-20%" y="-30%" width="140%" height="170%">
      <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#151132" floodOpacity="0.09" />
    </filter>
  );
}

function IconCircle({
  x,
  y,
  fill,
  name,
}: {
  x: number;
  y: number;
  fill: string;
  name: string;
}) {
  return (
    <>
      <circle cx={x} cy={y} r="15" fill={fill} />
      <g
        transform={`translate(${x - 9} ${y - 9})`}
        stroke="#fff"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <IconGlyph name={name} />
      </g>
    </>
  );
}

export function HeroDiagram() {
  const box = (x: number, label: string, eyebrow: string, sub: string, icon: string, accent: string) => (
    <g key={label}>
      <rect x={x} y="40" width="160" height="118" rx="12" fill="#fff" stroke={GREY} filter="url(#heroSh)" />
      <rect x={x} y="40" width="160" height="4" rx="2" fill={accent} />
      <circle cx={x + 30} cy="72" r="16" fill={accent === NAVY ? NAVY : '#EAF2FD'} />
      <g
        transform={`translate(${x + 30 - 9} ${72 - 9})`}
        stroke={accent === NAVY ? '#fff' : accent}
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <IconGlyph name={icon} />
      </g>
      <text x={x + 56} y="68" fontSize="10" fontWeight="700" fill={accent} letterSpacing=".5">
        {eyebrow}
      </text>
      <text x={x + 56} y="83" fontSize="12.5" fontWeight="700" fill={NAVY}>
        {label}
      </text>
      <text x={x + 18} y="112" fontSize="11" fill={SLATE}>
        {sub}
      </text>
    </g>
  );

  return (
    <svg className="d" viewBox="0 0 560 300" style={F}>
      <defs>
        <DropShadow id="heroSh" />
      </defs>
      {box(20, 'The answer', 'CONSULTING', 'Architecture, strategy', 'search', BLUE)}
      {box(200, 'The outcome', 'MANAGED SERVICES', 'Team plus governance', 'layers', NAVY)}
      {box(380, 'The capacity', 'TALENT SOLUTIONS', 'Direct engagement', 'users', BLUE)}
      <path
        d="M100 158 V190 Q100 218 150 218"
        fill="none"
        stroke={GREY}
        strokeWidth="2"
        strokeDasharray="5 5"
      >
        <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1.2s" repeatCount="indefinite" />
      </path>
      <path d="M280 158 V218" fill="none" stroke={GREY} strokeWidth="2" strokeDasharray="5 5">
        <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1.2s" repeatCount="indefinite" />
      </path>
      <path
        d="M460 158 V190 Q460 218 410 218"
        fill="none"
        stroke={GREY}
        strokeWidth="2"
        strokeDasharray="5 5"
      >
        <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1.2s" repeatCount="indefinite" />
      </path>
      <rect x="150" y="222" width="260" height="70" rx="10" fill={NAVY} filter="url(#heroSh)" />
      <text x="280" y="247" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">
        One partner, three ways in
      </text>
      <text x="280" y="265" textAnchor="middle" fontSize="10" fill="#B9C6DC">
        Evaluated professionals · governed delivery
      </text>
      <text x="280" y="278" textAnchor="middle" fontSize="10" fill="#B9C6DC">
        specialist advice
      </text>
    </svg>
  );
}

export function EngineDiagram() {
  return (
    <svg className="d" viewBox="0 0 700 260" style={F}>
      <defs>
        <DropShadow id="engSh" />
      </defs>
      <rect x="20" y="20" width="200" height="70" rx="10" fill="#fff" stroke={GREY} filter="url(#engSh)" />
      <IconCircle x={50} y={55} fill={BLUE} name="search" />
      <text x="72" y="50" fontSize="12" fontWeight="700" fill={BLUE}>
        Technology Consulting
      </text>
      <text x="72" y="68" fontSize="10.5" fill={SLATE}>
        The answer
      </text>
      <rect x="250" y="20" width="200" height="70" rx="10" fill="#fff" stroke={GREY} filter="url(#engSh)" />
      <IconCircle x={280} y={55} fill={NAVY} name="layers" />
      <text x="302" y="50" fontSize="12" fontWeight="700" fill={NAVY}>
        Managed Services
      </text>
      <text x="302" y="68" fontSize="10.5" fill={SLATE}>
        The outcome
      </text>
      <rect x="480" y="20" width="200" height="70" rx="10" fill="#fff" stroke={GREY} filter="url(#engSh)" />
      <IconCircle x={510} y={55} fill={BLUE} name="users" />
      <text x="532" y="50" fontSize="12" fontWeight="700" fill={BLUE}>
        Talent Solutions
      </text>
      <text x="532" y="68" fontSize="10.5" fill={SLATE}>
        The capacity
      </text>
      <path
        d="M120 90 V120 Q120 140 200 140 H500 Q580 140 580 120 V90"
        fill="none"
        stroke={GREY}
        strokeWidth="2"
        strokeDasharray="5 5"
      >
        <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1.4s" repeatCount="indefinite" />
      </path>
      <path d="M350 90 V140" fill="none" stroke={GREY} strokeWidth="2" strokeDasharray="5 5">
        <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1.4s" repeatCount="indefinite" />
      </path>
      <rect x="150" y="150" width="400" height="60" rx="10" fill={NAVY} filter="url(#engSh)" />
      <IconCircle x={180} y={180} fill={BLUE} name="community" />
      <text x="205" y="176" fontSize="13" fontWeight="700" fill="#fff">
        Technology Communities
      </text>
      <text x="205" y="194" fontSize="10.5" fill="#B9C6DC">
        The shared capability engine
      </text>
      <path d="M350 210 V232" stroke={GREY} strokeWidth="2" />
      <text x="350" y="252" textAnchor="middle" fontSize="11" fill={SLATE} fontStyle="italic">
        Five specialist communities, one engine, three ways in.
      </text>
    </svg>
  );
}

export function ReqFlowDiagram() {
  const steps = [
    'Client Requirement',
    'Relevant Community',
    'Specialist Capability',
    'Consulting / Managed Services / Talent Solutions',
  ];
  const W = 900;
  const n = steps.length;
  const gap = 8;
  const segW = (W - 20 - (n - 1) * gap) / n;

  return (
    <svg className="d" viewBox={`0 0 ${W} 110`} style={F}>
      {steps.map((step, i) => {
        const x = 10 + i * (segW + gap);
        const words = step.split(' ');
        const chunks: string[] = [];
        let line = '';
        words.forEach((word) => {
          if ((`${line} ${word}`).trim().length > 16 && line) {
            chunks.push(line);
            line = word;
          } else {
            line = line ? `${line} ${word}` : word;
          }
        });
        chunks.push(line);
        const cy = 55 - (chunks.length - 1) * 13;
        return (
          <g key={step}>
            <rect
              x={x}
              y="18"
              width={segW}
              height="72"
              rx="9"
              fill={i === 0 ? LGREY : i === n - 1 ? NAVY : '#fff'}
              stroke={GREY}
            />
            {chunks.map((chunk, j) => (
              <text
                key={chunk}
                x={x + segW / 2}
                y={cy + j * 15}
                textAnchor="middle"
                fontSize="11.5"
                fontWeight="700"
                fill={i === n - 1 ? '#fff' : NAVY}
              >
                {chunk}
              </text>
            ))}
            {i < n - 1 ? (
              <text x={x + segW + gap / 2} y="58" textAnchor="middle" fontSize="14" fill={SLATE}>
                →
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

export function LifeDiagram() {
  const phases = [
    'Mobilize',
    'Transition & Establish',
    'Operate & Deliver',
    'Improve & Scale',
    'Transition, where required',
  ];
  const W = 900;
  const n = phases.length;
  const gap = 6;
  const segW = (W - 20 - (n - 1) * gap) / n;

  return (
    <svg className="d" viewBox={`0 0 ${W} 100`} style={F}>
      {phases.map((phase, i) => {
        const x = 10 + i * (segW + gap);
        const words = phase.split(' ');
        const mid = Math.ceil(words.length / 2);
        const l1 = words.slice(0, mid).join(' ');
        const l2 = words.slice(mid).join(' ');
        return (
          <g key={phase}>
            <path
              d={`M${x} 16 H${x + segW - 22} L${x + segW} 50 L${x + segW - 22} 84 H${x} L${x + 22} 50 Z`}
              fill={i % 2 ? LGREY : '#fff'}
              stroke={GREY}
            />
            <text x={x + segW / 2} y={l2 ? 44 : 50} textAnchor="middle" fontSize="12" fontWeight="700" fill={NAVY}>
              {l1}
            </text>
            {l2 ? (
              <text x={x + segW / 2} y="60" textAnchor="middle" fontSize="12" fontWeight="700" fill={NAVY}>
                {l2}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

export function TrialDiagram() {
  const steps = [
    ['Select', 'Any available professional'],
    ['Define', 'Task, criteria, named contact'],
    ['Complete', 'The agreed task, within scope'],
    ['Decide', 'Continue, alternate, or stop'],
  ];
  return (
    <svg className="d" viewBox="0 0 560 280" style={F}>
      <rect x="20" y="20" width="520" height="72" rx="8" fill={NAVY} />
      <text x="280" y="50" textAnchor="middle" fontSize="22" fontWeight="700" fill="#fff">
        Up to 10 hours
      </text>
      <text x="280" y="74" textAnchor="middle" fontSize="11.5" fill="#B9C6DC">
        paid by BesTal for eligible engagements - work product is yours either way
      </text>
      {steps.map(([title, desc], i) => (
        <g key={title}>
          <rect x={20 + i * 132} y="118" width="124" height="112" rx="8" fill={LGREY} stroke={GREY} />
          <text x={82 + i * 132} y="146" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={SLATE}>
            STEP {i + 1}
          </text>
          <text x={82 + i * 132} y="170" textAnchor="middle" fontSize="14" fontWeight="700" fill={NAVY}>
            {title}
          </text>
          <text x={82 + i * 132} y="196" textAnchor="middle" fontSize="10" fill={SLATE}>
            {desc}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function FunnelDiagram() {
  const rows: [string, number, string][] = [
    ['Applications', 480, 'send'],
    ['Screened by community', 380, 'eye'],
    ['Assessed by specialist', 280, 'clipboard_check'],
    ['Verified', 190, 'shield'],
    ['Published, visible to clients', 110, 'check_circle'],
  ];
  const W = 640;
  const C = 320;
  return (
    <svg className="d" viewBox={`0 0 ${W} 300`} style={F}>
      <defs>
        <filter id="funSh" x="-20%" y="-40%" width="140%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#151132" floodOpacity="0.11" />
        </filter>
      </defs>
      {rows.map(([label, width, icon], i) => {
        const y = 14 + i * 56;
        const x = (W - width) / 2;
        const fill = i === 4 ? BLUE : i >= 2 ? BLUE : LGREY;
        const txt = i >= 2 || i === 4 ? '#fff' : NAVY;
        const approxW = label.length * 6.6;
        const fitsInside = approxW + 38 < width;
        const tx = fitsInside ? C + 13 : x + width + 16 + 24;
        const ix = fitsInside ? C - approxW / 2 - 16 : x + width + 16;
        const ta = fitsInside ? 'middle' : 'start';
        const labelFill = fitsInside ? txt : NAVY;
        return (
          <g key={label}>
            <rect
              x={x}
              y={y}
              width={width}
              height="44"
              rx="8"
              fill={fill}
              stroke={i < 2 ? GREY : 'none'}
              filter="url(#funSh)"
            />
            {!fitsInside ? (
              <line
                x1={x + width}
                y1={y + 22}
                x2={ix - 6}
                y2={y + 22}
                stroke={GREY}
                strokeWidth="1.5"
                strokeDasharray="2 3"
              />
            ) : null}
            <g
              transform={`translate(${ix - 9} ${y + 22 - 9})`}
              stroke={labelFill}
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <IconGlyph name={icon} />
            </g>
            <text x={tx} y={y + 27} textAnchor={ta} fontSize="12" fontWeight="700" fill={labelFill}>
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function VelocityDiagram({ pod }: { pod: DeliveryPod }) {
  if (!pod.velocity.length) {
    return <p style={{ fontSize: 13.5, color: 'var(--muted)' }}>No sprint history yet for this engagement.</p>;
  }
  const W = 560;
  const H = 260;
  const n = pod.velocity.length;
  const mx = Math.max(...pod.velocity) * 1.15;
  const x = (i: number) => 50 + i * ((W - 80) / Math.max(1, n - 1));
  const y = (v: number) => H - 50 - (v / mx) * (H - 90);

  return (
    <svg className="d" viewBox={`0 0 ${W} ${H}`} style={F}>
      <text x="20" y="22" fontSize="12" fontWeight="700" fill={NAVY}>
        {pod.name} - illustrative delivery trend
      </text>
      {pod.velocity.map((v, i) => (
        <g key={i}>
          <rect
            x={x(i) - 14}
            y={y(v)}
            width="28"
            height={H - 50 - y(v)}
            rx="4"
            fill={pod.commit[i] >= 0.85 ? BLUE : BLUE}
          />
          <text x={x(i)} y={y(v) - 6} textAnchor="middle" fontSize="10" fill={SLATE}>
            {v}
          </text>
          <text x={x(i)} y={H - 32} textAnchor="middle" fontSize="10" fill={SLATE}>
            S{i + 1}
          </text>
          <text x={x(i)} y={H - 16} textAnchor="middle" fontSize="9.5" fill={SLATE}>
            {Math.round(pod.commit[i] * 100)}%
          </text>
        </g>
      ))}
      <text x={W - 20} y="22" textAnchor="end" fontSize="10" fill={SLATE}>
        bars: points, % = commitment met
      </text>
    </svg>
  );
}

export function PodDiagram({ pod }: { pod: DeliveryPod }) {
  const team = pod.team.filter((i) => i !== pod.lead);
  const W = 560;
  const lead = pod.team.length ? PROFESSIONALS[pod.lead] : null;
  return (
    <svg className="d" viewBox={`0 0 ${W} 320`} style={F}>
      <rect x="200" y="14" width="160" height="48" rx="8" fill={NAVY} />
      <text x="280" y="34" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#fff">
        Your product owner
      </text>
      <text x="280" y="50" textAnchor="middle" fontSize="10" fill="#B9C6DC">
        {pod.owner} - sets priorities
      </text>
      <line x1="280" y1="62" x2="280" y2="94" stroke={GREY} strokeWidth="2" />
      <rect x="200" y="94" width="160" height="50" rx="8" fill={BLUE} />
      <text x="280" y="115" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#fff">
        Delivery lead - {lead?.name ?? 'TBC'}
      </text>
      <text x="280" y="131" textAnchor="middle" fontSize="10" fill="#DCEBFA">
        {lead ? `Passport ${lead.score} - runs delivery` : 'To be confirmed'}
      </text>
      <rect x="400" y="94" width="140" height="50" rx="8" fill="#fff" stroke={GREY} />
      <text x="470" y="115" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={NAVY}>
        Delivery manager
      </text>
      <text x="470" y="131" textAnchor="middle" fontSize="10" fill={SLATE}>
        fractional, governance
      </text>
      <line x1="360" y1="119" x2="400" y2="119" stroke={GREY} strokeWidth="2" strokeDasharray="4 3" />
      {team.map((ti, i) => {
        const e = PROFESSIONALS[ti];
        const n = team.length;
        const x = 280 - (n - 1) * 60 + i * 120;
        return (
          <g key={ti}>
            <line x1="280" y1="144" x2={x} y2="190" stroke={GREY} strokeWidth="2" />
            <rect x={x - 52} y="190" width="104" height="84" rx="8" fill={LGREY} />
            <circle cx={x} cy="216" r="15" fill={['#0B1F3A', '#0B66C3', '#25507A', '#5B6B82'][ti % 4]} />
            <text x={x} y="221" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#fff">
              {e.initials}
            </text>
            <text x={x} y="245" textAnchor="middle" fontSize="10" fontWeight="700" fill={NAVY}>
              {e.name}
            </text>
            <text x={x} y="259" textAnchor="middle" fontSize="9.5" fill={BLUE}>
              Passport {e.score}
            </text>
          </g>
        );
      })}
      <text x="280" y="304" textAnchor="middle" fontSize="10.5" fill={SLATE} fontStyle="italic">
        Team composition is shaped around scope and technology requirements.
      </text>
    </svg>
  );
}

export function RadarDiagram({ professional }: { professional: Professional }) {
  const cx = 180;
  const cy = 150;
  const R = 100;
  const n = 5;
  const pt = (i: number, r: number): [number, number] => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const ring = (r: number) =>
    Array.from({ length: n }, (_, i) => pt(i, r).join(',')).join(' ');
  const vals = professional.dimensions.map((v, i) => pt(i, (R * v) / 10).join(',')).join(' ');

  return (
    <svg className="d" viewBox="0 0 360 300" style={F}>
      {[0.25, 0.5, 0.75, 1].map((k) => (
        <polygon key={k} points={ring(R * k)} fill="none" stroke={GREY} />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const [x, y] = pt(i, R);
        const [lx, ly] = pt(i, R + 26);
        return (
          <g key={DIMENSIONS[i]}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke={GREY} />
            <text x={lx} y={ly + 4} textAnchor="middle" fontSize="10.5" fill={SLATE}>
              {DIMENSIONS[i]}
            </text>
          </g>
        );
      })}
      <polygon points={vals} fill="rgba(11,102,195,.15)" stroke={BLUE} strokeWidth="2.5" />
      {professional.dimensions.map((v, i) => {
        const [x, y] = pt(i, (R * v) / 10);
        return <circle key={i} cx={x} cy={y} r="4" fill="#fff" stroke={BLUE} strokeWidth="2.5" />;
      })}
      <text x={cx} y="288" textAnchor="middle" fontSize="12" fontWeight="700" fill={NAVY}>
        {professional.name} - {professional.score}/100
      </text>
    </svg>
  );
}

export function StackedSpendDiagram({ spend = SPEND }: { spend?: SpendMonth[] }) {
  const W = 560;
  const H = 240;
  const mx = 150;
  const x = (i: number) => 50 + i * 84;
  const sc = (v: number) => (v / mx) * (H - 70);
  return (
    <svg className="d" viewBox={`0 0 ${W} ${H}`} style={F}>
      {spend.map((s, i) => {
        let y = H - 40;
        const layers: [number, string][] = [
          [s.talent, BLUE],
          [s.delivery, BLUE],
          [s.consulting, NAVY],
        ];
        return (
          <g key={s.month}>
            {layers.map(([value, col], li) => {
              const h = sc(value);
              y -= h;
              return h ? <rect key={li} x={x(i) - 22} y={y} width="44" height={h} fill={col} /> : null;
            })}
            <text x={x(i)} y={H - 22} textAnchor="middle" fontSize="10.5" fill={SLATE}>
              {s.month}
            </text>
            <text
              x={x(i)}
              y={H - 40 - sc(s.consulting + s.delivery + s.talent) - 6}
              textAnchor="middle"
              fontSize="10"
              fill={SLATE}
            >
              ${(s.consulting + s.delivery + s.talent).toFixed(0)}k
            </text>
          </g>
        );
      })}
      <g fontSize="10.5">
        <rect x={W - 190} y="10" width="10" height="10" rx="2" fill={NAVY} />
        <text x={W - 175} y="19" fill={SLATE}>
          Consulting
        </text>
        <rect x={W - 115} y="10" width="10" height="10" rx="2" fill={BLUE} />
        <text x={W - 100} y="19" fill={SLATE}>
          Delivery
        </text>
        <rect x={W - 50} y="10" width="10" height="10" rx="2" fill={BLUE} />
        <text x={W - 35} y="19" fill={SLATE}>
          Talent
        </text>
      </g>
    </svg>
  );
}

export function DistDiagram({ professionals = PROFESSIONALS }: { professionals?: Professional[] }) {
  const dist = [0, 0, 0, 0, 0];
  professionals.forEach((e) => {
    dist[Math.min(4, Math.floor((e.score - 75) / 5))] += 1;
  });
  const dm = Math.max(...dist, 1);
  const W = 560;
  const H = 200;
  return (
    <svg className="d" viewBox={`0 0 ${W} ${H}`} style={F}>
      {dist.map((n, i) => (
        <g key={i}>
          <rect
            x={40 + i * 104}
            y={H - 30 - (n / dm) * (H - 60)}
            width="70"
            height={(n / dm) * (H - 60)}
            rx="6"
            fill={i >= 3 ? BLUE : LGREY}
            stroke={GREY}
          />
          <text x={75 + i * 104} y={H - 36 - (n / dm) * (H - 60)} textAnchor="middle" fontSize="11" fill={SLATE}>
            {n}
          </text>
          <text x={75 + i * 104} y={H - 12} textAnchor="middle" fontSize="10.5" fill={SLATE}>
            {75 + i * 5}-{79 + i * 5}
          </text>
        </g>
      ))}
    </svg>
  );
}
