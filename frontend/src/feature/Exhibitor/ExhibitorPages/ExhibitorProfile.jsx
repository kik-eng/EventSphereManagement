import { useEffect, useState } from 'react';
import ExhibitorLayout from '../ExhibitorComponents/ExhibitorLayout';
import {
  useTheme,
  Icon,
  ICONS,
  Card,
  Alert,
  Button,
  Field,
  inputStyle,
  PageLoader,
} from '../ExhibitorComponents/ExhibitorUI';
import {
  getProfileApi,
  updateProfileApi,
  fileUrl,
} from '../ExhibitorServices/exhibitorServices';

const CATEGORIES = [
  'Technology',
  'Manufacturing',
  'Healthcare',
  'Education',
  'Food & Beverage',
  'Retail',
  'Automotive',
  'Other',
];

const EMPTY = {
  name: '',
  companyName: '',
  description: '',
  category: '',
  products: '',
  phone: '',
  website: '',
  contactEmail: '',
  logoUrl: '',
};

export default function ExhibitorProfile() {
  return (
    <ExhibitorLayout
      title="Company Profile"
      subtitle="Manage your company information and public exhibitor identity"
    >
      <ProfileContent />
    </ExhibitorLayout>
  );
}

function ProfileContent() {
  const t = useTheme();

  const [form, setForm] = useState(EMPTY);
  const [email, setEmail] = useState('');
  const [imgError, setImgError] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const { profile: p } = await getProfileApi();

        if (!active) return;

        const c = p.companyDetails || {};

        setEmail(p.email || '');

        setForm({
          name: p.name || '',
          companyName: c.companyName || '',
          description: c.description || '',
          category: c.category || '',
          products: (c.products || []).join(', '),
          phone: c.contact?.phone || '',
          website: c.contact?.website || '',
          contactEmail: c.contact?.email || '',
          logoUrl: c.logoUrl || '',
        });
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message || 'Failed to load profile.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const set = (key) => (e) => {
    if (key === 'logoUrl') setImgError(false);
    setForm((f) => ({
      ...f,
      [key]: e.target.value,
    }));
  };

  const focus = (e) => {
    e.target.style.borderColor = '#315FA8';
    e.target.style.boxShadow = '0 0 0 3px rgba(49,95,168,0.10)';
  };

  const blur = (e) => {
    e.target.style.borderColor = t.border;
    e.target.style.boxShadow = 'none';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!form.companyName.trim()) {
      return setError('Company name is required.');
    }

    try {
      setSaving(true);

      const res = await updateProfileApi(form);

      setForm((f) => ({
        ...f,
        logoUrl: res.profile.companyDetails?.logoUrl || f.logoUrl,
      }));

      const u = JSON.parse(localStorage.getItem('user') || '{}');
      u.name = res.profile.name;
      localStorage.setItem('user', JSON.stringify(u));

      setSuccess('Your company profile has been updated successfully!');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to update profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  const shownLogo = !imgError ? fileUrl(form.logoUrl.trim()) : '';

  const two = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
    gap: 18,
  };

  const sectionTitle = {
    margin: 0,
    fontSize: 16,
    fontWeight: 800,
    color: t.text,
  };

  const sectionSubtitle = {
    margin: '5px 0 0',
    fontSize: 12.5,
    color: t.muted,
    lineHeight: 1.6,
  };

  const sectionHeader = {
    display: 'flex',
    alignItems: 'center',
    gap: 13,
    marginBottom: 24,
  };

  const sectionIcon = {
    width: 42,
    height: 42,
    borderRadius: 13,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#EAF0FA',
    color: '#315FA8',
    flexShrink: 0,
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 1050 }}>
      {/* PAGE INTRO */}
      <div
        style={{
          marginBottom: 25,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#315FA8',
              letterSpacing: '1px',
              marginBottom: 6,
              textTransform: 'uppercase',
            }}
          >
            Exhibitor Workspace
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: 23,
              fontWeight: 800,
              color: t.text,
              letterSpacing: '-0.5px',
            }}
          >
            Company Information
          </h2>

          <p
            style={{
              margin: '7px 0 0',
              fontSize: 13,
              color: t.muted,
            }}
          >
            Keep your business details up to date.
          </p>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '9px 13px',
            borderRadius: 10,
            background: '#EAF7EF',
            color: '#218653',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          <Icon d={ICONS.check} size={14} />
          Profile Management
        </div>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* COMPANY LOGO */}
      <Card style={{ padding: 26, marginBottom: 22 }}>
        <div style={sectionHeader}>
          <div style={sectionIcon}>
            <Icon d={ICONS.building} size={21} />
          </div>

          <div>
            <h3 style={sectionTitle}>Company Logo</h3>
            <p style={sectionSubtitle}>
              Paste a direct image URL to represent your company logo.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 23,
            flexWrap: 'wrap',
            padding: 18,
            borderRadius: 15,
            background: t.thBg,
            border: `1px solid ${t.border}`,
          }}
        >
          <div
            style={{
              width: 105,
              height: 105,
              borderRadius: 20,
              overflow: 'hidden',
              flexShrink: 0,
              background: 'linear-gradient(135deg,#244A8F,#315FA8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: 36,
              fontWeight: 800,
              boxShadow: '0 5px 16px rgba(36,74,143,0.18)',
            }}
          >
            {shownLogo ? (
              <img
                src={shownLogo}
                alt="Company logo"
                onError={() => setImgError(true)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              (form.companyName || 'C')[0].toUpperCase()
            )}
          </div>

          <div style={{ flex: 1, minWidth: 240 }}>
            <h4
              style={{
                margin: '0 0 6px',
                fontSize: 15,
                fontWeight: 800,
                color: t.text,
              }}
            >
              {form.companyName || 'Your Company'}
            </h4>

            <p
              style={{
                margin: '0 0 12px',
                fontSize: 12.5,
                color: t.muted,
              }}
            >
              Enter a public image link (PNG, JPG, WEBP, or SVG URL).
            </p>

            <input
              type="url"
              style={inputStyle(t)}
              value={form.logoUrl}
              onChange={set('logoUrl')}
              onFocus={focus}
              onBlur={blur}
              placeholder="https://example.com/company-logo.png"
            />
          </div>
        </div>
      </Card>

      {/* COMPANY DETAILS */}
      <Card style={{ padding: 26, marginBottom: 22 }}>
        <div style={sectionHeader}>
          <div style={sectionIcon}>
            <Icon d={ICONS.file} size={21} />
          </div>

          <div>
            <h3 style={sectionTitle}>Company Details</h3>
            <p style={sectionSubtitle}>
              Basic information about your company and business.
            </p>
          </div>
        </div>

        <div style={two}>
          <Field label="Your Name *">
            <input
              style={inputStyle(t)}
              value={form.name}
              onChange={set('name')}
              onFocus={focus}
              onBlur={blur}
              required
              placeholder="Enter your name"
            />
          </Field>

          <Field label="Login Email" hint="Your login email cannot be changed">
            <input
              style={{ ...inputStyle(t), opacity: 0.65 }}
              value={email}
              disabled
            />
          </Field>

          <Field label="Company Name *">
            <input
              style={inputStyle(t)}
              value={form.companyName}
              onChange={set('companyName')}
              onFocus={focus}
              onBlur={blur}
              placeholder="e.g. Techno Solutions Pvt Ltd"
              required
            />
          </Field>

          <Field label="Industry / Category">
            <select
              style={{ ...inputStyle(t), cursor: 'pointer' }}
              value={form.category}
              onChange={set('category')}
            >
              <option value="">— Select Category —</option>

              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Company Description">
          <textarea
            style={{
              ...inputStyle(t),
              resize: 'vertical',
              minHeight: 110,
              lineHeight: 1.6,
            }}
            rows={4}
            value={form.description}
            onChange={set('description')}
            onFocus={focus}
            onBlur={blur}
            placeholder="Tell attendees and organizers about your company..."
          />
        </Field>

        <Field
          label="Products / Services"
          hint="Separate items with commas, e.g. CRM Software, Cloud Hosting, Mobile Apps"
        >
          <input
            style={inputStyle(t)}
            value={form.products}
            onChange={set('products')}
            onFocus={focus}
            onBlur={blur}
            placeholder="Enter products or services"
          />
        </Field>
      </Card>

      {/* CONTACT INFORMATION */}
      <Card style={{ padding: 26, marginBottom: 24 }}>
        <div style={sectionHeader}>
          <div style={sectionIcon}>
            <Icon d={ICONS.message} size={21} />
          </div>

          <div>
            <h3 style={sectionTitle}>Contact Information</h3>
            <p style={sectionSubtitle}>
              Add contact details so people can reach your company.
            </p>
          </div>
        </div>

        <div style={two}>
          <Field label="Contact Email">
            <input
              type="email"
              style={inputStyle(t)}
              value={form.contactEmail}
              onChange={set('contactEmail')}
              onFocus={focus}
              onBlur={blur}
              placeholder="company@example.com"
            />
          </Field>

          <Field label="Phone">
            <input
              style={inputStyle(t)}
              value={form.phone}
              onChange={set('phone')}
              onFocus={focus}
              onBlur={blur}
              placeholder="Enter phone number"
            />
          </Field>
        </div>

        <Field label="Website">
          <input
            type="url"
            style={inputStyle(t)}
            value={form.website}
            onChange={set('website')}
            onFocus={focus}
            onBlur={blur}
            placeholder="https://www.example.com"
          />
        </Field>
      </Card>

      {/* SAVE ACTION */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          paddingBottom: 20,
        }}
      >
        <Button
          type="submit"
          loading={saving}
          disabled={saving}
          style={{
            padding: '13px 28px',
            borderRadius: 12,
            minWidth: 165,
          }}
        >
          {!saving && (
            <Icon d={ICONS.check} size={16} strokeWidth={2.5} />
          )}
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
}