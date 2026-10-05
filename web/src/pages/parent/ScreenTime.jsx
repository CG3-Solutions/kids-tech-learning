import ParentLayout from "../../layouts/ParentLayout.jsx";
import { useApp, localDay } from "../../lib/AppContext.jsx";
import { useFamily } from "../../lib/useFamily.js";
import { Avatar } from "../../components/Character.jsx";

const LIMITS = [null, 15, 30, 45, 60, 90, 120, 180];
const label = m => (m == null ? "No limit" : m < 60 ? `${m} min` : `${m / 60} ${m === 60 ? "hour" : "hours"}`);

export default function ScreenTime() {
  const { api, children, loadAccount, setError } = useApp();
  const { usage, minutesOn } = useFamily(1);
  const today = localDay();
  const setLimit = async (id, m) => { try { await api.updateChild(id, { daily_limit_min: m }); await loadAccount(); } catch (e) { setError(e.message); } };
  const addTime = async id => { try { await api.addUsage(id, today, 0, 15 * 60); await loadAccount(); } catch (e) { setError(e.message); } };
  const bonus = id => Math.round((usage.find(u => u.child_id === id && u.day === today)?.bonus_seconds ?? 0) / 60);
  return (
    <ParentLayout title="Screen time">
      <p className="lead">Set a daily learning limit for each child. Spark Lab counts active time only (it pauses when the tab is hidden or nobody touches the screen for 2 minutes), shows a 5-minute warning, then a friendly “Time's up” screen.</p>
      <div className="pc-table-wrap">
        <table className="pc-table">
          <thead><tr><th>Child</th><th>Daily limit</th><th>Used today</th><th>Extra today</th><th /></tr></thead>
          <tbody>
            {children.map(c => {
              const used = minutesOn(c.id, today), lim = c.daily_limit_min;
              return (
                <tr key={c.id}>
                  <td><span className="who-cell"><Avatar value={c.avatar} size="sm" /><b>{c.name}</b></span></td>
                  <td>
                    <label className="sr-only" htmlFor={`lim-${c.id}`}>Daily limit for {c.name}</label>
                    <select id={`lim-${c.id}`} className="select" value={lim ?? ""} onChange={e => setLimit(c.id, e.target.value === "" ? null : Number(e.target.value))}>
                      {LIMITS.map(m => <option key={m ?? "none"} value={m ?? ""}>{label(m)}</option>)}
                    </select>
                  </td>
                  <td>{used} min{lim ? <div className="meter"><i style={{ width: `${Math.min(100, (used / (lim + bonus(c.id))) * 100)}%` }} className={used >= lim + bonus(c.id) ? "full" : ""} /></div> : null}</td>
                  <td>{bonus(c.id) ? `+${bonus(c.id)} min` : "—"}</td>
                  <td className="right">{lim ? <button className="btn ghost" onClick={() => addTime(c.id)}>+15 min today</button> : null}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="note">Spark Lab can only limit time inside Spark Lab. To limit the whole device, use Google Family Link (Android) or Screen Time (iPhone and iPad).</div>
    </ParentLayout>
  );
}
