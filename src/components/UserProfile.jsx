```jsx
import React, { useState, useEffect } from 'react';

function UserProfile({ user }) {
  const [profile, setProfile] = useState(user);
  const [editing, setEditing] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchCsrfToken();
  }, []);

  const fetchProfile = async () => {
    const response = await fetch(`/profile/${user.id}`);
    const data = await response.json();
    setProfile(data);
  };

  const fetchCsrfToken = async () => {
    const response = await fetch('/csrf-token');
    const data = await response.json();
    setCsrfToken(data.csrfToken);
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const response = await fetch(`/profile/${user.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify(profile)
    });
    const data = await response.json();
    if (data.message) {
      alert(data.message);
      setEditing(false);
    } else {
      alert('Profile update failed');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prevProfile => ({
      ...prevProfile,
      [name]: value
    }));
  };

  return (
    <div>
      <h2>User Profile</h2>
      {editing ? (
        <form onSubmit={handleSave}>
          <input type="text" name="username" value={profile.username} onChange={handleChange} placeholder="Username" />
          <input type="email" name="email" value={profile.email} onChange={handleChange} placeholder="Email" />
          <input type="tel" name="phone" value={profile.phone} onChange={handleChange} placeholder="Phone" />
          <input type="text" name="address" value={profile.address} onChange={handleChange} placeholder="Address" />
          <button type="submit">Save</button>
        </form>
      ) : (
        <>
          <p>Username: {profile.username}</p>
          <p>Email: {profile.email}</p>
          <p>Phone: {profile.phone}</p>
          <p>Address: {profile.address}</p>
          <button onClick={handleEdit}>Edit Profile</button>
        </>
      )}
    </div>
  );
}

export default UserProfile;
```
