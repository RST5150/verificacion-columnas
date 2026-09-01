// Backend gratuito (sin servidor propio) para las escrituras de "Verificación
// de columnas" contra el Google Sheet. Pegar este código en un proyecto de
// Apps Script vinculado a esa planilla y desplegarlo como Web App (acceso
// "Cualquier usuario"). Mismo patrón que
// tableros_alumbrado_publico/scripts/apps-script/Code.gs.
//
// Reemplazar por el mismo Client ID que va en NEXT_PUBLIC_GOOGLE_CLIENT_ID.
var CLIENT_ID = '668667568352-s05cjvvihio58qc5i1n1h4hihg81o7p6.apps.googleusercontent.com';

var SHEET_ORDENES = 'OrdenesServicio';
var SHEET_COLUMNAS = 'ColumnasInspeccionadas';
var SHEET_USUARIOS = 'Usuarios';

var COLUMNAS_FIELDS = [
  'id', 'orden_servicio_id', 'calle', 'altura', 'n_columna',
  'tapa', 'aplomada', 'pintura', 'oxidada', 'picada_por_oxido',
  'perforada_desprendimiento', 'pat', 'prot_diferencial', 'prot_contacto_directo',
  'observaciones', 'created_at',
];

function doGet() {
  return jsonResponse({ ok: true, message: 'Apps Script de Verificación de columnas activo.' });
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var email = verifyIdToken(body.idToken);
    var role = getRole(email);

    if (body.action === 'create_orden') {
      return jsonResponse({ ok: true, id: createOrdenConColumnas(email, body.orden, body.columnas) });
    }
    if (body.action === 'delete_columna') {
      deleteColumna(email, role, body.id);
      return jsonResponse({ ok: true });
    }
    return jsonResponse({ ok: false, error: 'Acción inválida.' });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err.message || err) });
  }
}

// Valida el JWT de Google Sign-In contra los servidores de Google (no confía
// en el email que mande el cliente sin verificar) y devuelve el email
// verificado y en minúsculas.
function verifyIdToken(idToken) {
  if (!idToken) throw new Error('Falta la sesión. Volvé a iniciar sesión con Google.');

  var res = UrlFetchApp.fetch(
    'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken),
    { muteHttpExceptions: true }
  );
  var info = JSON.parse(res.getContentText());

  if (info.error) throw new Error('Tu sesión venció. Volvé a iniciar sesión con Google.');
  if (info.aud !== CLIENT_ID) throw new Error('Token de otra aplicación (Client ID no coincide).');
  if (!info.email || info.email_verified !== 'true') throw new Error('Email de Google no verificado.');

  return info.email.toLowerCase();
}

// Busca el email en la hoja "Usuarios" (columnas Email, Role) y devuelve el
// rol. Si no está en la hoja, no tiene acceso a la app.
function getRole(email) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_USUARIOS);
  var values = sheet.getDataRange().getValues();
  var header = values[0].map(function (h) { return String(h).trim().toLowerCase(); });
  var emailIdx = header.indexOf('email');
  var roleIdx = header.indexOf('role');

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][emailIdx]).trim().toLowerCase() === email) {
      return String(values[i][roleIdx] || 'user').trim().toLowerCase();
    }
  }
  throw new Error('Tu cuenta no tiene acceso. Pedile a un administrador que te agregue a la hoja "Usuarios".');
}

// Los ids son autoincrementales calculados a mano (no hay secuencia como en
// una base de datos real): toma el máximo id existente en la columna A y le
// suma 1.
function nextId(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return 1;
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().map(function (r) { return Number(r[0]) || 0; });
  return Math.max.apply(null, ids) + 1;
}

function createOrdenConColumnas(email, orden, columnas) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ordenesSheet = ss.getSheetByName(SHEET_ORDENES);
  var columnasSheet = ss.getSheetByName(SHEET_COLUMNAS);
  var now = new Date().toISOString();

  var ordenId = nextId(ordenesSheet);
  ordenesSheet.appendRow([ordenId, orden.orden_de_servicio, orden.localidad, orden.fecha, orden.zona, !!orden.es_plan, email, now]);

  (columnas || []).forEach(function (c) {
    var columnaId = nextId(columnasSheet);
    var row = COLUMNAS_FIELDS.map(function (field) {
      if (field === 'id') return columnaId;
      if (field === 'orden_servicio_id') return ordenId;
      if (field === 'created_at') return now;
      if (field === 'observaciones') return c.observaciones || '';
      return c[field];
    });
    columnasSheet.appendRow(row);
  });

  return ordenId;
}

function getOrdenCreatedBy(ordenId) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ORDENES);
  var values = sheet.getDataRange().getValues();
  var header = values[0];
  var idIdx = header.indexOf('id');
  var createdByIdx = header.indexOf('created_by');

  for (var i = 1; i < values.length; i++) {
    if (Number(values[i][idIdx]) === Number(ordenId)) {
      return String(values[i][createdByIdx] || '').trim().toLowerCase();
    }
  }
  return null;
}

function deleteColumna(email, role, id) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_COLUMNAS);
  var values = sheet.getDataRange().getValues();
  var header = values[0];
  var idIdx = header.indexOf('id');
  var ordenIdIdx = header.indexOf('orden_servicio_id');

  for (var i = 1; i < values.length; i++) {
    if (Number(values[i][idIdx]) === Number(id)) {
      if (role !== 'admin' && getOrdenCreatedBy(values[i][ordenIdIdx]) !== email) {
        throw new Error('No tenés permiso para eliminar esta columna.');
      }
      sheet.deleteRow(i + 1);
      return;
    }
  }
  throw new Error('No se encontró la columna con id ' + id + '.');
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
