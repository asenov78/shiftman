```jsx
import React, { useState } from 'react';

function ShiftManagement() {
  const [userId, setUserId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/shift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, startTime, endTime })
    });
    const data = await response.json();
    if (data.message) {
      alert(data.message);
    } else {
      alert('Shift addition failed');
    }
  };

  return (
    <div>
      <h2>Shift Management</h2>
      <form onSubmit={handleSubmit}>
        <input type="number" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" />
        <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="Start Time" />
        <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="End Time" />
        <button type="submit">Add Shift</button>
      </form>
    </div>
  );
}

export default ShiftManagement;
```
