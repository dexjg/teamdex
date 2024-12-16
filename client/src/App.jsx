import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [names, setNames] = useState([]);
  const [newName, setNewName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError(""); // Clear previous error messages
    try {
      const response = await axios.post("http://localhost:8000/signup", { username, password });
      alert(response.data.message);
    } catch (err) {
      setError("Signup failed. Try again.");
    }
  };
  
  const handleLogin = async () => {
    setError(""); // Clear previous error messages
    try {
      const response = await axios.post("http://localhost:8000/login", { username, password });
      setUser(response.data.user);
      localStorage.setItem("token", response.data.token); // Store the token for authentication
      fetchNames();
    } catch (err) {
      setError("Login failed. Check your credentials.");
    }
  };
  

  const fetchNames = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/names", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNames(response.data.names);
    } catch (err) {
      setError("Failed to fetch names.");
    }
  };

  const addName = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8000/names",
        { name: newName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewName("");
      fetchNames();
    } catch (err) {
      setError("Failed to add name.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setNames([]);
  };

  return (
    <div className="App">
      <h1>User Management and Name List</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!user ? (
        <div>
          <h2>Signup or Login</h2>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleSignup}>Signup</button>
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div>
          <h2>Welcome, {user.username}!</h2>
          <button onClick={handleLogout}>Logout</button>
          <input
            placeholder="Enter a name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button onClick={addName}>Add Name</button>
          <h3>Your Names</h3>
          <ul>
            {names.map((name, index) => (
              <li key={index}>{name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
