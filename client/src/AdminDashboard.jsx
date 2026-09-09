import { useEffect, useState } from "react";

function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/events").then((response) => response.json()).then((data) => setEvents(Array.isArray(data) ? data : [])).catch((error) => console.error("Error fetching events:", error));
    fetch("http://localhost:5000/api/registrations").then((response) => response.json()).then((data) => setRegistrations(Array.isArray(data) ? data : [])).catch((error) => console.error("Error fetching registrations:", error));
  }, []);

  return (<>
    <div className="dashboard-header"><div><h1>Dashboard</h1><p>Welcome to the EventNest Admin Dashboard</p></div><div className="admin-profile">👤 Admin</div></div>
    <div className="stats-container">
      <div className="stat-card"><div className="stat-icon">📅</div><div><p>Total Events</p><h2>{events.length}</h2></div></div>
      <div className="stat-card"><div className="stat-icon">📝</div><div><p>Total Registrations</p><h2>{registrations.length}</h2></div></div>
      <div className="stat-card"><div className="stat-icon">👥</div><div><p>Total Users</p><h2>{registrations.length}</h2></div></div>
      <div className="stat-card"><div className="stat-icon">🚀</div><div><p>Upcoming Events</p><h2>{events.length}</h2></div></div>
    </div>
    <section className="dashboard-section"><div className="section-header"><h2>Recent Events</h2></div><div className="event-table"><div className="table-header"><span>Event Name</span><span>Date</span><span>Location</span></div>{events.map((event) => <div className="table-row" key={event._id || event.id}><span>{event.name}</span><span>{event.date}</span><span>{event.location}</span></div>)}</div></section>
    <section className="dashboard-section"><div className="section-header"><h2>Recent Registrations</h2></div><div className="event-table"><div className="table-header"><span>Name</span><span>Email</span><span>Event</span></div>{registrations.map((registration, index) => <div className="table-row" key={registration._id || index}><span>{registration.name}</span><span>{registration.email}</span><span>{registration.eventName}</span></div>)}</div></section>
  </>);
}

export default AdminDashboard;
