import React from 'react';
import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav style={{ backgroundColor: '#f2f2f2' }}>
      <ul style={{ display: 'flex', justifyContent: 'center', padding: '0', margin: '0' }}>
        <li style={{ listStyle: 'none', margin: '0 10px' }}>
          <Link to="/">Home</Link>
        </li>
      </ul>
    </nav>
  );
}
