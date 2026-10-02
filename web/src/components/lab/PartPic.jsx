// A small picture of a lab part, drawn exactly as it looks on the board, so a child can match
// the part in the tray (or in "gather the parts") to the one they place.
import PartGlyph from "./PartGlyph.jsx";
import { PITCH, localPins } from "../../lib/circuit/board.js";

export default function PartPic({ type, size = 56 }) {
  const part = { type, id: "", uid: `pic-${type}`, at: [0, 0], dir: 0, len: 2, ohms: 100, colour: "red", anchorXY: [0, 0] };
  const pins = Object.values(localPins(part));
  const xs = pins.map(p => p[0] * PITCH), ys = pins.map(p => p[1] * PITCH);
  const x0 = Math.min(...xs) - 30, y0 = Math.min(...ys) - 34, w = Math.max(...xs) - Math.min(...xs) + 60, h = Math.max(...ys) - Math.min(...ys) + 68;
  return (
    <svg className="part-pic" viewBox={`${x0} ${y0} ${w} ${h}`} width={size * Math.min(1.8, w / h)} height={size} aria-hidden="true">
      <PartGlyph part={part} showLabel={false} />
    </svg>
  );
}
