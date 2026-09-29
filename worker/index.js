// Worker for bearlykyler.
//
// Cloudflare serves every file in site/ directly, without running this code.
// The Worker only runs for paths that are not a file there. It hands those
// back to the static assets, except for the Oware roadmap's API under
// /api/roadmap/. That API is password protected and keeps the roadmap in a
// Durable Object, so the data never lives in this public repository.
import { DurableObject } from "cloudflare:workers";

const API_PREFIX = "/api/roadmap/";

// SHA-256 of PASSWORD_SALT + the password. The roadmap page asks for the
// password and sends it with every API call in the X-Roadmap-Password
// header. A ROADMAP_PASSWORD secret set in the Cloudflare dashboard replaces
// this password.
const PASSWORD_SALT = "oware-roadmap:";
const PASSWORD_SHA256 = "42da7df54e73c4571b97da5510bbf80928b67fea56e4099d32fabac4cc559055";

// The board the roadmap started with, AES-GCM encrypted with a key derived
// from the password so its contents are not readable here. It is decrypted
// and saved the first time someone opens the empty board with the password.
const SEED = {
  iv: "sgAHW8Rekr5wsP8t",
  data: "IcfMGWnNaoCzpTqw83q8lqjV5Mj/0iTe69004gfhIw8G6umua+4/5tiSrkjhP22hOHAeh8vKukHqKolfQ0Oh5Xdkfz0EJGdHo98or1c0ghpqv9lT3gDUjLYwM0I08gvW6xpmmZ+lMbUQIqG9BkKN8bMjEwt3i2WMReewJcL6cBfD6ytICkd4WIh9wgUURKvT/pPmmNimnYvJphY7jC2qD1vhkeNrmmYq5WX1NZ9O2DvoNm6LXqp9JG2rOeOJuaKjRYcg3PqkarOGdh+wPjBR49wtYSIbAhQhRUERPZIjQjlJ8y+q5JG+Gm47Fygnd5ZsafKhRwZ8YgREgNqONUh84Hko2dXfzE/GrAKAvI+exoDaKl8w6nVWWLblF0jyJyGpqrpLClov0TiXuNqVFfp5tmkeDcg8/NZa1uaeQ/+5ojxGFy1rhjAkx+hRinqERb5OdpCgeJwZ/kGM5s3coJqKz7cprrwzbuzO03dZQ6UYdL36NsqGjaAJyHxZ3tVCONae5HcaZ3YgtT1kHOVK/H4gZJ0gUTVT+CgNJL8UPUgU76uW1/7NDYl0YmFoTAcOdBQtxCKk609iRXWXkWjPkPQH38kSi+wvAKsuEmVeMJm9aZr9Xx34OnQwjDIGFAzEbMhZLnFkhaiihM2j/bXPcAd3wpDS67WjcyP48vSaF6O0F9RenAuSVXA0cLbYVcLVFIKRXPksdSjdLqNfJ80uTWCCAcA6f5amyF6r2XCkz4nXBNmjm481X7HUwxqW6f4pArN7vounMBim0FnohkFjYhePJ9lW+RA/whBRa2AQa03yRw65CyK0nPBvCN1wS0p7qx7htYM15r/5caZZqCw/rjsXeBko0pjDeLvxfV+mZL1aH+tDxG2qTXEHwJkFIBVVaeXQ65BEIs7w2RdEP/mXmQQ0G01K1AbW6bkmndym2nY2jBjaeVYyVZENffUst+kKGJ0C7f7uASuh8e54FRj82wcwfV1qZta6Tv49d0F6xq8o9HGrCA9kDBIZvOjFxtCwxbe7oxtL5Tkwoxq0hhQXfXQpb4oidflKZnPVBiFOTqCcZS3llUjCrjKFdplf9/FdvqS4pXEswysgvBhZ9N7zwHok31ogbLPIReGmJy0smb8CZIuMBRMOefGSjcDLmnZE47I0NoIuB29daeZpE/vICQT6hJCs2bZBqjoFH6X95tYjiu+nf0+WmGxkcMXdBwEJgvZ5Nl/a2WveNOtpqBCyA+EUXJC3jVQcYJZSIIUrVTtS/wTez8Yb8QiwTkBqi598EG6tcsqoZqsNz2yHY4QD3FdvgjMZzNbutSxaAasjbi8IHPSuxOTNjSzraLaaLzKZQEzGtzk0ps3azAjHQU9FTssr4mIlwb08UHgj3FlvbqaRz6XE3EwiMwDn0uETNOacR7mSnJZC5szmSGHf+dtJULS67N8ecBJuvQO3r6d+gogEtzofzLsMO6A4eXh1Mle/tTlFmc53fwvh3EQB+Wkf2JpnzEcrkQRncnO0iDnGvBfiAIYmEdnSZS18X06XvHE01OCruY0Kq57dapYJes6uztX0TVhFpYfR/SstNtEUx7wTz3DvYoVISm65Qertue0HWIncffliVgTChbza+pvaM+aRN1a8jqM8AplDnp2o99G3bzFRfPg1ckRRCxHk04Tf7/obBIGhBSxxPZ2gJWAt9qhfwtfIm3vywszvgTyNW4aWvduaEfun8XI3sASeGwFO3LDWLxPPOP6TCht7UWpHNerPFHWyvH3+jIDNG9Vsy4PtEoc72bgJtM3ZDRoB2G7Lzc5ZPk0L",
};

const LIMITS = { items: 500, team: 100, opsPerRequest: 25, bodyBytes: 65536 };
const STATUSES = new Set(["planned", "active", "shipped"]);
const COLLECTIONS = new Set(["items", "team"]);
const OPS = new Set(["set", "update", "delete"]);
const ID_PATTERN = /^[A-Za-z0-9_.:@+~-]{1,80}$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith(API_PREFIX)) {
      return handleApi(request, env, url.pathname.slice(API_PREFIX.length));
    }
    return env.ASSETS.fetch(request);
  },
};

async function handleApi(request, env, route) {
  const password = request.headers.get("x-roadmap-password") || "";
  if (!(await passwordMatches(password, env))) {
    // A short pause makes guessing slower without affecting real use.
    await new Promise((resolve) => setTimeout(resolve, 400));
    return json({ error: "unauthorized" }, 401);
  }
  const board = env.ROADMAP.get(env.ROADMAP.idFromName("oware"));

  if (route === "board") {
    if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405);
    return json(await board.read(password));
  }

  if (route === "ops") {
    if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
    const text = await request.text();
    if (text.length > LIMITS.bodyBytes) return json({ error: "too_large" }, 413);
    let body = null;
    try {
      body = JSON.parse(text);
    } catch {
      return json({ error: "bad_request" }, 400);
    }
    const ops = cleanOps(body && body.ops);
    if (!ops) return json({ error: "bad_request" }, 400);
    const result = await board.apply(ops, password);
    return json(result, result.error ? 409 : 200);
  }

  return json({ error: "not_found" }, 404);
}

export class RoadmapBoard extends DurableObject {
  async read(password) {
    return view(await this.load(password));
  }

  // Applies every op to a copy of the board, then saves it in one write.
  // Nothing is saved if any op cannot apply.
  async apply(ops, password) {
    const board = await this.load(password);
    const next = { version: board.version + 1, items: { ...board.items }, team: { ...board.team } };
    for (const op of ops) {
      const docs = next[op.collection];
      if (op.op === "delete") {
        delete docs[op.id];
        continue;
      }
      if (op.op === "update" && !docs[op.id]) return { error: "missing", ...view(board) };
      const merged = op.op === "update" ? { ...docs[op.id], ...op.data } : op.data;
      const doc = op.collection === "items" ? cleanItem(merged) : cleanMember(merged);
      if (!doc) return { error: "bad_request", ...view(board) };
      docs[op.id] = doc;
    }
    if (Object.keys(next.items).length > LIMITS.items || Object.keys(next.team).length > LIMITS.team) {
      return { error: "full", ...view(board) };
    }
    await this.ctx.storage.put("board", next);
    this.board = next;
    return view(next);
  }

  async load(password) {
    if (!this.board) {
      // Hold other requests while the board is read or first created, so two
      // first visits cannot both seed it.
      await this.ctx.blockConcurrencyWhile(async () => {
        if (this.board) return;
        let board = await this.ctx.storage.get("board");
        if (!board) {
          const seed = await decryptSeed(password);
          board = { version: 1, items: seed ? seed.items : {}, team: seed ? seed.team : {} };
          await this.ctx.storage.put("board", board);
        }
        this.board = board;
      });
    }
    return this.board;
  }
}

async function passwordMatches(password, env) {
  if (!password || password.length > 200) return false;
  if (env.ROADMAP_PASSWORD) {
    return sameText(await sha256Hex(PASSWORD_SALT + password), await sha256Hex(PASSWORD_SALT + env.ROADMAP_PASSWORD));
  }
  return sameText(await sha256Hex(PASSWORD_SALT + password), PASSWORD_SHA256);
}

async function decryptSeed(password) {
  try {
    const keyBytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("oware-roadmap-seed:" + password));
    const key = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["decrypt"]);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(SEED.iv) }, key, fromBase64(SEED.data));
    const seed = JSON.parse(new TextDecoder().decode(plain));
    const items = {};
    const team = {};
    for (const row of seed.items || []) {
      const doc = row && ID_PATTERN.test(row.id) ? cleanItem(row.data || {}) : null;
      if (doc) items[row.id] = doc;
    }
    for (const row of seed.team || []) {
      const doc = row && ID_PATTERN.test(row.id) ? cleanMember(row.data || {}) : null;
      if (doc) team[row.id] = doc;
    }
    return { items, team };
  } catch {
    // A replacement password cannot open the original seed; start empty.
    return null;
  }
}

function cleanOps(raw) {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > LIMITS.opsPerRequest) return null;
  const ops = [];
  for (const op of raw) {
    if (!op || !OPS.has(op.op) || !COLLECTIONS.has(op.collection) || typeof op.id !== "string" || !ID_PATTERN.test(op.id)) {
      return null;
    }
    if (op.op !== "delete" && (!op.data || typeof op.data !== "object" || Array.isArray(op.data))) return null;
    ops.push({ op: op.op, collection: op.collection, id: op.id, data: op.data });
  }
  return ops;
}

function cleanItem(d) {
  const priority = Number.isInteger(d.priority) && d.priority >= 0 && d.priority <= 4 ? d.priority : 4;
  const item = {
    title: text(d.title, 120) || "Untitled",
    note: note(d.note),
    priority,
    owner: text(d.owner, 40),
    status: STATUSES.has(d.status) ? d.status : "planned",
    rank: num(d.rank),
    createdAt: num(d.createdAt),
    updatedAt: num(d.updatedAt),
  };
  if (num(d.shippedAt)) item.shippedAt = num(d.shippedAt);
  return item;
}

function cleanMember(d) {
  const name = text(d.name, 40);
  return name ? { name, order: num(d.order), createdAt: num(d.createdAt) } : null;
}

function text(value, max) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function note(value) {
  if (typeof value !== "string") return "";
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 280);
}

function num(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function view(board) {
  const rows = (docs) => Object.entries(docs).map(([id, data]) => ({ id, data }));
  return { version: board.version, items: rows(board.items), team: rows(board.team) };
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function sameText(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function fromBase64(value) {
  return Uint8Array.from(atob(value), (ch) => ch.charCodeAt(0));
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex",
    },
  });
}
