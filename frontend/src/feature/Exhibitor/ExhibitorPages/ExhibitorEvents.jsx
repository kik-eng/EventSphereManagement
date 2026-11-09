
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ExhibitorLayout from '../ExhibitorComponents/ExhibitorLayout';
import {
  useTheme, Icon, ICONS, Card, Alert, Button,
  Field, inputStyle, Modal, StatusBadge, EmptyState, PageLoader
} from '../ExhibitorComponents/ExhibitorUI';
import {
  getOpenEventsApi,
  applyToEventApi
} from '../ExhibitorServices/exhibitorServices';

const FALLBACK_BANNER =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000&auto=format&fit=crop';

export default function ExhibitorEvents() {
  return (
    <ExhibitorLayout
      title="Browse Events"
      subtitle="Discover opportunities and apply to upcoming exhibitions"
    >
      <EventsContent />
    </ExhibitorLayout>
  );
}

function EventsContent() {
  const t = useTheme();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [target, setTarget] = useState(null);
  const [form, setForm] = useState({ products: '', message: '' });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await getOpenEventsApi();
      setEvents(res.events || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openApply = (ev) => {
    setTarget(ev);
    setForm({ products: '', message: '' });
    setFiles([]);
    setModalError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!target) return;

    const fd = new FormData();
    fd.append('eventId', target._id);
    fd.append('products', form.products);
    fd.append('message', form.message);

    files.forEach((file) => {
      fd.append('documents', file);
    });

    try {
      setSubmitting(true);

      const res = await applyToEventApi(fd);

      setSuccess(res.message || 'Application submitted successfully!');
      setTarget(null);
      load();

      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setModalError(
        err.response?.data?.message || 'Failed to submit application.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const action = (ev) => {
    switch (ev.applicationStatus) {
      case 'approved':
        return (
          <Button
            variant="success"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() =>
              navigate(`/exhibitor/booth-selection/${ev._id}`)
            }
          >
            Select Booth <Icon d={ICONS.arrow} size={15} />
          </Button>
        );

      case 'pending':
        return (
          <Button
            variant="ghost"
            disabled
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Application Pending
          </Button>
        );

      case 'rejected':
        return (
          <Button
            variant="danger"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => openApply(ev)}
          >
            Re-apply to Event
          </Button>
        );

      default:
        return (
          <Button
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => openApply(ev)}
          >
            Apply to Exhibit <Icon d={ICONS.arrow} size={15} />
          </Button>
        );
    }
  };

  if (loading) return <PageLoader />;

  const detailStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 12.5,
    color: t.muted
  };

  return (
    <>
      {error && (
        <Alert type="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success">
          {success}
        </Alert>
      )}

      {/* Page Introduction */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 21,
              fontWeight: 800,
              color: t.text
            }}
          >
            Available Exhibitions
          </h2>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: 13,
              color: t.muted
            }}
          >
            Explore events and find the right platform for your business.
          </p>
        </div>

        <div
          style={{
            background: t.dark ? 'rgba(99,102,241,0.15)' : '#EAF0FA',
            color: t.dark ? '#818cf8' : '#244A8F',
            padding: '10px 16px',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Icon d={ICONS.ticket} size={17} />
          {events.length} Events Available
        </div>
      </div>

      {/* Event Cards */}
      {events.length === 0 ? (
        <Card>
          <EmptyState
            icon={ICONS.ticket}
            title="No open events"
            text="Check back later — organizers haven't published any upcoming expos yet."
          />
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 310px), 1fr))',
            gap: 22
          }}
        >
          {events.map((ev) => (
            <Card
              key={ev._id}
              style={{
                padding: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: `1px solid ${t.border}`,
                boxShadow: t.dark ? '0 5px 20px rgba(0,0,0,0.3)' : '0 5px 20px rgba(16,31,60,0.05)'
              }}
            >
              {/* Event Banner */}
              <div
                style={{
                  position: 'relative',
                  height: 175,
                  background: t.dark ? 'rgba(30,41,59,0.8)' : '#EAF0FA',
                  overflow: 'hidden'
                }}
              >
                <img
                  src={ev.bannerUrl || FALLBACK_BANNER}
                  alt={ev.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />

                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(to top, rgba(16,31,60,0.65), transparent 65%)'
                  }}
                />

                <div
                  style={{
                    position: 'absolute',
                    top: 13,
                    right: 13
                  }}
                >
                  <StatusBadge status={ev.status} />
                </div>

                <div
                  style={{
                    position: 'absolute',
                    bottom: 13,
                    left: 16,
                    color: '#FFFFFF',
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <span style={{ color: '#E7C982' }}>✦</span>
                  EVENTSPHERE EXHIBITION
                </div>
              </div>

              {/* Event Information */}
              <div
                style={{
                  padding: 20,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <h3
                  style={{
                    margin: '0 0 9px',
                    fontSize: 18,
                    fontWeight: 800,
                    color: t.text,
                    lineHeight: 1.4
                  }}
                >
                  {ev.title}
                </h3>

                {ev.description && (
                  <p
                    style={{
                      margin: '0 0 17px',
                      fontSize: 13,
                      color: t.muted,
                      lineHeight: 1.7
                    }}
                  >
                    {ev.description.length > 110
                      ? ev.description.slice(0, 110) + '…'
                      : ev.description}
                  </p>
                )}

                {/* Event Details */}
                <div
                  style={{
                    background: t.dark ? 'rgba(255,255,255,0.04)' : '#F7F9FC',
                    borderRadius: 12,
                    padding: 13,
                    display: 'grid',
                    gap: 12,
                    marginBottom: 17
                  }}
                >
                  <div style={detailStyle}>
                    <Icon d={ICONS.mapPin} size={16} />
                    <span>{ev.venue || 'Venue not specified'}</span>
                  </div>

                  <div style={detailStyle}>
                    <Icon d={ICONS.calendar} size={16} />
                    <span>
                      {new Date(ev.startDate).toLocaleDateString()}
                      {' – '}
                      {new Date(ev.endDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={detailStyle}>
                    <Icon d={ICONS.building} size={16} />
                    <span>
                      {ev.hallId?.name || 'Hall'}
                      {ev.hallId?.dimensions
                        ? ` (${ev.hallId.dimensions.rows}×${ev.hallId.dimensions.cols} booths)`
                        : ''}
                    </span>
                  </div>
                </div>

                {/* Application Status */}
                {ev.applicationStatus && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '11px 0',
                      borderTop: `1px solid ${t.border}`,
                      marginBottom: 12,
                      fontSize: 12.5,
                      color: t.muted
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>
                      Your application
                    </span>
                    <StatusBadge status={ev.applicationStatus} />
                  </div>
                )}

                <div style={{ marginTop: 'auto' }}>
                  {action(ev)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Application Modal */}
      <Modal
        show={!!target}
        onClose={() => !submitting && setTarget(null)}
        title={`Apply: ${target?.title || ''}`}
      >
        <form onSubmit={submit}>
          {modalError && (
            <Alert type="error">
              {modalError}
            </Alert>
          )}

          <div
            style={{
              background: t.dark ? 'rgba(99,102,241,0.12)' : '#EAF0FA',
              border: `1px solid ${t.border}`,
              borderRadius: 12,
              padding: 14,
              marginBottom: 20,
              display: 'flex',
              gap: 10,
              alignItems: 'center'
            }}
          >
            <Icon d={ICONS.info} size={19} color={t.dark ? '#818cf8' : '#244A8F'} />
            <span
              style={{
                fontSize: 12.5,
                color: t.dark ? '#818cf8' : '#244A8F',
                lineHeight: 1.5
              }}
            >
              Complete your application with your products and supporting documents.
            </span>
          </div>

          <Field
            label="Products / Services you will showcase"
            hint="Separate multiple products with commas"
          >
            <input
              required
              style={inputStyle(t)}
              value={form.products}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  products: e.target.value
                }))
              }
              placeholder="e.g. Smart Sensors, IoT Gateways"
            />
          </Field>

          <Field label="Message to organizers (optional)">
            <textarea
              style={{
                ...inputStyle(t),
                resize: 'vertical',
                minHeight: 95
              }}
              rows={3}
              value={form.message}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  message: e.target.value
                }))
              }
              placeholder="Tell us why you'd like to exhibit..."
            />
          </Field>

          <Field
            label="Supporting Documents"
            hint="Business license, brochure etc. PDF / image, max 5 files, 5MB each"
          >
            <div
              style={{
                border: `1.5px dashed ${t.border}`,
                borderRadius: 12,
                padding: 17,
                background: t.dark ? 'rgba(255,255,255,0.04)' : '#F8FAFD'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 12
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: t.dark ? 'rgba(99,102,241,0.15)' : '#EAF0FA',
                    display: 'grid',
                    placeItems: 'center',
                    color: t.dark ? '#818cf8' : '#244A8F'
                  }}
                >
                  <Icon d={ICONS.upload} size={19} />
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: t.text
                    }}
                  >
                    Upload your documents
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: t.muted,
                      marginTop: 3
                    }}
                  >
                    PDF, PNG, JPG or WEBP
                  </div>
                </div>
              </div>

              <input
                type="file"
                multiple
                accept="application/pdf,image/png,image/jpeg,image/webp"
                onChange={(e) =>
                  setFiles(Array.from(e.target.files).slice(0, 5))
                }
                style={{
                  width: '100%',
                  fontSize: 12,
                  color: t.soft
                }}
              />

              {files.length > 0 && (
                <div
                  style={{
                    marginTop: 12,
                    display: 'grid',
                    gap: 7
                  }}
                >
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      style={{
                        background: t.dark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
                        padding: '8px 10px',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 11.5,
                        color: t.text
                      }}
                    >
                      <Icon d={ICONS.file} size={15} color="#244A8F" />
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {file.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Field>

          <div
            style={{
              display: 'flex',
              gap: 10,
              marginTop: 22
            }}
          >
            <Button
              type="button"
              variant="ghost"
              disabled={submitting}
              onClick={() => setTarget(null)}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              loading={submitting}
              style={{ flex: 2, justifyContent: 'center' }}
            >
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

const detailStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  fontSize: 12.5,
  color: '#94a3b8'
};
