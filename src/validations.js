const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s()-]{7,20}$/;
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const issue = (code, field, message) => ({ code, field, message });

export function validateLogin({ user, password }) {
  const errors = [];
  // [VALIDACION-LOGIN-01] Evita enviar un usuario vacío.
  if (!user.trim()) errors.push(issue('VALIDACION-LOGIN-01', 'user', 'Ingresa el usuario o correo.'));
  // [VALIDACION-LOGIN-02] Evita enviar una contraseña vacía.
  if (!password.trim()) errors.push(issue('VALIDACION-LOGIN-02', 'password', 'Ingresa la contraseña.'));
  // [VALIDACION-LOGIN-03] Comprueba las credenciales permitidas para la demostración.
  if (!errors.length && !(['admin', 'admin@uleam.edu.ec'].includes(user.trim().toLowerCase()) && password === 'admin123')) {
    errors.push(issue('VALIDACION-LOGIN-03', 'credentials', 'Credenciales incorrectas.'));
  }
  return errors;
}

export function validateEquipment(item, equipments) {
  const errors = [];
  // [VALIDACION-EQUIPO-01] Verifica los campos mínimos para identificar y asignar un equipo.
  ['serial', 'brand', 'model', 'location', 'responsible', 'purchaseDate'].forEach((field) => {
    if (!String(item[field] ?? '').trim()) errors.push(issue('VALIDACION-EQUIPO-01', field, 'Este campo es obligatorio.'));
  });
  // [VALIDACION-EQUIPO-02] Impide registrar dos equipos con el mismo número de serie.
  if (equipments.some((equipment) => equipment.serial.toLowerCase() === item.serial.toLowerCase() && equipment.id !== item.id)) {
    errors.push(issue('VALIDACION-EQUIPO-02', 'serial', 'Ese número de serie ya existe.'));
  }
  // [VALIDACION-EQUIPO-03] Comprueba que el correo opcional tenga una estructura válida.
  if (item.email && !EMAIL_PATTERN.test(item.email)) errors.push(issue('VALIDACION-EQUIPO-03', 'email', 'El correo no tiene un formato válido.'));
  // [VALIDACION-EQUIPO-04] Comprueba que el teléfono opcional contenga solo caracteres telefónicos.
  if (item.phone && !PHONE_PATTERN.test(item.phone)) errors.push(issue('VALIDACION-EQUIPO-04', 'phone', 'El teléfono no tiene un formato válido.'));
  // [VALIDACION-EQUIPO-05] Evita costos negativos o valores que no sean numéricos.
  if (!Number.isFinite(item.cost) || item.cost < 0) errors.push(issue('VALIDACION-EQUIPO-05', 'cost', 'El costo debe ser un número mayor o igual a cero.'));
  // [VALIDACION-EQUIPO-06] La garantía no puede terminar antes de la fecha de compra.
  if (item.warranty && item.purchaseDate && item.warranty < item.purchaseDate) {
    errors.push(issue('VALIDACION-EQUIPO-06', 'warranty', 'La garantía no puede finalizar antes de la compra.'));
  }
  return errors;
}

export function validateMaintenance(item, equipments) {
  const errors = [];
  // [VALIDACION-MANTENIMIENTO-01] Exige que el mantenimiento pertenezca a un equipo existente.
  if (!equipments.some((equipment) => equipment.id === item.equipmentId)) {
    errors.push(issue('VALIDACION-MANTENIMIENTO-01', 'equipmentId', 'Selecciona un equipo válido.'));
  }
  // [VALIDACION-MANTENIMIENTO-02] Exige una fecha para ordenar el historial técnico.
  if (!item.date) errors.push(issue('VALIDACION-MANTENIMIENTO-02', 'date', 'Selecciona la fecha del mantenimiento.'));
  // [VALIDACION-MANTENIMIENTO-03] Las horas deben ser un número entero positivo.
  if (!Number.isInteger(item.hours) || item.hours < 1) errors.push(issue('VALIDACION-MANTENIMIENTO-03', 'hours', 'Las horas deben ser un entero mayor o igual a 1.'));
  // [VALIDACION-MANTENIMIENTO-04] El nombre del técnico es obligatorio.
  if (!item.technician.trim()) errors.push(issue('VALIDACION-MANTENIMIENTO-04', 'technician', 'Ingresa el nombre del técnico.'));
  // [VALIDACION-MANTENIMIENTO-05] La descripción es obligatoria y debe explicar el trabajo realizado.
  if (item.description.trim().length < 10) errors.push(issue('VALIDACION-MANTENIMIENTO-05', 'description', 'La descripción debe tener al menos 10 caracteres.'));
  return errors;
}

export function validateProfile(profile) {
  const errors = [];
  // [VALIDACION-PERFIL-01] Nombre y cargo son obligatorios para identificar al usuario.
  if (!profile.name.trim()) errors.push(issue('VALIDACION-PERFIL-01', 'name', 'Ingresa el nombre.'));
  if (!profile.role.trim()) errors.push(issue('VALIDACION-PERFIL-01', 'role', 'Ingresa el cargo.'));
  // [VALIDACION-PERFIL-02] El correo del perfil es obligatorio y debe ser válido.
  if (!EMAIL_PATTERN.test(profile.email.trim())) errors.push(issue('VALIDACION-PERFIL-02', 'email', 'Ingresa un correo válido.'));
  // [VALIDACION-PERFIL-03] El teléfono es opcional, pero debe respetar el formato permitido.
  if (profile.phone && !PHONE_PATTERN.test(profile.phone)) errors.push(issue('VALIDACION-PERFIL-03', 'phone', 'El teléfono no tiene un formato válido.'));
  return errors;
}

export function validateProfileImage(file) {
  // [VALIDACION-ARCHIVO-01] Detiene el proceso cuando no se seleccionó ningún archivo.
  if (!file) return [issue('VALIDACION-ARCHIVO-01', 'photo', 'Selecciona una imagen.')];
  // [VALIDACION-ARCHIVO-02] Solo permite formatos de imagen compatibles con el navegador.
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return [issue('VALIDACION-ARCHIVO-02', 'photo', 'Formato no permitido. Usa PNG, JPEG, WEBP o GIF.')];
  // [VALIDACION-ARCHIVO-03] Limita el archivo original para proteger el almacenamiento local.
  if (file.size > MAX_IMAGE_BYTES) return [issue('VALIDACION-ARCHIVO-03', 'photo', 'La imagen no puede superar 5 MB.')];
  return [];
}

export function validateExport(rows) {
  // [VALIDACION-EXPORTACION-01] Evita generar archivos vacíos sin encabezados ni registros.
  return rows.length ? [] : [issue('VALIDACION-EXPORTACION-01', 'rows', 'No hay datos para exportar.')];
}
