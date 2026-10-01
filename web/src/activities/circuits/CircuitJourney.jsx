import Journey from "../../components/journey/Journey.jsx";
import { VoltFace } from "../../components/journey/Guide.jsx";
import { CIRCUIT_PATH, CIRCUIT_PARTS } from "../../content/circuits.js";
import { CloseTheLoop, LoopDetective, WillItLight, SwapThePart, BrighterDimmer } from "./StepsA.jsx";
import { AndSwitches, OrSwitches, NotSwitch, StaircaseSwitch, ElectricFingers, MeetTheGates, GateDetective } from "./StepsB.jsx";
import { AddingMachine, BiggerAdder, MemoryLatch } from "./StepsC.jsx";
import Workshop from "./Workshop.jsx";
import { BellTalk, DoorbellMission } from "./Doorbell.jsx";

const VIEWS = {
  "circuit-step-1": CloseTheLoop, "circuit-step-2": LoopDetective, "circuit-step-3": WillItLight, "circuit-step-4": SwapThePart, "circuit-step-5": BrighterDimmer,
  "circuit-step-6": AndSwitches, "circuit-step-7": OrSwitches, "circuit-step-8": NotSwitch, "circuit-step-9": StaircaseSwitch,
  "circuit-step-10": ElectricFingers, "circuit-step-11": MeetTheGates, "circuit-step-12": GateDetective,
  "circuit-step-13": AddingMachine, "circuit-step-14": BiggerAdder, "circuit-step-15": MemoryLatch,
  "circuit-workshop": Workshop,
  "circuit-talk-bell": BellTalk, "circuit-mission-bell": DoorbellMission,
};

export default function CircuitJourney({ done, grade, onStepDone }) {
  return (
    <Journey title="Volt's circuit adventure" intro="Build a doorbell, then gates that add and remember." Face={VoltFace}
      steps={CIRCUIT_PATH} parts={CIRCUIT_PARTS} views={VIEWS} done={done} grade={grade} onStepDone={onStepDone} />
  );
}
