import React from 'react';
import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav style={{ backgroundColor: '#f2f2f2' }}>
      <ul style={{ display: 'flex', justifyContent: 'center', padding: '0', margin: '0' }}>
        <li style={{ listStyle: 'none', margin: '0 10px' }}>
          <Link to="/">Home</Link>
        </li>
        <li style={{ listStyle: 'none', margin: '0 10px' }}>
          <Link to="/userinfo">UserInfo</Link>
        </li>
        <li style={{ listStyle: 'none', margin: '0 10px' }}>
          <Link to="/groupdetail">GroupDetail</Link>
        </li>
        <li style={{ listStyle: 'none', margin: '0 10px' }}>
          <Link to="/group">Group</Link>
        </li>
        <li style={{ listStyle: 'none', margin: '0 10px' }}>
          <Link to="/groupform">GroupForm</Link>
        </li>
      </ul>
    </nav>
  );
}
