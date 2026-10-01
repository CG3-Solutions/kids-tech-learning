// Ollie's mission: plan a party. The child picks their money and how many friends to invite, then
// works out the people, pizza and juice, shops within a budget, pays and gets change, and shares
// sweets into party bags. Every answer is the child's own; the numbers come from their choices.
import { useState } from "react";
import Guide, { OllieFace } from "../journey/Guide.jsx";
import Conversation from "../journey/Conversation.jsx";
import Visual from "./Visual.jsx";
import { NumberPad } from "./Practice.jsx";
import { useApp } from "../../lib/AppContext.jsx";
import { local } from "../../lib/storage.js";
import { sfx } from "../../lib/sfx.js";
import { hush } from "../../lib/speech.js";
import {
  OLLIE_TALK_PARTY, MONEY, defaultMoney, moneyOf, fmtMoney, BUDGET, SHOP, SLICES_EACH, SLICES_PER_PIZZA, CUPS_EACH, CUPS_PER_BOTTLE, SWEETS,
  partyNeeds, basket, totalOf, roundUpChoices, partyDeeper,
} from "../../content/practice/party.js";

export function PartyTalk({ onComplete }) {
  const { activeChild } = useApp();
  return <div className="step-body"><Conversation script={OLLIE_TALK_PARTY} Face={OllieFace} name={activeChild?.name ?? ""} onComplete={onComplete} doneLabel="Let's learn some maths! →" /></div>;
}

const Ollie = props => <Guide Face={OllieFace} {...props} />;
const e2e = () => { try { return localStorage.getItem("sparklab.e2e") === "1"; } catch { return false; } };

// One question: a number to type, or choices. Wrong once → hint; wrong twice → the answer.
// Right (or shown) → the explanation and a Next button, so the child has time to read it.
function Ask({ prompt, answer, choices, hint, why, visual, onDone, nextLabel = "Next →" }) {
  const [num, setNum] = useState("");
  const [state, setState] = useState(null); // null | "wrong" | "right" | "reveal"
  const done = state === "right" || state === "reveal";
  const check = v => {
    if (done) return;
    if (Number(v) === answer) { sfx.ding(); setState("right"); }
    else if (state === "wrong") { sfx.oops(); setState("reveal"); }
    else { sfx.oops(); setState("wrong"); setNum(""); }
  };
  // Before an answer the bubble points at the question (and reads it aloud), so the text isn't shown twice.
  const say = state === "right" ? `Yes! ${why}` : state === "reveal" ? `The answer is ${answer}. ${why}` : state === "wrong" ? `Not quite. ${hint}` : prompt;
  const shown = state ? say : "Over to you! 👇";
  return (
    <div className="stack" style={{ gap: 12 }}>
      <Ollie mood={state === "right" ? "cheer" : state ? "wow" : "happy"} say={say}>{shown}</Ollie>
      <div className="q-card" {...(e2e() ? { "data-answer": String(answer) } : {})}>
        <div className={`q-prompt${prompt.length > 40 ? " long" : ""}`}>{prompt}</div>
        <Visual v={visual} />
        {choices
          ? <div className="choices">{choices.map(c => <button key={c} className={`choice${done && c === answer ? " right" : ""}`} disabled={done} onClick={() => check(c)}>{c}</button>)}</div>
          : <NumberPad value={num} setValue={setNum} onSubmit={() => check(num)} disabled={done} />}
      </div>
      {done && <div className="row center-row"><button className="btn primary big" onClick={onDone}>{nextLabel}</button></div>}
    </div>
  );
}

const TRAIL = [
  { emoji: "🧒", name: "Guests" }, { emoji: "🍕", name: "Food" }, { emoji: "🧃", name: "Drinks" },
  { emoji: "🛒", name: "Shop" }, { emoji: "🧾", name: "Pay" }, { emoji: "🎁", name: "Bags" },
];
// Stage → trail position.
const SPOT = [0, 0, 1, 1, 2, 3, 4, 4, 5];

export function PartyMission({ onComplete }) {
  const { activeChild } = useApp();
  const grade = activeChild?.learner === "adult" ? 12 : activeChild?.grade ?? 0;
  const young = grade <= 2, deep = grade >= 5;
  const name = activeChild?.name ?? "";
  const [stage, setStage] = useState(0);
  const [moneyId, setMoneyId] = useState(() => local.get("sparklab.money", null) ?? defaultMoney(typeof navigator !== "undefined" ? navigator.language : ""));
  const [friends, setFriends] = useState(null);
  const [dessert, setDessert] = useState(null);
  const [extras, setExtras] = useState([]);
  const [over, setOver] = useState(false);
  const money = moneyOf(moneyId);
  const $ = n => fmtMoney(money, n);
  const go = n => { hush(); setStage(n); window.scrollTo({ top: 0 }); };
  const next = () => go(stage + 1);

  const people = (friends ?? 0) + 1;
  const need = partyNeeds(people);
  const budget = BUDGET * money.m;
  const lines = basket(people, dessert, extras, money);
  const total = totalOf(lines);

  const trail = stage > 0 && stage < 9 && (
    <ol className="key-trail" aria-label="Mission steps">
      {TRAIL.map((s, i) => <li key={s.name} className={i < SPOT[stage] ? "done" : i === SPOT[stage] ? "on" : ""}><span aria-hidden="true">{s.emoji}</span><small>{s.name}</small></li>)}
    </ol>
  );
  const receipt = (
    <div className="receipt" aria-label="Shopping list">
      {lines.map(l => <div key={l.id} className="receipt-line"><span>{l.emoji} {l.name}</span><span>{l.qty > 1 ? `${l.qty} × ${$(l.price)} = ` : ""}<b>{$(l.total)}</b></span></div>)}
    </div>
  );

  // 0 · Money and guests
  if (stage === 0) {
    const pickMoney = id => { sfx.click(); setMoneyId(id); local.set("sparklab.money", id); };
    return (
      <div className="step-body">
        <Ollie>{`Mission time${name ? `, ${name}` : ""}! Let's plan your party. Your budget is ${$(budget)}: that's the most you can spend. First, which money do you use, and how many friends will you invite?`}</Ollie>
        <div className="stack" style={{ gap: 6 }}>
          <span className="eyebrow">Your money</span>
          <div className="row wrap-row">{MONEY.map(m => <button key={m.id} className="chip" aria-pressed={m.id === moneyId} onClick={() => pickMoney(m.id)}>{m.sym} {m.name}</button>)}</div>
          <p className="muted small-note">Your money isn't here? Pick 🪙 Coins.</p>
        </div>
        <div className="stack" style={{ gap: 6 }}>
          <span className="eyebrow">Friends to invite</span>
          <div className="row wrap-row">{[3, 4, 5, 6, 7, 8, 9].map(n => <button key={n} className="chip" aria-pressed={friends === n} onClick={() => { sfx.click(); setFriends(n); }}>{n}</button>)}</div>
        </div>
        <div className="row center-row"><button className="btn primary big" disabled={!friends} onClick={next}>Start planning 🎉</button></div>
      </div>
    );
  }

  // 1 · How many people?
  if (stage === 1) {
    return (
      <div className="step-body">
        {trail}
        <Ask key="people" prompt={`You invited ${friends} friends. How many people will be at the party, counting you?`} answer={people}
          visual={young ? { kind: "add", emoji: "🧒", a: friends, b: 1 } : undefined}
          hint={`Don't forget yourself! ${friends} friends and you.`} why={`${friends} + 1 = ${people} people.`} onDone={next} />
      </div>
    );
  }

  // 2 · Pizza slices · 3 · Pizzas
  if (stage === 2) {
    return (
      <div className="step-body">
        {trail}
        <Ask key="slices" prompt={`Everyone eats ${SLICES_EACH} slices of pizza. How many slices do ${people} people need?`} answer={need.slices}
          visual={grade <= 3 ? { kind: "groups", emoji: "🍕", groups: people, each: SLICES_EACH } : undefined}
          hint={`${people} people, ${SLICES_EACH} slices each: ${people} × ${SLICES_EACH}.`} why={`${people} × ${SLICES_EACH} = ${need.slices} slices.`} onDone={next} />
      </div>
    );
  }
  if (stage === 3) {
    const { options } = roundUpChoices(need.slices, SLICES_PER_PIZZA);
    const exact = need.slices % SLICES_PER_PIZZA === 0;
    return (
      <div className="step-body">
        {trail}
        <Ask key="pizzas" prompt={`One pizza has ${SLICES_PER_PIZZA} slices. How many pizzas do we need for ${need.slices} slices?`} answer={need.pizzas} choices={options}
          hint={`Count in ${SLICES_PER_PIZZA}s until you reach ${need.slices} or more: ${Array.from({ length: need.pizzas }, (_, i) => (i + 1) * SLICES_PER_PIZZA).join(", ")}…`}
          why={exact ? `${need.pizzas} pizzas × ${SLICES_PER_PIZZA} = ${need.slices} slices exactly.`
            : `${need.pizzas - 1} ${need.pizzas - 1 === 1 ? "pizza is" : "pizzas are"} only ${(need.pizzas - 1) * SLICES_PER_PIZZA} slices: not enough! ${need.pizzas} pizzas make ${need.pizzas * SLICES_PER_PIZZA}, with ${need.pizzas * SLICES_PER_PIZZA - need.slices} spare. When sharing out food, we round UP.`}
          onDone={next} />
      </div>
    );
  }

  // 4 · Juice
  if (stage === 4) {
    const { options } = roundUpChoices(need.cups, CUPS_PER_BOTTLE);
    return (
      <div className="step-body">
        {trail}
        <Ask key="juice" prompt={`Everyone drinks ${CUPS_EACH} cups of juice, so we need ${need.cups} cups. One bottle fills ${CUPS_PER_BOTTLE} cups. How many bottles?`} answer={need.bottles} choices={options}
          hint={`Count in ${CUPS_PER_BOTTLE}s until you reach ${need.cups} or more.`}
          why={`${need.bottles} bottles fill ${need.bottles * CUPS_PER_BOTTLE} cups${need.bottles * CUPS_PER_BOTTLE > need.cups ? `: enough for ${need.cups}, with ${need.bottles * CUPS_PER_BOTTLE - need.cups} spare` : ""}.`}
          onDone={next} />
      </div>
    );
  }

  // 5 · Shop
  if (stage === 5) {
    const toggle = id => { sfx.click(); setOver(false); setExtras(x => (x.includes(id) ? x.filter(y => y !== id) : [...x, id])); };
    return (
      <div className="step-body">
        {trail}
        <Ollie mood={over ? "wow" : "happy"}>
          {over ? `That came to more than ${$(budget)}. Take something off the list, then check out again.`
            : `To the shop! The pizza and juice are in the basket. Now choose a cake or cupcakes, and any extras you like. Remember: you can spend up to ${$(budget)}.`}
        </Ollie>
        <span className="eyebrow">In your basket</span>
        {receipt}
        <span className="eyebrow">Choose one: cake or cupcakes</span>
        <div className="shop-grid">
          {SHOP.filter(s => s.kind === "dessert").map(s => (
            <button key={s.id} className={`shop-item${dessert === s.id ? " on" : ""}`} aria-pressed={dessert === s.id} onClick={() => { sfx.click(); setOver(false); setDessert(s.id); }}>
              <span className="shop-emoji">{s.emoji}</span><b>{s.name}</b><span>{$(s.price * money.m)}{s.id === "cupcakes" && need.cupcakePacks > 1 ? ` (you need ${need.cupcakePacks} packs)` : ""}</span>
            </button>
          ))}
        </div>
        <span className="eyebrow">Extras (if they fit)</span>
        <div className="shop-grid">
          {SHOP.filter(s => s.kind === "extra").map(s => (
            <button key={s.id} className={`shop-item${extras.includes(s.id) ? " on" : ""}`} aria-pressed={extras.includes(s.id)} onClick={() => toggle(s.id)}>
              <span className="shop-emoji">{s.emoji}</span><b>{s.name}</b><span>{$(s.price * money.m)}</span>
            </button>
          ))}
        </div>
        <div className="row center-row"><button className="btn primary big" disabled={!dessert} onClick={next}>🧾 Go to the checkout</button></div>
      </div>
    );
  }

  // 6 · Checkout: the child adds it up
  if (stage === 6) {
    const fits = total <= budget;
    return (
      <div className="step-body">
        {trail}
        {receipt}
        <Ask key={`total-${lines.map(l => l.id).join()}`} prompt={`The shopkeeper asks: what's the total? (in ${money.id === "coins" ? "coins" : money.name.toLowerCase()})`} answer={total}
          hint={`Add the line totals: ${lines.map(l => l.total).join(" + ")}.`}
          why={fits ? `${lines.map(l => l.total).join(" + ")} = ${total}. That's within your budget of ${$(budget)}!` : `${lines.map(l => l.total).join(" + ")} = ${total}. Oh no, that's ${total - budget} more than your budget of ${$(budget)}!`}
          nextLabel={fits ? "Pay →" : "🛒 Back to the shop"}
          onDone={() => { if (fits) next(); else { setOver(true); go(5); } }} />
      </div>
    );
  }

  // 7 · Change
  if (stage === 7) {
    return (
      <div className="step-body">
        {trail}
        <Ask key="change" prompt={`You pay with your ${$(budget)}. The total is ${$(total)}. How much change do you get back?`} answer={budget - total}
          hint={`Take the total away from your money: ${budget} − ${total}.`}
          why={budget === total ? "You spent every last bit of your budget! No change." : `${budget} − ${total} = ${budget - total}. You get ${$(budget - total)} back.`} onDone={next} />
      </div>
    );
  }

  // 8 · Party bags
  if (stage === 8) {
    const each = Math.floor(SWEETS / friends), left = SWEETS % friends;
    return (
      <div className="step-body">
        {trail}
        <Ask key="bags" prompt={`Last job: party bags! Share ${SWEETS} sweets equally between your ${friends} friends' bags. How many sweets go in each bag?`} answer={each}
          visual={young ? { kind: "count", emoji: "🍬", n: SWEETS } : undefined}
          hint={`Which number times ${friends} gets closest to ${SWEETS} without going over?`}
          why={left ? `${friends} × ${each} = ${friends * each}, and ${left} ${left === 1 ? "sweet is" : "sweets are"} left over. The leftovers are for you, the party planner!` : `${friends} × ${each} = ${SWEETS} exactly. Nothing left over!`}
          nextLabel="See your party plan 🎉" onDone={() => { sfx.tada(); next(); }} />
      </div>
    );
  }

  const d = partyDeeper(total, people, money);
  const eachText = Number.isInteger(d.each) ? String(d.each) : d.each.toFixed(2);
  return (
    <div className="step-body">
      <div className="invite">
        <div className="invite-title">🎉 {name ? `${name}'s` : "My"} party plan</div>
        <ul>
          <li>🧒 {people} people ({friends} friends and me)</li>
          <li>🍕 {need.pizzas} pizzas: {need.pizzas * SLICES_PER_PIZZA} slices for {need.slices} needed</li>
          <li>🧃 {need.bottles} bottles of juice</li>
          {lines.filter(l => !["pizza", "juice"].includes(l.id)).map(l => <li key={l.id}>{l.emoji} {l.qty > 1 ? `${l.qty} × ` : ""}{l.name}</li>)}
          <li>🎁 {Math.floor(SWEETS / friends)} sweets in each party bag</li>
          <li>🧾 Spent {$(total)} of {$(budget)}; {$(budget - total)} left</li>
        </ul>
      </div>
      <Ollie mood="cheer">{`What a party! You used adding, taking away, times and sharing to plan it, and you stayed within your budget. You're a real party planner${name ? `, ${name}` : ""}!`}</Ollie>
      {deep && <p className="deeper-note">🔬 <b>Go deeper:</b> {`The party costs ${$(total)} ÷ ${people} people = ${money.id === "coins" ? `${eachText} coins` : `${money.sym}${eachText}`} per person. You spent ${total} out of ${budget}, which is ${d.pct}% of your budget.`}</p>}
      <div className="row center-row">
        <button className="btn primary big" onClick={onComplete}>Mission complete ⭐</button>
        <button className="btn" onClick={() => { setFriends(null); setDessert(null); setExtras([]); setOver(false); go(0); }}>🎉 Plan another party</button>
      </div>
    </div>
  );
}
