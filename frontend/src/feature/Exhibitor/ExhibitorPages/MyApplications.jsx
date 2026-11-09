
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ExhibitorLayout from '../ExhibitorComponents/ExhibitorLayout';
import {
  useTheme, Icon, ICONS, Card, Alert, Button,
  StatusBadge, EmptyState, PageLoader
} from '../ExhibitorComponents/ExhibitorUI';
import {
  getMyApplicationsApi,
  withdrawApplicationApi,
  fileUrl
} from '../ExhibitorServices/exhibitorServices';

export default function MyApplications() {
  return (
    <ExhibitorLayout
      title="My Applications"
      subtitle="Track and manage your exhibition applications"
    >
      <ApplicationsContent />
    </ExhibitorLayout>
  );
}

function ApplicationsContent() {
  const t = useTheme();
  const navigate = useNavigate();

  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await getMyApplicationsApi();
      setApps(res.applications || []);
      setError('');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load applications.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const withdraw = async (id) => {
    if (!window.confirm('Withdraw this application?')) return;

    try {
      setBusyId(id);
      await withdrawApplicationApi(id);
      setSuccess('Application withdrawn successfully.');
      await load();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to withdraw application.'
      );
    } finally {
      setBusyId('');
    }
  };

  const counts = {
    total: apps.length,
    pending: apps.filter(a => a.status === 'pending').length,
    approved: apps.filter(a => a.status === 'approved').length,
    rejected: apps.filter(a => a.status === 'rejected').length
  };

  if (loading) return <PageLoader />;

  const stats = [
    {
      label: 'Total Applications',
      value: counts.total,
      icon: ICONS.file,
      color: '#244A8F',
      bg: '#EAF0FA'
    },
    {
      label: 'Pending Review',
      value: counts.pending,
      icon: ICONS.activity,
      color: '#B17A27',
      bg: '#FBF2E3'
    },
    {
      label: 'Approved',
      value: counts.approved,
      icon: ICONS.check,
      color: '#23845D',
      bg: '#E6F5EE'
    },
    {
      label: 'Rejected',
      value: counts.rejected,
      icon: ICONS.alert,
      color: '#C34D52',
      bg: '#FCEBED'
    }
  ];

  return (
    <>
      {error && (
        <Alert type="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && <Alert type="success">{success}</Alert>}

      {/* Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,190px),1fr))',
        gap: 15,
        marginBottom: 25
      }}>
        {stats.map(stat => (
          <Card key={stat.label} style={{ padding: 18 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10
            }}>
              <div>
                <p style={{
                  margin: 0,
                  fontSize: 12,
                  color: t.muted,
                  fontWeight: 600
                }}>
                  {stat.label}
                </p>

                <h2 style={{
                  margin: '9px 0 0',
                  fontSize: 27,
                  fontWeight: 800,
                  color: t.text
                }}>
                  {stat.value}
                </h2>
              </div>

              <div style={{
                width: 43,
                height: 43,
                borderRadius: 12,
                display: 'grid',
                placeItems: 'center',
                background: stat.bg,
                color: stat.color
              }}>
                <Icon d={stat.icon} size={21} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Section Heading */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 18
      }}>
        <div>
          <h2 style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 800,
            color: t.text
          }}>
            Application History
          </h2>

          <p style={{
            margin: '5px 0 0',
            fontSize: 12.5,
            color: t.muted
          }}>
            View your submitted applications and their latest status.
          </p>
        </div>

        <Button
          variant="ghost"
          onClick={() => navigate('/exhibitor/events')}
        >
          <Icon d={ICONS.plus} size={15} />
          Explore Events
        </Button>
      </div>

      {/* Applications */}
      {apps.length === 0 ? (
        <Card>
          <EmptyState
            icon={ICONS.file}
            title="No applications yet"
            text="You haven't applied to any exhibitions. Explore upcoming events and submit your first application."
            action={
              <Button onClick={() => navigate('/exhibitor/events')}>
                Browse Events <Icon d={ICONS.arrow} size={15} />
              </Button>
            }
          />
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: 17 }}>
          {apps.map(a => (
            <Card key={a._id} style={{
              padding: 22,
              border: '1px solid #E5EAF2',
              boxShadow: '0 4px 18px rgba(16,31,60,0.04)'
            }}>

              {/* Event Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 15,
                flexWrap: 'wrap',
                marginBottom: 18
              }}>
                <div style={{
                  display: 'flex',
                  gap: 14,
                  minWidth: 0,
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: 62,
                    height: 62,
                    minWidth: 62,
                    borderRadius: 16,
                    background: 'linear-gradient(135deg,#101F3C,#244A8F,#4778BD)',
                    color: '#FFFFFF',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: '0 5px 14px rgba(36,74,143,0.2)'
                  }}>
                    <Icon d={ICONS.building} size={29} />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <h3 style={{
                      margin: '0 0 7px',
                      fontSize: 17,
                      fontWeight: 800,
                      color: t.text
                    }}>
                      {a.event?.title || 'Event removed'}
                    </h3>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      flexWrap: 'wrap',
                      fontSize: 12.5,
                      color: t.muted
                    }}>
                      <Icon d={ICONS.building} size={14} />
                      {a.event?.venue || 'Venue unavailable'}

                      {a.event?.startDate && (
                        <>
                          <span>·</span>
                          <Icon d={ICONS.activity} size={14} />
                          {new Date(a.event.startDate).toLocaleDateString()}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <StatusBadge status={a.status} />
              </div>

              <div style={{
                height: 1,
                background: '#EAEFF5',
                marginBottom: 17
              }} />

              {/* Application Information */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,210px),1fr))',
                gap: 15,
                marginBottom: 17
              }}>
                <InfoItem
                  icon={ICONS.activity}
                  label="Applied On"
                  value={new Date(a.createdAt).toLocaleDateString()}
                  color="#244A8F"
                  bg="#EAF0FA"
                />

                <InfoItem
                  icon={ICONS.building}
                  label="Products / Services"
                  value={
                    a.products?.length > 0
                      ? a.products.join(', ')
                      : 'Not specified'
                  }
                  color="#A77B35"
                  bg="#FBF2E3"
                />
              </div>

              {/* Your Message */}
              {a.message && (
                <div style={{
                  background: '#F7F9FC',
                  borderRadius: 11,
                  padding: 13,
                  marginBottom: 15,
                  border: '1px solid #E7EBF2'
                }}>
                  <p style={{
                    margin: '0 0 6px',
                    fontSize: 11,
                    fontWeight: 800,
                    color: '#788397',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}>
                    Your Message
                  </p>

                  <p style={{
                    margin: 0,
                    fontSize: 13,
                    color: t.text,
                    lineHeight: 1.6
                  }}>
                    “{a.message}”
                  </p>
                </div>
              )}

              {/* Supporting Documents */}
              {a.documents?.length > 0 && (
                <div style={{ marginBottom: 17 }}>
                  <p style={{
                    margin: '0 0 12px',
                    fontSize: 12,
                    fontWeight: 800,
                    color: t.text
                  }}>
                    Supporting Documents
                  </p>

                  <div style={{
                    display: 'flex',
                    gap: 14,
                    flexWrap: 'wrap'
                  }}>
                    {a.documents.map((d, i) => {
                      const url = fileUrl(d.url);
                      const fileName = d.name || d.url || 'Document';

                      const isImage =
                        /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(String(d.url || '')) ||
                        /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(String(fileName));

                      return (
                        <div key={i} style={{
                          width: 180,
                          maxWidth: '100%',
                          border: '1px solid #E7EBF2',
                          borderRadius: 13,
                          overflow: 'hidden',
                          background: '#FFFFFF'
                        }}>

                          {/* Actual Image Preview */}
                          {isImage ? (
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'block',
                                height: 125,
                                background: 'linear-gradient(135deg,#EAF0FA,#D9E5F7)'
                              }}
                            >
                              <img
                                src={url}
                                alt={fileName}
                                loading="lazy"
                                style={{
                                  width: '100%',
                                  height: 125,
                                  objectFit: 'cover',
                                  display: 'block'
                                }}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </a>
                          ) : (
                            /* PDF, SVG and Other Files */
                            <div style={{
                              height: 125,
                              display: 'grid',
                              placeItems: 'center',
                              background: 'linear-gradient(135deg,#FBF5E9,#F1E2C3)',
                              color: '#A77B35'
                            }}>
                              <div style={{
                                width: 54,
                                height: 54,
                                borderRadius: 16,
                                background: '#FFFFFF',
                                display: 'grid',
                                placeItems: 'center',
                                boxShadow: '0 4px 12px rgba(16,31,60,0.08)'
                              }}>
                                <Icon d={ICONS.file} size={28} />
                              </div>
                            </div>
                          )}

                          <div style={{ padding: 11 }}>
                            <p style={{
                              margin: '0 0 8px',
                              fontSize: 11,
                              fontWeight: 700,
                              color: t.text,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }} title={fileName}>
                              {fileName}
                            </p>

                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: '#315FA8',
                                fontSize: 11,
                                fontWeight: 700,
                                textDecoration: 'none'
                              }}
                            >
                              Open Document ↗
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Admin Remarks */}
              {a.adminRemarks && (
                <div style={{
                  padding: '13px 15px',
                  borderRadius: 11,
                  marginBottom: 17,
                  fontSize: 13,
                  background: '#FBF5E9',
                  color: '#8B682C',
                  border: '1px solid #EAD9B5'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontWeight: 800,
                    marginBottom: 6
                  }}>
                    <Icon d={ICONS.alert} size={16} />
                    Admin Remarks
                  </div>

                  <div style={{ lineHeight: 1.6 }}>
                    {a.adminRemarks}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
                paddingTop: 15,
                borderTop: '1px solid #EAEFF5'
              }}>
                {a.status === 'approved' && (
                  <Button
                    variant="success"
                    onClick={() =>
                      navigate(`/exhibitor/booth-selection/${a.event?._id}`)
                    }
                  >
                    <Icon d={ICONS.floorPlan} size={15} />
                    Select Booth
                    <Icon d={ICONS.arrow} size={14} />
                  </Button>
                )}

                {a.status === 'pending' && (
                  <Button
                    variant="danger"
                    loading={busyId === a._id}
                    onClick={() => withdraw(a._id)}
                  >
                    <Icon d={ICONS.trash} size={14} />
                    Withdraw Application
                  </Button>
                )}

                {a.status === 'rejected' && (
                  <Button onClick={() => navigate('/exhibitor/events')}>
                    <Icon d={ICONS.refresh} size={14} />
                    Re-apply
                  </Button>
                )}

                <Button
                  variant="ghost"
                  onClick={() => navigate('/exhibitor/messages')}
                >
                  <Icon d={ICONS.message} size={14} />
                  Contact Admin
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

function InfoItem({ icon, label, value, color, bg }) {
  return (
    <div style={{
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start'
    }}>
      <div style={{
        width: 36,
        height: 36,
        minWidth: 36,
        borderRadius: 10,
        background: bg,
        color,
        display: 'grid',
        placeItems: 'center'
      }}>
        <Icon d={icon} size={17} />
      </div>

      <div style={{ minWidth: 0 }}>
        <p style={{
          margin: 0,
          fontSize: 11,
          color: '#788397',
          fontWeight: 700
        }}>
          {label}
        </p>

        <p style={{
          margin: '4px 0 0',
          fontSize: 12.5,
          color: '#202B3C',
          fontWeight: 600,
          lineHeight: 1.5,
          overflowWrap: 'anywhere'
        }}>
          {value}
        </p>
      </div>
    </div>
  );
}
