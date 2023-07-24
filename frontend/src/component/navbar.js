import React from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';

export function Navbar() {
  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li className="navbar-item">
          <Link to="/">Home</Link>
        </li>
        <li className="navbar-item">
          <Link to="/userinfo">UserInfo</Link>
        </li>
        <li className="navbar-item">
          <Link to="/groupdetail">GroupDetail</Link>
        </li>
      </ul>
    </nav>

  );
}