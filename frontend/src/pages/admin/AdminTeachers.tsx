import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import { AddressInput, emptyAddress, formatAddress, type Address } from "@/components/ui/address-input";
import { Plus, Trash2, X, Pencil } from "lucide-react";
import { maskCPF, validateCPF } from "@/lib/masks";
import { formatDate } from "@/lib/utils";
import api from "@/services/api";
import Swal from "sweetalert2";

interface Teacher {
  teacher_id: string;
  user_id: string;
  subjects: string[];
  name?: string;
  cpf?: string;
  address?: string;
  classes?: string[];
  schedule?: { class_id: string; day_of_week: string; time: string }[];
}

interface TeacherAbsence {
  teacher_id: string;
  date: string;
  reason: string;
}

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const TIMES = ["07:30", "08:20", "09:10", "10:15", "11:05", "13:00", "13:50", "14:40"];

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [subjectsList, setSubjectsList] = useState<string[]>([]);
  const [newSubjectInput, setNewSubjectInput] = useState("");
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);

  // Form state
  const [form, setForm] = useState({
    name: "", email: "", cpf: "",
    subjects: [] as string[],
    classes: [] as string[],
    schedule: [] as { class_id: string; day_of_week: string; time: string; subject: string }[],
  });
  const [addressForm, setAddressForm] = useState<Address>({ ...emptyAddress });
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Detail modal
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teacherAbsences, setTeacherAbsences] = useState<TeacherAbsence[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadTeachers();
    loadSubjects();
    loadClasses();
  }, []);

  const loadTeachers = async () => {
    try {
      const res = await api.get("/teachers");
      setTeachers(res.data.data || []);
    } catch { /* empty */ } finally { setLoading(false); }
  };

  const loadSubjects = async () => {
    try {
      const res = await api.get("/subjects");
      setSubjectsList(res.data.data || []);
    } catch { /* empty */ }
  };

  const loadClasses = async () => {
    try {
      const res = await api.get("/classes");
      const classes = (res.data.data || []).map((c: { class_id: string }) => c.class_id);
      setAvailableClasses(classes);
    } catch { /* empty */ }
  };

  const addNewSubject = async () => {
    const name = newSubjectInput.trim();
    if (!name) return;
    if (subjectsList.includes(name)) {
      setNewSubjectInput("");
      return;
    }
    try {
      await api.post("/subjects", { subjects: [name] });
      setSubjectsList([...subjectsList, name]);
      setNewSubjectInput("");
    } catch { /* empty */ }
  };

  const toggleSubject = (subject: string) => {
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const addScheduleEntry = () => {
    setForm((prev) => ({
      ...prev,
      schedule: [...prev.schedule, { class_id: availableClasses[0] || "", day_of_week: DAYS[0], time: TIMES[0], subject: form.subjects[0] || "" }],
    }));
  };

  const removeScheduleEntry = (index: number) => {
    setForm((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index),
    }));
  };

  const updateScheduleEntry = (index: number, field: string, value: string) => {
    setForm((prev) => {
      const updated = [...prev.schedule];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, schedule: updated };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!editingTeacher && !form.email.trim()) newErrors.email = "Email é obrigatório";
    if (!form.cpf.trim()) newErrors.cpf = "CPF é obrigatório";
    else if (!validateCPF(form.cpf)) newErrors.cpf = "CPF inválido";
    if (form.subjects.length === 0) newErrors.subjects = "Selecione ao menos uma disciplina";

    // Validar endereço se CEP preenchido
    if (addressForm.cep) {
      const cepDigits = addressForm.cep.replace(/\D/g, "");
      if (cepDigits.length !== 8) newErrors.address = "CEP inválido";
      else if (!addressForm.street) newErrors.address = "CEP não encontrado - verifique o CEP";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Derivar turmas automaticamente dos horários
    const derivedClasses = [...new Set(form.schedule.map((s) => s.class_id).filter(Boolean))];
    const formData = { ...form, classes: derivedClasses };

    try {
      if (editingTeacher) {
        const newAddress = formatAddress(addressForm);
        const payload: Record<string, unknown> = { ...formData };
        if (newAddress) {
          payload.address = newAddress;
        }
        await api.put(`/teachers/${editingTeacher.teacher_id}`, payload);
        setMessage({ text: "Professor atualizado com sucesso!", type: "success" });
      } else {
        await api.post("/teachers", { ...formData, address: formatAddress(addressForm) });
        setMessage({ text: "Professor cadastrado com sucesso!", type: "success" });
      }
      setShowForm(false);
      setEditingTeacher(null);
      setForm({ name: "", email: "", cpf: "", subjects: [], classes: [], schedule: [] });
      setAddressForm({ ...emptyAddress });
      setErrors({});
      loadTeachers();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || "Erro ao salvar", type: "error" });
    }
  };

  const startEditingTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    const scheduleWithSubject = (teacher.schedule || []).map((s) => ({
      class_id: s.class_id,
      day_of_week: s.day_of_week,
      time: s.time,
      subject: (s as any).subject || (teacher.subjects?.[0] || ""),
    }));
    setForm({
      name: teacher.name || "",
      email: "",
      cpf: teacher.cpf || "",
      subjects: teacher.subjects || [],
      classes: teacher.classes || [],
      schedule: scheduleWithSubject,
    });
    setAddressForm({ ...emptyAddress });
    setShowForm(true);
  };

  const deleteTeacher = async (id: string) => {
    const result = await Swal.fire({
      title: "Remover professor?",
      text: "Essa ação não pode ser desfeita.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Sim, remover",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/teachers/${id}`);
      setMessage({ text: "Professor removido!", type: "success" });
      loadTeachers();
    } catch { setMessage({ text: "Erro ao remover", type: "error" }); }
  };

  const openTeacherDetail = async (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setDetailLoading(true);
    try {
      const res = await api.get(`/teacher-absences?teacher_id=${teacher.teacher_id}`);
      setTeacherAbsences(res.data.data || []);
    } catch { /* empty */ } finally { setDetailLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Professores</h1>
          <p className="text-muted-foreground">Gerencie os professores do sistema</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingTeacher(null); setForm({ name: "", email: "", cpf: "", subjects: [], classes: [], schedule: [] }); setAddressForm({ ...emptyAddress }); }}>
          {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showForm ? "Cancelar" : "Novo Professor"}
        </Button>
      </div>

      {message && (
        <div role="alert" className={`rounded-lg border px-4 py-3 text-sm font-medium ${message.type === "success" ? "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "border-red-300 bg-red-100 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300"}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-2 font-bold">×</button>
        </div>
      )}

      {/* Modal de Cadastro/Edição de Professor */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditingTeacher(null); setForm({ name: "", email: "", cpf: "", subjects: [], classes: [], schedule: [] }); setAddressForm({ ...emptyAddress }); setErrors({}); }}>
        <div className="space-y-4">
          <h2 className="text-xl font-bold">{editingTeacher ? "Editar Professor" : "Cadastrar Professor"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} required />
              {!editingTeacher && <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} required />}
              <Input label="CPF" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: maskCPF(e.target.value) })} placeholder="000.000.000-00" error={errors.cpf} required disabled={!!editingTeacher} />
            </div>

            <h3 className="pt-2 text-sm font-semibold text-foreground">Endereço</h3>
            {editingTeacher && editingTeacher.address && (
              <p className="text-sm text-muted-foreground">Endereço atual: <span className="font-medium text-foreground">{editingTeacher.address}</span></p>
            )}
            <AddressInput value={addressForm} onChange={setAddressForm} error={errors.address} />

            {/* Disciplinas */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Disciplinas *</label>
              {errors.subjects && <p className="text-xs text-red-500">{errors.subjects}</p>}
              <div className="flex flex-wrap gap-2">
                {subjectsList.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => toggleSubject(subject)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      form.subjects.includes(subject)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Nova disciplina..."
                  value={newSubjectInput}
                  onChange={(e) => setNewSubjectInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addNewSubject(); } }}
                />
                <Button type="button" variant="outline" size="sm" onClick={addNewSubject}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Horários */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Horários e Turmas</label>
                <Button type="button" variant="outline" size="sm" onClick={addScheduleEntry}>
                  <Plus className="mr-1 h-4 w-4" /> Horário
                </Button>
              </div>
              {form.schedule.length > 0 && (
                <p className="text-xs text-muted-foreground">As turmas são atribuídas automaticamente com base nos horários adicionados.</p>
              )}
              {form.schedule.map((entry, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-border p-2">
                  <select value={entry.class_id} onChange={(e) => updateScheduleEntry(i, "class_id", e.target.value)} className="rounded border border-border bg-card px-2 py-1 text-sm">
                    {availableClasses.map((cls) => <option key={cls} value={cls}>{cls}</option>)}
                  </select>
                  <select value={entry.subject} onChange={(e) => updateScheduleEntry(i, "subject", e.target.value)} className="rounded border border-border bg-card px-2 py-1 text-sm">
                    {form.subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={entry.day_of_week} onChange={(e) => updateScheduleEntry(i, "day_of_week", e.target.value)} className="rounded border border-border bg-card px-2 py-1 text-sm">
                    {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select value={entry.time} onChange={(e) => updateScheduleEntry(i, "time", e.target.value)} className="rounded border border-border bg-card px-2 py-1 text-sm">
                    {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeScheduleEntry(i)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            <Button type="submit">{editingTeacher ? "Salvar Alterações" : "Cadastrar"}</Button>
          </form>
        </div>
      </Modal>

      {/* Teacher Detail Modal */}
      <Modal open={!!selectedTeacher} onClose={() => setSelectedTeacher(null)}>
        {selectedTeacher && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">{selectedTeacher.name}</h2>
              <p className="text-sm text-muted-foreground">Detalhes do professor</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">CPF</p>
                <p className="font-medium">{selectedTeacher.cpf || "—"}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Disciplinas</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {(selectedTeacher.subjects || []).map((s) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Turmas</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {(selectedTeacher.classes || []).map((c) => (
                    <Badge key={c} variant="secondary">{c}</Badge>
                  ))}
                  {(!selectedTeacher.classes || selectedTeacher.classes.length === 0) && <span className="text-sm">—</span>}
                </div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Endereço</p>
                <p className="font-medium">{selectedTeacher.address || "—"}</p>
              </div>
            </div>

            {/* Horários */}
            {selectedTeacher.schedule && selectedTeacher.schedule.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold">Horários</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Turma</TableHead>
                      <TableHead>Dia</TableHead>
                      <TableHead>Horário</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTeacher.schedule.map((s, i) => (
                      <TableRow key={i}>
                        <TableCell>{s.class_id}</TableCell>
                        <TableCell>{s.day_of_week}</TableCell>
                        <TableCell>{s.time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Faltas */}
            <div>
              <h3 className="mb-3 text-sm font-semibold">Faltas ({teacherAbsences.length})</h3>
              {detailLoading ? (
                <Skeleton className="h-20" />
              ) : teacherAbsences.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma falta registrada.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Motivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teacherAbsences.map((a, i) => (
                      <TableRow key={i}>
                        <TableCell>{formatDate(a.date)}</TableCell>
                        <TableCell>{a.reason || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Teachers Table */}
      <Card>
        <CardHeader><CardTitle>Professores Cadastrados ({teachers.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : teachers.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Nenhum professor cadastrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Disciplinas</TableHead>
                  <TableHead>Turmas</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((t) => (
                  <TableRow key={t.teacher_id} className="cursor-pointer" onClick={() => openTeacherDetail(t)}>
                    <TableCell className="font-medium">{t.name || t.teacher_id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(t.subjects || []).map((s) => (
                          <Badge key={s} variant="secondary">{s}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(t.classes || []).map((c) => (
                          <Badge key={c} variant="secondary">{c}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{t.cpf || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" onClick={() => startEditingTeacher(t)} title="Editar professor">
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteTeacher(t.teacher_id)} title="Remover professor">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
