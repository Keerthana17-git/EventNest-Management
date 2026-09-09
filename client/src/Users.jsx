import { useEffect, useState } from "react";

function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "participant",
  });
  const [formMessage, setFormMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, []);

  const deleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("User deleted successfully");

        setUsers(
          users.filter((user) => user._id !== id)
        );
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Unable to delete user");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const addUser = async (event) => {
    event.preventDefault();
    setFormMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        setFormMessage(data.message || "Unable to add user.");
        return;
      }

      setUsers((currentUsers) => [data.user, ...currentUsers]);
      setForm({ name: "", email: "", password: "", role: "participant" });
      setShowForm(false);
    } catch (error) {
      console.error("Add user error:", error);
      setFormMessage("Unable to connect to the server.");
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="users-page">

      <div className="users-header">
        <div>
          <h1>User Management</h1>
          <p>Manage EventNest users</p>
        </div>

        <button
          className="add-user-button"
          type="button"
          onClick={() => {
            setFormMessage("");
            setShowForm((isVisible) => !isVisible);
          }}
        >
          + Add New User
        </button>
      </div>

      {showForm && (
        <form className="add-user-form" onSubmit={addUser}>
          <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email address" value={form.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="participant">Participant</option>
            <option value="organizer">Organizer</option>
            <option value="admin">Admin</option>
          </select>
          <button className="add-user-button" type="submit">Save User</button>
          {formMessage && <p className="form-message">{formMessage}</p>}
        </form>
      )}

      <div className="users-toolbar">

        <input
          type="text"
          placeholder="🔍 Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      <div className="users-table">

        <div className="users-table-header">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="no-users">
            {users.length === 0
              ? "No user accounts yet. Select Add New User to create one."
              : "No users match your search."}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              className="users-table-row"
              key={user._id}
            >
              <span>{user.name}</span>

              <span>{user.email}</span>

              <span>
                <span className="role-badge">
                  {user.role}
                </span>
              </span>

              <span>
                <span className="status-badge">
                  {user.status}
                </span>
              </span>

              <span className="action-buttons">

                <button
                  className="edit-button"
                  onClick={() =>
                    alert(
                      "Edit User feature coming next"
                    )
                  }
                >
                  ✏️
                </button>

                <button
                  className="delete-button"
                  onClick={() =>
                    deleteUser(user._id)
                  }
                >
                  🗑️
                </button>

              </span>
            </div>
          ))
        )}

      </div>

    </div>
  );
}

export default Users;
