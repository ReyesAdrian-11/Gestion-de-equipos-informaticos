import { APP_KEY, LEGACY_KEYS, PHOTO_KEY, seed } from './data.js';

export const clone = (value) => JSON.parse(JSON.stringify(value));
export const todayISO = () => new Date().toISOString().slice(0, 10);
export const money = (value) => `$ ${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const initials = (name = 'U') => name.split(' ').filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase() || 'U';
export const statusClass = (status) => String(status || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
export const nextId = (items, prefix, floor) => `${prefix}${Math.max(floor, ...items.map((item) => Number(String(item.id).replace(prefix, '')) || 0)) + 1}`;

export function loadState() {
  for (const key of LEGACY_KEYS) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      return {
        profile: { ...clone(seed.profile), ...(parsed.profile || {}) },
        equipments: Array.isArray(parsed.equipments) && parsed.equipments.length ? parsed.equipments : clone(seed.equipments),
        maintenance: Array.isArray(parsed.maintenance) ? parsed.maintenance : clone(seed.maintenance),
      };
    } catch {
      // [VALIDACION-ALMACENAMIENTO-01] Ignora datos locales corruptos y continúa buscando una versión válida.
    }
  }
  return clone(seed);
}

export const saveState = (state) => localStorage.setItem(APP_KEY, JSON.stringify(state));

export function defaultAvatar(name) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><defs><linearGradient id="g"><stop stop-color="#0f5faa"/><stop offset="1" stop-color="#0e7490"/></linearGradient></defs><rect width="100%" height="100%" rx="60" fill="url(#g)"/><text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="Arial" font-size="110" font-weight="900">${initials(name)}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const getProfilePhoto = () => localStorage.getItem(PHOTO_KEY) || '';

export function resizeImage(file, maxSize = 420) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = ({ target }) => {
      const image = new Image();
      // [VALIDACION-ARCHIVO-04] Rechaza archivos que declaran ser imágenes pero no pueden decodificarse.
      image.onerror = () => reject(new Error('Imagen inválida'));
      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        context.fillStyle = '#fff';
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      image.src = target.result;
    };
    reader.readAsDataURL(file);
  });
}

export function downloadBlob(blob, filename) {
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
}

export function exportCSV(rows, filename) {
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map((row) => headers.map((header) => `"${String(row[header] ?? '').replaceAll('"', '""')}"`).join(','))].join('\n');
  downloadBlob(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }), filename);
}

export function groupResponsibles(equipments) {
  const groups = new Map();
  equipments.forEach((equipment) => {
    const key = equipment.responsible || 'Sin responsable';
    if (!groups.has(key)) groups.set(key, { name: key, email: equipment.email || '', phone: equipment.phone || '', equipments: [], value: 0 });
    const group = groups.get(key);
    group.equipments.push(equipment);
    group.value += Number(equipment.cost || 0);
  });
  return [...groups.values()].sort((a, b) => b.equipments.length - a.equipments.length || b.value - a.value);
}
