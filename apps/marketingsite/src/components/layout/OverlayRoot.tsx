import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DIMENSIONS, STAGES, ZONES } from '@/constants/content';
import { PROFESSIONALS } from '@/constants/workspace-data';
import { ROUTES } from '@/constants/routes';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { Passport, ProfileHead } from '@/components/workspace/Passport';
import { availabilityLabel } from '@/utils/advisor';
import { Avatar } from '@/components/workspace/Avatar';
import { PodDiagram, RadarDiagram, VelocityDiagram } from '@/components/diagrams/Diagrams';
import { useApp } from '@/context/app-context';
import { submitEnquiry } from '@/services/contact.service';
import type { RequestKind } from '@/types';

function Tabs({ labels, active, onChange }: { labels: string[]; active: number; onChange: (i: number) => void }) {
  return (
    <div className="tabs">
      {labels.map((label, i) => (
        <button key={label} type="button" className={active === i ? 'on' : ''} onClick={() => onChange(i)}>
          {label}
        </button>
      ))}
    </div>
  );
}

function ProfileDrawer({ index }: { index: number }) {
  const { shortlist, toggleShortlist, addToTeam, openModal } = useApp();
  const [tab, setTab] = useState(0);
  const professional = PROFESSIONALS[index];
  return (
    <>
      <Chip>Demo profile - illustrative</Chip>
      <div style={{ marginTop: 12 }}>
        <ProfileHead professional={professional} />
      </div>
      <Tabs labels={['Passport', 'Radar', 'About', 'Verification']} active={tab} onChange={setTab} />
      <div className={tab === 0 ? 'tabp on' : 'tabp'}>
        <Passport professional={professional} />
      </div>
      <div className={tab === 1 ? 'tabp on' : 'tabp'}>
        <RadarDiagram professional={professional} />
      </div>
      <div className={tab === 2 ? 'tabp on' : 'tabp'}>
        <div className="kv">
          <div>
            <span>Community</span>
            <b>{professional.community}</b>
          </div>
          <div>
            <span>Working hours</span>
            <b>{professional.zone}</b>
          </div>
          <div>
            <span>Availability</span>
            <b>{availabilityLabel(professional.availableInDays)}</b>
          </div>
          <div>
            <span>Models</span>
            <b>{professional.models.join(', ')}</b>
          </div>
          <div>
            <span>Rate</span>
            <b>${professional.rate}/hr, fixed at contract</b>
          </div>
          <div>
            <span>Experience</span>
            <b>
              {professional.years} years · {professional.city}
            </b>
          </div>
        </div>
        <p style={{ fontSize: 13.5 }}>
          <b style={{ color: 'var(--navy)' }}>A trial with {professional.name.split(' ')[0]} could look like:</b> up
          to 10 hours on an agreed task, a named contact on your side, a brief check-in. Work product is yours
          either way.
        </p>
      </div>
      <div className={tab === 3 ? 'tabp on' : 'tabp'}>
        <div className="ver">
          <div>
            Identity - confirmed against a live capture<span className="ok">Verified</span>
          </div>
          <div>
            Education - {professional.education}
            <span className="ok">Verified</span>
          </div>
          <div>
            Employment - {professional.employment}
            <span className="ok">Verified</span>
          </div>
          <div>
            Working hours - agreed for this engagement<span className="ok">Confirmed</span>
          </div>
        </div>
        <p style={{ fontSize: 12.5 }}>
          Status only. Documents are held in access-controlled storage and never shared with clients.
        </p>
      </div>
      <div className="df" style={{ margin: '18px -22px -22px' }}>
        <Button variant="goldb" onClick={() => openModal({ type: 'trial', index })}>
          Request 10-Hour Trial
        </Button>
        <Button variant="outline" onClick={() => toggleShortlist(index)}>
          {shortlist.includes(index) ? 'Remove from shortlist' : 'Save to shortlist'}
        </Button>
        <Button variant="outline" onClick={() => addToTeam(index)}>
          + Team
        </Button>
      </div>
    </>
  );
}

function PodDrawer({ index }: { index: number }) {
  const { pods, openDrawer, toast } = useApp();
  const [tab, setTab] = useState(0);
  const pod = pods[index];
  return (
    <>
      <span className={`st ${pod.status === 'green' ? 'st-g' : pod.status === 'amber' ? 'st-a' : 'st-n'}`}>
        {pod.status === 'green' ? 'On track' : pod.status === 'amber' ? 'At risk - plan adjusted' : 'Requested'}
      </span>
      <Tabs labels={['Team', 'Health', 'Governance']} active={tab} onChange={setTab} />
      <div className={tab === 0 ? 'tabp on' : 'tabp'}>
        {pod.team.length ? <PodDiagram pod={pod} /> : <p style={{ fontSize: 13.5 }}>Team not yet confirmed.</p>}
        <div style={{ marginTop: 10 }}>
          {pod.team.map((ti) => {
            const professional = PROFESSIONALS[ti];
            return (
              <div className="row" key={ti} style={{ cursor: 'pointer' }} onClick={() => openDrawer({ type: 'profile', index: ti })}>
                <Avatar professional={professional} />
                <div style={{ flex: 1 }}>
                  <b>{professional.name}</b>
                  {ti === pod.lead ? <span className="st st-b" style={{ marginLeft: 6 }}>Lead</span> : null}
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {professional.role} · Passport {professional.score} · {professional.zone}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={(event) => {
                    event.stopPropagation();
                    toast(`Transition requested for ${professional.name}`);
                  }}
                >
                  Request change
                </Button>
              </div>
            );
          })}
        </div>
      </div>
      <div className={tab === 1 ? 'tabp on' : 'tabp'}>
        <VelocityDiagram pod={pod} />
        {pod.status === 'amber' ? (
          <div className="panel" style={{ marginTop: 10, background: 'var(--warn-t)' }}>
            <h4>Why this engagement is at risk</h4>
            <p style={{ fontSize: 13.5, marginTop: 4 }}>
              Sprint 3 commitment 88%. Root cause: scope grew mid-sprint. Adjustment: scope frozen at sprint start
              going forward.
            </p>
          </div>
        ) : null}
      </div>
      <div className={tab === 2 ? 'tabp on' : 'tabp'}>
        <table className="sla">
          <thead>
            <tr>
              <th>Indicator</th>
              <th>Illustrative target</th>
              <th>This sprint</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Commitment met</td>
              <td>≥85%</td>
              <td>{pod.commit.length ? `${Math.round(pod.commit[pod.commit.length - 1] * 100)}%` : '-'}</td>
            </tr>
            <tr>
              <td>Escaped defects</td>
              <td>Low, none critical</td>
              <td>None this sprint</td>
            </tr>
            <tr>
              <td>Review turnaround</td>
              <td>Within 1 business day</td>
              <td>0.6 days</td>
            </tr>
            <tr>
              <td>Delivery reporting</td>
              <td>Agreed cadence</td>
              <td>On time</td>
            </tr>
          </tbody>
        </table>
        <p style={{ fontSize: 12, marginTop: 10 }}>
          Delivery metrics and service levels are agreed per engagement and set out in the statement of work.
        </p>
      </div>
    </>
  );
}

function RequestDetail({ index }: { index: number }) {
  const { requests, moveRequest, openDrawer, closeOverlays, toast } = useApp();
  const request = requests[index];
  return (
    <>
      <span className="st st-b">{STAGES[request.stage]}</span>
      <div className="kv" style={{ marginTop: 14 }}>
        <div>
          <span>Type</span>
          <b>{request.type}</b>
        </div>
        <div>
          <span>Owner</span>
          <b>{request.owner}</b>
        </div>
        <div>
          <span>Timeline</span>
          <b>{request.due}</b>
        </div>
      </div>
      <div className="panel" style={{ marginTop: 12 }}>
        <h4>Proposed team</h4>
        {[6, 0].map((ti) => (
          <div className="row" key={ti}>
            <Avatar professional={PROFESSIONALS[ti]} />
            <div style={{ flex: 1 }}>
              <b>{PROFESSIONALS[ti].name}</b>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                {PROFESSIONALS[ti].role} · Passport {PROFESSIONALS[ti].score}
              </div>
            </div>
            <Button variant="outline" size="xs" onClick={() => openDrawer({ type: 'profile', index: ti })}>
              Passport
            </Button>
          </div>
        ))}
      </div>
      <div className="df" style={{ margin: '18px -22px -22px' }}>
        <Button
          variant="primary"
          onClick={() => {
            toast('Proposal accepted - kickoff to be scheduled');
            moveRequest(index);
            closeOverlays();
          }}
        >
          Accept proposal
        </Button>
        <Button variant="outline" onClick={() => toast('Question sent to the engagement lead')}>
          Ask a question
        </Button>
      </div>
    </>
  );
}

function ShortlistDrawer() {
  const { shortlist, toggleShortlist, openModal, toast, closeOverlays } = useApp();
  return (
    <>
      {shortlist.length ? (
        shortlist.map((i) => (
          <div className="row" key={i}>
            <Avatar professional={PROFESSIONALS[i]} />
            <div>
              <b>{PROFESSIONALS[i].name}</b>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                {PROFESSIONALS[i].role} · ${PROFESSIONALS[i].rate}/hr · {PROFESSIONALS[i].zone}
              </div>
            </div>
            <Button variant="outline" size="xs" style={{ marginLeft: 'auto' }} onClick={() => toggleShortlist(i)}>
              Remove
            </Button>
          </div>
        ))
      ) : (
        <div className="empty" style={{ border: 0 }}>
          <h3>Nothing saved yet</h3>
          <p style={{ marginTop: 6, fontSize: 14 }}>
            Save professionals from Technology Professionals, then compare or request trials.
          </p>
        </div>
      )}
      {shortlist.length ? (
        <div className="df" style={{ margin: '18px -22px -22px' }}>
          <Button
            variant="outline"
            disabled={shortlist.length < 2}
            onClick={() => openModal({ type: 'compare' })}
          >
            Compare
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              toast(`Trial requests started for ${shortlist.length}`);
              closeOverlays();
            }}
          >
            Request trials
          </Button>
        </div>
      ) : null}
    </>
  );
}

function CompareModal() {
  const { compare } = useApp();
  const selected = compare.map((i) => PROFESSIONALS[i]);
  const highlight = (values: number[], high = true) => {
    const target = high ? Math.max(...values) : Math.min(...values);
    return values.map((value) => value === target);
  };
  const rows: { label: string; values: (string | number)[]; hi: boolean[] }[] = [
    { label: 'Passport', values: selected.map((e) => e.score), hi: highlight(selected.map((e) => e.score)) },
    {
      label: 'Rate',
      values: selected.map((e) => `$${e.rate}/hr`),
      hi: highlight(
        selected.map((e) => e.rate),
        false,
      ),
    },
    { label: 'Experience', values: selected.map((e) => `${e.years} yrs`), hi: highlight(selected.map((e) => e.years)) },
    { label: 'Hours', values: selected.map((e) => e.zone), hi: [] },
    {
      label: 'Availability',
      values: selected.map((e) => availabilityLabel(e.availableInDays)),
      hi: highlight(
        selected.map((e) => e.availableInDays),
        false,
      ),
    },
    ...DIMENSIONS.map((dim, k) => ({
      label: dim,
      values: selected.map((e) => e.dimensions[k]),
      hi: highlight(selected.map((e) => e.dimensions[k])),
    })),
    { label: 'Reservation', values: selected.map((e) => e.reservation), hi: [] },
  ];

  return (
    <table className="cmp">
      <thead>
        <tr>
          <th />
          {selected.map((e) => (
            <th key={e.name}>
              {e.name}
              <div style={{ fontWeight: 500, fontSize: 12, color: 'var(--muted)' }}>{e.role}</div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <td>{row.label}</td>
            {row.values.map((value, i) => (
              <td key={`${row.label}-${i}`} className={row.hi[i] ? 'hi' : ''}>
                {value}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TrialModal({ index }: { index: number }) {
  const { startTrial, closeOverlays, toast } = useApp();
  const [step, setStep] = useState(0);
  const [task, setTask] = useState('');
  const [criteria, setCriteria] = useState('');
  const [owner, setOwner] = useState('');
  const professional = PROFESSIONALS[index];

  return (
    <>
      <div className="stepper">
        {[0, 1, 2].map((i) => (
          <i key={i} className={i <= step ? 'on' : ''} />
        ))}
      </div>
      {step === 0 ? (
        <div className="form">
          <label htmlFor="t_del">What would you like to evaluate during the 10-hour trial?</label>
          <textarea
            id="t_del"
            value={task}
            onChange={(event) => setTask(event.target.value)}
            placeholder="e.g. Migrate the orders pipeline to dbt with tests, or a scoped review of retrieval quality"
          />
          <label htmlFor="t_crit">Success criteria</label>
          <input id="t_crit" value={criteria} onChange={(event) => setCriteria(event.target.value)} placeholder="Success criteria" />
        </div>
      ) : null}
      {step === 1 ? (
        <div className="form">
          <label htmlFor="t_mgr">Who on your side owns this?</label>
          <input id="t_mgr" value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="Name and role" />
          <label>Preferred start</label>
          <select>
            <option>{professional.availableInDays === 0 ? 'As soon as possible' : availabilityLabel(professional.availableInDays)}</option>
            <option>Next week</option>
            <option>I will choose a date</option>
          </select>
          <label>Access to provision on day one</label>
          <input placeholder="Repo, environment, workspace access" />
        </div>
      ) : null}
      {step === 2 ? (
        <>
          <div className="panel" style={{ background: 'var(--tint-blue)' }}>
            <h4>Review</h4>
            <p style={{ fontSize: 13.5, marginTop: 6 }}>
              <b style={{ color: 'var(--navy)' }}>{professional.name}</b> · {professional.role} · {professional.zone} · $
              {professional.rate}/hr after the trial
            </p>
            <p style={{ fontSize: 13.5, marginTop: 6 }}>
              <b style={{ color: 'var(--navy)' }}>Task:</b> {task || '-'}
            </p>
            <p style={{ fontSize: 13.5, marginTop: 4 }}>
              <b style={{ color: 'var(--navy)' }}>Criteria:</b> {criteria || '-'}
            </p>
          </div>
          <div className="kv" style={{ marginTop: 12 }}>
            <div>
              <span>Cost to you</span>
              <b>$0 for up to 10 trial hours</b>
            </div>
            <div>
              <span>Paid to professional</span>
              <b>Yes, by BesTal</b>
            </div>
            <div>
              <span>Work product</span>
              <b>Yours, either way</b>
            </div>
            <div>
              <span>After</span>
              <b>Continue, alternate, or stop</b>
            </div>
          </div>
        </>
      ) : null}
      <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
        {step > 0 ? (
          <Button variant="outline" onClick={() => setStep((prev) => prev - 1)}>
            Back
          </Button>
        ) : null}
        <Button
          variant="primary"
          style={{ flex: 1 }}
          onClick={() => {
            if (step === 0 && !task.trim()) {
              toast('Describe the task first');
              return;
            }
            if (step === 2) {
              startTrial(index);
              closeOverlays();
              return;
            }
            setStep((prev) => prev + 1);
          }}
        >
          {step === 2 ? 'Request trial' : 'Continue'}
        </Button>
      </div>
    </>
  );
}

function PostProjectModal() {
  const { addProject, closeOverlays, toast, setTab } = useApp();
  const [title, setTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [hours, setHours] = useState('');
  const [budget, setBudget] = useState('');
  const [zone, setZone] = useState('Any');

  return (
    <>
      <div className="form">
        <label htmlFor="g_t">What is the outcome?</label>
        <input id="g_t" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Cost review of our Databricks workspace" />
        <label htmlFor="g_s">Skills</label>
        <input id="g_s" value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="Databricks, FinOps, Spark" />
        <div className="g2">
          <div>
            <label htmlFor="g_h">Hours</label>
            <input id="g_h" value={hours} onChange={(event) => setHours(event.target.value)} placeholder="20" />
          </div>
          <div>
            <label htmlFor="g_r">Budget</label>
            <input id="g_r" value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="Agreed on scope" />
          </div>
        </div>
        <label htmlFor="g_z">Working hours</label>
        <select id="g_z" value={zone} onChange={(event) => setZone(event.target.value)}>
          <option>Any</option>
          {ZONES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <Button
        variant="primary"
        style={{ width: '100%', marginTop: 18 }}
        onClick={() => {
          if (!title.trim()) {
            toast('Describe the outcome first');
            return;
          }
          addProject({
            title: title.trim(),
            hours: `up to ${hours || '20'} hrs`,
            rate: budget || 'Agreed on scope',
            zone,
            skills: (skills || 'General')
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean),
            status: 'Open',
            applicants: Math.floor(Math.random() * 4) + 2,
          });
          closeOverlays();
          setTab('projects');
          toast('Opportunity posted');
        }}
      >
        Post and match
      </Button>
    </>
  );
}

function EnquiryModal({ kind }: { kind: RequestKind }) {
  const { addRequest, closeOverlays, toast, setTab } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const titles: Record<RequestKind, string> = {
    consulting: 'Discuss Your Technology Challenge',
    security: 'Request Procurement Information',
    general: 'Talk to BesTal',
  };

  return (
    <>
      <div className="form">
        <label htmlFor="r_n">Name</label>
        <input id="r_n" value={name} onChange={(event) => setName(event.target.value)} />
        <label htmlFor="r_e">Work email</label>
        <input id="r_e" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <label htmlFor="r_c">Company</label>
        <input id="r_c" value={company} onChange={(event) => setCompany(event.target.value)} />
        <label htmlFor="r_t">
          {kind === 'consulting'
            ? 'What are you trying to decide or build?'
            : kind === 'security'
              ? 'What information do you need?'
              : 'How can we help?'}
        </label>
        <textarea
          id="r_t"
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          placeholder={kind === 'consulting' ? 'e.g. Whether to move to Fabric or stay on Synapse' : 'A short description is fine'}
        />
      </div>
      <Button
        variant="primary"
        style={{ width: '100%', marginTop: 18 }}
        disabled={loading}
        onClick={async () => {
          if (!name.trim() || !email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
            toast('Please complete name and a valid work email');
            return;
          }
          setLoading(true);
          const result = await submitEnquiry({ name, email, company, details, kind });
          setLoading(false);
          if (!result.ok) {
            toast(result.message);
            return;
          }
          if (kind === 'consulting') {
            addRequest({
              title: details.slice(0, 48) || 'New scoping request',
              type: 'Advisory Engagement',
              stage: 0,
              owner: name || 'You',
              due: 'To be scheduled',
            });
            closeOverlays();
            setTab('consulting');
            navigate(ROUTES.workspace);
            toast('Request submitted - it appears under Submitted');
            return;
          }
          closeOverlays();
          toast('Thank you. We will be in touch.');
        }}
      >
        {kind === 'consulting' ? 'Request a Call' : 'Send'}
      </Button>
      <p style={{ fontSize: 12.5, marginTop: 10 }}>
        {kind === 'consulting' ? 'A short introductory call, no deck required.' : 'We will follow up as soon as we can.'}
      </p>
      <p className="sr-only">{titles[kind]}</p>
    </>
  );
}

export function OverlayRoot() {
  const { drawer, modal, toasts, closeOverlays, toast, pods, requests } = useApp();
  const overlayOn = Boolean(drawer || modal);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeOverlays();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeOverlays]);

  const drawerTitle =
    drawer?.type === 'profile'
      ? PROFESSIONALS[drawer.index].name
      : drawer?.type === 'pod'
        ? pods[drawer.index]?.name
        : drawer?.type === 'request-detail'
          ? requests[drawer.index]?.title
          : drawer?.type === 'shortlist'
            ? 'Your shortlist'
            : '';

  const modalTitle =
    modal?.type === 'compare'
      ? 'Compare'
      : modal?.type === 'trial'
        ? `Request a 10-Hour Trial with ${PROFESSIONALS[modal.index].name}`
        : modal?.type === 'post-project'
          ? 'Post an opportunity'
          : modal?.type === 'enquiry'
            ? modal.kind === 'consulting'
              ? 'Discuss Your Technology Challenge'
              : modal.kind === 'security'
                ? 'Request Procurement Information'
                : 'Talk to BesTal'
            : '';

  return (
    <>
      <div className={`ov ${overlayOn ? 'on' : ''}`} onClick={closeOverlays} />
      <aside
        className={`drawer ${drawer ? 'on' : ''}`}
        role={drawer ? 'dialog' : undefined}
        aria-modal={drawer ? true : undefined}
        aria-hidden={!drawer}
        inert={!drawer}
      >
        <div className="dh">
          <h3>{drawerTitle}</h3>
          {drawer ? (
            <button className="icon" type="button" aria-label="Close drawer" onClick={closeOverlays}>
              ✕
            </button>
          ) : null}
        </div>
        <div className="db">
          {drawer?.type === 'profile' ? <ProfileDrawer index={drawer.index} /> : null}
          {drawer?.type === 'pod' ? <PodDrawer index={drawer.index} /> : null}
          {drawer?.type === 'request-detail' ? <RequestDetail index={drawer.index} /> : null}
          {drawer?.type === 'shortlist' ? <ShortlistDrawer /> : null}
        </div>
        {drawer?.type === 'pod' ? (
          <div className="df">
            <Button variant="primary" onClick={() => toast('Additional capacity requested - proposal within two business days')}>
              Add capacity
            </Button>
            <Button variant="outline" onClick={() => toast('Delivery report opened')}>
              Delivery report
            </Button>
          </div>
        ) : null}
      </aside>
      <div
        className={`modal ${modal ? 'on' : ''}`}
        aria-hidden={!modal}
        inert={!modal}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeOverlays();
        }}
      >
        <div className={`mbox ${modal && modal.type !== 'compare' ? 'n' : ''}`}>
          <div className="dh">
            <h3>{modalTitle}</h3>
            {modal ? (
              <button className="icon" type="button" aria-label="Close dialog" onClick={closeOverlays}>
                ✕
              </button>
            ) : null}
          </div>
          <div style={{ padding: '0 22px 22px' }}>
            {modal?.type === 'compare' ? <CompareModal /> : null}
            {modal?.type === 'trial' ? <TrialModal index={modal.index} /> : null}
            {modal?.type === 'post-project' ? <PostProjectModal /> : null}
            {modal?.type === 'enquiry' ? <EnquiryModal kind={modal.kind} /> : null}
          </div>
        </div>
      </div>
      <div className="toasts">
        {toasts.map((item) => (
          <div className="toast" key={item.id}>
            {item.message}
          </div>
        ))}
      </div>
    </>
  );
}
