/* Bitácora Interna centralizada · función de Vercel (/api/bitacora)

   Puente entre el visor y la hoja de Google Sheets (Apps Script de
   tools/bitacora-apps-script.gs). La URL de Apps Script y el token
   compartido viven solo en las variables de entorno de Vercel:

     BITACORA_SHEET_URL  URL de la app web de Apps Script (…/exec)
     BITACORA_TOKEN      el mismo valor que la propiedad TOKEN del script

   GET  /api/bitacora                         → { ok, entries: [...] }
   POST /api/bitacora { action: "add", entry } → { ok }
   POST /api/bitacora { action: "delete", id } → { ok }
*/
"use strict";

// Orígenes que pueden llamar a la API desde el navegador
const ALLOWED_ORIGINS = [
  /^https:\/\/tennant-t7-visor(-[a-z0-9-]+)?\.vercel\.app$/,
  /^https:\/\/santymendoza05-stack\.github\.io$/,
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/
];

// Largo máximo de cada campo (igual que en el formulario)
const LIMITS = { id: 40, date: 10, time: 5, tech: 80, site: 80, op: 40, machine: 20, machineName: 60, parts: 4000, createdAt: 40 };
const ID_RE = /^[a-z0-9]{6,40}$/;

function cleanEntry(raw) {
  if (!raw || typeof raw !== "object") return null;
  const entry = {};
  for (const [key, max] of Object.entries(LIMITS)) entry[key] = String(raw[key] ?? "").trim().slice(0, max);
  if (!ID_RE.test(entry.id) || !entry.tech || !entry.parts) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date) || !/^\d{2}:\d{2}$/.test(entry.time)) return null;
  return entry;
}

function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body || "{}"); } catch { return {}; }
}

module.exports = async (req, res) => {
  const origin = req.headers.origin || "";
  if (ALLOWED_ORIGINS.some((re) => re.test(origin))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();

  const sheetUrl = process.env.BITACORA_SHEET_URL;
  const token = process.env.BITACORA_TOKEN;
  if (!sheetUrl || !token) return res.status(503).json({ ok: false, error: "not_configured" });

  let upstream;
  try {
    if (req.method === "GET") {
      upstream = await fetch(`${sheetUrl}?${new URLSearchParams({ action: "list", token })}`, { redirect: "follow" });
    } else if (req.method === "POST") {
      const body = readBody(req);
      let payload;
      if (body.action === "add") {
        const entry = cleanEntry(body.entry);
        if (!entry) return res.status(400).json({ ok: false, error: "invalid_entry" });
        payload = { action: "add", entry };
      } else if (body.action === "delete" && ID_RE.test(String(body.id || ""))) {
        payload = { action: "delete", id: body.id };
      } else {
        return res.status(400).json({ ok: false, error: "invalid_action" });
      }
      // text/plain: Apps Script lo recibe sin preflight; el 302 de Google se sigue como GET
      upstream = await fetch(sheetUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ ...payload, token }),
        redirect: "follow"
      });
    } else {
      res.setHeader("Allow", "GET, POST, OPTIONS");
      return res.status(405).json({ ok: false, error: "method_not_allowed" });
    }
  } catch (err) {
    console.error("Apps Script no responde:", err);
    return res.status(502).json({ ok: false, error: "upstream_unreachable" });
  }

  const text = await upstream.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("Respuesta no JSON de Apps Script:", upstream.status, text.slice(0, 300));
    return res.status(502).json({ ok: false, error: "bad_upstream_response" });
  }
  return res.status(data && data.ok ? 200 : 502).json(data);
};
