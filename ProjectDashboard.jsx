import { useState, useMemo } from "react";
import { Search, Filter, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Clock, Pause, Plus, X, Edit2, Save, TrendingUp, Briefcase, Users, Calendar } from "lucide-react";

const INITIAL_PROJECTS = [
  { id: 1, proyecto: "IA", empresa: "PPM", responsable: "Esteban Morejon", estado: "En progreso", puntosAtencion: "", avance: "KO realizado esta semana", porcentaje: 15, proximosPasos: "", fechaActualizacion: "2025-05-04" },
];

const ESTADO_CONFIG = {
  "En progreso": { color: "#185FA5", bg: "#E6F1FB", icon: TrendingUp, label: "En progreso" },
  "En revisión": { color: "#854F0B", bg: "#FAEEDA", icon: Clock, label: "En revisión" },
  "Pausado": { color: "#5F5E5A", bg: "#F1EFE8", icon: Pause, label: "Pausado" },
  "Completado": { color: "#3B6D11", bg: "#EAF3DE", icon: CheckCircle, label: "Completado" },
};

const COLUMN_HEADERS = [
  { key: "proyecto", label: "Proyecto", width: "18%" },
  { key: "empresa", label: "Empresa", width: "13%" },
  { key: "responsable", label: "Responsable", width: "12%" },
  { key: "estado", label: "Estado", width: "10%" },
  { key: "puntosAtencion", label: "Puntos de atención", width: "18%" },
  { key: "porcentaje", label: "% Avance", width: "9%" },
  { key: "proximosPasos", label: "Próximos pasos", width: "15%" },
  { key: "fechaActualizacion", label: "Actualización", width: "10%" },
];

function ProgressBar({ value }) {
  const color = value === 100 ? "#3B6D11" : value >= 70 ? "#185FA5" : value >= 40 ? "#854F0B" : "#A32D2D";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: "var(--color-background-tertiary)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.4s ease" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", minWidth: 30, textAlign: "right" }}>{value}%</span>
    </div>
  );
}

function Badge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || ESTADO_CONFIG["En progreso"];
  const Icon = cfg.icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 99, background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 500, whiteSpace: "nowrap" }}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function EditableCell({ value, onChange, multiline }) {
  if (multiline) return (
    <textarea value={value} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", fontSize: 12, padding: "4px 6px", border: "1px solid var(--color-border-secondary)", borderRadius: 6, resize: "vertical", minHeight: 56, fontFamily: "var(--font-sans)", background: "var(--color-background-primary)", color: "var(--color-text-primary)" }} />
  );
  return (
    <input value={value} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", fontSize: 12, padding: "4px 6px", border: "1px solid var(--color-border-secondary)", borderRadius: 6, fontFamily: "var(--font-sans)", background: "var(--color-background-primary)", color: "var(--color-text-primary)" }} />
  );
}

function SelectCell({ value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ fontSize: 11, padding: "3px 6px", border: "1px solid var(--color-border-secondary)", borderRadius: 6, background: "var(--color-background-primary)", color: "var(--color-text-primary)" }}>
      {Object.keys(ESTADO_CONFIG).map(k => <option key={k}>{k}</option>)}
    </select>
  );
}

export default function Dashboard() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [editingId, setEditingId] = useState(null);
  const [editBuffer, setEditBuffer] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [newRow, setNewRow] = useState({ proyecto: "", empresa: "", responsable: "", estado: "En progreso", puntosAtencion: "", avance: "", porcentaje: 0, proximosPasos: "", fechaActualizacion: new Date().toISOString().split("T")[0] });

  const stats = useMemo(() => ({
    total: projects.length,
    enProgreso: projects.filter(p => p.estado === "En progreso").length,
    completados: projects.filter(p => p.estado === "Completado").length,
    promAvance: projects.length ? Math.round(projects.reduce((a, p) => a + p.porcentaje, 0) / projects.length) : 0,
  }), [projects]);

  const filtered = useMemo(() => {
    let arr = [...projects];
    if (search) arr = arr.filter(p => Object.values(p).join(" ").toLowerCase().includes(search.toLowerCase()));
    if (filterEstado !== "Todos") arr = arr.filter(p => p.estado === filterEstado);
    if (sortKey) arr.sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey];
      return sortDir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
    return arr;
  }, [projects, search, filterEstado, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const startEdit = (p) => { setEditingId(p.id); setEditBuffer({ ...p }); };
  const saveEdit = () => {
    setProjects(ps => ps.map(p => p.id === editingId ? { ...editBuffer } : p));
    setEditingId(null);
  };
  const cancelEdit = () => setEditingId(null);

  const deleteProject = (id) => setProjects(ps => ps.filter(p => p.id !== id));

  const addProject = () => {
    setProjects(ps => [...ps, { ...newRow, id: Date.now() }]);
    setNewRow({ proyecto: "", empresa: "", responsable: "", estado: "En progreso", puntosAtencion: "", avance: "", porcentaje: 0, proximosPasos: "", fechaActualizacion: new Date().toISOString().split("T")[0] });
    setShowAdd(false);
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span style={{ opacity: 0.3, fontSize: 10 }}>↕</span>;
    return <span style={{ fontSize: 10 }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", padding: "1.5rem 1rem 2rem" }}>
      <h2 className="sr-only">Dashboard de Portafolio de Proyectos</h2>

      <div style={{ marginBottom: "1.5rem" }}>
        <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-tertiary)", margin: "0 0 4px" }}>Gestión de proyectos</p>
        <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0, color: "var(--color-text-primary)" }}>Portafolio de proyectos</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: "1.5rem" }}>
        {[
          { label: "Proyectos totales", value: stats.total, Icon: Briefcase, color: "#185FA5" },
          { label: "En progreso", value: stats.enProgreso, Icon: TrendingUp, color: "#854F0B" },
          { label: "Completados", value: stats.completados, Icon: CheckCircle, color: "#3B6D11" },
          { label: "Avance promedio", value: `${stats.promAvance}%`, Icon: Users, color: "#533B2F" },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "0 0 6px", fontWeight: 400 }}>{label}</p>
              <Icon size={14} color={color} style={{ marginTop: 2 }} />
            </div>
            <p style={{ fontSize: 24, fontWeight: 500, margin: 0, color: "var(--color-text-primary)" }}>{value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar proyectos..." style={{ width: "100%", paddingLeft: 32, fontSize: 13, boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Filter size={13} style={{ color: "var(--color-text-tertiary)" }} />
          <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} style={{ fontSize: 12 }}>
            <option>Todos</option>
            {Object.keys(ESTADO_CONFIG).map(k => <option key={k}>{k}</option>)}
          </select>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "0 14px", whiteSpace: "nowrap" }}>
          <Plus size={13} /> Nuevo proyecto
        </button>
      </div>

      {showAdd && (
        <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", padding: "14px 16px", marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 10px" }}>Agregar nuevo proyecto</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
            {[["proyecto","Nombre del proyecto"],["empresa","Empresa"],["responsable","Responsable"],["puntosAtencion","Puntos de atención"],["proximosPasos","Próximos pasos"]].map(([k, ph]) => (
              <input key={k} value={newRow[k]} onChange={e => setNewRow(n => ({...n,[k]:e.target.value}))} placeholder={ph} style={{ fontSize: 12 }} />
            ))}
            <select value={newRow.estado} onChange={e => setNewRow(n => ({...n, estado: e.target.value}))} style={{ fontSize: 12 }}>
              {Object.keys(ESTADO_CONFIG).map(k => <option key={k}>{k}</option>)}
            </select>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ fontSize: 11, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>% Avance</label>
              <input type="number" min={0} max={100} value={newRow.porcentaje} onChange={e => setNewRow(n => ({...n, porcentaje: Number(e.target.value)}))} style={{ fontSize: 12, width: 70 }} />
            </div>
            <input type="date" value={newRow.fechaActualizacion} onChange={e => setNewRow(n => ({...n, fechaActualizacion: e.target.value}))} style={{ fontSize: 12 }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={addProject} style={{ fontSize: 12, padding: "0 14px" }}><Save size={12} style={{ marginRight: 5 }} />Guardar</button>
            <button onClick={() => setShowAdd(false)} style={{ fontSize: 12, padding: "0 14px" }}><X size={12} style={{ marginRight: 5 }} />Cancelar</button>
          </div>
        </div>
      )}

      <div style={{ overflowX: "auto", borderRadius: "var(--border-radius-lg)", border: "0.5px solid var(--color-border-tertiary)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, tableLayout: "fixed" }}>
          <thead>
            <tr style={{ background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-secondary)" }}>
              {COLUMN_HEADERS.map(({ key, label, width }) => (
                <th key={key} onClick={() => handleSort(key)}
                  style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", cursor: "pointer", userSelect: "none", width, whiteSpace: "nowrap" }}>
                  {label} <SortIcon col={key} />
                </th>
              ))}
              <th style={{ width: 72, padding: "10px 12px", fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-tertiary)", fontSize: 13 }}>No se encontraron proyectos</td></tr>
            )}
            {filtered.map((p, i) => {
              const isEditing = editingId === p.id;
              const buf = editBuffer;
              const rowBg = i % 2 === 0 ? "var(--color-background-primary)" : "var(--color-background-secondary)";
              return (
                <tr key={p.id} style={{ background: rowBg, borderBottom: "0.5px solid var(--color-border-tertiary)", transition: "background 0.15s" }}
                  onMouseEnter={e => { if (!isEditing) e.currentTarget.style.background = "var(--color-background-info)"; }}
                  onMouseLeave={e => { if (!isEditing) e.currentTarget.style.background = rowBg; }}>

                  <td style={{ padding: "10px 12px", fontWeight: 500 }}>
                    {isEditing ? <EditableCell value={buf.proyecto} onChange={v => setEditBuffer(b => ({...b, proyecto: v}))} /> : p.proyecto}
                  </td>
                  <td style={{ padding: "10px 12px", color: "var(--color-text-secondary)" }}>
                    {isEditing ? <EditableCell value={buf.empresa} onChange={v => setEditBuffer(b => ({...b, empresa: v}))} /> : p.empresa}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {isEditing ? <EditableCell value={buf.responsable} onChange={v => setEditBuffer(b => ({...b, responsable: v}))} /> : p.responsable}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {isEditing ? <SelectCell value={buf.estado} onChange={v => setEditBuffer(b => ({...b, estado: v}))} /> : <Badge estado={p.estado} />}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {p.puntosAtencion && !isEditing ? (
                      <div style={{ display: "flex", gap: 5, alignItems: "flex-start" }}>
                        <AlertCircle size={12} color="#854F0B" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span style={{ color: "var(--color-text-secondary)", lineHeight: 1.4 }}>{p.puntosAtencion}</span>
                      </div>
                    ) : isEditing ? (
                      <EditableCell value={buf.puntosAtencion} onChange={v => setEditBuffer(b => ({...b, puntosAtencion: v}))} multiline />
                    ) : <span style={{ color: "var(--color-text-tertiary)" }}>—</span>}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {isEditing ? (
                      <input type="number" min={0} max={100} value={buf.porcentaje} onChange={e => setEditBuffer(b => ({...b, porcentaje: Number(e.target.value)}))} style={{ width: 60, fontSize: 12 }} />
                    ) : <ProgressBar value={p.porcentaje} />}
                  </td>
                  <td style={{ padding: "10px 12px", color: "var(--color-text-secondary)" }}>
                    {isEditing ? <EditableCell value={buf.proximosPasos} onChange={v => setEditBuffer(b => ({...b, proximosPasos: v}))} multiline /> : p.proximosPasos}
                  </td>
                  <td style={{ padding: "10px 12px", color: "var(--color-text-tertiary)", whiteSpace: "nowrap" }}>
                    {isEditing ? <input type="date" value={buf.fechaActualizacion} onChange={e => setEditBuffer(b => ({...b, fechaActualizacion: e.target.value}))} style={{ fontSize: 11 }} /> : p.fechaActualizacion}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {isEditing ? (
                        <>
                          <button onClick={saveEdit} title="Guardar" style={{ padding: "4px 7px", fontSize: 11, background: "#EAF3DE", color: "#3B6D11", border: "0.5px solid #C0DD97", borderRadius: 6 }}><Save size={11} /></button>
                          <button onClick={cancelEdit} title="Cancelar" style={{ padding: "4px 7px", fontSize: 11, background: "var(--color-background-tertiary)", color: "var(--color-text-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 6 }}><X size={11} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(p)} title="Editar" style={{ padding: "4px 7px", fontSize: 11, background: "#E6F1FB", color: "#185FA5", border: "0.5px solid #B5D4F4", borderRadius: 6 }}><Edit2 size={11} /></button>
                          <button onClick={() => deleteProject(p.id)} title="Eliminar" style={{ padding: "4px 7px", fontSize: 11, background: "#FCEBEB", color: "#A32D2D", border: "0.5px solid #F7C1C1", borderRadius: 6 }}><X size={11} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", margin: 0 }}>{filtered.length} de {projects.length} proyectos</p>
        <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", margin: 0 }}>Última sincronización: {new Date().toLocaleDateString("es-ES")}</p>
      </div>
    </div>
  );
}
