```jsx
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const [twoFactor, setTwoFactor] = useState(false);
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    fetch('/csrf-token')
      .then(response => response.json())
      .then(data => setCsrfToken(data.csrfToken));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({ username, password, token })
    });
    const data = await response.json();
    if (data.token) {
      onLogin(data.token, { username }, data.refreshToken);
    } else if (data.secret) {
      setSecret(data.secret);
      setTwoFactor(true);
    } else {
      alert('Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      {twoFactor && (
        <>
          <p>Scan this QR code with your authenticator app:</p>
          <QRCode value={`otpauth://totp/${username}?secret=${secret}&issuer=UserManagementSystem`} />
          <input type="text" value={token} onChange={(e) => setToken(e.target.value)} placeholder="2FA Token" />
        </>
      )}
      <button type="submit">{twoFactor ? 'Verify 2FA' : 'Login'}</button>
    </form>
  );
}

export default Login;
```
