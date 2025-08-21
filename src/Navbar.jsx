import { useState } from "react";

export default function Navbar({ onLogoClick }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="nav">
      {/* Logo on the left — click toggles sidebar */}
      <button
        className="logo"
        onClick={onLogoClick}
        aria-label="Toggle sidebar"
        title="Toggle sidebar"
      >
        {/* little icon + brand text */}
        <span aria-hidden>☰</span>
        <strong>MyApp</strong>
      </button>

      <div className="spacer" />

      {/* Simple dropdown on the right */}
      <div className="dropdown">
        <button
          className="dropbtn"
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          Menu ▾
        </button>

        {menuOpen && (
          <ul className="menu" role="menu">
            <li role="menuitem"><a href="#">Profile</a></li>
            <li role="menuitem"><a href="#">Settings</a></li>
            <li role="menuitem"><a href="logout.php">Sign out</a></li>
          </ul>
        )}
      </div>
    </header>
  );
}
