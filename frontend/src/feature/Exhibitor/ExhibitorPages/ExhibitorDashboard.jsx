import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExhibitorLayout from '../ExhibitorComponents/ExhibitorLayout';
import { useTheme, Icon, ICONS, Card, Alert, Button } from '../ExhibitorComponents/ExhibitorUI';
import { getDashboardApi, getProfileApi } from '../ExhibitorServices/exhibitorServices';

export default function ExhibitorDashboard() {
  return (
    <ExhibitorLayout title="Dashboard" subtitle="Your exhibitor overview">
      <DashboardContent />
    </ExhibitorLayout>
  );
}

function StatCard({ label, value, icon, gradient, loading, onClick }) {
  const t = useTheme();
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 20, padding: '22px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
        background: t.surface, border: `1px solid ${t.border}`,
        boxShadow: hover ? '0 12px 40px rgba(124,58,237,0.18)' : t.dark ? '0 2px 16px rgba(0,0,0,0.3)' : '0 2px 12px rgba(100,116,139,0.1)',
        transform: hover ? 'translateY(-4px)' : 'translateY(0)', transition: 'all 0.25s',
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 14, background: gradient, color: '#fff', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon d={icon} size={20} strokeWidth={1.8} />
      </div>
      <div>
        <p style={{ margin: '0 0 4px', fontSize: 12.5, fontWeight: 500, color: t.soft }}>{label}</p>
        {loading ? (
          <div style={{ width: 48, height: 26, borderRadius: 8, background: t.inputBg, animation: 'pulse 1.5s infinite' }} />
        ) : (
          <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: t.text, lineHeight: 1, letterSpacing: '-0.03em' }}>{value ?? '—'}</p>
        )}
      </div>
    </div>
  );
}

function DashboardContent() {
  const t = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [d, p] = await Promise.all([getDashboardApi(), getProfileApi()]);
        setStats(d.stats);
        setProfile(p.profile);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const profileIncomplete = profile && !profile.companyDetails?.companyName;

  const actions = [
    { title: 'Browse Events', text: 'Find expos and apply to exhibit', icon: ICONS.ticket, path: '/exhibitor/events' },
    { title: 'My Applications', text: 'Track approval status', icon: ICONS.file, path: '/exhibitor/applications' },
    { title: 'My Booths', text: 'Manage showcase and staff', icon: ICONS.floorPlan, path: '/exhibitor/my-booths' },
    { title: 'Messages', text: 'Chat with admin and neighbors', icon: ICONS.message, path: '/exhibitor/messages' },
  ];

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: t.text, letterSpacing: '-0.02em' }}>
          Welcome back{profile?.name ? `, ${profile.name}` : ''} 👋
        </h2>
        <p style={{ margin: '6px 0 0', color: t.muted, fontSize: 14 }}>
          {profile?.companyDetails?.companyName || 'Complete your company profile to start applying for expos.'}
        </p>
      </div>

      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

      {profileIncomplete && (
        <Alert type="warning">
          Your company profile is incomplete. You need a company name before you can apply to any event.{' '}
          <span onClick={() => navigate('/exhibitor/profile')} style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 800 }}>
            Complete profile
          </span>
        </Alert>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14, marginBottom: 32 }}>
        <StatCard label="Applications" value={stats?.totalApplications} icon={ICONS.file} gradient="linear-gradient(135deg,#7c3aed,#a855f7)" loading={loading} onClick={() => navigate('/exhibitor/applications')} />
        <StatCard label="Approved" value={stats?.approved} icon={ICONS.check} gradient="linear-gradient(135deg,#059669,#34d399)" loading={loading} onClick={() => navigate('/exhibitor/applications')} />
        <StatCard label="Pending" value={stats?.pending} icon={ICONS.activity} gradient="linear-gradient(135deg,#f59e0b,#fbbf24)" loading={loading} onClick={() => navigate('/exhibitor/applications')} />
        <StatCard label="My Booths" value={stats?.myBooths} icon={ICONS.floorPlan} gradient="linear-gradient(135deg,#06b6d4,#0891b2)" loading={loading} onClick={() => navigate('/exhibitor/my-booths')} />
        <StatCard label="Unread Messages" value={stats?.unreadMessages} icon={ICONS.message} gradient="linear-gradient(135deg,#ec4899,#f43f5e)" loading={loading} onClick={() => navigate('/exhibitor/messages')} />
      </div>

      <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800, color: t.text }}>Quick Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        {actions.map((a) => (
          <Card key={a.path} style={{ padding: 20, cursor: 'pointer' }} onClick={() => navigate(a.path)}>
            <div style={{ color: '#7c3aed', marginBottom: 12 }}><Icon d={a.icon} size={22} /></div>
            <p style={{ margin: '0 0 4px', fontWeight: 800, color: t.text, fontSize: 15 }}>{a.title}</p>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: t.muted }}>{a.text}</p>
            <span style={{ color: '#7c3aed', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Open <Icon d={ICONS.arrow} size={14} />
            </span>
          </Card>
        ))}
      </div>
    </>
  );
}