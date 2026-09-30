import { useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useApp } from "./lib/AppContext.jsx";
import TopBar from "./components/TopBar.jsx";
import ParentGate, { gatePassed } from "./components/ParentGate.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Profiles from "./pages/Profiles.jsx";
import KidHome from "./pages/KidHome.jsx";
import ModulePage from "./pages/ModulePage.jsx";
import Parent from "./pages/Parent.jsx";
import Guides from "./pages/Guides.jsx";
import Admin from "./pages/Admin.jsx";

function Loading() {
  return <><TopBar variant="public" /><main className="wrap"><p className="lead" style={{ paddingTop: 40 }}>Loading…</p></main></>;
}

function RequireUser({ children }) {
  const { api, user } = useApp();
  const loc = useLocation();
  if (!api || user === undefined) return <Loading />;
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return children;
}

function RequireChild({ children }) {
  const { activeChild, profile } = useApp();
  if (!profile) return <Loading />;
  if (!activeChild) return <Navigate to="/profiles" replace />;
  return children;
}

function Gate({ children }) {
  const [ok, setOk] = useState(gatePassed());
  if (ok) return children;
  return <><TopBar variant="public" /><main className="wrap"><ParentGate onPass={() => setOk(true)} /></main></>;
}

function RequireAdmin({ children }) {
  const { profile, isAdmin } = useApp();
  if (!profile) return <Loading />;
  if (!isAdmin) return <Navigate to="/parent" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profiles" element={<RequireUser><Profiles /></RequireUser>} />
      <Route path="/learn" element={<RequireUser><RequireChild><KidHome /></RequireChild></RequireUser>} />
      <Route path="/learn/:moduleId/:tab?" element={<RequireUser><RequireChild><ModulePage /></RequireChild></RequireUser>} />
      <Route path="/parent" element={<RequireUser><Gate><Parent /></Gate></RequireUser>} />
      <Route path="/parent/guides/:slug" element={<RequireUser><Gate><Guides /></Gate></RequireUser>} />
      <Route path="/admin" element={<RequireUser><Gate><RequireAdmin><Admin /></RequireAdmin></Gate></RequireUser>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
