import Guide from "../../components/journey/Guide.jsx";
import { BitFace } from "../../components/journey/Crew.jsx";

// Bit the Robot: can only say ON or OFF. Its antenna lamp shows its own state.
export { BitFace };

export default function Bit(props) {
  return <Guide Face={BitFace} {...props} />;
}
