
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ExhibitorLayout from '../ExhibitorComponents/ExhibitorLayout';
import {
  useTheme, Icon, ICONS, Card, Alert, Button,
  Field, inputStyle, StatusBadge, EmptyState, PageLoader
} from '../ExhibitorComponents/ExhibitorUI';
import {
  getMyBoothsApi,
  updateBoothDetailsApi,
  getNeighborsApi,
  cancelReservationApi,
  fileUrl
} from '../ExhibitorServices/exhibitorServices';

export default function MyBooths() {
  return (
    <ExhibitorLayout
      title="My Booths"
      subtitle="Manage your exhibition space, staff and neighboring exhibitors"
    >
      <MyBoothsContent />
    </ExhibitorLayout>
  );
}

function BoothCard({ booth, onChanged, onMessage }) {
  const t = useTheme();

  const [showcase, setShowcase] = useState(
    (booth.details?.showcase || []).join(', ')
  );

  const [staff, setStaff] = useState(
    (booth.details?.staff || []).map((s) => ({
      name: s.name,
      role: s.role || '',
      phone: s.phone || ''
    }))
  );

  const [neighbors, setNeighbors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    getNeighborsApi(booth._id)
      .then((r) => setNeighbors(r.neighbors || []))
      .catch(() => setNeighbors([]));
  }, [booth._id]);

  const setStaffField = (i, key, value) => {
    setStaff((list) =>
      list.map((s, idx) =>
        idx === i ? { ...s, [key]: value } : s
      )
    );
  };

  const save = async () => {
    try {
      setSaving(true);
      setMsg({ type: '', text: '' });

      await updateBoothDetailsApi(booth._id, {
        showcase: showcase
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        staff: staff.filter((s) => s.name.trim())
      });

      setMsg({
        type: 'success',
        text: 'Booth details saved successfully.'
      });

      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      setMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save details.'
      });
    } finally {
      setSaving(false);
    }
  };

  const cancel = async () => {
    if (!window.confirm(`Cancel your request for booth ${booth.boothNumber}?`)) {
      return;
    }

    try {
      setCancelling(true);
      await cancelReservationApi(booth._id);
      onChanged();
    } catch (err) {
      setMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to cancel.'
      });
    } finally {
      setCancelling(false);
    }
  };

  const isApproved = booth.status === 'booked';

  return (
    <Card
      style={{
        padding: 0,
        overflow: 'hidden',
        border: '1px solid #E4EAF2',
        boxShadow: '0 5px 20px rgba(16,31,60,0.045)'
      }}
    >
      {/* Booth Header */}
      <div
        style={{
          padding: 22,
          background: '#F7F9FC',
          borderBottom: '1px solid #E7ECF3',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 15,
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div
            style={{
              width: 49,
              height: 49,
              minWidth: 49,
              borderRadius: 13,
              background: '#EAF0FA',
              color: '#244A8F',
              display: 'grid',
              placeItems: 'center'
            }}
          >
            <Icon d={ICONS.floorPlan} size={24} />
          </div>

          <div>
            <h3
              style={{
                margin: '0 0 5px',
                fontSize: 20,
                fontWeight: 800,
                color: t.text
              }}
            >
              Booth {booth.boothNumber}
            </h3>

            <p
              style={{
                margin: 0,
                fontSize: 12.5,
                color: t.muted,
                lineHeight: 1.7
              }}
            >
              {booth.hallId?.name || 'Hall'}
              {' · '}
              {booth.category}
              {' · '}
              ${booth.price}
            </p>

            <p
              style={{
                margin: '3px 0 0',
                fontSize: 11.5,
                color: t.muted
              }}
            >
              Row {(booth.gridPosition?.row ?? 0) + 1}
              {' · '}
              Column {(booth.gridPosition?.col ?? 0) + 1}
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          <StatusBadge
            status={isApproved ? 'approved' : 'pending'}
            label={isApproved ? 'Approved' : 'Pending approval'}
          />

          {booth.status === 'reserved' && (
            <Button
              variant="danger"
              loading={cancelling}
              onClick={cancel}
            >
              Cancel Request
            </Button>
          )}
        </div>
      </div>

      <div style={{ padding: 22 }}>
        {msg.text && (
          <Alert type={msg.type}>
            {msg.text}
          </Alert>
        )}

        {/* Showcase */}
        <div style={{ marginBottom: 23 }}>
          <Field
            label="Products / Services Showcase"
            hint="Separate multiple products or services with commas"
          >
            <input
              style={inputStyle(t)}
              value={showcase}
              onChange={(e) => setShowcase(e.target.value)}
              placeholder="e.g. Live demo, New product launch, Free consultation"
            />
          </Field>
        </div>

        {/* Staff Management */}
        <div style={{ marginBottom: 23 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 10,
              marginBottom: 13
            }}
          >
            <div>
              <h4
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 800,
                  color: t.text
                }}
              >
                Booth Staff
              </h4>

              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: 12,
                  color: t.muted
                }}
              >
                Add the team members managing your booth.
              </p>
            </div>

            <Button
              variant="ghost"
              style={{ padding: '7px 12px' }}
              disabled={staff.length >= 10}
              onClick={() =>
                setStaff((s) => [
                  ...s,
                  { name: '', role: '', phone: '' }
                ])
              }
            >
              <Icon d={ICONS.plus} size={14} />
              Add Staff
            </Button>
          </div>

          {staff.length === 0 ? (
            <div
              style={{
                padding: 20,
                textAlign: 'center',
                background: '#F7F9FC',
                border: '1px dashed #D5DFED',
                borderRadius: 12
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: t.muted,
                  fontSize: 13
                }}
              >
                No staff members added yet.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {staff.map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr)) auto',
                    gap: 9,
                    padding: 12,
                    border: '1px solid #E7ECF3',
                    borderRadius: 12,
                    background: '#FAFBFD',
                    alignItems: 'center'
                  }}
                >
                  <input
                    style={inputStyle(t)}
                    placeholder="Staff Name"
                    value={s.name}
                    onChange={(e) =>
                      setStaffField(i, 'name', e.target.value)
                    }
                  />

                  <input
                    style={inputStyle(t)}
                    placeholder="Role"
                    value={s.role}
                    onChange={(e) =>
                      setStaffField(i, 'role', e.target.value)
                    }
                  />

                  <input
                    style={inputStyle(t)}
                    placeholder="Phone"
                    value={s.phone}
                    onChange={(e) =>
                      setStaffField(i, 'phone', e.target.value)
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setStaff((list) =>
                        list.filter((_, idx) => idx !== i)
                      )
                    }
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      border: '1px solid #F1D5D6',
                      background: '#FFF5F5',
                      color: '#C34D52',
                      cursor: 'pointer',
                      display: 'grid',
                      placeItems: 'center'
                    }}
                    title="Remove staff"
                  >
                    <Icon d={ICONS.trash} size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {staff.length >= 10 && (
            <p
              style={{
                margin: '8px 0 0',
                fontSize: 11.5,
                color: t.muted
              }}
            >
              Maximum 10 staff members allowed.
            </p>
          )}
        </div>

        {/* Save Button */}
        <div style={{ marginBottom: 25 }}>
          <Button
            loading={saving}
            onClick={save}
          >
            <Icon d={ICONS.check} size={15} />
            Save Booth Details
          </Button>
        </div>

        {/* Neighbors */}
        <div
          style={{
            paddingTop: 22,
            borderTop: '1px solid #E7ECF3'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              marginBottom: 16
            }}
          >
            <div
              style={{
                width: 39,
                height: 39,
                borderRadius: 11,
                background: '#FBF2E3',
                color: '#B17A27',
                display: 'grid',
                placeItems: 'center'
              }}
            >
              <Icon d={ICONS.building} size={19} />
            </div>

            <div>
              <h4
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 800,
                  color: t.text
                }}
              >
                Neighboring Exhibitors
              </h4>

              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: 12,
                  color: t.muted
                }}
              >
                Connect with businesses exhibiting nearby.
              </p>
            </div>
          </div>

          {neighbors.length === 0 ? (
            <div
              style={{
                padding: 18,
                background: '#F7F9FC',
                borderRadius: 12,
                textAlign: 'center'
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: t.muted
                }}
              >
                No neighbors assigned around your booth yet.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 245px), 1fr))',
                gap: 13
              }}
            >
              {neighbors.map((n) => {
                const ex = n.assignedExhibitor;
                const c = ex?.companyDetails || {};

                return (
                  <div
                    key={n._id}
                    style={{
                      padding: 15,
                      borderRadius: 13,
                      border: '1px solid #E5EAF2',
                      background: '#FAFBFD'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: 11,
                        alignItems: 'center',
                        marginBottom: 13
                      }}
                    >
                      <div
                        style={{
                          width: 43,
                          height: 43,
                          borderRadius: 11,
                          overflow: 'hidden',
                          flexShrink: 0,
                          background: '#EAF0FA',
                          color: '#244A8F',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 17
                        }}
                      >
                        {c.logoUrl ? (
                          <img
                            src={fileUrl(c.logoUrl)}
                            alt=""
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          (c.companyName || ex?.name || '?')[0].toUpperCase()
                        )}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            fontWeight: 800,
                            fontSize: 13.5,
                            color: t.text,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {c.companyName || ex?.name}
                        </p>

                        <p
                          style={{
                            margin: '4px 0 0',
                            fontSize: 11.5,
                            color: t.muted
                          }}
                        >
                          Booth {n.boothNumber}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gap: 8,
                        marginBottom: 14
                      }}
                    >
                      {c.contact?.email && (
                        <NeighborDetail
                          icon={ICONS.mail}
                          value={c.contact.email}
                        />
                      )}

                      {c.contact?.phone && (
                        <NeighborDetail
                          icon={ICONS.phone}
                          value={c.contact.phone}
                        />
                      )}

                      {c.contact?.website && (
                        <NeighborDetail
                          icon={ICONS.globe}
                          value={c.contact.website}
                        />
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        padding: '8px 12px'
                      }}
                      onClick={() =>
                        onMessage(
                          ex._id,
                          c.companyName || ex.name
                        )
                      }
                    >
                      <Icon d={ICONS.message} size={14} />
                      Message Exhibitor
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function NeighborDetail({ icon, value }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        minWidth: 0,
        fontSize: 11.5,
        color: '#788397'
      }}
    >
      <Icon d={icon} size={13} />
      <span
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {value}
      </span>
    </div>
  );
}

function MyBoothsContent() {
  const navigate = useNavigate();

  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await getMyBoothsApi();
      setBooths(res.booths || []);
      setError('');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load booths.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <PageLoader />;

  const approvedCount = booths.filter(
    (b) => b.status === 'booked'
  ).length;

  const pendingCount = booths.filter(
    (b) => b.status === 'reserved'
  ).length;

  return (
    <>
      {error && (
        <Alert type="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Overview */}
      {booths.length > 0 && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
              gap: 15,
              marginBottom: 23
            }}
          >
            <OverviewCard
              label="Total Booths"
              value={booths.length}
              icon={ICONS.floorPlan}
              color="#244A8F"
              background="#EAF0FA"
            />

            <OverviewCard
              label="Approved Booths"
              value={approvedCount}
              icon={ICONS.check}
              color="#23845D"
              background="#E6F5EE"
            />

            <OverviewCard
              label="Pending Requests"
              value={pendingCount}
              icon={ICONS.clock}
              color="#B17A27"
              background="#FBF2E3"
            />
          </div>

          <div style={{ marginBottom: 17 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 800,
                color: '#202B3C'
              }}
            >
              Your Exhibition Spaces
            </h2>

            <p
              style={{
                margin: '5px 0 0',
                fontSize: 12.5,
                color: '#788397'
              }}
            >
              Manage your booth information and connect with nearby exhibitors.
            </p>
          </div>
        </>
      )}

      {booths.length === 0 ? (
        <Card>
          <EmptyState
            icon={ICONS.floorPlan}
            title="No booth yet"
            text="Once your application is approved, pick a booth from the floor plan."
            action={
              <Button
                onClick={() =>
                  navigate('/exhibitor/applications')
                }
              >
                View Applications
                <Icon d={ICONS.arrow} size={15} />
              </Button>
            }
          />
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {booths.map((b) => (
            <BoothCard
              key={b._id}
              booth={b}
              onChanged={load}
              onMessage={(userId, name) =>
                navigate('/exhibitor/messages', {
                  state: { userId, name }
                })
              }
            />
          ))}
        </div>
      )}
    </>
  );
}

function OverviewCard({ label, value, icon, color, background }) {
  return (
    <Card
      style={{
        padding: 18,
        border: '1px solid #E7EBF2',
        boxShadow: '0 4px 15px rgba(16,31,60,0.035)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: '#788397',
              fontWeight: 600
            }}
          >
            {label}
          </p>

          <h2
            style={{
              margin: '8px 0 0',
              fontSize: 27,
              fontWeight: 800,
              color: '#202B3C'
            }}
          >
            {value}
          </h2>
        </div>

        <div
          style={{
            width: 43,
            height: 43,
            borderRadius: 12,
            background,
            color,
            display: 'grid',
            placeItems: 'center'
          }}
        >
          <Icon d={icon} size={21} />
        </div>
      </div>
    </Card>
  );
}
