import { DIMENSIONS } from '@/constants/content';
import { Chip } from '@/components/ui/Chip';
import { Avatar } from '@/components/workspace/Avatar';
import type { Professional } from '@/types';

export function ProfileHead({ professional, hideRate = false }: { professional: Professional; hideRate?: boolean }) {
  return (
    <>
      <div className="ct">
        <Avatar professional={professional} size={48} />
        <div>
          <div className="nm" style={{ fontSize: 17 }}>
            {professional.name}
          </div>
          <div className="rl" style={{ fontSize: 12.5 }}>
            {professional.role} · {professional.years} yrs · {professional.city}
          </div>
        </div>
        <div className="sc">
          {hideRate ? (
            <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>Shared during evaluation</span>
          ) : (
            <>
              <b style={{ fontSize: 22, color: 'var(--navy)' }}>${professional.rate}</b>
              <span>per hour</span>
            </>
          )}
        </div>
      </div>
      <div className="chips" style={{ margin: '12px 0' }}>
        {professional.skills.map((skill) => (
          <Chip key={skill}>{skill}</Chip>
        ))}
        <Chip>{`${professional.zone}, agreed hours`}</Chip>
      </div>
    </>
  );
}

export function Passport({ professional, label = 'Talent Passport' }: { professional: Professional; label?: string }) {
  return (
    <div className="passport">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#41506B' }}>{label}</span>
        <b style={{ fontSize: 24, fontWeight: 700, color: 'var(--blue-d)' }}>
          {professional.score}
          <small style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>/100</small>
        </b>
      </div>
      {professional.dimensions.map((value, index) => (
        <div className="prow" key={DIMENSIONS[index]}>
          {DIMENSIONS[index]}
          <div className="bar">
            <i className={index === 3 ? 'c' : ''} style={{ ['--w' as string]: `${value * 10}%` }} />
          </div>
          <b>{value}</b>
        </div>
      ))}
      <p className="note">
        {professional.note} <em>Reservation:</em> {professional.reservation}
        <span className="who2">Specialist assessor, {professional.specialty} - assessed March 2026</span>
      </p>
    </div>
  );
}

