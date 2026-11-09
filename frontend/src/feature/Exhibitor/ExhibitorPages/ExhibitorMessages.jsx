import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ExhibitorLayout from '../ExhibitorComponents/ExhibitorLayout';
import { useTheme, useIsMobile, Icon, ICONS, Card, Alert, Button, inputStyle, Spinner } from '../ExhibitorComponents/ExhibitorUI';
import { getInboxApi, getConversationApi, sendMessageApi, getSupportAdminApi } from '../ExhibitorServices/exhibitorServices';

export default function ExhibitorMessages() {
  return (
    <ExhibitorLayout title="Messages" subtitle="Chat with organizers and neighboring exhibitors">
      <MessagesContent />
    </ExhibitorLayout>
  );
}

function MessagesContent() {
  const t = useTheme();
  const isMobile = useIsMobile();
  const location = useLocation();
  const me = JSON.parse(localStorage.getItem('user') || '{}').id;

  const [inbox, setInbox] = useState([]);
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [active, setActive] = useState(
    location.state?.userId ? { userId: location.state.userId, name: location.state.name || 'Conversation' } : null
  );
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const activeId = active?.userId;

  const loadInbox = useCallback(async () => {
    try {
      const res = await getInboxApi();
      setInbox(res.conversations || []);
    } catch {
      /* silent */
    } finally {
      setLoadingInbox(false);
    }
  }, []);

  const loadChat = useCallback(async (userId) => {
    try {
      const res = await getConversationApi(userId);
      setMessages(res.messages || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load conversation.');
    }
  }, []);

  useEffect(() => { loadInbox(); }, [loadInbox]);

  useEffect(() => {
    if (activeId) loadChat(activeId);
    else setMessages([]);
  }, [activeId, loadChat]);

  // Har 5 second mein nayi messages check (polling)
  useEffect(() => {
    const id = setInterval(() => {
      loadInbox();
      if (activeId) loadChat(activeId);
    }, 5000);
    return () => clearInterval(id);
  }, [activeId, loadInbox, loadChat]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  const contactAdmin = async () => {
    try {
      const res = await getSupportAdminApi();
      setActive({ userId: res.admin._id, name: 'Admin Support' });
    } catch (err) {
      setError(err.response?.data?.message || 'Admin is not available right now.');
    }
  };

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeId) return;
    try {
      setSending(true);
      await sendMessageApi(activeId, text.trim());
      setText('');
      await loadChat(activeId);
      loadInbox();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const nameOf = (c) => c.user.companyDetails?.companyName || c.user.name;
  const showList = !isMobile || !active;
  const showChat = !isMobile || !!active;
  const height = isMobile ? 'calc(100vh - 150px)' : 'calc(100vh - 170px)';

  return (
    <>
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      <div style={{ display: 'flex', gap: 18, height, minHeight: 460 }}>

        {/* ───── Conversation list ───── */}
        {showList && (
          <Card style={{ width: isMobile ? '100%' : 320, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: 14, borderBottom: `1px solid ${t.border}` }}>
              <Button onClick={contactAdmin} style={{ width: '100%' }}>
                <Icon d={ICONS.message} size={15} /> Contact Admin
              </Button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loadingInbox ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 30, color: '#7c3aed' }}><Spinner size={20} /></div>
              ) : inbox.length === 0 ? (
                <p style={{ padding: 24, textAlign: 'center', fontSize: 13, color: t.muted }}>
                  No conversations yet. Contact the admin or message a neighbor from “My Booths”.
                </p>
              ) : (
                inbox.map((c) => {
                  const isActive = c._id === activeId;
                  return (
                    <div
                      key={c._id}
                      onClick={() => setActive({ userId: c._id, name: nameOf(c) })}
                      style={{
                        display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px', cursor: 'pointer',
                        borderBottom: `1px solid ${t.border}`,
                        background: isActive ? (t.dark ? 'rgba(124,58,237,0.16)' : '#ede9fe') : 'transparent',
                      }}
                    >
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', flexShrink: 0, color: '#fff', fontWeight: 800,
                        background: 'linear-gradient(135deg,#6d28d9,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {nameOf(c)[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nameOf(c)}</span>
                          <span style={{ fontSize: 11, color: t.muted, flexShrink: 0 }}>
                            {new Date(c.lastAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 12.5, color: t.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.lastMessage}</span>
                          {c.unread > 0 && (
                            <span style={{ background: '#7c3aed', color: '#fff', fontSize: 11, fontWeight: 800, borderRadius: 99, padding: '1px 7px', flexShrink: 0 }}>{c.unread}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        )}

        {/* ───── Chat window ───── */}
        {showChat && (
          <Card style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {!active ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: t.muted }}>
                <Icon d={ICONS.message} size={40} strokeWidth={1.2} />
                <p style={{ marginTop: 12, fontSize: 14 }}>Select a conversation to start chatting</p>
              </div>
            ) : (
              <>
                <div style={{ padding: '14px 18px', borderBottom: `1px solid ${t.border}`, background: t.thBg, display: 'flex', alignItems: 'center', gap: 12 }}>
                  {isMobile && (
                    <button onClick={() => setActive(null)} style={{ background: 'none', border: 'none', color: t.soft, cursor: 'pointer', fontSize: 18 }}>←</button>
                  )}
                  <strong style={{ color: t.text, fontSize: 15 }}>{active.name}</strong>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {messages.length === 0 && <p style={{ textAlign: 'center', color: t.muted, fontSize: 13, marginTop: 30 }}>No messages yet. Say hello 👋</p>}
                  {messages.map((m) => {
                    const mine = String(m.sender) === String(me);
                    return (
                      <div key={m._id} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                        <div style={{
                          padding: '9px 14px', borderRadius: 16, fontSize: 14, lineHeight: 1.45, wordBreak: 'break-word',
                          borderBottomRightRadius: mine ? 4 : 16, borderBottomLeftRadius: mine ? 16 : 4,
                          background: mine ? 'linear-gradient(135deg,#6d28d9,#8b5cf6)' : (t.dark ? 'rgba(255,255,255,0.07)' : '#f1f5f9'),
                          color: mine ? '#fff' : t.text,
                        }}>
                          {m.text}
                        </div>
                        <span style={{ fontSize: 10.5, color: t.muted, display: 'block', textAlign: mine ? 'right' : 'left', marginTop: 3 }}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                <form onSubmit={send} style={{ display: 'flex', gap: 10, padding: 14, borderTop: `1px solid ${t.border}` }}>
                  <input
                    style={inputStyle(t)} value={text} maxLength={1000}
                    onChange={(e) => setText(e.target.value)} placeholder="Type a message…"
                  />
                  <Button type="submit" loading={sending} disabled={!text.trim()}>
                    <Icon d={ICONS.send} size={15} />
                  </Button>
                </form>
              </>
            )}
          </Card>
        )}
      </div>
    </>
  );
}