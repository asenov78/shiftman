```jsx
import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  const handleLogin = (token, user, refreshToken) => {
    setToken(token);
    setUser(user);
    setRefreshToken(refreshToken);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setRefreshToken(null);
  };

  return (
    <div className="App">
      {token ? (
        <Dashboard user={user} onLogout={handleLogout} refreshToken={refreshToken} />
      ) : (
        <>
          <Login onLogin={handleLogin} />
          <Register />
        </>
      )}
    </div>
  );
}

export default App;
```
