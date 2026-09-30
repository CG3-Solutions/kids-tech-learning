import { useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useApp } from "./lib/AppContext.jsx";
import TopBar from "./components/TopBar.jsx";
import ParentGate, { gatePassed } from "./components/ParentGate.jsx";
import KidLayout from "./layouts/KidLayout.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Profiles from "./pages/Profiles.jsx";
import Home from "./pages/kid/Home.jsx";
import Area from "./pages/kid/Area.jsx";
import Badges from "./pages/kid/Badges.jsx";
import ModulePage from "./pages/ModulePage.jsx";
import Overview from "./pages/parent/Overview.jsx";
import Children from "./pages/parent/Children.jsx";
import Reports from "./pages/parent/Reports.jsx";
import ScreenTime from "./pages/parent/ScreenTime.jsx";
import Notifications from "./pages/parent/Notifications.jsx";
import VoiceSound from "./pages/parent/VoiceSound.jsx";
import Account from "./pages/parent/Account.jsx";
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

// Kid pages: need a chosen child, and run inside the kid shell (navigation, screen time).
function KidGate({ children }) {
  const { activeChild, profile } = useApp();
  if (!profile) return <Loading />;
  if (!activeChild) return <Navigate to="/profiles" replace />;
  return <KidLayout>{children}</KidLayout>;
}
const Kid = ({ children }) => <RequireUser><KidGate>{children}</KidGate></RequireUser>;

// Parent pages: a grown-up check once per browser session.
function Parent({ children, admin = false }) {
  const [ok, setOk] = useState(gatePassed());
  const { profile, isAdmin } = useApp();
  if (!ok) return <><TopBar variant="public" /><main className="wrap"><ParentGate onPass={() => setOk(true)} /></main></>;
  if (admin) {
    if (!profile) return <Loading />;
    if (!isAdmin) return <Navigate to="/parent" replace />;
  }
  return children;
}

const P = (el, admin) => <RequireUser><Parent admin={admin}>{el}</Parent></RequireUser>;

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profiles" element={<RequireUser><Profiles /></RequireUser>} />
      <Route path="/learn" element={<Kid><Home /></Kid>} />
      <Route path="/learn/area/:areaId" element={<Kid><Area /></Kid>} />
      <Route path="/learn/badges" element={<Kid><Badges /></Kid>} />
      <Route path="/learn/:moduleId/:tab?" element={<Kid><ModulePage /></Kid>} />
      <Route path="/parent" element={P(<Overview />)} />
      <Route path="/parent/children" element={P(<Children />)} />
      <Route path="/parent/reports/:childId?" element={P(<Reports />)} />
      <Route path="/parent/screen-time" element={P(<ScreenTime />)} />
      <Route path="/parent/notifications" element={P(<Notifications />)} />
      <Route path="/parent/voice" element={P(<VoiceSound />)} />
      <Route path="/parent/account" element={P(<Account />)} />
      <Route path="/parent/guides/:slug" element={P(<Guides />)} />
      <Route path="/admin" element={P(<Admin />, true)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
