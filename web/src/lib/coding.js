// Robot puzzle engine. Programs are lists of { op: "fwd" | "left" | "right" } or { op: "repeat", times, body: [...] }.
const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // right, down, left, up

export function parseGrid(grid) {
  let start = null, goal = null;
  grid.forEach((row, r) => [...row].forEach((ch, c) => {
    if (ch === "S") start = [r, c];
    if (ch === "G") goal = [r, c];
  }));
  return { rows: grid.length, cols: grid[0].length, start, goal };
}

export function flatten(program, limit = 200) {
  const out = [];
  const walk = list => {
    for (const step of list) {
      if (out.length >= limit) return;
      if (step.op === "repeat") for (let i = 0; i < step.times; i++) walk(step.body);
      else out.push(step.op);
    }
  };
  walk(program);
  return out;
}

// Returns every frame of the run, so the UI can animate it, and how it ended.
export function run(grid, program) {
  const { rows, cols, start, goal } = parseGrid(grid);
  let [r, c] = start, dir = 0;
  const frames = [{ r, c, dir }];
  for (const op of flatten(program)) {
    if (op === "left") dir = (dir + 3) % 4;
    else if (op === "right") dir = (dir + 1) % 4;
    else {
      const nr = r + DIRS[dir][0], nc = c + DIRS[dir][1];
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || grid[nr][nc] === "#") {
        frames.push({ r, c, dir, bump: true });
        return { frames, result: "bump" };
      }
      r = nr; c = nc;
    }
    frames.push({ r, c, dir });
    if (r === goal[0] && c === goal[1]) return { frames, result: "win" };
  }
  return { frames, result: "short" };
}
