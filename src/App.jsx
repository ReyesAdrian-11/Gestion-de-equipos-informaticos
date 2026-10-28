import { useEffect, useMemo, useRef, useState } from 'react';
import {
  PHOTO_KEY,
  SESSION_KEY,
  THEME_KEY,
  categories,
  maintenanceTypes,
  ramOptions,
  statuses,
  storageOptions,
} from './data.js';
import {
  defaultAvatar,
  exportCSV,
  getProfilePhoto,
  groupResponsibles,
  loadState,
  money,
  nextId,
  resizeImage,
  saveState,
  statusClass,
  todayISO,
} from './utils.js';
import {
  validateEquipment,
  validateExport,
  validateLogin,
  validateMaintenance,
  validateProfile,
  validateProfileImage,
} from './validations.js';

const LOGO = '/logo-uleam-sistema.png';
const emptyEquipment = {
  id: '', serial: '', category: categories[0], brand: '', model: '', processor: '',
  ram: '', storage: '', status: 'Disponible', location: '', responsible: '',
  email: '', phone: '', purchaseDate: '', warranty: '', provider: '', cost: '', notes: '',
};
const emptyMaintenance = {
  id: '', equipmentId: '', type: maintenanceTypes[0], date: todayISO(), hours: 1,
  technician: '', description: '', result: 'Completado', statusAfter: 'Disponible',
};
const navItems = [
  ['inicio', '🏠', 'Inicio'], ['dashboard', '📊', 'Dashboard'], ['inventario', '💻', 'Inventario'],
  ['registro', '➕', 'Registrar equipo'], ['mantenimiento', '🛠', 'Mantenimiento'],
  ['reportes', '📁', 'Reportes'], ['responsables', '👥', 'Responsables'], ['perfil', '👤', 'Perfil'],
];

function ErrorList({ errors }) {
  if (!errors.length) return null;
  return (
    <div className="error-box validation-errors">
      {errors.map((error, index) => (
        <p key={`${error.code}-${error.field}-${index}`}>
          <span className="validation-tag">{error.code}</span> {error.message}
        </p>
      ))}
    </div>
  );
}

function FieldError({ errors, field }) {
  const error = errors.find((item) => item.field === field);
  return error ? <small className="field-error"><b>{error.code}</b> {error.message}</small> : null;
}

function Login({ onLogin, notify }) {
  const [form, setForm] = useState({ user: '', password: '', remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState([]);

  function submit(event) {
    event.preventDefault();
    const nextErrors = validateLogin(form);
    setErrors(nextErrors);
    if (nextErrors.length) {
      notify(nextErrors[0].message);
      return;
    }
    onLogin(form.remember);
  }

  return (
    <section className="login-screen">
      <div className="login-deco deco-a" />
      <div className="login-deco deco-b" />
      <div className="login-hero">
        <img src={LOGO} alt="Logo ULEAM" className="login-logo" />
        <h1>ULEAM</h1>
        <p>Informáticos</p>
        <ul><li>Registro y control de equipos</li><li>Responsables, mantenimiento y estados</li><li>Reportes Excel y PDF</li></ul>
      </div>
      <form className="login-card" onSubmit={submit} noValidate>
        <div className="login-head">
          <img src={LOGO} alt="Logo del sistema" className="login-head-logo" />
          <div><h2>Iniciar sesión</h2><p>Accede al panel administrativo</p></div>
        </div>
        <label>Usuario o correo
          <input value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })} autoComplete="username" />
          <FieldError errors={errors} field="user" />
        </label>
        <label>Contraseña
          <div className="password-wrap">
            <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" />
            <button type="button" className="icon-button password-btn" onClick={() => setShowPassword(!showPassword)}>👁</button>
          </div>
          <FieldError errors={errors} field="password" />
        </label>
        <FieldError errors={errors} field="credentials" />
        <div className="login-row">
          <label className="check-row"><input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} /> Recordarme</label>
          <button type="button" className="text-link" onClick={() => notify('Usa admin@uleam.edu.ec y la contraseña admin123')}>Ayuda</button>
        </div>
        <button className="btn primary full" type="submit">Entrar al sistema</button>
        <small className="demo-cred">Demo: <b>admin@uleam.edu.ec</b> / <b>admin123</b></small>
      </form>
    </section>
  );
}

function Sidebar({ open, view, navigate, close }) {
  return (
    <>
      <aside className={`sidebar ${open ? '' : 'closed'}`}>
        <div className="sidebar-brand">
          <img src={LOGO} alt="Logo" className="sidebar-logo" />
          <div><h2>ULEAM</h2><p>Inventario TI</p></div>
          <button type="button" className="icon-button side-close" onClick={close}>×</button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(([id, icon, label]) => (
            <button key={id} className={`nav-btn ${view === id ? 'active' : ''}`} onClick={() => { navigate(id); close(); }}>
              {icon} <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-note"><span>Guardado automático local</span><small>Interfaz desarrollada con React</small></div>
      </aside>
      {open && <div className="overlay" onClick={close} />}
    </>
  );
}

function Header({ profile, avatar, theme, setTheme, openMenu, goBack, canGoBack, navigate, logout, notify, setInventorySearch }) {
  function globalSearch(value) {
    setInventorySearch(value);
    navigate('inventario');
  }
  return (
    <header className="topbar">
      <div className="top-left">
        <button type="button" className="icon-button" onClick={openMenu}>☰</button>
        <button type="button" className="icon-button" onClick={goBack} disabled={!canGoBack}>←</button>
        <div className="search-box">🔎 <input placeholder="Buscar equipo, serie, responsable o ubicación..." onChange={(e) => globalSearch(e.target.value)} /></div>
      </div>
      <div className="top-right">
        <button type="button" className="btn ghost small" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? '☀️ Modo claro' : '🌙 Modo oscuro'}</button>
        <button type="button" className="icon-button notify-btn" onClick={notify}>🔔<i /></button>
        <button type="button" className="profile-chip" onClick={() => navigate('perfil')}>
          <img src={avatar} alt="Avatar" /><span><b>{profile.name}</b><small>{profile.role}</small></span>
        </button>
        <button type="button" className="btn ghost small" onClick={logout}>Salir</button>
      </div>
    </header>
  );
}

function PageHead({ title, description, children }) {
  return <div className="page-head"><div><h1>{title}</h1><p>{description}</p></div>{children}</div>;
}

function StatCard({ label, value, note, onClick }) {
  return <article className={`stat-card ${onClick ? 'clickable' : ''}`} onClick={onClick}><span>{label}</span><strong className={String(value).startsWith('$') ? 'money-stat' : ''}>{value}</strong><small>{note}</small></article>;
}

function Home({ state, navigate }) {
  const responsibles = groupResponsibles(state.equipments);
  const totalValue = state.equipments.reduce((sum, item) => sum + Number(item.cost || 0), 0);
  const alerts = statuses.slice(1).map((status) => ({ status, count: state.equipments.filter((item) => item.status === status).length })).filter((item) => item.count);
  const recent = [...state.equipments].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  return (
    <>
      <PageHead title="Inicio" description="Accesos rápidos, alertas y resumen general del sistema." />
      <div className="hero-panel">
        <div><span className="badge-soft">Panel institucional</span><h2>Bienvenido al sistema de inventario informático ULEAM</h2><p>Gestiona activos tecnológicos, responsables, mantenimientos y genera reportes con una estructura clara y profesional.</p><div className="hero-actions"><button className="btn primary" onClick={() => navigate('registro')}>Registrar equipo</button><button className="btn ghost" onClick={() => navigate('reportes')}>Ver reportes</button></div></div>
        <div className="hero-logo-shell"><img src={LOGO} alt="Logo institucional" className="hero-logo" /></div>
      </div>
      <div className="stats-grid">
        <StatCard label="Total equipos" value={state.equipments.length} note="Activos registrados" />
        <StatCard label="Responsables" value={responsibles.length} note="Personas con equipos" />
        <StatCard label="Mantenimientos" value={state.maintenance.length} note="Historial técnico" />
        <StatCard label="Valor total" value={money(totalValue)} note="Costo del inventario" />
      </div>
      <div className="shortcut-grid">
        {navItems.filter(([id]) => ['inventario', 'mantenimiento', 'responsables', 'perfil'].includes(id)).map(([id, icon, label]) => <button key={id} className="shortcut-card" onClick={() => navigate(id)}><span>{icon}</span><b>{label}</b><small>Abrir módulo</small></button>)}
      </div>
      <div className="grid-panels">
        <article className="panel"><div className="panel-head"><div><h2>Alertas rápidas</h2><p>Novedades que requieren atención.</p></div></div><div className="list-stack">{alerts.length ? alerts.map((alert) => <article className="list-item" key={alert.status}><b>{alert.count} equipo(s) {alert.status.toLowerCase()}</b><small>Requieren seguimiento dentro del inventario.</small></article>) : <article className="list-item"><b>Sin alertas críticas</b><small>No hay novedades urgentes.</small></article>}</div></article>
        <article className="panel"><div className="panel-head"><div><h2>Actividad reciente</h2><p>Últimos equipos registrados.</p></div></div><div className="list-stack">{recent.map((item) => <article className="list-item" key={item.id}><b>{item.id} · {item.brand} {item.model}</b><small>{item.category} · {item.status} · {item.responsible}</small></article>)}</div></article>
      </div>
    </>
  );
}

function DonutChart({ equipments }) {
  const total = equipments.length || 1;
  let offset = 0;
  const colors = { Disponible: '#22c55e', Asignado: '#3b82f6', 'En Mantenimiento': '#f97316', Dañado: '#ef4444' };
  const segments = statuses.map((status) => {
    const count = equipments.filter((item) => item.status === status).length;
    const dash = (count / total) * 100;
    const segment = { status, count, dash, offset, color: colors[status] };
    offset -= dash;
    return segment;
  });
  return (
    <div className="react-chart">
      <svg viewBox="0 0 42 42" className="donut">
        <circle className="donut-hole" cx="21" cy="21" r="15.9155" fill="transparent" />
        <circle className="donut-ring" cx="21" cy="21" r="15.9155" fill="transparent" stroke="var(--line)" strokeWidth="5" />
        {segments.filter((item) => item.count).map((item) => <circle key={item.status} cx="21" cy="21" r="15.9155" fill="transparent" stroke={item.color} strokeWidth="5" strokeDasharray={`${item.dash} ${100 - item.dash}`} strokeDashoffset={item.offset} />)}
        <text x="21" y="20" textAnchor="middle" className="donut-number">{equipments.length}</text><text x="21" y="24" textAnchor="middle" className="donut-label">equipos</text>
      </svg>
      <div className="legend">{segments.map((item) => <span key={item.status}><i style={{ background: item.color }} />{item.status}: {item.count}</span>)}</div>
    </div>
  );
}

function BarChart({ data, moneyValues = false }) {
  const max = Math.max(1, ...data.map((item) => item.value));
  return <div className="react-bars">{data.filter((item) => item.value > 0).map((item) => <div className="react-bar-item" key={item.label} title={`${item.label}: ${moneyValues ? money(item.value) : item.value}`}><b>{moneyValues ? money(item.value) : item.value}</b><div className="react-bar-track"><div className="react-bar-fill" style={{ height: `${Math.max(8, item.value / max * 100)}%` }} /></div><small>{item.label.replace(' de Escritorio', '')}</small></div>)}</div>;
}

function Dashboard({ state, filterByStatus }) {
  const categoryData = categories.map((label) => ({ label, value: state.equipments.filter((item) => item.category === label).length }));
  return (
    <>
      <PageHead title="Dashboard" description="Indicadores y gráficos del inventario institucional." />
      <div className="stats-grid">
        <StatCard label="Total equipos" value={state.equipments.length} note="Inventario registrado" />
        {['Disponible', 'En Mantenimiento', 'Dañado'].map((status) => <StatCard key={status} label={status} value={state.equipments.filter((item) => item.status === status).length} note="Ver equipos" onClick={() => filterByStatus(status)} />)}
      </div>
      <div className="grid-panels">
        <article className="panel"><div className="panel-head"><div><h2>Distribución por estado</h2><p>Condición actual del inventario.</p></div></div><DonutChart equipments={state.equipments} /></article>
        <article className="panel"><div className="panel-head"><div><h2>Equipos por categoría</h2><p>Vista comparativa del inventario.</p></div></div><BarChart data={categoryData} /></article>
      </div>
    </>
  );
}

function Inventory({ equipments, filters, setFilters, navigate, editEquipment, deleteEquipment, updateStatus, notify }) {
  const filtered = useMemo(() => equipments.filter((item) => {
    const haystack = [item.id, item.serial, item.brand, item.model, item.category, item.location, item.responsible, item.status].join(' ').toLowerCase();
    return (!filters.search || haystack.includes(filters.search.toLowerCase())) && (!filters.category || item.category === filters.category) && (!filters.status || item.status === filters.status);
  }), [equipments, filters]);

  function doExport() {
    const errors = validateExport(filtered);
    if (errors.length) return notify(`${errors[0].code}: ${errors[0].message}`);
    exportCSV(filtered, 'inventario_uleam.csv');
    notify('Archivo CSV exportado');
  }

  return (
    <>
      <PageHead title="Inventario" description="Consulta, edita, elimina y cambia el estado de cada equipo."><button className="btn primary" onClick={() => navigate('registro')}>+ Registrar</button></PageHead>
      <div className="panel filters inventory-filters">
        <input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Buscar por ID, serie, marca, modelo o responsable..." />
        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}><option value="">Todas las categorías</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">Todos los estados</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select>
        <button className="btn ghost" onClick={() => setFilters({ search: '', category: '', status: '' })}>Limpiar</button>
        <button className="btn primary" onClick={doExport}>Exportar CSV</button>
      </div>
      <article className="panel"><div className="table-wrap"><table><thead><tr><th>ID</th><th>Serie</th><th>Equipo</th><th>Categoría</th><th>Ubicación</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
        {filtered.map((item) => <tr key={item.id}><td>{item.id}</td><td>{item.serial}</td><td><b>{item.brand} {item.model}</b><br /><small>{item.processor}</small></td><td>{item.category}</td><td>{item.location}</td><td><select className="status-select" value={item.status} onChange={(e) => updateStatus(item.id, e.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></td><td><div className="row-actions"><button className="mini-btn" onClick={() => navigate('detalle', item.id)}>Ver</button><button className="mini-btn" onClick={() => editEquipment(item)}>Editar</button><button className="mini-btn danger" onClick={() => deleteEquipment(item.id)}>Eliminar</button></div></td></tr>)}
      </tbody></table></div><p className="muted">Mostrando {filtered.length} de {equipments.length} equipos registrados.</p></article>
    </>
  );
}

function EquipmentForm({ draft, setDraft, equipments, saveEquipment, cancelEdit }) {
  const [errors, setErrors] = useState([]);
  function change(field, value) { setDraft({ ...draft, [field]: value }); }
  function submit(event) {
    event.preventDefault();
    const item = { ...draft, cost: Number(draft.cost || 0), createdAt: draft.createdAt || todayISO() };
    const nextErrors = validateEquipment(item, equipments);
    setErrors(nextErrors);
    if (!nextErrors.length) saveEquipment(item);
  }
  return (
    <>
      <PageHead title={draft.id ? `Editar equipo ${draft.id}` : 'Registrar nuevo equipo'} description="Completa los datos del dispositivo informático." />
      <form className="form-card" onSubmit={submit} noValidate>
        <div className="form-banner"><h2>Datos del equipo</h2><p>Las reglas muestran un código para facilitar su revisión.</p></div>
        <div className="form-body">
          <h3>Identificación</h3><div className="form-grid two">
            <label>Número de serie *<input value={draft.serial} onChange={(e) => change('serial', e.target.value)} /><FieldError errors={errors} field="serial" /></label>
            <label>Categoría *<select value={draft.category} onChange={(e) => change('category', e.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>
          <h3>Especificaciones</h3><div className="form-grid two">
            <label>Marca *<input value={draft.brand} onChange={(e) => change('brand', e.target.value)} /><FieldError errors={errors} field="brand" /></label>
            <label>Modelo *<input value={draft.model} onChange={(e) => change('model', e.target.value)} /><FieldError errors={errors} field="model" /></label>
          </div><div className="form-grid three">
            <label>Procesador<input value={draft.processor} onChange={(e) => change('processor', e.target.value)} /></label>
            <label>RAM<select value={draft.ram} onChange={(e) => change('ram', e.target.value)}>{ramOptions.map((item) => <option key={item}>{item || 'Seleccionar'}</option>)}</select></label>
            <label>Almacenamiento<select value={draft.storage} onChange={(e) => change('storage', e.target.value)}>{storageOptions.map((item) => <option key={item}>{item || 'Seleccionar'}</option>)}</select></label>
          </div>
          <h3>Estado, ubicación y responsable</h3><div className="form-grid two">
            <label>Estado *<select value={draft.status} onChange={(e) => change('status', e.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Ubicación *<input value={draft.location} onChange={(e) => change('location', e.target.value)} /><FieldError errors={errors} field="location" /></label>
          </div><div className="form-grid three">
            <label>Responsable *<input value={draft.responsible} onChange={(e) => change('responsible', e.target.value)} /><FieldError errors={errors} field="responsible" /></label>
            <label>Correo<input type="email" value={draft.email} onChange={(e) => change('email', e.target.value)} /><FieldError errors={errors} field="email" /></label>
            <label>Teléfono<input value={draft.phone} onChange={(e) => change('phone', e.target.value)} /><FieldError errors={errors} field="phone" /></label>
          </div>
          <h3>Compra</h3><div className="form-grid four">
            <label>Fecha de compra *<input type="date" value={draft.purchaseDate} onChange={(e) => change('purchaseDate', e.target.value)} /><FieldError errors={errors} field="purchaseDate" /></label>
            <label>Garantía hasta<input type="date" value={draft.warranty} onChange={(e) => change('warranty', e.target.value)} /><FieldError errors={errors} field="warranty" /></label>
            <label>Proveedor<input value={draft.provider} onChange={(e) => change('provider', e.target.value)} /></label>
            <label>Costo<input type="number" min="0" step="0.01" value={draft.cost} onChange={(e) => change('cost', e.target.value)} /><FieldError errors={errors} field="cost" /></label>
          </div>
          <label>Observaciones<textarea value={draft.notes} onChange={(e) => change('notes', e.target.value)} /></label>
          <ErrorList errors={errors} />
          <div className="actions"><button className="btn primary" type="submit">💾 Guardar equipo</button><button className="btn ghost" type="button" onClick={cancelEdit}>Limpiar</button></div>
        </div>
      </form>
    </>
  );
}

function Detail({ equipment, maintenance, navigate, editEquipment, openMaintenance }) {
  if (!equipment) return <p className="muted">El equipo seleccionado ya no existe.</p>;
  const records = maintenance.filter((item) => item.equipmentId === equipment.id).sort((a, b) => b.date.localeCompare(a.date));
  const details = [['Categoría', equipment.category], ['Procesador', equipment.processor], ['RAM', equipment.ram], ['Almacenamiento', equipment.storage], ['Ubicación', equipment.location], ['Responsable', equipment.responsible], ['Correo', equipment.email || 'No registrado'], ['Teléfono', equipment.phone || 'No registrado'], ['Fecha de compra', equipment.purchaseDate], ['Garantía hasta', equipment.warranty || 'No registrada'], ['Proveedor', equipment.provider || 'No registrado'], ['Costo', money(equipment.cost)]];
  return (
    <>
      <PageHead title="Detalle del equipo" description="Información completa del activo seleccionado."><button className="btn ghost" onClick={() => navigate('inventario')}>← Volver</button></PageHead>
      <div className="detail-grid"><article className="panel"><div className="detail-title"><div><h1>{equipment.brand} {equipment.model}</h1><p>ID: {equipment.id} · Serie: {equipment.serial}</p></div><span className={`pill ${statusClass(equipment.status)}`}>{equipment.status}</span></div><div className="info-list">{details.map(([label, value]) => <div className="info-item" key={label}><small>{label}</small><b>{value}</b></div>)}</div></article>
        <article className="panel"><div className="panel-head"><div><h2>Acciones rápidas</h2><p>Gestiona este dispositivo.</p></div></div><div className="actions"><button className="btn primary" onClick={() => editEquipment(equipment)}>Editar</button><button className="btn ghost" onClick={() => openMaintenance(equipment.id)}>Agregar mantenimiento</button><button className="btn ghost" onClick={() => navigate('responsables')}>Ver responsable</button></div><article className="list-item"><b>Observaciones</b><small>{equipment.notes || 'Sin observaciones registradas.'}</small></article></article></div>
      <article className="panel detail-maintenance"><div className="panel-head"><div><h2>Historial de mantenimiento</h2><p>Registros técnicos asociados al equipo.</p></div></div><MaintenanceList records={records} equipments={[equipment]} compact /></article>
    </>
  );
}

function MaintenanceList({ records, equipments, compact, onView, onEdit, onDelete }) {
  if (!records.length) return <p className="muted">No hay registros de mantenimiento.</p>;
  return <div className="timeline">{records.map((record) => {
    const equipment = equipments.find((item) => item.id === record.equipmentId);
    return <div className="timeline-item" key={record.id}><div className="timeline-dot" /><article className="timeline-card"><h3>{record.type}</h3><div className="meta-line"><span>{record.date}</span><span>{record.hours} hora(s)</span><span>{record.technician}</span><span>{record.result}</span></div><p><b>Equipo:</b> {equipment ? `${equipment.id} · ${equipment.brand} ${equipment.model}` : record.equipmentId}</p><p>{record.description}</p><p><b>Estado posterior:</b> <span className={`pill ${statusClass(record.statusAfter)}`}>{record.statusAfter}</span></p>{!compact && <div className="maint-actions"><button className="mini-btn" onClick={() => onView(record.equipmentId)}>Ver equipo</button><button className="mini-btn" onClick={() => onEdit(record)}>Editar</button><button className="mini-btn danger" onClick={() => onDelete(record.id)}>Eliminar</button></div>}</article></div>;
  })}</div>;
}

function Maintenance({ state, openDialog, navigate, editRecord, deleteRecord }) {
  const [filters, setFilters] = useState({ search: '', type: '', equipmentId: '' });
  const records = useMemo(() => state.maintenance.filter((record) => {
    const equipment = state.equipments.find((item) => item.id === record.equipmentId);
    const text = [record.id, record.type, record.technician, record.description, equipment?.brand, equipment?.model].join(' ').toLowerCase();
    return (!filters.search || text.includes(filters.search.toLowerCase())) && (!filters.type || record.type === filters.type) && (!filters.equipmentId || record.equipmentId === filters.equipmentId);
  }).sort((a, b) => b.date.localeCompare(a.date)), [state, filters]);
  return (
    <>
      <PageHead title="Mantenimiento" description="Agrega, edita, elimina y filtra registros técnicos."><button className="btn primary" onClick={() => openDialog()}>+ Agregar mantenimiento</button></PageHead>
      <div className="panel filters maintenance-filters"><input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Buscar por equipo, técnico, tipo o descripción..." /><select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}><option value="">Todos los tipos</option>{maintenanceTypes.map((item) => <option key={item}>{item}</option>)}</select><select value={filters.equipmentId} onChange={(e) => setFilters({ ...filters, equipmentId: e.target.value })}><option value="">Todos los equipos</option>{state.equipments.map((item) => <option value={item.id} key={item.id}>{item.id} - {item.brand} {item.model}</option>)}</select></div>
      <article className="panel"><MaintenanceList records={records} equipments={state.equipments} onView={(id) => navigate('detalle', id)} onEdit={editRecord} onDelete={deleteRecord} /></article>
    </>
  );
}

function MaintenanceDialog({ open, draft, setDraft, equipments, close, save }) {
  const dialogRef = useRef(null);
  const [errors, setErrors] = useState([]);
  useEffect(() => {
    if (open && !dialogRef.current.open) dialogRef.current.showModal();
    if (!open && dialogRef.current.open) dialogRef.current.close();
  }, [open]);
  function change(field, value) { setDraft({ ...draft, [field]: value }); }
  function submit(event) {
    event.preventDefault();
    const item = { ...draft, hours: Number(draft.hours) };
    const nextErrors = validateMaintenance(item, equipments);
    setErrors(nextErrors);
    if (!nextErrors.length) { save(item); setErrors([]); }
  }
  return (
    <dialog ref={dialogRef} className="modal" onCancel={close}>
      <form onSubmit={submit} noValidate>
        <h2>{draft.id ? `Editar mantenimiento ${draft.id}` : 'Agregar mantenimiento'}</h2>
        <label>Equipo<select value={draft.equipmentId} onChange={(e) => change('equipmentId', e.target.value)}><option value="">Seleccionar equipo</option>{equipments.map((item) => <option value={item.id} key={item.id}>{item.id} - {item.brand} {item.model}</option>)}</select><FieldError errors={errors} field="equipmentId" /></label>
        <label>Tipo<select value={draft.type} onChange={(e) => change('type', e.target.value)}>{maintenanceTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
        <div className="form-grid two"><label>Fecha<input type="date" value={draft.date} onChange={(e) => change('date', e.target.value)} /><FieldError errors={errors} field="date" /></label><label>Horas<input type="number" min="1" step="1" value={draft.hours} onChange={(e) => change('hours', e.target.value)} /><FieldError errors={errors} field="hours" /></label></div>
        <label>Técnico<input value={draft.technician} onChange={(e) => change('technician', e.target.value)} /><FieldError errors={errors} field="technician" /></label>
        <label>Descripción<textarea value={draft.description} onChange={(e) => change('description', e.target.value)} /><FieldError errors={errors} field="description" /></label>
        <div className="form-grid two"><label>Resultado<select value={draft.result} onChange={(e) => change('result', e.target.value)}><option>Completado</option><option>Pendiente</option><option>En proceso</option></select></label><label>Estado posterior<select value={draft.statusAfter} onChange={(e) => change('statusAfter', e.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label></div>
        <ErrorList errors={errors} /><div className="actions"><button className="btn primary" type="submit">Guardar mantenimiento</button><button className="btn ghost" type="button" onClick={close}>Cancelar</button></div>
      </form>
    </dialog>
  );
}

function Reports({ state, notify }) {
  const totalValue = state.equipments.reduce((sum, item) => sum + Number(item.cost || 0), 0);
  const responsibles = groupResponsibles(state.equipments);
  const categoryData = categories.map((label) => ({ label, value: state.equipments.filter((item) => item.category === label).reduce((sum, item) => sum + Number(item.cost || 0), 0) }));
  const categoryRows = categoryData.filter((item) => item.value).map((item) => ({ ...item, count: state.equipments.filter((equipment) => equipment.category === item.label).length }));
  function excel() {
    const errors = validateExport(state.equipments);
    if (errors.length) return notify(`${errors[0].code}: ${errors[0].message}`);
    const rows = state.equipments.map((item) => ({ ID: item.id, Serie: item.serial, Categoría: item.category, Marca: item.brand, Modelo: item.model, Estado: item.status, Ubicación: item.location, Responsable: item.responsible, Costo: item.cost }));
    exportCSV(rows, 'reporte_inventario_uleam.csv');
    notify('Reporte compatible con Excel generado');
  }
  function print() { window.print(); }
  return (
    <>
      <PageHead title="Reportes" description="Consulta los resúmenes y genera exportaciones en Excel o PDF."><div className="actions"><button className="btn primary" onClick={excel}>Generar Excel/CSV</button><button className="btn ghost" onClick={print}>Imprimir / Guardar PDF</button></div></PageHead>
      <div className="stats-grid"><StatCard label="Total equipos" value={state.equipments.length} note="Activos registrados" /><StatCard label="Valor total" value={money(totalValue)} note="Costo acumulado" /><StatCard label="Promedio por equipo" value={money(totalValue / (state.equipments.length || 1))} note="Costo promedio" /><StatCard label="Responsables" value={responsibles.length} note="Personas asignadas" /></div>
      <div className="grid-panels"><article className="panel"><div className="panel-head"><div><h2>Valor por categoría</h2><p>Montos estimados.</p></div></div><BarChart data={categoryData} moneyValues /></article><article className="panel"><div className="panel-head"><div><h2>Estado del inventario</h2><p>Resumen visual.</p></div></div><DonutChart equipments={state.equipments} /></article></div>
      <div className="grid-panels report-tables-grid"><article className="panel"><h2>Resumen por categoría</h2><div className="table-wrap"><table><thead><tr><th>Categoría</th><th>Cantidad</th><th>Valor</th></tr></thead><tbody>{categoryRows.map((row) => <tr key={row.label}><td>{row.label}</td><td>{row.count}</td><td>{money(row.value)}</td></tr>)}</tbody></table></div></article><article className="panel"><h2>Equipos más costosos</h2><div className="table-wrap"><table><thead><tr><th>ID</th><th>Equipo</th><th>Responsable</th><th>Costo</th></tr></thead><tbody>{[...state.equipments].sort((a, b) => b.cost - a.cost).slice(0, 8).map((item) => <tr key={item.id}><td>{item.id}</td><td>{item.brand} {item.model}</td><td>{item.responsible}</td><td>{money(item.cost)}</td></tr>)}</tbody></table></div></article></div>
    </>
  );
}

function Responsibles({ equipments, navigate }) {
  const [selected, setSelected] = useState(null);
  const dialogRef = useRef(null);
  const groups = groupResponsibles(equipments);
  useEffect(() => {
    if (selected && !dialogRef.current.open) dialogRef.current.showModal();
    if (!selected && dialogRef.current?.open) dialogRef.current.close();
  }, [selected]);
  return (
    <>
      <PageHead title="Responsables" description="Visualiza cuántas máquinas tiene cada responsable y sus detalles." />
      <div className="users-grid">{groups.map((group) => <article className="user-card" key={group.name}><div className="avatar">{group.name.split(' ').slice(0, 2).map((word) => word[0]).join('')}</div><h3>{group.name}</h3><p>{group.email || 'Correo no registrado'}</p><p>{group.phone || 'Teléfono no registrado'}</p><div className="user-meta"><div><small>Máquinas</small><b>{group.equipments.length}</b></div><div><small>Valor</small><b>{money(group.value)}</b></div></div><button className="btn ghost full" onClick={() => setSelected(group)}>Ver detalle</button></article>)}</div>
      <dialog ref={dialogRef} className="modal large" onCancel={() => setSelected(null)}>{selected && <div><h2>{selected.name}</h2><p className="muted">{selected.email} · {selected.phone}</p><div className="table-wrap"><table><thead><tr><th>ID</th><th>Equipo</th><th>Ubicación</th><th>Estado</th><th /></tr></thead><tbody>{selected.equipments.map((item) => <tr key={item.id}><td>{item.id}</td><td>{item.brand} {item.model}</td><td>{item.location}</td><td><span className={`pill ${statusClass(item.status)}`}>{item.status}</span></td><td><button className="mini-btn" onClick={() => { setSelected(null); navigate('detalle', item.id); }}>Ver</button></td></tr>)}</tbody></table></div><div className="actions"><button className="btn ghost" onClick={() => setSelected(null)}>Cerrar</button></div></div>}</dialog>
    </>
  );
}

function Profile({ profile, saveProfile, avatar, setAvatar, notify }) {
  const [draft, setDraft] = useState(profile);
  const [errors, setErrors] = useState([]);
  useEffect(() => setDraft(profile), [profile]);
  function submit(event) {
    event.preventDefault();
    const nextErrors = validateProfile(draft);
    setErrors(nextErrors);
    if (!nextErrors.length) saveProfile(draft);
  }
  async function changePhoto(event) {
    const file = event.target.files[0];
    const nextErrors = validateProfileImage(file);
    setErrors(nextErrors);
    if (nextErrors.length) return;
    try {
      const data = await resizeImage(file);
      // [VALIDACION-ALMACENAMIENTO-02] La escritura puede fallar si localStorage no tiene espacio suficiente.
      localStorage.setItem(PHOTO_KEY, data);
      setAvatar(data);
      notify('Foto de perfil actualizada');
    } catch {
      notify('No se pudo procesar o guardar la imagen.');
    }
    event.target.value = '';
  }
  return (
    <>
      <PageHead title="Perfil" description="Cambia tu información personal y tu foto de perfil." />
      <article className="panel profile-panel"><div className="profile-photo-block"><div className="profile-photo-shell"><img src={avatar} alt="Foto de perfil" /></div><label className="btn primary file-button">Seleccionar foto<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={changePhoto} hidden /></label><button className="btn ghost" onClick={() => { localStorage.removeItem(PHOTO_KEY); setAvatar(defaultAvatar(draft.name)); }}>Quitar foto</button><small>PNG, JPEG, WEBP o GIF. Máximo 5 MB.</small></div>
        <form className="profile-form" onSubmit={submit} noValidate><label>Nombre<input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /><FieldError errors={errors} field="name" /></label><label>Cargo<input value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} /><FieldError errors={errors} field="role" /></label><label>Correo<input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /><FieldError errors={errors} field="email" /></label><label>Teléfono<input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /><FieldError errors={errors} field="phone" /></label><ErrorList errors={errors} /><button className="btn primary" type="submit">Guardar perfil</button></form></article>
    </>
  );
}

function App() {
  const [state, setState] = useState(loadState);
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem(SESSION_KEY) === 'on');
  const [view, setView] = useState('inicio');
  const [history, setHistory] = useState(['inicio']);
  const [selectedId, setSelectedId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem(THEME_KEY) || 'light');
  const [toast, setToast] = useState('');
  const [equipmentDraft, setEquipmentDraft] = useState(emptyEquipment);
  const [maintenanceDraft, setMaintenanceDraft] = useState(emptyMaintenance);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [filters, setFilters] = useState({ search: '', category: '', status: '' });
  const [avatar, setAvatar] = useState(() => getProfilePhoto() || defaultAvatar(state.profile.name));

  useEffect(() => { document.body.classList.toggle('dark', theme === 'dark'); localStorage.setItem(THEME_KEY, theme); }, [theme]);
  useEffect(() => { saveState(state); }, [state]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  function notify(message) { setToast(message); }
  function navigate(nextView, id = null) {
    if (id) setSelectedId(id);
    setView(nextView);
    setHistory((items) => items.at(-1) === nextView ? items : [...items, nextView]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function goBack() {
    if (history.length <= 1) return;
    const next = history.slice(0, -1);
    setHistory(next);
    setView(next.at(-1));
  }
  function login(remember) {
    if (remember) localStorage.setItem(SESSION_KEY, 'on');
    setLoggedIn(true);
    notify('Ingreso correcto al sistema');
  }
  function logout() { localStorage.removeItem(SESSION_KEY); setLoggedIn(false); notify('Sesión cerrada'); }
  function saveEquipment(item) {
    const normalized = { ...item, id: item.id || nextId(state.equipments, 'EQ-', 1247), processor: item.processor || 'No aplica', ram: item.ram || 'No aplica', storage: item.storage || 'No aplica' };
    setState((current) => ({ ...current, equipments: current.equipments.some((equipment) => equipment.id === normalized.id) ? current.equipments.map((equipment) => equipment.id === normalized.id ? normalized : equipment) : [normalized, ...current.equipments] }));
    setEquipmentDraft(emptyEquipment);
    navigate('inventario');
    notify(item.id ? 'Equipo actualizado' : 'Equipo registrado');
  }
  function editEquipment(item) { setEquipmentDraft({ ...item }); navigate('registro'); }
  function deleteEquipment(id) {
    // [VALIDACION-ELIMINACION-01] Solicita confirmación antes de eliminar el equipo y su historial.
    if (!window.confirm(`¿Eliminar el equipo ${id} y sus mantenimientos?`)) return;
    setState((current) => ({ ...current, equipments: current.equipments.filter((item) => item.id !== id), maintenance: current.maintenance.filter((item) => item.equipmentId !== id) }));
    notify('Equipo eliminado');
  }
  function updateStatus(id, status) { setState((current) => ({ ...current, equipments: current.equipments.map((item) => item.id === id ? { ...item, status } : item) })); notify('Estado actualizado'); }
  function openMaintenance(equipmentId = '') { setMaintenanceDraft({ ...emptyMaintenance, equipmentId }); setMaintenanceOpen(true); }
  function editMaintenance(item) { setMaintenanceDraft({ ...item }); setMaintenanceOpen(true); }
  function saveMaintenance(item) {
    const normalized = { ...item, id: item.id || nextId(state.maintenance, 'M-', 3) };
    setState((current) => ({ ...current, maintenance: current.maintenance.some((record) => record.id === normalized.id) ? current.maintenance.map((record) => record.id === normalized.id ? normalized : record) : [normalized, ...current.maintenance], equipments: current.equipments.map((equipment) => equipment.id === normalized.equipmentId ? { ...equipment, status: normalized.statusAfter } : equipment) }));
    setMaintenanceOpen(false);
    notify(item.id ? 'Mantenimiento actualizado' : 'Mantenimiento guardado');
  }
  function deleteMaintenance(id) {
    // [VALIDACION-ELIMINACION-02] Solicita confirmación antes de borrar un registro técnico.
    if (!window.confirm('¿Deseas eliminar este registro de mantenimiento?')) return;
    setState((current) => ({ ...current, maintenance: current.maintenance.filter((item) => item.id !== id) }));
    notify('Mantenimiento eliminado');
  }
  function saveProfile(profile) { setState((current) => ({ ...current, profile })); notify('Perfil actualizado'); }
  function filterByStatus(status) { setFilters({ search: '', category: '', status }); navigate('inventario'); }

  if (!loggedIn) return <><Login onLogin={login} notify={notify} />{toast && <div className="toast show">{toast}</div>}</>;
  const selectedEquipment = state.equipments.find((item) => item.id === selectedId);
  const pageProps = { state, navigate };
  return (
    <section className="app">
      <Sidebar open={menuOpen} view={view} navigate={navigate} close={() => setMenuOpen(false)} />
      <main className="main-area">
        <Header profile={state.profile} avatar={avatar} theme={theme} setTheme={setTheme} openMenu={() => setMenuOpen(true)} goBack={goBack} canGoBack={history.length > 1} navigate={navigate} logout={logout} setInventorySearch={(search) => setFilters({ ...filters, search })} notify={() => notify(`${state.equipments.filter((item) => ['Dañado', 'En Mantenimiento'].includes(item.status)).length} equipo(s) requieren seguimiento.`)} />
        <section className="view active">
          {view === 'inicio' && <Home {...pageProps} />}
          {view === 'dashboard' && <Dashboard state={state} filterByStatus={filterByStatus} />}
          {view === 'inventario' && <Inventory equipments={state.equipments} filters={filters} setFilters={setFilters} navigate={navigate} editEquipment={editEquipment} deleteEquipment={deleteEquipment} updateStatus={updateStatus} notify={notify} />}
          {view === 'registro' && <EquipmentForm draft={equipmentDraft} setDraft={setEquipmentDraft} equipments={state.equipments} saveEquipment={saveEquipment} cancelEdit={() => setEquipmentDraft(emptyEquipment)} />}
          {view === 'detalle' && <Detail equipment={selectedEquipment} maintenance={state.maintenance} navigate={navigate} editEquipment={editEquipment} openMaintenance={openMaintenance} />}
          {view === 'mantenimiento' && <Maintenance state={state} openDialog={openMaintenance} navigate={navigate} editRecord={editMaintenance} deleteRecord={deleteMaintenance} />}
          {view === 'reportes' && <Reports state={state} notify={notify} />}
          {view === 'responsables' && <Responsibles equipments={state.equipments} navigate={navigate} />}
          {view === 'perfil' && <Profile profile={state.profile} saveProfile={saveProfile} avatar={avatar} setAvatar={setAvatar} notify={notify} />}
        </section>
      </main>
      <MaintenanceDialog open={maintenanceOpen} draft={maintenanceDraft} setDraft={setMaintenanceDraft} equipments={state.equipments} close={() => setMaintenanceOpen(false)} save={saveMaintenance} />
      {toast && <div className="toast show">{toast}</div>}
    </section>
  );
}

export default App;
