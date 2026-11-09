import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const askChatbotApi = async (message) => {
  try {
    const [hallsRes, eventsRes, floorRes] = await Promise.all([
      axios.get(`${API_BASE}/floor-plan/halls`, getAuthHeaders()).catch(() => ({ data: {} })),
      axios.get(`${API_BASE}/admin/events`, getAuthHeaders()).catch(() => ({ data: {} })),
      axios.get(`${API_BASE}/floor-plan/floor-plan`, getAuthHeaders()).catch(() => ({ data: {} }))
    ]);

    const halls = hallsRes.data?.halls || hallsRes.data?.hall || (Array.isArray(hallsRes.data) ? hallsRes.data : []);
    const events = eventsRes.data?.events || (Array.isArray(eventsRes.data) ? eventsRes.data : []);
    const booths = floorRes.data?.booths || (Array.isArray(floorRes.data) ? floorRes.data : []);

    const lowerMsg = message.toLowerCase();

    // 🎯 DETAILED BOOTH BOOKING RESPONSE
   if (lowerMsg.includes('book') || lowerMsg.includes('booth') || lowerMsg.includes('reserve') || lowerMsg.includes('exhibitor')) {
  const totalBooths = booths.length;
  const availableBooths = booths.filter(b => b.status === 'available' || !b.isBooked).length;
  const bookedBooths = booths.filter(b => b.status === 'booked' || b.isBooked).length;

  return `### 🏢 EventSphere Booth Booking Guide\n\n` +
         `**Live Floor Status:**\n` +
         `* **Total Booths:** ${totalBooths}\n` +
         `* **Available (Green):** ${availableBooths}\n` +
         `* **Reserved/Booked:** ${bookedBooths}\n\n` +
         `**Step-by-Step Procedure:**\n` +
         `1. **Access Floor Plan:** Open *Floor Plan Builder* from the sidebar.\n` +
         `2. **Select Expo Hall:** Choose hall (e.g. ${halls[0]?.name || 'TECHWIZ'}).\n` +
         `3. **Pick Available Slot:** Click on any green booth card on the grid.\n` +
         `4. **Confirm Reservation:** Submit to reserve your booth space live!`;
}
    // 1. Events Queries
    if (lowerMsg.includes('event') || lowerMsg.includes('expo') || lowerMsg.includes('program') || lowerMsg.includes('aptech')) {
      if (events.length === 0) return "Currently, there are no published events in the database.";
      const evList = events.map(e => `• ${e.title} (Pass: $${e.ticketPrice || 0})`).join('\n');
      return `Total ${events.length} event(s) found in EventSphere:\n\n${evList}`;
    }

    // 2. Halls Queries
    if (lowerMsg.includes('hall') || lowerMsg.includes('floor')) {
      if (halls.length === 0) return "No exhibition halls are registered in the database yet.";
      const hallList = halls.map(h => `• ${h.name} (${h.dimensions?.rows || 5}x${h.dimensions?.cols || 8} Grid)`).join('\n');
      return `Active Exhibition Halls:\n\n${hallList}\n\nYou can manage and view booths in the Floor Plan Builder!`;
    }

    // 3. Ticket & Pass Queries
    if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('ticket') || lowerMsg.includes('pass')) {
      return "Event pass prices are listed inside each event card. You can check ticket prices on the Events page!";
    }

    // Greetings
    if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey') || lowerMsg.includes('salam')) {
      return "Walaikum Assalam! 👋 I am your EventSphere AI Assistant. Ask me about available events, DB halls, or booth bookings!";
    }

    return "I am EventSphere Smart AI! Ask me queries like:\n- 'How to book a booth?'\n- 'How many events are available?'\n- 'Show active halls'";

  } catch (err) {
    return "I'm having trouble connecting to EventSphere database right now.";
  }
};