-- Reemplaza el campo de texto libre "empresa" por "zona": ahora se carga
-- desde un desplegable fijo (Zona 1 / Zona 2 / Zona 3) en vez de texto libre.
-- Los registros ya cargados conservan su valor anterior (nombre de empresa)
-- en la columna renombrada; no coincidirá con las opciones del desplegable
-- hasta que se edite manualmente si hace falta.

alter table ordenes_servicio rename column empresa to zona;
