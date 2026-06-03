import React, { useState, useEffect } from 'react';
import { FaTicketAlt, FaPaperclip, FaChevronLeft } from 'react-icons/fa';
import adminService from '../../services/adminService';
import styles from './Feedback.module.css';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const STATUS_PILL = {
  open: { bg: '#FFF4E5', color: '#B26A00' },
  in_progress: { bg: '#E3F2FD', color: '#1565C0' },
  resolved: { bg: '#E6F4EA', color: '#2E7D32' },
  closed: { bg: '#ECEFF1', color: '#546E7A' },
};

const formatTime = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }) + ' IST';
  } catch { return iso; }
};

const StatusPill = ({ status }) => {
  const s = STATUS_PILL[status] || STATUS_PILL.open;
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>
      {(status || 'open').replace('_', ' ')}
    </span>
  );
};

const TicketDetail = ({ ticket, onBack, onUpdated }) => {
  const [reply, setReply] = useState('');
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [err, setErr] = useState('');

  const send = async (e) => {
    e.preventDefault();
    setErr('');
    if (!reply.trim()) { setErr('Message required.'); return; }
    setSending(true);
    try {
      const res = await adminService.replyToSupportTicket(ticket.ticket_id, reply.trim(), files);
      onUpdated(res.ticket);
      setReply(''); setFiles([]);
    } catch (e2) {
      setErr(typeof e2 === 'string' ? e2 : (e2.message || 'Failed to send.'));
    } finally {
      setSending(false);
    }
  };

  const changeStatus = async (newStatus) => {
    if (!newStatus || newStatus === ticket.status) return;
    setStatusBusy(true);
    try {
      const res = await adminService.updateSupportTicketStatus(ticket.ticket_id, newStatus);
      onUpdated(res.ticket);
    } catch (e) {
      setErr(typeof e === 'string' ? e : (e.message || 'Failed to update status.'));
    } finally {
      setStatusBusy(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem', background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2766AA', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16, padding: 0 }}>
        <FaChevronLeft /> Back to all tickets
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '1.4rem' }}>{ticket.subject}</h2>
          <div style={{ color: '#7f8c8d', fontSize: '0.85rem', marginTop: 4 }}>
            <strong>{ticket.username || 'Unknown'}</strong> · {ticket.user_email || 'no email'} · {ticket.category_label}
          </div>
          <div style={{ color: '#7f8c8d', fontSize: '0.75rem', marginTop: 2 }}>
            Ticket ID: {ticket.ticket_id} · Created {formatTime(ticket.created_at)}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StatusPill status={ticket.status} />
          <select
            value={ticket.status || 'open'}
            disabled={statusBusy}
            onChange={(e) => changeStatus(e.target.value)}
            style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #D0E7FF', fontSize: '0.85rem' }}
          >
            {STATUS_OPTIONS.filter(s => s.value).map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 20, maxHeight: 460, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '4px' }}>
        {(ticket.messages || []).map(m => (
          <div key={m.message_id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender === 'admin' ? 'flex-end' : 'flex-start' }}>
            <div style={{ background: m.sender === 'admin' ? '#E3F2FD' : '#F1F5F9', color: '#2c3e50', padding: '10px 14px', borderRadius: 10, maxWidth: '80%', whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#7f8c8d', marginBottom: 4 }}>
                <strong>{m.sender === 'admin' ? (m.sender_name || 'Support') : (m.sender_name || 'User')}</strong> · {formatTime(m.created_at)}
              </div>
              <div>{m.text}</div>
              {(m.attachments || []).length > 0 && (
                <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {m.attachments.map((a, i) => (
                    <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.78rem', color: '#2766AA' }}>
                      <FaPaperclip /> {a.filename}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={send} style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          rows={3}
          placeholder="Type your reply to the user…"
          style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #D0E7FF', outline: 'none', fontSize: '0.9rem', resize: 'vertical' }}
        />
        {files.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {files.map((f, i) => (
              <li key={i} style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FBFF', padding: '4px 8px', borderRadius: 4, fontSize: '0.8rem' }}>
                <span>{f.name}</span>
                <button type="button" onClick={() => setFiles(files.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
              </li>
            ))}
          </ul>
        )}
        {err && <div style={{ fontSize: '0.85rem', color: '#d9534f' }}>{err}</div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 6, border: '1px dashed #78B3F3', cursor: 'pointer', color: '#2766AA', fontSize: '0.8rem' }}>
            <FaPaperclip /> Attach
            <input
              type="file"
              multiple
              onChange={(e) => { setFiles([...files, ...Array.from(e.target.files || [])].slice(0, 5)); e.target.value = ''; }}
              style={{ display: 'none' }}
            />
          </label>
          <button type="submit" disabled={sending} style={{ padding: '8px 18px', background: '#2766AA', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.6 : 1 }}>
            {sending ? 'Sending…' : 'Send Reply'}
          </button>
        </div>
      </form>
    </div>
  );
};

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchTickets = async (status = statusFilter) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminService.getAllSupportTickets(status || null);
      setTickets(res.tickets || []);
    } catch (e) {
      setError(`Failed to load tickets: ${typeof e === 'string' ? e : (e.message || 'unknown')}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const onTicketUpdated = (updated) => {
    setSelected(updated);
    setTickets(prev => prev.map(t => t.ticket_id === updated.ticket_id ? updated : t));
  };

  const openTicket = async (t) => {
    try {
      const res = await adminService.getSupportTicket(t.ticket_id);
      setSelected(res.ticket);
    } catch (e) {
      setError(typeof e === 'string' ? e : (e.message || 'Failed to load ticket.'));
    }
  };

  if (selected) {
    return (
      <div className={styles.container}>
        <TicketDetail ticket={selected} onBack={() => setSelected(null)} onUpdated={onTicketUpdated} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Support Tickets</h1>
        <p>Total Tickets: {tickets.length}</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <label style={{ fontSize: '0.9rem', color: '#2c3e50' }}>
          Status:&nbsp;
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #D0E7FF' }}>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
        <button onClick={() => fetchTickets()} style={{ padding: '6px 14px', background: '#2766AA', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' }}>
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: 12, background: '#FEECEC', borderRadius: 8, color: '#A12626' }}>{error}</div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.feedbackTable}>
          <thead>
            <tr>
              <th>User</th>
              <th>Subject</th>
              <th>Category</th>
              <th>Status</th>
              <th>Messages</th>
              <th>Created</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading…</td></tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan="7" className={styles.emptyRow}>
                  <div className={styles.emptyState}>
                    <FaTicketAlt className={styles.emptyIcon} />
                    <p>No tickets found</p>
                  </div>
                </td>
              </tr>
            ) : (
              tickets.map(t => (
                <tr key={t.ticket_id} className={styles.tableRow} onClick={() => openTicket(t)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div className={styles.userCell}>
                      <strong>{t.username || 'Unknown'}</strong>
                      <span className={styles.userId}>{t.user_email || t.user_uuid}</span>
                    </div>
                  </td>
                  <td><div className={styles.textCell || ''} style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.subject}</div></td>
                  <td>{t.category_label}</td>
                  <td><StatusPill status={t.status} /></td>
                  <td>{(t.messages || []).length}</td>
                  <td>{formatTime(t.created_at)}</td>
                  <td>{formatTime(t.updated_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupportTickets;
