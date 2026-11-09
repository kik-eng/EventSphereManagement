
import { useState, useEffect, useCallback } from 'react';
import { useGlobalTheme } from '../../../core/context/ThemeContext';
import {
  createHallApi,
  getFloorPlanApi,
  updateBoothApi,
  approveBoothApi,
  getExhibitorsApi,
} from '../AdminServices/floorPlanServices';

/* ================= ICONS ================= */

const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  plus: 'M12 5v14 M5 12h14',
  check: 'M20 6L9 17l-5-5',
  close: 'M18 6L6 18 M6 6l12 12',
  refresh: 'M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
  filter: 'M22 3H2l8 9.46V19l4 2v-8.54L22 3',
  alert: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 8v4 M12 16h.01',
};

/* ================= THEME ================= */

const C = {
  navy: '#101F3C',
  royal: '#244A8F',
  blue: '#315FA8',
  softBlue: '#EAF0FA',
  gold: '#C6A15B',
  ivory: '#FAF9F6',
  grey: '#F1F3F7',
  white: '#FFFFFF',
  text: '#202B3C',
  muted: '#788397',
  border: '#E5E9F0',
};

const STATUS_CFG = {
  available: {
    label: 'Available',
    bg: '#E5F5ED',
    border: '#A9DFC2',
    text: '#20734A',
    dot: '#32A66A',
  },
  reserved: {
    label: 'Reserved',
    bg: '#FFF5DF',
    border: '#F1D69A',
    text: '#936A18',
    dot: '#D6A43D',
  },
  booked: {
    label: 'Booked',
    bg: '#FCE9E9',
    border: '#EABABA',
    text: '#A83D3D',
    dot: '#D65B5B',
  },
};

const CATEGORY_CFG = {
  VIP: { color: '#8B6A2E' },
  Premium: { color: '#315FA8' },
  Standard: { color: '#788397' },
};

/* ================= BOOTH CELL ================= */

const BoothCell = ({ booth, onClick }) => {
  const [hovered, setHovered] = useState(false);

  const status = STATUS_CFG[booth.status] || STATUS_CFG.available;
  const category = CATEGORY_CFG[booth.category] || CATEGORY_CFG.Standard;

  return (
    <button
      type="button"
      onClick={() => onClick(booth)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={`${booth.boothNumber} - ${booth.category} - ${booth.status}`}
      style={{
        width: 88,
        minHeight: 88,
        borderRadius: 11,
        border: `1.5px solid ${hovered ? C.gold : status.border}`,
        background: status.bg,
        padding: '9px 5px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered
          ? '0 7px 18px rgba(16,31,60,0.15)'
          : '0 2px 5px rgba(16,31,60,0.04)',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
    >
      <span style={{
        fontSize: 11,
        fontWeight: 800,
        color: status.text,
      }}>
        {booth.boothNumber}
      </span>

      <span style={{
        fontSize: 9,
        fontWeight: 700,
        color: category.color,
      }}>
        {booth.category}
      </span>

      <span style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: status.dot,
      }} />

      {booth.assignedExhibitor && (
        <span style={{
          position: 'absolute',
          bottom: 4,
          right: 5,
          fontSize: 8,
          fontWeight: 800,
          color: C.navy,
        }}>
          {booth.assignedExhibitor.name?.[0]?.toUpperCase()}
        </span>
      )}
    </button>
  );
};

/* ================= STAT CARD ================= */

const MiniStat = ({ label, value, accent, icon, isDark }) => (
  <div style={{
    background: isDark ? 'rgba(15,23,42,0.85)' : C.white,
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : C.border}`,
    borderRadius: 17,
    padding: '19px 20px',
    minWidth: 145,
    flex: 1,
    boxShadow: isDark
      ? '0 4px 15px rgba(0,0,0,0.3)'
      : '0 4px 15px rgba(16,31,60,0.035)',
    backdropFilter: isDark ? 'blur(12px)' : 'none',
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    }}>
      <span style={{
        fontSize: 11,
        fontWeight: 700,
        color: isDark ? '#94a3b8' : C.muted,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>
        {label}
      </span>

      <span style={{
        width: 32,
        height: 32,
        borderRadius: 10,
        background: `${accent}18`,
        color: accent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {icon}
      </span>
    </div>

    <div style={{
      marginTop: 10,
      fontSize: 27,
      fontWeight: 800,
      color: isDark ? '#f1f5f9' : C.text,
    }}>
      {value}
    </div>
  </div>
);

/* ================= MODAL ================= */

const Modal = ({ show, onClose, title, children, isDark }) => {
  if (!show) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(16,31,60,0.55)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 510,
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 20,
          background: isDark ? 'rgba(15,23,42,0.95)' : C.white,
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
          backdropFilter: isDark ? 'blur(20px)' : 'none',
          boxShadow: isDark
            ? '0 25px 70px rgba(0,0,0,0.6)'
            : '0 25px 70px rgba(16,31,60,0.25)',
        }}
      >
        <div style={{
          padding: '19px 23px',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : C.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h3 style={{
            margin: 0,
            color: isDark ? '#f1f5f9' : C.navy,
            fontSize: 17,
            fontWeight: 800,
          }}>
            {title}
          </h3>

          <button
            type="button"
            onClick={onClose}
            style={{
              ...iconButton,
              background: isDark ? 'rgba(255,255,255,0.08)' : C.white,
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : C.border}`,
              color: isDark ? '#94a3b8' : C.muted,
            }}
          >
            <Icon d={ICONS.close} size={17} />
          </button>
        </div>

        <div style={{ padding: 23 }}>
          {children}
        </div>
      </div>
    </div>
  );
};

/* ================= FORM HELPERS ================= */

const Label = ({ children }) => (
  <label style={{
    display: 'block',
    fontSize: 11,
    fontWeight: 800,
    color: C.muted,
    marginBottom: 7,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }}>
    {children}
  </label>
);

const inputStyle = {
  width: '100%',
  padding: '11px 13px',
  borderRadius: 10,
  border: `1px solid ${C.border}`,
  background: C.ivory,
  color: C.text,
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const iconButton = {
  width: 36,
  height: 36,
  borderRadius: 10,
  border: `1px solid ${C.border}`,
  background: C.white,
  color: C.muted,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const primaryButton = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '11px 19px',
  border: 'none',
  borderRadius: 11,
  background: C.navy,
  color: C.white,
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
};

const secondaryButton = {
  padding: '10px 17px',
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  background: C.white,
  color: C.text,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};

const SpinIcon = () => (
  <span style={{
    width: 14,
    height: 14,
    border: '2px solid rgba(255,255,255,0.4)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  }} />
);

/* ================= MAIN COMPONENT ================= */

export default function FloorPlanBuilder() {
  const { isDark } = useGlobalTheme();

  // Data
  const [halls, setHalls] = useState([]);
  const [booths, setBooths] = useState([]);
  const [exhibitors, setExhibitors] = useState([]);
  const [selectedHallId, setSelectedHallId] = useState('');

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals
  const [boothModal, setBoothModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [selectedBooth, setSelectedBooth] = useState(null);

  // Booth form
  const [boothForm, setBoothForm] = useState({
    category: '',
    price: '',
    status: '',
    exhibitorId: '',
  });

  const [saving, setSaving] = useState(false);

  // Hall form
  const [hallForm, setHallForm] = useState({
    name: '',
    description: '',
    rows: 5,
    cols: 8,
    defaultCategory: 'Standard',
    defaultPrice: 0,
  });

  const [creating, setCreating] = useState(false);

  /* ================= FETCH DATA ================= */

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [planRes, exhRes] = await Promise.all([
        getFloorPlanApi(selectedHallId || null),
        getExhibitorsApi(),
      ]);

      setHalls(planRes.halls || []);
      setBooths(planRes.booths || []);
      setExhibitors(exhRes.exhibitors || []);

      if (!selectedHallId && planRes.halls?.length) {
        setSelectedHallId(planRes.halls[0]._id);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load floor plan.'
      );
    } finally {
      setLoading(false);
    }
  }, [selectedHallId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ================= COMPUTED DATA ================= */

  const currentHallBooths = booths.filter(b =>
    !selectedHallId ||
    String(b.hallId) === selectedHallId ||
    b.hallId?._id === selectedHallId ||
    b.hallId === selectedHallId
  );

  const totalBooths = currentHallBooths.length;

  const availableCount = currentHallBooths.filter(
    b => b.status === 'available'
  ).length;

  const reservedCount = currentHallBooths.filter(
    b => b.status === 'reserved'
  ).length;

  const bookedCount = currentHallBooths.filter(
    b => b.status === 'booked'
  ).length;

  const revenue = currentHallBooths
    .filter(b => b.status === 'booked')
    .reduce((sum, b) => sum + (b.price || 0), 0);

  const currentHall =
    halls.find(h => h._id === selectedHallId) || halls[0];

  /* ================= BUILD GRID ================= */

  const buildGrid = () => {
    if (!currentHall?.dimensions) return [];

    const { rows, cols } = currentHall.dimensions;
    const grid = Array.from(
      { length: rows },
      () => Array(cols).fill(null)
    );

    currentHallBooths.forEach(b => {
      const r = b.gridPosition?.row;
      const c = b.gridPosition?.col;

      if (
        r !== undefined &&
        c !== undefined &&
        r < rows &&
        c < cols
      ) {
        grid[r][c] = b;
      }
    });

    return grid;
  };

  const grid = buildGrid();

  /* ================= BOOTH MODAL ================= */

  const openBoothModal = booth => {
    setSelectedBooth(booth);

    setBoothForm({
      category: booth.category,
      price: booth.price,
      status: booth.status,
      exhibitorId: booth.assignedExhibitor?._id || '',
    });

    setBoothModal(true);
  };

  /* ================= SAVE BOOTH ================= */

  const handleBoothSave = async () => {
    if (!selectedBooth) return;

    setSaving(true);
    setError('');

    try {
      const confirming =
        boothForm.status === 'booked' &&
        boothForm.exhibitorId &&
        selectedBooth.status !== 'booked';

      await updateBoothApi(selectedBooth._id, {
        category: boothForm.category,
        price: Number(boothForm.price),
        ...(confirming ? {} : { status: boothForm.status }),
      });

      if (confirming) {
        await approveBoothApi(
          selectedBooth._id,
          boothForm.exhibitorId
        );
      }

      setSuccess('Booth updated successfully!');
      setBoothModal(false);
      await fetchData();

      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to update booth.'
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================= CREATE HALL ================= */

  const handleCreateHall = async () => {
    if (!hallForm.name.trim()) {
      setError('Hall name is required.');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const res = await createHallApi({
        name: hallForm.name,
        description: hallForm.description,
        dimensions: {
          rows: Number(hallForm.rows),
          cols: Number(hallForm.cols),
        },
        defaultCategory: hallForm.defaultCategory,
        defaultPrice: Number(hallForm.defaultPrice),
      });

      setSuccess(res.message || 'Hall created successfully!');
      setCreateModal(false);

      setHallForm({
        name: '',
        description: '',
        rows: 5,
        cols: 8,
        defaultCategory: 'Standard',
        defaultPrice: 0,
      });

      setSelectedHallId('');
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to create hall.'
      );
    } finally {
      setCreating(false);
    }
  };

  /* ================= FILTERS ================= */

  const filteredBooths = currentHallBooths.filter(b => {
    const matchStatus =
      statusFilter === 'all' || b.status === statusFilter;

    const matchCategory =
      categoryFilter === 'all' || b.category === categoryFilter;

    return matchStatus && matchCategory;
  });

  const legendItems = [
    { label: 'Available', color: STATUS_CFG.available.dot },
    { label: 'Reserved', color: STATUS_CFG.reserved.dot },
    { label: 'Booked', color: STATUS_CFG.booked.dot },
    { label: 'VIP', color: '#8B6A2E' },
    { label: 'Premium', color: C.blue },
    { label: 'Standard', color: C.muted },
  ];

  /* ================= PAGE UI ================= */

  return (
    <div style={{
      minHeight: '100%',
      background: C.ivory,
      fontFamily: "'Inter','Segoe UI',sans-serif",
      color: C.text,
    }}>

      {/* PAGE HEADING */}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 15,
        marginBottom: 25,
      }}>
        <div>
          <p style={{
            margin: '0 0 6px',
            color: C.gold,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            Event Management / Floor Planning
          </p>

          <h1 style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 800,
            color: C.navy,
          }}>
            Floor Plan Builder
          </h1>

          <p style={{
            margin: '7px 0 0',
            fontSize: 13,
            color: C.muted,
          }}>
            Manage exhibition halls, booths and exhibitor assignments.
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
        }}>
          <button
            type="button"
            onClick={fetchData}
            style={iconButton}
            title="Refresh floor plan"
          >
            <Icon d={ICONS.refresh} size={17} />
          </button>

          <button
            type="button"
            onClick={() => setCreateModal(true)}
            style={primaryButton}
          >
            <Icon d={ICONS.plus} size={16} />
            Create New Hall
          </button>
        </div>
      </div>

      {/* MESSAGES */}

      {error && (
        <div style={{
          padding: '13px 16px',
          borderRadius: 12,
          marginBottom: 18,
          background: '#FCE9E9',
          border: '1px solid #EABABA',
          color: '#A83D3D',
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <Icon d={ICONS.alert} size={17} />
          <span style={{ flex: 1 }}>{error}</span>
          <button
            type="button"
            onClick={() => setError('')}
            style={{ ...iconButton, width: 28, height: 28 }}
          >
            <Icon d={ICONS.close} size={14} />
          </button>
        </div>
      )}

      {success && (
        <div style={{
          padding: '13px 16px',
          borderRadius: 12,
          marginBottom: 18,
          background: '#E5F5ED',
          border: '1px solid #A9DFC2',
          color: '#20734A',
          fontSize: 13,
          fontWeight: 600,
        }}>
          <Icon d={ICONS.check} size={15} /> {success}
        </div>
      )}

      {/* HALL SELECTOR */}

      {halls.length > 1 && (
        <div style={{
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: 15,
          padding: 17,
          marginBottom: 22,
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
        }}>
          <strong style={{
            color: C.navy,
            fontSize: 13,
            marginRight: 5,
          }}>
            Select Hall:
          </strong>

          {halls.map(h => (
            <button
              type="button"
              key={h._id}
              onClick={() => setSelectedHallId(h._id)}
              style={{
                padding: '8px 17px',
                borderRadius: 9,
                border: `1px solid ${
                  selectedHallId === h._id ? C.navy : C.border
                }`,
                background:
                  selectedHallId === h._id ? C.navy : C.white,
                color:
                  selectedHallId === h._id ? C.white : C.muted,
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {h.name}
            </button>
          ))}
        </div>
      )}

      {/* LOADING */}

      {loading ? (
        <div style={{
          background: C.white,
          borderRadius: 17,
          border: `1px solid ${C.border}`,
          padding: 35,
          textAlign: 'center',
          color: C.muted,
        }}>
          Loading floor plan...
        </div>
      ) : halls.length === 0 ? (

        /* EMPTY STATE */

        <div style={{
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          padding: '65px 20px',
          textAlign: 'center',
        }}>
          <div style={{
            width: 75,
            height: 75,
            margin: '0 auto 18px',
            borderRadius: 22,
            background: C.softBlue,
            color: C.royal,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon d={ICONS.grid} size={34} />
          </div>

          <h2 style={{
            margin: '0 0 9px',
            color: C.navy,
            fontSize: 21,
            fontWeight: 800,
          }}>
            No Hall Created Yet
          </h2>

          <p style={{
            color: C.muted,
            fontSize: 13,
            margin: '0 auto 22px',
            maxWidth: 390,
          }}>
            Create your first exhibition hall to start building your floor plan.
          </p>

          <button
            type="button"
            onClick={() => setCreateModal(true)}
            style={primaryButton}
          >
            <Icon d={ICONS.plus} size={17} />
            Create First Hall
          </button>
        </div>

      ) : (
        <>

          {/* CURRENT HALL INFO */}

          <div style={{
            background: C.navy,
            color: C.white,
            borderRadius: 17,
            padding: '20px 23px',
            marginBottom: 22,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <div>
              <p style={{
                margin: '0 0 5px',
                fontSize: 10,
                fontWeight: 700,
                color: '#DCC58F',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>
                Currently Selected Hall
              </p>

              <h2 style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 800,
              }}>
                {currentHall?.name}
              </h2>

              <p style={{
                margin: '6px 0 0',
                fontSize: 12,
                color: '#D0D9E8',
              }}>
                {currentHall?.dimensions?.rows} Rows × {currentHall?.dimensions?.cols} Columns
              </p>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 12,
              padding: '11px 17px',
            }}>
              <span style={{
                display: 'block',
                color: '#D0D9E8',
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
              }}>
                Total Booths
              </span>
              <strong style={{ fontSize: 23 }}>
                {totalBooths}
              </strong>
            </div>
          </div>

          {/* STATISTICS */}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))',
            gap: 14,
            marginBottom: 25,
          }}>
            <MiniStat
              label="Total Booths"
              value={totalBooths}
              accent={C.navy}
              icon={<Icon d={ICONS.grid} size={17} />}
            />

            <MiniStat
              label="Available"
              value={availableCount}
              accent={STATUS_CFG.available.dot}
              icon={<Icon d={ICONS.check} size={17} />}
            />

            <MiniStat
              label="Reserved"
              value={reservedCount}
              accent={STATUS_CFG.reserved.dot}
              icon={<Icon d={ICONS.filter} size={17} />}
            />

            <MiniStat
              label="Booked"
              value={bookedCount}
              accent={STATUS_CFG.booked.dot}
              icon={<Icon d={ICONS.check} size={17} />}
            />

            <MiniStat
              label="Revenue"
              value={`$${revenue.toLocaleString()}`}
              accent={C.gold}
              icon={<span style={{ fontWeight: 800 }}>$</span>}
            />
          </div>

          {/* LEGEND */}

          <div style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 15,
            padding: '15px 19px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 17,
          }}>
            <strong style={{
              fontSize: 11,
              color: C.navy,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              Legend
            </strong>

            {legendItems.map(item => (
              <span key={item.label} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                fontWeight: 600,
                color: C.muted,
              }}>
                <span style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: item.color,
                }} />
                {item.label}
              </span>
            ))}
          </div>

          {/* FILTERS */}

          <div style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 15,
            padding: '16px 18px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
          }}>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 800,
              color: C.navy,
            }}>
              <Icon d={ICONS.filter} size={15} />
              FILTER:
            </span>

            {['all', 'available', 'reserved', 'booked'].map(s => (
              <button
                type="button"
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '7px 13px',
                  borderRadius: 8,
                  border: `1px solid ${
                    statusFilter === s ? C.royal : C.border
                  }`,
                  background:
                    statusFilter === s ? C.softBlue : C.white,
                  color:
                    statusFilter === s ? C.royal : C.muted,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {s === 'all' ? 'All Status' : s}
              </button>
            ))}

            <span style={{
              width: 1,
              height: 22,
              background: C.border,
              margin: '0 3px',
            }} />

            {['all', 'VIP', 'Premium', 'Standard'].map(c => (
              <button
                type="button"
                key={c}
                onClick={() => setCategoryFilter(c)}
                style={{
                  padding: '7px 13px',
                  borderRadius: 8,
                  border: `1px solid ${
                    categoryFilter === c ? C.royal : C.border
                  }`,
                  background:
                    categoryFilter === c ? C.softBlue : C.white,
                  color:
                    categoryFilter === c ? C.royal : C.muted,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {c === 'all' ? 'All Categories' : c}
              </button>
            ))}
          </div>

          {/* INTERACTIVE FLOOR GRID */}

          <div style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 18,
            overflow: 'hidden',
            marginBottom: 24,
            boxShadow: '0 4px 18px rgba(16,31,60,0.035)',
          }}>
            <div style={{
              padding: '17px 21px',
              borderBottom: `1px solid ${C.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 10,
            }}>
              <div>
                <h3 style={{
                  margin: 0,
                  color: C.navy,
                  fontSize: 15,
                  fontWeight: 800,
                }}>
                  Interactive Booth Layout
                </h3>

                <p style={{
                  margin: '5px 0 0',
                  color: C.muted,
                  fontSize: 11,
                }}>
                  Select a booth to view or edit its details.
                </p>
              </div>

              <span style={{
                padding: '7px 12px',
                borderRadius: 8,
                background: C.softBlue,
                color: C.royal,
                fontSize: 11,
                fontWeight: 700,
              }}>
                {currentHall?.dimensions?.rows} × {currentHall?.dimensions?.cols} Grid
              </span>
            </div>

            <div style={{
              padding: 22,
              overflowX: 'auto',
              textAlign: 'center',
            }}>
              {grid.length === 0 ? (
                <p style={{
                  color: C.muted,
                  fontSize: 13,
                  padding: 30,
                }}>
                  No booths in this hall yet.
                </p>
              ) : (
                <div style={{
                  display: 'inline-block',
                  minWidth: 'max-content',
                }}>
                  {grid.map((row, rIdx) => (
                    <div key={rIdx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      marginBottom: 7,
                    }}>
                      <span style={{
                        width: 20,
                        fontSize: 10,
                        fontWeight: 800,
                        color: C.muted,
                      }}>
                        {rIdx + 1}
                      </span>

                      {row.map((booth, cIdx) => {
                        const matchFilter = booth
                          ? (
                            statusFilter === 'all' ||
                            booth.status === statusFilter
                          ) && (
                            categoryFilter === 'all' ||
                            booth.category === categoryFilter
                          )
                          : false;

                        return (
                          <div
                            key={cIdx}
                            style={{
                              opacity:
                                booth && !matchFilter ? 0.2 : 1,
                              transition: 'opacity 0.2s',
                            }}
                          >
                            {booth ? (
                              <BoothCell
                                booth={booth}
                                onClick={openBoothModal}
                              />
                            ) : (
                              <div style={{
                                width: 88,
                                minHeight: 88,
                                borderRadius: 11,
                                border: `1px dashed ${C.border}`,
                                background: C.grey,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#AAB2C0',
                                fontSize: 9,
                              }}>
                                {rIdx + 1},{cIdx + 1}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  <div style={{
                    display: 'flex',
                    gap: 7,
                    paddingLeft: 27,
                    marginTop: 8,
                  }}>
                    {(grid[0] || []).map((_, cIdx) => (
                      <span key={cIdx} style={{
                        width: 88,
                        textAlign: 'center',
                        fontSize: 10,
                        fontWeight: 800,
                        color: C.muted,
                      }}>
                        {cIdx + 1}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{
              padding: '12px 20px',
              background: C.ivory,
              borderTop: `1px solid ${C.border}`,
              fontSize: 11,
              color: C.muted,
            }}>
              Showing {filteredBooths.length} matching booths out of {totalBooths}.
            </div>
          </div>
        </>
      )}

      {/* ================= EDIT BOOTH MODAL ================= */}

      <Modal
        show={boothModal}
        onClose={() => setBoothModal(false)}
        title={`Edit Booth ${selectedBooth?.boothNumber || ''}`}
      >
        {selectedBooth && (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: 12,
              borderRadius: 11,
              background:
                STATUS_CFG[selectedBooth.status]?.bg || C.grey,
              marginBottom: 20,
            }}>
              <span style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                background:
                  STATUS_CFG[selectedBooth.status]?.dot || C.muted,
              }} />

              <strong style={{
                fontSize: 12,
                color:
                  STATUS_CFG[selectedBooth.status]?.text || C.text,
              }}>
                Currently {selectedBooth.status}
              </strong>

              {selectedBooth.assignedExhibitor && (
                <span style={{
                  marginLeft: 'auto',
                  fontSize: 11,
                  color: C.muted,
                }}>
                  {selectedBooth.assignedExhibitor.name}
                </span>
              )}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
              gap: 14,
              marginBottom: 17,
            }}>
              <div>
                <Label>Category</Label>
                <select
                  value={boothForm.category}
                  onChange={e =>
                    setBoothForm(f => ({
                      ...f,
                      category: e.target.value,
                    }))
                  }
                  style={inputStyle}
                >
                  <option value="VIP">VIP</option>
                  <option value="Premium">Premium</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>

              <div>
                <Label>Price ($)</Label>
                <input
                  type="number"
                  min="0"
                  value={boothForm.price}
                  onChange={e =>
                    setBoothForm(f => ({
                      ...f,
                      price: e.target.value,
                    }))
                  }
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: 17 }}>
              <Label>Status</Label>

              <div style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
              }}>
                {['available', 'reserved', 'booked'].map(s => {
                  const cfg = STATUS_CFG[s];
                  const active = boothForm.status === s;

                  return (
                    <button
                      type="button"
                      key={s}
                      onClick={() =>
                        setBoothForm(f => ({ ...f, status: s }))
                      }
                      style={{
                        flex: 1,
                        minWidth: 90,
                        padding: '10px 6px',
                        borderRadius: 9,
                        border: `1.5px solid ${
                          active ? cfg.dot : C.border
                        }`,
                        background: active ? cfg.bg : C.white,
                        color: active ? cfg.text : C.muted,
                        fontSize: 11,
                        fontWeight: 800,
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {boothForm.status === 'booked' && (
              <div style={{ marginBottom: 18 }}>
                <Label>Assign Exhibitor</Label>

                <select
                  value={boothForm.exhibitorId}
                  onChange={e =>
                    setBoothForm(f => ({
                      ...f,
                      exhibitorId: e.target.value,
                    }))
                  }
                  style={inputStyle}
                >
                  <option value="">— Select Exhibitor —</option>

                  {exhibitors.map(ex => (
                    <option key={ex._id} value={ex._id}>
                      {ex.name}{' '}
                      {ex.companyDetails?.companyName
                        ? `(${ex.companyDetails.companyName})`
                        : ''}
                    </option>
                  ))}
                </select>

                {exhibitors.length === 0 && (
                  <p style={{
                    color: '#B7791F',
                    fontSize: 11,
                    marginTop: 7,
                  }}>
                    No exhibitors registered yet.
                  </p>
                )}
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: 10,
              marginTop: 24,
            }}>
              <button
                type="button"
                onClick={() => setBoothModal(false)}
                style={{ ...secondaryButton, flex: 1 }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleBoothSave}
                disabled={saving}
                style={{
                  ...primaryButton,
                  flex: 1.5,
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? (
                  <><SpinIcon /> Saving...</>
                ) : (
                  <><Icon d={ICONS.check} size={15} /> Save Changes</>
                )}
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* ================= CREATE HALL MODAL ================= */}

      <Modal
        show={createModal}
        onClose={() => setCreateModal(false)}
        title="Create New Hall"
      >
        <div style={{ marginBottom: 16 }}>
          <Label>Hall Name *</Label>
          <input
            type="text"
            placeholder="e.g. Hall A, North Wing..."
            value={hallForm.name}
            onChange={e =>
              setHallForm(f => ({ ...f, name: e.target.value }))
            }
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Label>Description (Optional)</Label>
          <textarea
            placeholder="Brief description of this hall..."
            value={hallForm.description}
            onChange={e =>
              setHallForm(f => ({
                ...f,
                description: e.target.value,
              }))
            }
            rows={3}
            style={{
              ...inputStyle,
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
          gap: 14,
          marginBottom: 16,
        }}>
          <div>
            <Label>Rows</Label>
            <input
              type="number"
              min="1"
              max="20"
              value={hallForm.rows}
              onChange={e =>
                setHallForm(f => ({
                  ...f,
                  rows: e.target.value,
                }))
              }
              style={inputStyle}
            />
          </div>

          <div>
            <Label>Columns</Label>
            <input
              type="number"
              min="1"
              max="20"
              value={hallForm.cols}
              onChange={e =>
                setHallForm(f => ({
                  ...f,
                  cols: e.target.value,
                }))
              }
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
          gap: 14,
          marginBottom: 18,
        }}>
          <div>
            <Label>Default Category</Label>
            <select
              value={hallForm.defaultCategory}
              onChange={e =>
                setHallForm(f => ({
                  ...f,
                  defaultCategory: e.target.value,
                }))
              }
              style={inputStyle}
            >
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
              <option value="VIP">VIP</option>
            </select>
          </div>

          <div>
            <Label>Default Price ($)</Label>
            <input
              type="number"
              min="0"
              value={hallForm.defaultPrice}
              onChange={e =>
                setHallForm(f => ({
                  ...f,
                  defaultPrice: e.target.value,
                }))
              }
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{
          padding: '13px 15px',
          borderRadius: 11,
          background: C.softBlue,
          border: `1px solid #D5E1F3`,
          color: C.royal,
          fontSize: 12,
          fontWeight: 600,
          marginBottom: 20,
        }}>
          This will generate{' '}
          <strong>
            {Number(hallForm.rows) * Number(hallForm.cols)}
          </strong>{' '}
          booths ({hallForm.rows} rows × {hallForm.cols} columns).
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => setCreateModal(false)}
            style={{ ...secondaryButton, flex: 1 }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleCreateHall}
            disabled={creating}
            style={{
              ...primaryButton,
              flex: 1.5,
              opacity: creating ? 0.7 : 1,
            }}
          >
            {creating ? (
              <><SpinIcon /> Creating...</>
            ) : (
              <><Icon d={ICONS.plus} size={16} /> Create Hall</>
            )}
          </button>
        </div>
      </Modal>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 600px) {
          .floor-plan-responsive {
            padding: 14px !important;
          }
        }
      `}</style>
    </div>
  );
}
