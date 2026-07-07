export const APP_KEY = 'uleam_inventory_v6';
export const SESSION_KEY = 'uleam_session_v6';
export const THEME_KEY = 'uleam_theme_v6';
export const PHOTO_KEY = 'uleam_profile_photo_v6';
export const LEGACY_KEYS = ['uleam_inventory_v6', 'uleam_inventory_v5', 'uleam_inventory_v4', 'uleam_inventory_v3', 'uleam_inventory_v2'];

export const categories = ['Computadora de Escritorio', 'Laptop', 'Impresora', 'Proyector', 'Switch', 'Router', 'Servidor', 'Tablet', 'Monitor', 'UPS'];
export const statuses = ['Disponible', 'Asignado', 'En Mantenimiento', 'Dañado'];
export const maintenanceTypes = ['Mantenimiento Preventivo', 'Mantenimiento Correctivo', 'Actualización de Hardware', 'Instalación de Software'];
export const ramOptions = ['', '4GB DDR4', '8GB DDR4', '16GB DDR4', '32GB DDR4', '64GB DDR4', 'No aplica'];
export const storageOptions = ['', '256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD', '500GB HDD', 'No aplica'];

export const seed = {
  profile: { name: 'Admin ULEAM', role: 'Administrador', email: 'admin@uleam.edu.ec', phone: '+593 99 123 4567' },
  equipments: [
    { id: 'EQ-1247', serial: 'SN-DL-7090-2026-001', category: 'Computadora de Escritorio', brand: 'Dell', model: 'Optiplex 7090', processor: 'Intel Core i7-11700', ram: '16GB DDR4', storage: '512GB SSD', status: 'Disponible', location: 'Laboratorio de Informática 1', responsible: 'Dr. Juan Carlos Pérez Mora', email: 'juan.perez@uleam.edu.ec', phone: '+593 99 123 4567', purchaseDate: '2026-05-12', warranty: '2029-05-12', provider: 'TechSolutions Ecuador', cost: 1245, notes: 'Equipo en excelente estado. Cuenta con licencia Windows 11 Pro activada.', createdAt: '2026-05-12' },
    { id: 'EQ-1246', serial: 'SN-HP-M404-2026-002', category: 'Impresora', brand: 'HP', model: 'LaserJet Pro M404dn', processor: 'No aplica', ram: 'No aplica', storage: 'No aplica', status: 'En Mantenimiento', location: 'Oficina Administrativa', responsible: 'Lcda. María Cedeño', email: 'maria.cedeno@uleam.edu.ec', phone: '+593 98 222 3344', purchaseDate: '2026-05-11', warranty: '2028-05-11', provider: 'CompuStore Manabí', cost: 389.99, notes: 'Requiere cambio de tóner y limpieza interna.', createdAt: '2026-05-11' },
    { id: 'EQ-1245', serial: 'SN-LN-X1-2026-003', category: 'Laptop', brand: 'Lenovo', model: 'ThinkPad X1 Carbon', processor: 'Intel Core i5-1135G7', ram: '16GB DDR4', storage: '256GB SSD', status: 'Disponible', location: 'Decanato', responsible: 'Dra. Laura Zambrano', email: 'laura.zambrano@uleam.edu.ec', phone: '+593 97 404 1122', purchaseDate: '2026-05-10', warranty: '2028-05-10', provider: 'Lenovo Partner Ecuador', cost: 1450, notes: 'Equipo asignable a dirección académica.', createdAt: '2026-05-10' },
    { id: 'EQ-1244', serial: 'SN-EP-2250-2026-004', category: 'Proyector', brand: 'Epson', model: 'PowerLite 2250U', processor: 'No aplica', ram: 'No aplica', storage: 'No aplica', status: 'Dañado', location: 'Aula Magna', responsible: 'Lcdo. Pedro Cedeño', email: 'pedro.cedeno@uleam.edu.ec', phone: '+593 99 111 2020', purchaseDate: '2026-05-09', warranty: '2028-05-09', provider: 'VisualTech', cost: 920, notes: 'No enciende. Requiere diagnóstico técnico.', createdAt: '2026-05-09' },
    { id: 'EQ-1243', serial: 'SN-CS-2960-2026-005', category: 'Switch', brand: 'Cisco', model: 'Catalyst 2960', processor: 'No aplica', ram: 'No aplica', storage: 'No aplica', status: 'Asignado', location: 'Data Center', responsible: 'Ing. Ana López', email: 'ana.lopez@uleam.edu.ec', phone: '+593 98 222 1199', purchaseDate: '2026-05-08', warranty: '2029-05-08', provider: 'Network Ecuador', cost: 760, notes: 'Instalado en rack principal.', createdAt: '2026-05-08' },
  ],
  maintenance: [
    { id: 'M-1', equipmentId: 'EQ-1247', type: 'Mantenimiento Preventivo', date: '2026-04-15', hours: 2, technician: 'Tec. Luis Martínez', description: 'Limpieza general del sistema, actualización de BIOS y drivers.', result: 'Completado', statusAfter: 'Disponible' },
    { id: 'M-2', equipmentId: 'EQ-1245', type: 'Actualización de Hardware', date: '2025-10-20', hours: 1, technician: 'Ing. María García', description: 'Actualización de RAM de 8GB a 16GB.', result: 'Completado', statusAfter: 'Disponible' },
    { id: 'M-3', equipmentId: 'EQ-1244', type: 'Mantenimiento Correctivo', date: '2025-07-05', hours: 3, technician: 'Ing. Ana López', description: 'Revisión de proyector por falla de encendido.', result: 'Completado', statusAfter: 'Dañado' },
  ],
};
