```jsx
import React, { useState, useEffect } from 'react';
import UserList from './UserList';
import RoleList from './RoleList';
import DepartmentList from './DepartmentList';
import ShiftManagement from './ShiftManagement';
import UserProfile from './UserProfile';

function Dashboard({ user, onLogout, refreshToken }) {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [token, setToken] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchDepartments();
    refreshTokenIfNeeded();
  }, []);

  const fetchUsers = async () => {
    const response = await fetch('/users');
    const data = await response.json();
    setUsers(data);
  };

  const fetchRoles = async () => {
    const response = await fetch('/roles');
    const data = await response.json();
    setRoles(data);
  };

  const fetchDepartments = async () => {
    const response = await fetch('/departments');
    const data = await response.json();
    setDepartments(data);
  };

  const refreshTokenIfNeeded = async () => {
    if (!token) {
      const response = await fetch('/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      const data = await response.json();
      if (data.token) {
        setToken(data.token);
      }
    }
  };

  return (
    <div>
      <h1>Welcome, {user.username}</h1>
      <button onClick={onLogout}>Logout</button>
      <UserProfile user={user} />
      <UserList users={users} />
      <RoleList roles={roles} />
      <DepartmentList departments={departments} />
      <ShiftManagement />
    </div>
  );
}

export default Dashboard;
```
