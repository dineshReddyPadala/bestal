import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Seo } from '@/components/common/Seo';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { Avatar } from '@/components/workspace/Avatar';
import { Passport, ProfileHead } from '@/components/workspace/Passport';
import { availabilityLabel } from '@/utils/advisor';
import { DistDiagram, PodDiagram, RadarDiagram, StackedSpendDiagram, VelocityDiagram } from '@/components/diagrams/Diagrams';
import { SolutionFinder } from '@/components/sections/SolutionFinder';
import { COMMUNITY_CHIP, COMMUNITIES, ROLES, STAGES, ZONES } from '@/constants/content';
import { INITIAL_INVOICES, PROFESSIONALS, SPEND } from '@/constants/workspace-data';
import { useApp } from '@/context/app-context';
import { matchScore, matchWhy } from '@/utils/advisor';
import type { BuyerTab, CandidateTab, WorkspaceTab } from '@/types';

const BUYER_TABS: [BuyerTab, string][] = [
  ['overview', 'Overview'],
  ['advisor', 'Solution Finder'],
  ['discover', 'Technology Professionals'],
  ['teams', 'Build a Delivery Team'],
  ['delivery', 'Managed Services'],
  ['consulting', 'Consulting Engagements'],
  ['workforce', 'Workforce'],
  ['projects', 'Project Opportunities'],
  ['analytics', 'Analytics'],
  ['billing', 'Billing'],
];

const CANDIDATE_TABS: [CandidateTab, string][] = [
  ['passport', 'My Passport'],
  ['opps', 'Opportunities'],
  ['assess', 'Assessment'],
  ['earn', 'Earnings'],
];

const SIDE_ICONS: Record<string, 'home' | 'solution' | 'discover' | 'team' | 'delivery' | 'request' | 'users' | 'package' | 'analytics' | 'billing' | 'fingerprint' | 'target' | 'clipboard_check' | 'commercials'> = {
  overview: 'home',
  advisor: 'solution',
  discover: 'discover',
  teams: 'team',
  delivery: 'delivery',
  consulting: 'request',
  workforce: 'users',
  projects: 'package',
  analytics: 'analytics',
  billing: 'billing',
  passport: 'fingerprint',
  opps: 'target',
  assess: 'clipboard_check',
  earn: 'commercials',
};

export function WorkspacePage() {
  const [params] = useSearchParams();
  const app = useApp();
  const { setMode, setTab } = app;

  useEffect(() => {
    const mode = params.get('mode');
    const tab = params.get('tab') as WorkspaceTab | null;
    if (mode === 'candidate') setMode('candidate');
    if (tab) setTab(tab);
  }, [params, setMode, setTab]);

  const tabs = app.mode === 'buyer' ? BUYER_TABS : CANDIDATE_TABS;
  const counts: Partial<Record<WorkspaceTab, number | string>> = {
    discover: PROFESSIONALS.length,
    teams: app.draftTeam.length || '',
    delivery: app.pods.length,
    consulting: app.requests.filter((item) => item.stage < 4).length,
    workforce: app.workforce.filter((item) => item.pending).length || '',
    projects: app.projects.filter((item) => item.status === 'Open').length,
    billing: INITIAL_INVOICES.filter((item) => item.status !== 'Paid').length,
  };

  return (
    <main>
      <Seo page="workspace" />
      <section style={{ padding: '30px 0 56px' }}>
        <div className="shell">
          <div className="portal">
            <div className="demobanner">Demo Workspace — Illustrative Data</div>
            <div className="ptop">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
              <span className="url">
                {app.mode === 'buyer' ? 'app.bestal.co / workspace' : 'app.bestal.co / me'}
              </span>
              <span className="who">
                <i />
                <span>{app.mode === 'buyer' ? 'Acme Data · Client Workspace' : 'Sai K. · Professional Workspace'}</span>
              </span>
            </div>
            <div className="pbody">
              <aside className="side">
                <div className="sideT">{app.mode === 'buyer' ? 'Workspace' : 'Professional'}</div>
                {(app.mode === 'buyer' ? tabs.slice(0, 6) : tabs).map(([key, label]) => (
                  <button key={key} type="button" className={app.tab === key ? 'on' : ''} onClick={() => app.setTab(key)}>
                    <Icon name={SIDE_ICONS[key]} size={16} strokeWidth={1.7} />
                    <span style={{ flex: 1 }}>{label}</span>
                    {counts[key] ? <span className="n">{counts[key]}</span> : null}
                  </button>
                ))}
                {app.mode === 'buyer' ? (
                  <>
                    <div className="sideT" style={{ marginTop: 8 }}>
                      Manage
                    </div>
                    {tabs.slice(6).map(([key, label]) => (
                      <button key={key} type="button" className={app.tab === key ? 'on' : ''} onClick={() => app.setTab(key)}>
                        <Icon name={SIDE_ICONS[key]} size={16} strokeWidth={1.7} />
                        <span style={{ flex: 1 }}>{label}</span>
                        {counts[key] ? <span className="n">{counts[key]}</span> : null}
                      </button>
                    ))}
                  </>
                ) : null}
                <div className="sp" />
                {app.mode === 'buyer' ? (
                  <div className="tip">
                    <b>10-Hour Trial</b>
                    Paid by BesTal. Any profile marked available.
                  </div>
                ) : (
                  <div className="tip">
                    <b>Paid for trial hours</b>
                    Client trials are never unpaid work for you.
                  </div>
                )}
              </aside>
              <div className="main">
                {app.tab === 'overview' ? <OverviewTab /> : null}
                {app.tab === 'advisor' ? <AdvisorTab /> : null}
                {app.tab === 'discover' ? <DiscoverTab /> : null}
                {app.tab === 'teams' ? <TeamsTab /> : null}
                {app.tab === 'delivery' ? <DeliveryTab /> : null}
                {app.tab === 'consulting' ? <ConsultingTab /> : null}
                {app.tab === 'workforce' ? <WorkforceTab /> : null}
                {app.tab === 'projects' ? <ProjectsTab /> : null}
                {app.tab === 'analytics' ? <AnalyticsTab /> : null}
                {app.tab === 'billing' ? <BillingTab /> : null}
                {app.tab === 'passport' ? <PassportTab /> : null}
                {app.tab === 'opps' ? <OppsTab /> : null}
                {app.tab === 'assess' ? <AssessTab /> : null}
                {app.tab === 'earn' ? <EarnTab /> : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function OverviewTab() {
  const { workforce, requests, pods, setTab, approveTimesheet, openDrawer } = useApp();
  const pending = workforce.filter((item) => item.pending);
  const trials = workforce.filter((item) => item.status === 'trial');
  return (
    <>
      <div className="top">
        <div>
          <span className="k">Client Workspace · Acme Data</span>
          <h3>Good morning, Alex.</h3>
          <p style={{ fontSize: 13.5 }}>
            {pending.length} timesheet{pending.length === 1 ? '' : 's'} to approve · {requests.filter((r) => r.stage === 2).length} proposal
            to review · {trials.length} trial in progress.
          </p>
        </div>
        <button className="btn primary sm" type="button" onClick={() => setTab('advisor')}>
          Ask the Advisor
        </button>
      </div>
      <div className="g4" style={{ marginBottom: 16 }}>
        <div className="metric">
          <b>{workforce.length}</b>
          <span>professionals engaged</span>
        </div>
        <div className="metric">
          <b>{pods.length}</b>
          <span>
            delivery teams · {pods.filter((p) => p.status === 'green').length} on track, {pods.filter((p) => p.status === 'amber').length} at
            risk
          </span>
        </div>
        <div className="metric">
          <b>${INITIAL_INVOICES[1].amount}k</b>
          <span>this month · due {INITIAL_INVOICES[1].status.replace('Due ', '')}</span>
        </div>
        <div className="metric">
          <b>{Math.round(workforce.reduce((sum, item) => sum + PROFESSIONALS[item.professionalIndex].score, 0) / workforce.length)}</b>
          <span>avg Passport score, your team</span>
        </div>
      </div>
      <div className="g2">
        <div className="panel">
          <h4>Needs your attention</h4>
          <div style={{ marginTop: 8 }}>
            {pending.map((item) => (
              <div className="row" key={item.professionalIndex}>
                <Avatar professional={PROFESSIONALS[item.professionalIndex]} />
                <div style={{ flex: 1 }}>
                  <b>{PROFESSIONALS[item.professionalIndex].name}</b>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {item.hours} hours · {item.model}
                  </div>
                </div>
                <button
                  className="btn outline xs"
                  type="button"
                  onClick={() => approveTimesheet(workforce.indexOf(item))}
                >
                  Approve
                </button>
              </div>
            ))}
            {requests
              .filter((item) => item.stage === 2)
              .map((item) => (
                <div className="row" key={item.title}>
                  <div className="av" style={{ background: 'var(--blue)' }}>
                    P
                  </div>
                  <div style={{ flex: 1 }}>
                    <b>{item.title}</b>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>Proposal ready for review</div>
                  </div>
                  <button className="btn outline xs" type="button" onClick={() => setTab('consulting')}>
                    Review
                  </button>
                </div>
              ))}
            {pods
              .filter((pod) => pod.status === 'amber')
              .map((pod) => (
                <div className="row" key={pod.name}>
                  <div className="av" style={{ background: 'var(--gold)' }}>
                    !
                  </div>
                  <div style={{ flex: 1 }}>
                    <b>{pod.name}</b>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      At risk · commitment {Math.round(pod.commit[pod.commit.length - 1] * 100)}% last sprint
                    </div>
                  </div>
                  <button className="btn outline xs" type="button" onClick={() => openDrawer({ type: 'pod', index: pods.indexOf(pod) })}>
                    Open
                  </button>
                </div>
              ))}
          </div>
        </div>
        <div className="panel">
          <h4>Illustrative delivery trend · {pods[0].name}</h4>
          <VelocityDiagram pod={pods[0]} />
        </div>
        <div className="panel">
          <h4>Recommended for your open requirements</h4>
          <div style={{ marginTop: 8 }}>
            {[0, 1, 3].map((i) => (
              <div className="row" key={i} style={{ cursor: 'pointer' }} onClick={() => openDrawer({ type: 'profile', index: i })}>
                <Avatar professional={PROFESSIONALS[i]} />
                <div style={{ flex: 1 }}>
                  <b>{PROFESSIONALS[i].name}</b>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {PROFESSIONALS[i].role} · ${PROFESSIONALS[i].rate}/hr · {PROFESSIONALS[i].zone}
                  </div>
                </div>
                <span className="st st-b">{PROFESSIONALS[i].score}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <h4>Recent activity</h4>
          <div style={{ marginTop: 8, fontSize: 13.5, display: 'grid', gap: 9, color: '#41506B' }}>
            <div>Timesheet approved · Data Modernization Pod · 40h</div>
            <div>Sprint 8 closed · 96% commitment met</div>
            <div>Proposal received · AI readiness assessment</div>
            <div>New project opportunity · RAG architecture review</div>
            <div>3 new matches for "Fabric specialist, UK hours"</div>
          </div>
        </div>
      </div>
    </>
  );
}

function AdvisorTab() {
  return (
    <>
      <div className="top">
        <div>
          <span className="k">Capability Advisor</span>
          <h3>What are you trying to accomplish?</h3>
        </div>
      </div>
      <div className="panel">
        <SolutionFinder />
      </div>
    </>
  );
}

function DiscoverTab() {
  const {
    filters,
    setFilters,
    zone,
    setZone,
    model,
    setModel,
    match,
    setMatch,
    needText,
    compare,
    shortlist,
    clearFilters,
    openDrawer,
    openModal,
    toggleShortlist,
    toggleCompare,
    addToTeam,
    setTab,
  } = useApp();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 240);
    return () => window.clearTimeout(timer);
  }, []);

  const list = useMemo(() => {
    const rateCap = Number(filters.rate) || 999;
    return PROFESSIONALS.map((professional, index) => ({
      professional,
      index,
      score: matchScore(professional, match),
    }))
      .filter(({ professional, score }) => {
        const hay = `${professional.role} ${professional.skills.join(' ')} ${professional.community} ${professional.specialty}`.toLowerCase();
        if (filters.query && !hay.includes(filters.query.toLowerCase())) return false;
        if (filters.community && professional.community !== filters.community) return false;
        if (zone && professional.zone !== zone) return false;
        if (model && !professional.models.includes(model)) return false;
        if (filters.availability === 'now' && professional.availableInDays !== 0) return false;
        if (filters.availability === 'week' && professional.availableInDays > 7) return false;
        if (professional.rate >= rateCap) return false;
        if (match && (score ?? 0) < 50) return false;
        return true;
      })
      .sort((a, b) => {
        const key = {
          score: () => b.professional.score - a.professional.score,
          rate: () => a.professional.rate - b.professional.rate,
          exp: () => b.professional.years - a.professional.years,
          avail: () => a.professional.availableInDays - b.professional.availableInDays,
          match: () => (match ? (b.score ?? 0) - (a.score ?? 0) : b.professional.score - a.professional.score),
        }[filters.sort];
        return key();
      });
  }, [filters, zone, model, match]);

  return (
    <>
      <div className="top">
        <div>
          <span className="k">Talent Solutions</span>
          <h3>Technology Professionals</h3>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {compare.length >= 2 ? (
            <button className="btn outline sm" type="button" onClick={() => openModal({ type: 'compare' })}>
              Compare {compare.length}
            </button>
          ) : null}
          <button className="btn primary sm" type="button" onClick={() => setTab('advisor')}>
            Ask the Advisor
          </button>
        </div>
      </div>
      {match ? (
        <div className="mnote">
          <b>Matching:</b>
          <span>{needText}</span>
          <span style={{ flex: 1 }} />
          <button className="btn outline xs" type="button" onClick={() => setMatch(null)}>
            Clear
          </button>
        </div>
      ) : null}
      {model ? (
        <div className="mnote">
          <b>Model:</b>
          <span>{model}</span>
          <span style={{ flex: 1 }} />
          <button className="btn outline xs" type="button" onClick={() => setModel('')}>
            Clear
          </button>
        </div>
      ) : null}
      <div className="fbar">
        <input
          value={filters.query}
          placeholder="Search skills or roles"
          onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
        />
        <select value={filters.community} onChange={(event) => setFilters((prev) => ({ ...prev, community: event.target.value }))}>
          <option value="">All communities</option>
          {COMMUNITIES.map((community) => (
            <option key={community.id} value={community.title}>
              {community.title}
            </option>
          ))}
        </select>
        {ZONES.map((item) => (
          <button
            key={item}
            type="button"
            className={`zb ${zone === item ? 'on' : ''}`}
            onClick={() => setZone(zone === item ? '' : item)}
          >
            {item.replace('US ', '')}
          </button>
        ))}
        <select value={filters.availability} onChange={(event) => setFilters((prev) => ({ ...prev, availability: event.target.value }))}>
          <option value="">Any availability</option>
          <option value="now">Available now</option>
          <option value="week">Within a week</option>
        </select>
        <select value={filters.rate} onChange={(event) => setFilters((prev) => ({ ...prev, rate: event.target.value }))}>
          <option value="">Any rate</option>
          <option value="25">Under $25</option>
          <option value="35">Under $35</option>
          <option value="45">Under $45</option>
        </select>
        <select
          value={filters.sort}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, sort: event.target.value as typeof prev.sort }))
          }
        >
          <option value="match">Best match</option>
          <option value="score">Highest Passport</option>
          <option value="rate">Lowest rate</option>
          <option value="exp">Most experience</option>
          <option value="avail">Soonest available</option>
        </select>
        <span className="cnt">
          <b>{list.length}</b> professionals ·{' '}
          <button type="button" className="linkish" style={{ background: 'none', border: 0, padding: 0 }} onClick={clearFilters}>
            clear
          </button>
        </span>
      </div>
      <div className="grid">
        {!ready ? (
          <>
            <div className="skel" />
            <div className="skel" />
            <div className="skel" />
          </>
        ) : list.length ? (
          list.map(({ professional, index, score }) => (
            <div
              className={`cand ${compare.includes(index) ? 'sel' : ''}`}
              key={professional.name}
              onClick={() => openDrawer({ type: 'profile', index })}
            >
              <div className="ct">
                <Avatar professional={professional} />
                <div>
                  <div className="nm">{professional.name}</div>
                  <div className="rl">
                    {professional.role} · {professional.years} yrs
                  </div>
                </div>
                <div className="sc">
                  <b>{professional.score}</b>
                  {score !== null ? <span className="m">{score}% match</span> : <span>Passport</span>}
                </div>
              </div>
              <div className="chips">
                {professional.skills.slice(0, 3).map((skill) => (
                  <Chip key={skill} accent={COMMUNITY_CHIP[professional.community]}>
                    {skill}
                  </Chip>
                ))}
              </div>
              {score !== null && match ? <div className="why">{matchWhy(professional, match)}</div> : null}
              <div className="facts">
                <div>
                  <span>Hours</span>
                  <b>{professional.zone}</b>
                </div>
                <div>
                  <span>Availability</span>
                  <b className="okc">{availabilityLabel(professional.availableInDays)}</b>
                </div>
                <div>
                  <span>Rate</span>
                  <b className="rate">
                    ${professional.rate}
                    <small style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>/hr</small>
                  </b>
                </div>
                <div>
                  <span>Models</span>
                  <b style={{ fontSize: 11 }}>{professional.models.join(' · ')}</b>
                </div>
              </div>
              <div className="cact">
                <button
                  className="btn goldb xs"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openModal({ type: 'trial', index });
                  }}
                >
                  Request trial
                </button>
                <button
                  className="btn outline xs"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleShortlist(index);
                  }}
                >
                  {shortlist.includes(index) ? 'Saved' : 'Save'}
                </button>
                <button
                  className="btn outline xs"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleCompare(index);
                  }}
                >
                  {compare.includes(index) ? 'Comparing' : 'Compare'}
                </button>
                <button
                  className="btn outline xs"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    addToTeam(index);
                  }}
                >
                  + Team
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty">
            <h3>No professionals match all of these filters</h3>
            <p style={{ marginTop: 6, fontSize: 14 }}>Try widening the rate range or availability.</p>
            <button className="btn outline sm" style={{ marginTop: 12 }} type="button" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function TeamsTab() {
  const {
    draftTeam,
    addRole,
    updateDraftAlloc,
    removeDraft,
    clearDraft,
    teamZone,
    setTeamZone,
    teamWeeks,
    setTeamWeeks,
    requestTeam,
  } = useApp();

  const lines = draftTeam.map((member) => {
    const rate = member.professionalIndex !== undefined ? PROFESSIONALS[member.professionalIndex].rate : ROLES[member.role][0];
    const cost = rate * 40 * (member.allocation / 100) * 4.33;
    return {
      name:
        member.professionalIndex !== undefined
          ? PROFESSIONALS[member.professionalIndex].name
          : `${member.role} (to be matched)`,
      rate,
      cost,
    };
  });
  const monthly = Math.round((lines.reduce((sum, line) => sum + line.cost, 0) / 1000) * 10) / 10;
  const total = Math.round((monthly * 1000 * teamWeeks) / 4.33 / 1000);
  const podTeam = draftTeam
    .map((member) => member.professionalIndex)
    .filter((index): index is number => index !== undefined);

  return (
    <>
      <div className="top">
        <div>
          <span className="k">Team builder</span>
          <h3>Build a Delivery Team</h3>
          <p style={{ fontSize: 13.5 }}>Add professionals from Technology Professionals, or add roles to be matched.</p>
        </div>
        <button className="btn outline sm" type="button" onClick={clearDraft}>
          Clear
        </button>
      </div>
      <div className="g2" style={{ alignItems: 'start' }}>
        <div>
          <div className="panel" style={{ marginBottom: 12 }}>
            <h4>Add a role to be matched</h4>
            <div className="rolepal" style={{ marginTop: 10 }}>
              {Object.keys(ROLES).map((role) => (
                <button key={role} type="button" onClick={() => addRole(role)}>
                  + {role} <span style={{ color: 'var(--muted)' }}>${ROLES[role][0]}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="panel">
            <h4>
              Your team · {draftTeam.length} {draftTeam.length === 1 ? 'person' : 'people'}
            </h4>
            <div style={{ marginTop: 10 }}>
              {draftTeam.length ? (
                draftTeam.map((member, i) => (
                  <div className="teamrow" key={`${member.role}-${i}`}>
                    {member.professionalIndex !== undefined ? (
                      <Avatar professional={PROFESSIONALS[member.professionalIndex]} size={36} />
                    ) : (
                      <div className="av" style={{ width: 36, height: 36, fontSize: 12 }}>
                        ?
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <b style={{ fontSize: 13.5 }}>
                        {member.professionalIndex !== undefined ? PROFESSIONALS[member.professionalIndex].name : member.role}
                      </b>
                      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                        {member.professionalIndex !== undefined
                          ? `${PROFESSIONALS[member.professionalIndex].role} · Passport ${PROFESSIONALS[member.professionalIndex].score} · ${PROFESSIONALS[member.professionalIndex].zone}`
                          : 'To be matched from relevant technology communities'}
                      </div>
                    </div>
                    <select value={member.allocation} onChange={(event) => updateDraftAlloc(i, Number(event.target.value))}>
                      {[100, 75, 50, 25].map((alloc) => (
                        <option key={alloc} value={alloc}>
                          {alloc}%
                        </option>
                      ))}
                    </select>
                    <button className="btn outline xs" type="button" onClick={() => removeDraft(i)}>
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty" style={{ padding: 24 }}>
                  <p style={{ fontSize: 13.5 }}>Empty. Add roles above, or use "+ Team" from Technology Professionals.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <div className="est">
            <span>Illustrative monthly run rate</span>
            <b>${monthly}k</b>
            <span>
              {teamWeeks} weeks ≈ ${total}k · 40 hrs/week · rates from Passports
            </span>
            {lines.map((line) => (
              <div className="ln" key={line.name}>
                <span>
                  {line.name} · ${line.rate}/hr
                </span>
                <span>${(line.cost / 1000).toFixed(1)}k</span>
              </div>
            ))}
            {draftTeam.length ? (
              <div className="ln">
                <span>Delivery lead + management</span>
                <span>included</span>
              </div>
            ) : null}
          </div>
          <div className="panel" style={{ marginTop: 12 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600 }}>Working hours for the team</label>
            <div className="rolepal" style={{ margin: '8px 0 12px' }}>
              {ZONES.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={teamZone === item ? 'zb on' : 'zb'}
                  onClick={() => setTeamZone(item)}
                >
                  {item.replace('US ', '')}
                </button>
              ))}
            </div>
            <label style={{ fontSize: 12.5, fontWeight: 600 }}>Duration</label>
            <div className="rolepal" style={{ margin: '8px 0 12px' }}>
              {[4, 8, 12, 24].map((weeks) => (
                <button
                  key={weeks}
                  type="button"
                  className={teamWeeks === weeks ? 'zb on' : 'zb'}
                  onClick={() => setTeamWeeks(weeks)}
                >
                  {weeks} wks
                </button>
              ))}
            </div>
            <button className="btn primary" style={{ width: '100%' }} type="button" disabled={!draftTeam.length} onClick={requestTeam}>
              {draftTeam.length ? 'Request this team' : 'Add people to request a team'}
            </button>
            <p style={{ fontSize: 12, marginTop: 8 }}>
              We come back within two business days with the named team and a fixed monthly fee. No obligation.
            </p>
          </div>
          <div className="panel" style={{ marginTop: 12 }}>
            <PodDiagram
              pod={{
                name: 'Your team',
                team: podTeam.length >= 2 ? podTeam : [0, 2, 6],
                lead: podTeam[0] ?? 6,
                owner: 'You',
                status: 'pending',
                sprint: 0,
                velocity: [],
                commit: [],
                start: 'Draft',
                model: 'Managed Delivery Pod',
                fee: monthly,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function DeliveryTab() {
  const { pods, setTab, openDrawer } = useApp();
  const withCommit = pods.filter((pod) => pod.commit.length);
  return (
    <>
      <div className="top">
        <div>
          <span className="k">Managed Services</span>
          <h3>Your delivery teams</h3>
        </div>
        <button className="btn primary sm" type="button" onClick={() => setTab('teams')}>
          + Build a Delivery Team
        </button>
      </div>
      <div className="g4" style={{ marginBottom: 14 }}>
        <div className="metric">
          <b>{pods.filter((pod) => pod.velocity.length).length}</b>
          <span>active delivery teams</span>
        </div>
        <div className="metric">
          <b>
            {withCommit.length
              ? Math.round((withCommit.reduce((sum, pod) => sum + pod.commit[pod.commit.length - 1], 0) / withCommit.length) * 100)
              : 0}
            %
          </b>
          <span>commitment met, last sprint</span>
        </div>
        <div className="metric">
          <b>${pods.reduce((sum, pod) => sum + pod.fee, 0)}k</b>
          <span>monthly across teams</span>
        </div>
        <div className="metric">
          <b>{pods.length}</b>
          <span>engagements</span>
        </div>
      </div>
      <div className="g2">
        {pods.map((pod, i) => (
          <div className="panel" key={pod.name} style={{ cursor: 'pointer' }} onClick={() => openDrawer({ type: 'pod', index: i })}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 10 }}>
              <div>
                <h4>{pod.name}</h4>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                  {pod.team.length} people · lead {pod.team.length ? PROFESSIONALS[pod.lead].name : 'TBC'} · {pod.model} · since{' '}
                  {pod.start}
                </div>
              </div>
              <span className={`st ${pod.status === 'green' ? 'st-g' : pod.status === 'amber' ? 'st-a' : 'st-n'}`}>
                {pod.status === 'pending' ? 'Requested' : pod.status === 'green' ? 'On track' : 'At risk'}
              </span>
            </div>
            {pod.velocity.length ? (
              <div style={{ marginTop: 12 }}>
                <VelocityDiagram pod={pod} />
              </div>
            ) : (
              <p style={{ fontSize: 13, marginTop: 12 }}>Awaiting named team and fee confirmation.</p>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 10, fontSize: 12.5, color: '#41506B' }}>
              <span>Sprint {pod.sprint}</span>·<span>${pod.fee}k / month</span>·<span>Owner {pod.owner}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ConsultingTab() {
  const { requests, openModal, openDrawer, moveRequest } = useApp();
  return (
    <>
      <div className="top">
        <div>
          <span className="k">Technology Consulting</span>
          <h3>Requests and engagements</h3>
        </div>
        <button className="btn primary sm" type="button" onClick={() => openModal({ type: 'enquiry', kind: 'consulting' })}>
          + New request
        </button>
      </div>
      <div className="kan">
        {STAGES.map((stage, i) => (
          <div className="kcol" key={stage}>
            <h5>
              {stage}
              <span>{requests.filter((item) => item.stage === i).length}</span>
            </h5>
            {requests
              .filter((item) => item.stage === i)
              .map((item) => (
                <div
                  className="kcard"
                  key={item.title}
                  onClick={() => openDrawer({ type: 'request-detail', index: requests.indexOf(item) })}
                >
                  <b>{item.title}</b>
                  <small>
                    {item.type} · {item.owner}
                  </small>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <small>
                      {item.due === 'To be scheduled'
                        ? 'Scoping call to schedule'
                        : item.due === 'Delivered'
                          ? 'Delivered'
                          : `Due ${item.due}`}
                    </small>
                  </div>
                  {i < 4 ? (
                    <button
                      className="btn outline xs"
                      style={{ marginTop: 8, width: '100%' }}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        moveRequest(requests.indexOf(item));
                      }}
                    >
                      Move to {STAGES[i + 1]}
                    </button>
                  ) : null}
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  );
}

function WorkforceTab() {
  const { workforce, approveTimesheet, continueTrial, openDrawer, setTab, toast } = useApp();
  const util = Math.round((workforce.reduce((sum, item) => sum + item.hours, 0) / (workforce.length * 40)) * 100);
  return (
    <>
      <div className="top">
        <div>
          <span className="k">Engagements</span>
          <h3>My Workforce</h3>
        </div>
        <button className="btn outline sm" type="button" onClick={() => setTab('discover')}>
          Add a professional
        </button>
      </div>
      <div className="g4" style={{ marginBottom: 14 }}>
        <div className="metric">
          <b>{workforce.filter((item) => item.status === 'live').length}</b>
          <span>active engagements</span>
        </div>
        <div className="metric">
          <b>{workforce.filter((item) => item.pending).length}</b>
          <span>timesheets to approve</span>
        </div>
        <div className="metric">
          <b>{workforce.filter((item) => item.status === 'trial').length}</b>
          <span>trial in progress</span>
        </div>
        <div className="metric">
          <b>{util}%</b>
          <span>utilization this week</span>
        </div>
      </div>
      <div className="panel">
        {workforce.map((item, i) => {
          const professional = PROFESSIONALS[item.professionalIndex];
          return (
            <div className="row" key={`${professional.name}-${i}`}>
              <Avatar professional={professional} />
              <div style={{ flex: 1 }}>
                <b>{professional.name}</b>{' '}
                <span className={`st ${item.status === 'live' ? 'st-g' : 'st-a'}`} style={{ marginLeft: 6 }}>
                  {item.status === 'live' ? 'Active' : `Trial · ${item.hours} of 10 hrs`}
                </span>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                  {professional.role} · {item.model} · {professional.zone} · since {item.since} · ${professional.rate}/hr
                </div>
                {item.status === 'trial' ? (
                  <div className="prog" style={{ marginTop: 8, maxWidth: 260 }}>
                    <i style={{ width: `${Math.min(100, (item.hours / 10) * 100)}%` }} />
                  </div>
                ) : null}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {item.pending ? (
                  <button className="btn outline xs" type="button" onClick={() => approveTimesheet(i)}>
                    Approve {item.hours}h
                  </button>
                ) : null}
                {item.status === 'trial' ? (
                  <>
                    <button className="btn primary xs" type="button" onClick={() => continueTrial(i)}>
                      Continue
                    </button>
                    <button className="btn outline xs" type="button" onClick={() => toast('Alternative requested - matches within 48 hours')}>
                      Request alternative
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn outline xs" type="button" onClick={() => openDrawer({ type: 'profile', index: item.professionalIndex })}>
                      Passport
                    </button>
                    <button className="btn outline xs" type="button" onClick={() => toast('Extension requested - same terms')}>
                      Extend
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function ProjectsTab() {
  const { projects, openModal, openDrawer, toast } = useApp();
  const [tab, setTab] = useState(0);
  const experts = PROFESSIONALS.filter((person) => person.models.includes('Specialist Experts'));
  return (
    <>
      <div className="top">
        <div>
          <span className="k">Talent Solutions</span>
          <h3>Project Opportunities</h3>
        </div>
        <button className="btn primary sm" type="button" onClick={() => openModal({ type: 'post-project' })}>
          + Post an opportunity
        </button>
      </div>
      <div className="tabs" style={{ marginTop: 0 }}>
        <button type="button" className={tab === 0 ? 'on' : ''} onClick={() => setTab(0)}>
          Project Opportunities
        </button>
        <button type="button" className={tab === 1 ? 'on' : ''} onClick={() => setTab(1)}>
          Specialist Experts
        </button>
      </div>
      <div className={tab === 0 ? 'tabp on' : 'tabp'}>
        <div className="g2">
          {projects.map((project) => (
            <div className="panel" key={project.title} style={{ cursor: 'pointer' }} onClick={() => toast('Opening this opportunity')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <h4>{project.title}</h4>
                <span className={`st ${project.status === 'Open' ? 'st-b' : project.status === 'Matched' ? 'st-a' : 'st-g'}`}>
                  {project.status}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--muted)', margin: '8px 0' }}>
                {project.hours} · {project.rate} · {project.zone}
              </div>
              <div className="chips">
                {project.skills.map((skill) => (
                  <Chip key={skill}>{skill}</Chip>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{project.applicants} evaluated professionals matched</span>
                <button className="btn outline xs" type="button" onClick={(event) => event.stopPropagation()}>
                  {project.status === 'Open' ? 'See matches' : 'Open'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={tab === 1 ? 'tabp on' : 'tabp'}>
        <p style={{ fontSize: 13.5, marginBottom: 12 }}>Fractional architects and senior advisors, billed in agreed blocks of hours.</p>
        <div className="grid">
          {experts.map((person) => (
            <div className="cand" key={person.name} onClick={() => openDrawer({ type: 'profile', index: PROFESSIONALS.indexOf(person) })}>
              <div className="ct">
                <Avatar professional={person} />
                <div>
                  <div className="nm">{person.name}</div>
                  <div className="rl">
                    {person.role} · {person.years} yrs
                  </div>
                </div>
                <div className="sc">
                  <b>{person.score}</b>
                  <span>Passport</span>
                </div>
              </div>
              <div className="chips">
                {person.skills.slice(0, 3).map((skill) => (
                  <Chip key={skill} accent={COMMUNITY_CHIP[person.community]}>
                    {skill}
                  </Chip>
                ))}
              </div>
              <div className="facts">
                <div>
                  <span>10-hour block</span>
                  <b className="rate">${person.rate * 10}</b>
                </div>
                <div>
                  <span>Hours</span>
                  <b>{person.zone}</b>
                </div>
              </div>
              <button
                className="btn outline xs"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  toast(`Block of hours requested with ${person.name}`);
                }}
              >
                Request a block of hours
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function AnalyticsTab() {
  const { pods, workforce } = useApp();
  const last = SPEND[SPEND.length - 1];
  return (
    <>
      <div className="top">
        <div>
          <span className="k">Insight</span>
          <h3>Analytics</h3>
        </div>
        <select style={{ border: '1px solid var(--border2)', borderRadius: 8, padding: '8px 10px', fontSize: 13 }}>
          <option>Last 6 months</option>
          <option>Year to date</option>
        </select>
      </div>
      <div className="g4" style={{ marginBottom: 14 }}>
        <div className="metric">
          <b>${(last.consulting + last.delivery + last.talent).toFixed(1)}k</b>
          <span>spend this month</span>
        </div>
        <div className="metric">
          <b>{Math.round(pods[0].commit[pods[0].commit.length - 1] * 100)}%</b>
          <span>commitment met · lead team</span>
        </div>
        <div className="metric">
          <b>2.1 days</b>
          <span>median time to start</span>
        </div>
        <div className="metric">
          <b>{Math.round(workforce.reduce((sum, item) => sum + PROFESSIONALS[item.professionalIndex].score, 0) / workforce.length)}</b>
          <span>avg Passport, your workforce</span>
        </div>
      </div>
      <div className="g2">
        <div className="panel">
          <h4>Spend by service line ($k)</h4>
          <StackedSpendDiagram />
        </div>
        <div className="panel">
          <h4>Illustrative delivery trend</h4>
          <VelocityDiagram pod={pods[0]} />
        </div>
        <div className="panel">
          <h4>Passport distribution, talent community</h4>
          <DistDiagram />
          <p style={{ fontSize: 12, marginTop: 6 }}>A genuine spread across the community.</p>
        </div>
        <div className="panel">
          <h4>Time to start, last 10 engagements</h4>
          <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
            {[
              ['Available now to day 1', 6],
              ['24-48 hours', 2],
              ['3-5 days', 2],
            ].map(([label, n]) => (
              <div key={String(label)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                  <span>{label}</span>
                  <b>{n}</b>
                </div>
                <div className="prog" style={{ marginTop: 4 }}>
                  <i style={{ width: `${Number(n) * 10}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function BillingTab() {
  const { workforce, approveTimesheet, toast } = useApp();
  const pending = workforce.filter((item) => item.pending);
  return (
    <>
      <div className="top">
        <div>
          <span className="k">Billing</span>
          <h3>Billing & Timesheets</h3>
        </div>
        <button className="btn outline sm" type="button" onClick={() => toast('Statement exported')}>
          Export
        </button>
      </div>
      <div className="g4" style={{ marginBottom: 14 }}>
        <div className="metric">
          <b>${INITIAL_INVOICES[1].amount}k</b>
          <span>current invoice · {INITIAL_INVOICES[1].status}</span>
        </div>
        <div className="metric">
          <b>${INITIAL_INVOICES[0].amount}k</b>
          <span>last month · paid</span>
        </div>
        <div className="metric">
          <b>{pending.length}</b>
          <span>timesheets pending</span>
        </div>
        <div className="metric">
          <b>USD</b>
          <span>invoiced in USD or GBP by engagement</span>
        </div>
      </div>
      <div className="g2">
        <div className="panel">
          <h4>Invoices</h4>
          {INITIAL_INVOICES.map((invoice) => (
            <div className="row" key={invoice.number}>
              <div style={{ flex: 1 }}>
                <b>{invoice.number}</b>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {invoice.period} · Consulting ${invoice.lines.Consulting}k · Delivery ${invoice.lines.Delivery}k · Talent $
                  {invoice.lines.Talent}k
                </div>
              </div>
              <span className={`st ${invoice.status === 'Paid' ? 'st-g' : 'st-a'}`}>{invoice.status}</span>
              <b>${invoice.amount}k</b>
              <button className="btn outline xs" type="button" onClick={() => toast(`${invoice.number} downloaded`)}>
                PDF
              </button>
            </div>
          ))}
        </div>
        <div className="panel">
          <h4>Timesheets awaiting approval</h4>
          {pending.length ? (
            pending.map((item) => (
              <div className="row" key={item.professionalIndex}>
                <Avatar professional={PROFESSIONALS[item.professionalIndex]} />
                <div style={{ flex: 1 }}>
                  <b>{PROFESSIONALS[item.professionalIndex].name}</b>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {item.hours} hrs · ${PROFESSIONALS[item.professionalIndex].rate}/hr · $
                    {(item.hours * PROFESSIONALS[item.professionalIndex].rate).toLocaleString()}
                  </div>
                </div>
                <button className="btn outline xs" type="button" onClick={() => approveTimesheet(workforce.indexOf(item))}>
                  Approve
                </button>
              </div>
            ))
          ) : (
            <p style={{ fontSize: 13.5, marginTop: 8 }}>Nothing pending.</p>
          )}
          <div className="panel" style={{ marginTop: 12, background: 'var(--tint-blue)' }}>
            <h4>How billing works</h4>
            <p style={{ fontSize: 13, marginTop: 4 }}>
              Talent Solutions is billed on approved hours. Managed Services engagements are typically a fixed monthly fee.
              Payment terms are set out in the applicable agreement.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function PassportTab() {
  const me = PROFESSIONALS[0];
  const { toast } = useApp();
  return (
    <>
      <div className="top">
        <div>
          <span className="k">Your verified identity</span>
          <h3>My Talent Passport</h3>
        </div>
        <span className="st st-g">Live · visible to clients</span>
      </div>
      <div className="g2" style={{ alignItems: 'start' }}>
        <div>
          <ProfileHead professional={me} />
          <Passport professional={me} />
        </div>
        <div>
          <RadarDiagram professional={me} />
          <div className="panel" style={{ marginTop: 10 }}>
            <h4>Your rate</h4>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
              <b style={{ fontSize: 24 }}>${me.rate}</b>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>/hr · agreed with you · shown to clients</span>
            </div>
            <button className="btn outline xs" style={{ marginTop: 10 }} type="button" onClick={() => toast('Rate change requests are reviewed within 2 business days')}>
              Request a change
            </button>
          </div>
          <div className="panel" style={{ marginTop: 10 }}>
            <h4>Your hours</h4>
            <p style={{ fontSize: 13.5, marginTop: 6 }}>
              {me.zone} working arrangement, agreed for this engagement.{' '}
              <button className="btn outline xs" type="button" onClick={() => toast('Working arrangement change requires re-confirmation')}>
                Change
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function OppsTab() {
  const { projects, toast } = useApp();
  const items = [
    ...projects.filter((item) => item.status === 'Open').map((item, i) => ({ title: item.title, sub: `Project · ${item.hours}`, pct: [92, 86][i % 2] })),
    { title: 'Senior Data Engineer, fintech client', sub: 'Dedicated · US Central · $34/hr', pct: 94 },
    { title: 'Databricks migration team', sub: 'Managed Services · US Central', pct: 91 },
    { title: 'Snowflake migration, short-term', sub: 'Flexible · US Central · $34/hr', pct: 89 },
  ];
  return (
    <>
      <div className="top">
        <div>
          <span className="k">Matched to your Passport</span>
          <h3>Opportunities</h3>
        </div>
      </div>
      <p style={{ fontSize: 13.5, marginBottom: 12 }}>Only opportunities that match your assessed skills and availability.</p>
      <div style={{ display: 'grid', gap: 10 }}>
        {items.map((item) => (
          <div className="opp" key={item.title} onClick={() => toast(`Interest recorded: ${item.title}`)}>
            <div className="ic">•</div>
            <div>
              <b>{item.title}</b>
              <span>{item.sub}</span>
            </div>
            <span className="pct">{item.pct}% fit</span>
          </div>
        ))}
      </div>
    </>
  );
}

function AssessTab() {
  const { toast } = useApp();
  const steps = [
    ['Applied', 'Done'],
    ['Screened by community', 'Done'],
    ['Assessed by specialist', 'Done · 94/100'],
    ['Verification complete', 'Done'],
    ['Rate and hours agreed', 'Done'],
    ['Passport live', 'Since March 2026'],
  ];
  return (
    <>
      <div className="top">
        <div>
          <span className="k">Your journey</span>
          <h3>Assessment</h3>
        </div>
      </div>
      <div className="panel">
        {steps.map(([title, status], i) => (
          <div className="row" key={title}>
            <div className="av" style={{ width: 32, height: 32, fontSize: 11 }}>
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <b style={{ fontSize: 14 }}>{title}</b>
            </div>
            <span className="st st-g">{status}</span>
          </div>
        ))}
      </div>
      <div className="panel" style={{ marginTop: 12, background: 'var(--tint-blue)' }}>
        <h4>Re-assessment</h4>
        <p style={{ fontSize: 13.5, marginTop: 6 }}>
          Reviewed periodically, or sooner if your primary stack changes.{' '}
          <button className="btn outline xs" type="button" onClick={() => toast('Early re-assessment requested')}>
            Request early
          </button>
        </p>
      </div>
    </>
  );
}

function EarnTab() {
  const { toast } = useApp();
  return (
    <>
      <div className="top">
        <div>
          <span className="k">Payments</span>
          <h3>Earnings</h3>
        </div>
        <span className="st st-g">Next payout · 5 Oct</span>
      </div>
      <div className="g4" style={{ marginBottom: 14 }}>
        <div className="metric">
          <b>₹2.36L</b>
          <span>this month, approved hours</span>
        </div>
        <div className="metric">
          <b>40</b>
          <span>hours this week</span>
        </div>
        <div className="metric">
          <b>6</b>
          <span>trial hours paid to you</span>
        </div>
        <div className="metric">
          <b>₹0</b>
          <span>unpaid, ever</span>
        </div>
      </div>
      <div className="panel">
        <h4>How you're paid</h4>
        <p style={{ fontSize: 13.5, marginTop: 6 }}>
          Payment terms are set out in your engagement agreement. You are paid for every trial hour - a client trial is
          never unpaid work for you.
        </p>
        <button className="btn outline xs" style={{ marginTop: 10 }} type="button" onClick={() => toast('September statement downloaded')}>
          Download statement
        </button>
      </div>
    </>
  );
}
