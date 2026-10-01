import Journey from "../../components/journey/Journey.jsx";
import { BitFace } from "./Bit.jsx";
import { Step1, Step2, Step3, Step4, Step5, Step6, Step7, PixelPainter, SecretMessage } from "./Steps.jsx";
import { TalkIntro, TalkLetters, LettersInLamps, MissionThankYou, NameInBinary, Translator } from "./Mission.jsx";
import { BINARY_JOURNEY } from "../../content/subjects.js";

const VIEWS = { "binary-step-0": TalkIntro, "binary-step-8": TalkLetters, "binary-step-9": LettersInLamps, "binary-step-10": MissionThankYou,
  "binary-bonus-name": NameInBinary, "binary-bonus-translator": Translator, "binary-step-1": Step1, "binary-step-2": Step2, "binary-step-3": Step3, "binary-step-4": Step4, "binary-step-5": Step5, "binary-step-6": Step6, "binary-step-7": Step7, "binary-bonus-pixel": PixelPainter, "binary-bonus-secret": SecretMessage };

export default function BinaryJourney({ done, grade, onStepDone }) {
  return (
    <Journey title="Bit's binary adventure" intro="Bit's mission: learn the computer's own language and say THANK YOU to a computer!" Face={BitFace}
      steps={BINARY_JOURNEY} views={VIEWS} done={done} grade={grade} onStepDone={onStepDone} />
  );
}
