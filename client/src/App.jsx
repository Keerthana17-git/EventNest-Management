import { useEffect, useState } from "react";
import "./App.css";
import AdminDashboard from "./AdminDashboard";
import Users from "./Users";

const API_URL = "http://localhost:5000/api";

function DataPage({ title, description, endpoint, columns, getRowKey }) {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    fetch(`${API_URL}/${endpoint}`)
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load data");
        return response.json();
      })
      .then((data) => {
        if (isMounted) setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (isMounted) setMessage("Unable to load this information. Check that the server is running.");
      });
    return () => { isMounted = false; };
  }, [endpoint]);

  return (
    <section className="management-page">
      <div className="dashboard-header"><div><h1>{title}</h1><p>{description}</p></div></div>
      <div className="dashboard-section">
        {message ? <p className="page-message">{message}</p> : (
          <div className="event-table">
            <div className="table-header" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
              {columns.map((column) => <span key={column.label}>{column.label}</span>)}
            </div>
            {items.length === 0 ? <p className="page-message">No records found.</p> : items.map((item, index) => (
              <div className="table-row" key={getRowKey(item, index)} style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
                {columns.map((column) => <span key={column.label}>{column.value(item)}</span>)}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function App() {
  const [page, setPage] = useState("dashboard");
  const pages = {
    dashboard: <AdminDashboard />,
    users: <Users />,
    events: <DataPage title="Events" description="View all EventNest events" endpoint="events" getRowKey={(event) => event._id || event.id} columns={[{ label: "Event Name", value: (event) => event.name }, { label: "Date", value: (event) => event.date }, { label: "Location", value: (event) => event.location }]} />,
    registrations: <DataPage title="Registrations" description="View all event registrations" endpoint="registrations" getRowKey={(registration, index) => registration._id || index} columns={[{ label: "Name", value: (registration) => registration.name }, { label: "Email", value: (registration) => registration.email }, { label: "Event", value: (registration) => registration.eventName }]} />,
  };
  const navigation = [["dashboard", "📊 Dashboard"], ["users", "👥 Users"], ["events", "📅 Events"], ["registrations", "📝 Registrations"]];

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <h2>EventNest</h2><p className="admin-title">ADMIN PANEL</p>
        {navigation.map(([name, label]) => <button key={name} type="button" className={page === name ? "active-menu" : ""} onClick={() => setPage(name)}>{label}</button>)}
      </aside>
      <main className="dashboard-content">{pages[page]}</main>
    </div>
  );
}

export default App;
