import RoleSwitcher from "./components/RoleSwitcher";
import FarmerView from "./pages/FarmerView";
import OperatorView from "./pages/OperatorView";
import { useMandiStore } from "./store/useMandiStore";

export default function App() {
  const role = useMandiStore((state) => state.role);

  return (
    <div className="app-shell">
      <RoleSwitcher />
      <main>{role === "farmer" ? <FarmerView /> : <OperatorView />}</main>
    </div>
  );
}
