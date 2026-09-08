/**
 * Dev convenience: before starting the stack, kill any stale node processes
 * still listening on the dev ports (3000 = Next.js, 4100 = monolith API) from
 * an earlier run. Without this, `npm run dev` fails with EADDRINUSE after the
 * first Ctrl+C that leaves the process behind.
 *
 * Only processes named node.exe (Windows) / node (POSIX) are killed — other
 * apps sharing those ports are left untouched.
 */
"use strict";

const { execFileSync } = require("node:child_process");

const PORTS = [3000, 4100];

function pidsForPort(port) {
  const pids = new Set();
  try {
    const out = execFileSync("netstat", ["-ano"], { encoding: "utf8", windowsHide: true });
    for (const line of out.split(/\r?\n/)) {
      const m = line.trim().match(/TCP\s+\S+:(3000|4100)\s+\S+\s+LISTENING\s+(\d+)/i);
      if (m && Number(m[1]) === port) pids.add(m[2]);
    }
  } catch {
    /* netstat unavailable — nothing we can do */
  }
  return [...pids];
}

function isNodeProcess(pid) {
  try {
    const out = execFileSync("tasklist", ["/FI", `PID eq ${pid}`, "/FO", "CSV", "/NH"], {
      encoding: "utf8",
      windowsHide: true,
    });
    return /node\.exe/i.test(out);
  } catch {
    return false;
  }
}

function kill(pid) {
  try {
    execFileSync("taskkill", ["/F", "/PID", pid], { windowsHide: true, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

let killed = 0;
for (const port of PORTS) {
  for (const pid of pidsForPort(port)) {
    if (!isNodeProcess(pid)) continue;
    if (kill(pid)) {
      killed += 1;
      process.stdout.write(`[free-ports] freed port ${port} (stale node pid ${pid})\n`);
    }
  }
}

if (killed === 0) {
  process.stdout.write("[free-ports] ports 3000/4100 are free — starting clean\n");
}