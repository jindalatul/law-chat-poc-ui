export default function Sidebar({ open, pinned, onClose, onTogglePin }) {
  return (
    <>
      <aside className={`sidebar ${open ? "open" : ""} ${pinned ? "pinned" : ""}`}>
        <button className="pin-btn" onClick={onTogglePin}>
          {pinned ? "📌 Unpin" : "📍 Pin"}
        </button>

        <nav>
          <a href="#">Dashboard</a>
          <a href="#">Cases</a>
          <a href="#">Documents</a>
        </nav>
      </aside>

      {open && !pinned && <div className="backdrop" onClick={onClose} />}
    </>
  );
}
