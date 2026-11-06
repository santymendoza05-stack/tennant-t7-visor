/**
 * INGPAR S.A.S. · Bitácora Interna de Solicitudes → Google Sheets
 *
 * Instalación (una sola vez):
 *  1. Crea una hoja de cálculo en Google Drive, p. ej. "Bitácora Interna INGPAR".
 *  2. Extensiones → Apps Script. Borra el contenido y pega este archivo completo.
 *  3. Configuración del proyecto (engranaje) → Propiedades del script →
 *     agrega TOKEN con el mismo valor de BITACORA_TOKEN en Vercel.
 *  4. Ejecuta la función setup() una vez (acepta los permisos que pide).
 *  5. Implementar → Nueva implementación → tipo "Aplicación web":
 *       Ejecutar como: Yo   ·   Quién tiene acceso: Cualquier usuario
 *     Copia la URL que termina en /exec.
 *  6. En Vercel → tennant-t7-visor → Settings → Environment Variables:
 *     BITACORA_SHEET_URL = esa URL. Luego vuelve a publicar (Redeploy).
 *
 * Si cambias este código: Implementar → Gestionar implementaciones →
 * editar (lápiz) → Versión: "Nueva versión". Así la URL /exec no cambia.
 */

const SHEET_NAME = "Bitácora";
const HEADERS = [
  "ID", "Fecha", "Hora", "Técnico", "Sede / Lugar", "OP",
  "Máquina", "ID máquina", "Repuestos solicitados", "Creado en el dispositivo", "Recibido en el servidor"
];
// Campo de cada registro → columna (mismo orden que HEADERS)
const FIELDS = ["id", "date", "time", "tech", "site", "op", "machineName", "machine", "parts", "createdAt", "receivedAt"];

function setup() {
  const sheet = getSheet_();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
    .setFontWeight("bold").setBackground("#f5b301").setFontColor("#1b1300");
  sheet.setFrozenRows(1);
  // Todo como texto: Sheets no convierte fechas, horas ni Part Numbers
  sheet.getRange(1, 1, sheet.getMaxRows(), HEADERS.length).setNumberFormat("@");
  sheet.setColumnWidth(9, 420);
  sheet.getRange(1, 9, sheet.getMaxRows(), 1).setWrap(true);
}

function doGet(e) {
  if (!authorized_(e.parameter.token)) return json_({ ok: false, error: "unauthorized" });
  if (e.parameter.action !== "list") return json_({ ok: false, error: "invalid_action" });
  const sheet = getSheet_();
  const rows = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, FIELDS.length).getDisplayValues() : [];
  const entries = rows
    .filter((r) => r[0])
    .map((r) => FIELDS.reduce((o, f, i) => ((o[f] = r[i]), o), {}));
  return json_({ ok: true, entries });
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: "invalid_json" }); }
  if (!authorized_(body.token)) return json_({ ok: false, error: "unauthorized" });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = getSheet_();
    if (body.action === "add") {
      const entry = body.entry || {};
      if (!entry.id || !entry.tech || !entry.parts) return json_({ ok: false, error: "invalid_entry" });
      if (findRow_(sheet, entry.id)) return json_({ ok: true, duplicate: true }); // reintento del mismo registro
      entry.receivedAt = new Date().toISOString();
      const row = FIELDS.map((f) => {
        const v = String(entry[f] == null ? "" : entry[f]);
        return /^[=+\-@]/.test(v) ? "'" + v : v; // texto escrito a mano: no es fórmula
      });
      sheet.appendRow(row);
      return json_({ ok: true });
    }
    if (body.action === "delete") {
      const row = findRow_(sheet, body.id);
      if (row) sheet.deleteRow(row);
      return json_({ ok: true, deleted: !!row });
    }
    return json_({ ok: false, error: "invalid_action" });
  } finally {
    lock.releaseLock();
  }
}

function getSheet_() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  return book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
}

function findRow_(sheet, id) {
  if (!id || sheet.getLastRow() < 2) return 0;
  const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getDisplayValues();
  for (let i = 0; i < ids.length; i++) if (ids[i][0] === String(id)) return i + 2;
  return 0;
}

function authorized_(token) {
  const expected = PropertiesService.getScriptProperties().getProperty("TOKEN");
  return !!expected && token === expected;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
