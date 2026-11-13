import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'https://event-sphere-management-puce.vercel.app';
const cleanBaseUrl = rawApiUrl.replace(/\/+$/, '');
const API_BASE = cleanBaseUrl.endsWith('/api') ? cleanBaseUrl : `${cleanBaseUrl}/api`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const getUserRole = () => {
  const directRole = localStorage.getItem('role') || localStorage.getItem('userRole');
  if (directRole) return directRole.toLowerCase();

  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userObj = JSON.parse(userStr);
      return (userObj.role || userObj.userRole || '').toLowerCase();
    }
  } catch (e) {
    // ignore parse error
  }
  return '';
};

const extractArray = (resData, preferredKeys = []) => {
  if (!resData) return [];
  if (Array.isArray(resData)) return resData;
  for (const key of preferredKeys) {
    if (Array.isArray(resData[key])) return resData[key];
  }
  const firstArray = Object.values(resData).find((val) => Array.isArray(val));
  return firstArray || [];
};

export const askChatbotApi = async (message) => {
  try {
    const headers = getAuthHeaders();
    const role = getUserRole();

    // Role ke mutabiq events API select karein
    let eventsPromise;
    if (role === 'admin' || role === 'superadmin') {
      eventsPromise = axios.get(`${API_BASE}/admin/events`, headers);
    } else if (role === 'exhibitor') {
      eventsPromise = axios.get(`${API_BASE}/exhibitor/events`, headers)
        .catch(() => axios.get(`${API_BASE}/attendee/events`, headers));
    } else {
      eventsPromise = axios.get(`${API_BASE}/attendee/events`, headers);
    }

    // Floor-plan routes sirf admin aur exhibitor ke liye call karein
    const canViewFloorPlan = role === 'admin' || role === 'superadmin' || role === 'exhibitor';

    const [eventsRes, hallsRes, floorRes] = await Promise.all([
      eventsPromise.catch(() => ({ data: {} })),
      canViewFloorPlan
        ? axios.get(`${API_BASE}/floor-plan/halls`, headers).catch(() => ({ data: {} }))
        : Promise.resolve({ data: {} }),
      canViewFloorPlan
        ? axios.get(`${API_BASE}/floor-plan/floor-plan`, headers).catch(() => ({ data: {} }))
        : Promise.resolve({ data: {} }),
    ]);

    // Attendee controller { success: true, data: [...] } bhejta hai, jabke admin { events: [...] }
    const events = extractArray(eventsRes.data, ['data', 'events', 'allEvents']);
    let halls = extractArray(hallsRes.data, ['halls', 'hall', 'data']);

    // Attendee ke liye events ke populated hallId se halls extract karein
    if (halls.length === 0 && events.length > 0) {
      const extractedHalls = [];
      const seenIds = new Set();
      events.forEach((ev) => {
        if (ev.hallId && typeof ev.hallId === 'object' && ev.hallId._id && !seenIds.has(ev.hallId._id)) {
          seenIds.add(ev.hallId._id);
          extractedHalls.push(ev.hallId);
        }
      });
      halls = extractedHalls;
    }

    const booths = extractArray(floorRes.data, ['booths', 'data']);
    const lowerMsg = message.toLowerCase();

    // 1. Booth Booking Queries
    if (lowerMsg.includes('book') || lowerMsg.includes('booth') || lowerMsg.includes('reserve') || lowerMsg.includes('exhibitor')) {
      const totalBooths = booths.length;
      const availableBooths = booths.filter((b) => b.status === 'available' || !b.isBooked).length;
      const bookedBooths = booths.filter((b) => b.status === 'booked' || b.isBooked).length;

      const statusSection = totalBooths > 0
        ? `**Live Floor Status:**\n` +
          `• **Total Booths:** ${totalBooths}\n` +
          `• **Available (Green):** ${availableBooths}\n` +
          `• **Reserved/Booked:** ${bookedBooths}\n\n`
        : '';

      return `### 🏢 EventSphere Booth Booking Guide\n\n` +
             statusSection +
             `**Step-by-Step Procedure:**\n` +
             `1. **Access Floor Plan:** Open *Floor Plan Builder* from the Exhibitor/Admin sidebar.\n` +
             `2. **Select Expo Hall:** Choose hall (e.g. ${halls[0]?.name || 'CyberSphere Expo Center'}).\n` +
             `3. **Pick Available Slot:** Click on any green booth card on the grid.\n` +
             `4. **Confirm Reservation:** Submit to reserve your booth space live!`;
    }

    // 2. Events Queries
    if (lowerMsg.includes('event') || lowerMsg.includes('expo') || lowerMsg.includes('program') || lowerMsg.includes('aptech')) {
      if (events.length === 0) return "Currently, there are no published events in the database.";
      const evList = events
        .map((e) => `• **${e.title}** (Pass: Rs. ${e.ticketPrice || 0} | Venue: ${e.venue || 'TBA'})`)
        .join('\n');
      return `Total **${events.length} event(s)** found in EventSphere:\n\n${evList}`;
    }

    // 3. Halls Queries
    if (lowerMsg.includes('hall') || lowerMsg.includes('floor')) {
      if (halls.length === 0) return "No exhibition halls are registered in the database yet.";
      const hallList = halls
        .map((h) => `• **${h.name}** (${h.dimensions?.rows || 4}x${h.dimensions?.cols || 8} Grid)`)
        .join('\n');
      return `Active Exhibition Halls:\n\n${hallList}`;
    }

    // 4. Ticket & Pass Queries
    if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('ticket') || lowerMsg.includes('pass')) {
      if (events.length > 0) {
        const priceList = events
          .map((e) => `• **${e.title}**: Rs. ${e.ticketPrice || 0}`)
          .join('\n');
        return `Here are the current event ticket prices:\n\n${priceList}`;
      }
      return "Event pass prices are listed inside each event card. You can check ticket prices on the Events page!";
    }

    // 5. Greetings
    if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey') || lowerMsg.includes('salam')) {
      return "Walaikum Assalam! 👋 I am your EventSphere AI Assistant. Ask me about available events, DB halls, or booth bookings!";
    }

    return "I am EventSphere Smart AI! Ask me queries like:\n- How to book a booth?\n- How many events are available?\n- Show active halls";
  } catch (err) {
    return "I'm having trouble connecting to EventSphere database right now.";
  }
};