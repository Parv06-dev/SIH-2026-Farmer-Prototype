import { useMandiStore } from "../store/useMandiStore";

export default function RoleSwitcher() {
  const role = useMandiStore((state) => state.role);
  const setRole = useMandiStore((state) => state.setRole);

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          🌾
        </span>
        <div>
          <p className="brand-kicker">SIH 2026 · Smart Mandi</p>
          <h1>Farmer Procurement System</h1>
        </div>
      </div>
      <div className="role-switch" role="tablist" aria-label="Switch demonstration role">
        <button
          type="button"
          role="tab"
          aria-selected={role === "farmer"}
          className={role === "farmer" ? "active" : ""}
          onClick={() => setRole("farmer")}
        >
          Farmer View
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={role === "operator"}
          className={role === "operator" ? "active" : ""}
          onClick={() => setRole("operator")}
        >
          Mandi Operator View
        </button>
      </div>
    </header>
  );
}
