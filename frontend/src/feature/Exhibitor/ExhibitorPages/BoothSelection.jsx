import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExhibitorLayout from '../ExhibitorComponents/ExhibitorLayout';
import { useTheme, Icon, ICONS, Card, Alert, Button, StatusBadge, PageLoader } from '../ExhibitorComponents/ExhibitorUI';
import { getEventBoothsApi, reserveBoothApi, cancelReservationApi } from '../ExhibitorServices/exhibitorServices';

export default function BoothSelection() {
  return (
    <ExhibitorLayout title="Floor Plan & Booth Selection" subtitle="Pick the perfect spot for your stand">
      <BoothContent />
    </ExhibitorLayout>
  );
}

const cellColors = (b, dark) => {
  if (b.isMine) return { bg: dark ? 'rgba(124,58,237,0.32)' : '#ede9fe', bd: '#7c3aed', tx: dark ? '#c4b5fd' : '#6d28d9' };
  if (b.status === 'available') return { bg: dark ? 'rgba(16,185,129,0.18)' : '#d1fae5', bd: dark ? 'rgba(52,211,153,0.4)' : '#6ee7b7', tx: dark ? '#34d399' : '#065f46' };
  if (b.status === 'reserved') return { bg: dark ? 'rgba(245,158,11,0.18)' : '#fef3c7', bd: dark ? 'rgba(251,191,36,0.4)' : '#fcd34d', tx: dark ? '#fbbf24' : '#92400e' };
  return { bg: dark ? 'rgba(239,68,68,0.18)' : '#fee2e2', bd: dark ? 'rgba(252,165,165,0.4)' : '#fca5a5', tx: dark ? '#f87171' : '#991b1b' };
};

const CATEGORY_COLOR = { VIP: '#7c3aed', Premium: '#f59e0b', Standard: '#0ea5e9' };

function BoothCell({ booth, selected, dark, onClick }) {
  const [hover, setHover] = useState(false);
  const c = cellColors(booth, dark);
  const company = booth.assignedExhibitor?.companyDetails?.companyName || booth.assignedExhibitor?.name;
  return (
    <div
      onClick={() => onClick(booth)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={`${booth.boothNumber} · ${booth.category} · ${booth.status}`}
      style={{
        position: 'relative', overflow: 'hidden', width: 84, height: 84, borderRadius: 10, cursor: 'pointer',
        background: c.bg, border: `2px solid ${selected ? '#7c3aed' : c.bd}`,
        transform: hover || selected ? 'scale(1.06)' : 'scale(1)', zIndex: hover || selected ? 2 : 1,
        boxShadow: selected ? '0 0 0 3px rgba(124,58,237,0.35)' : hover ? '0 4px 16px rgba(124,58,237,0.25)' : 'none',
        transition: 'all 0.15s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: CATEGORY_COLOR[booth.category] || '#0ea5e9' }} />
      <span style={{ fontSize: 10, fontWeight: 800, color: c.tx }}>{booth.boothNumber}</span>
      <span style={{ fontSize: 9, fontWeight: 600, color: c.tx, opacity: 0.85 }}>${booth.price}</span>
      {booth.isMine ? (
        <span style={{ fontSize: 8, fontWeight: 800, color: c.tx }}>{booth.status === 'reserved' ? '★ PENDING' : '★ YOURS'}</span>
      ) : company ? (
        <span style={{ fontSize: 8, color: c.tx, maxWidth: 74, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{company}</span>
      ) : null}
    </div>
  );
}

function BoothContent() {
  const t = useTheme();
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (silent = false) => {
    try {
      const res = await getEventBoothsApi(eventId);
      setData(res);
    } catch (err) {
      if (!silent) setError(err.response?.data?.message || 'Failed to load floor plan.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    load(false);
    const id = setInterval(() => load(true), 8000);
    return () => clearInterval(id);
  }, [load]);

  if (loading) return <PageLoader />;
  if (!data) return <Alert type="error">{error || 'Floor plan not available.'}</Alert>;

  const { hall, booths, canReserve, applicationStatus, event } = data;
  const selected = booths.find((b) => b._id === selectedId) || null;
  const myBoothsList = booths.filter((b) => b.isMine);
  const count = (s) => booths.filter((b) => b.status === s).length;

  const rows = hall?.dimensions?.rows || 0;
  const cols = hall?.dimensions?.cols || 0;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
  booths.forEach((b) => {
    const r = b.gridPosition?.row;
    const c = b.gridPosition?.col;
    if (r < rows && c < cols) grid[r][c] = b;
  });

  const reserve = async () => {
    if (!window.confirm(`Request booth ${selected.boothNumber} ($${selected.price})? The admin will approve it.`)) return;
    try {
      setBusy(true);
      setError('');
      const res = await reserveBoothApi(selected._id, eventId);
      setSuccess(res.message);
      await load(true);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reserve booth.');
      load(true);
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    if (!window.confirm(`Cancel your request for booth ${selected.boothNumber}?`)) return;
    try {
      setBusy(true);
      setError('');
      const res = await cancelReservationApi(selected._id);
      setSuccess(res.message);
      await load(true);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel request.');
    } finally {
      setBusy(false);
    }
  };

  const banner = () => {
    if (applicationStatus === 'approved') return null;
    const text = {
      pending: 'Your application is still pending admin approval. You can view the floor plan, but booking opens once you are approved.',
      rejected: 'Your application was rejected, so you cannot reserve a booth for this event.',
    }[applicationStatus] || 'You have not applied for this event yet. Apply first to be able to reserve a booth.';
    return (
      <Alert type="warning">
        {text}{' '}
        <span onClick={() => navigate('/exhibitor/events')} style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 800 }}>
          Go to events
        </span>
      </Alert>
    );
  };

  const legend = [
    ['Available', '#10b981'], ['Pending approval', '#f59e0b'], ['Booked', '#ef4444'], ['Your booth', '#7c3aed'],
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: t.text }}>{event?.title}</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: t.muted }}>
            {hall?.name} · {rows}×{cols} grid · {count('available')} of {booths.length} booths available
          </p>
        </div>
        <Button variant="ghost" onClick={() => load(false)}><Icon d={ICONS.refresh} size={14} /> Refresh</Button>
      </div>

      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}
      {banner()}
      {myBoothsList.length > 0 && (
        <Alert type="success">
          Your booths:{' '}
          <strong>
            {myBoothsList.map((b) => `${b.boothNumber} (${b.status === 'booked' ? 'approved' : 'pending approval'})`).join(', ')}
          </strong>.{' '}
          <span onClick={() => navigate('/exhibitor/my-booths')} style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 800 }}>Manage booths</span>
        </Alert>
      )}

      <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* ───── Floor plan ───── */}
        <Card style={{ flex: '1 1 560px', minWidth: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '14px 20px', borderBottom: `1px solid ${t.border}`, background: t.thBg,
            display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center',
          }}>
            {legend.map(([label, color]) => (
              <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: t.soft }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: color }} /> {label}
              </span>
            ))}
          </div>
          <div style={{ padding: 20, overflowX: 'auto' }}>
            <div style={{ display: 'inline-block' }}>
              {grid.map((row, r) => (
                <div key={r} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: t.muted }}>{r + 1}</div>
                  {row.map((b, c) =>
                    b ? (
                      <BoothCell key={b._id} booth={b} dark={t.dark} selected={b._id === selectedId} onClick={(x) => setSelectedId(x._id)} />
                    ) : (
                      <div key={c} style={{ width: 84, height: 84, borderRadius: 10, border: `1.5px dashed ${t.border}` }} />
                    )
                  )}
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, paddingLeft: 28 }}>
                {Array.from({ length: cols }, (_, c) => (
                  <div key={c} style={{ width: 84, textAlign: 'center', fontSize: 10, fontWeight: 700, color: t.muted }}>{c + 1}</div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* ───── Details panel ───── */}
        <Card style={{ flex: '1 1 290px', width: '100%', maxWidth: '100%', padding: 22 }}>
          {!selected ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: t.muted }}>
              <Icon d={ICONS.floorPlan} size={34} strokeWidth={1.3} />
              <p style={{ margin: '12px 0 0', fontSize: 14 }}>Click any booth on the floor plan to see its details.</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: t.text }}>Booth {selected.boothNumber}</h3>
                <StatusBadge status={selected.status} />
              </div>
              <div style={{ display: 'grid', gap: 10, fontSize: 14, color: t.soft, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Category</span><strong style={{ color: t.text }}>{selected.category}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Price</span><strong style={{ color: t.text }}>${selected.price}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Position</span><strong style={{ color: t.text }}>Row {selected.gridPosition.row + 1}, Col {selected.gridPosition.col + 1}</strong>
                </div>
                {selected.assignedExhibitor && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Exhibitor</span>
                    <strong style={{ color: t.text }}>{selected.isMine ? 'You' : selected.assignedExhibitor.companyDetails?.companyName || selected.assignedExhibitor.name}</strong>
                  </div>
                )}
              </div>

              {selected.isMine && (
                <div style={{ display: 'grid', gap: 10 }}>
                  <p style={{ fontSize: 12.5, color: t.muted, margin: 0 }}>
                    {selected.status === 'reserved' ? 'Waiting for admin to approve your request.' : 'Approved by admin.'}
                  </p>
                  <Button variant="success" onClick={() => navigate('/exhibitor/my-booths')} style={{ width: '100%' }}>Manage My Booth</Button>
                  {selected.status === 'reserved' && (
                    <Button variant="danger" loading={busy} onClick={cancel} style={{ width: '100%' }}>Cancel Request</Button>
                  )}
                </div>
              )}
              {!selected.isMine && selected.status === 'available' && (
                <>
                  <Button loading={busy} disabled={!canReserve} onClick={reserve} style={{ width: '100%' }}>Reserve This Booth</Button>
                  {!canReserve && <p style={{ fontSize: 12, color: t.muted, margin: '10px 0 0' }}>Booking is available after your application is approved.</p>}
                </>
              )}
              {!selected.isMine && selected.status !== 'available' && (
                <p style={{ fontSize: 13, color: t.muted, margin: 0 }}>This booth is not available.</p>
              )}
            </>
          )}
        </Card>
      </div>
    </>
  );
}