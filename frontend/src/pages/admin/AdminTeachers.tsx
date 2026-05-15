import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import { AddressInput, emptyAddress, formatAddress, type Address } from "@/components/ui/address-input";
import { Plus, Trash2, X } from "lucide-react";
import { maskCPF, validateCPF } from "@/lib/masks";
import api from "@/services/api";

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
const AVAILABLE_CLASSES = ["1A", "2B", "3A"];

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [subjectsList, setSubjectsList] = useState<string[]>([]);
  const [newSubjectInput, setNewSubjectInput] = useState("");

  // Form state
  const [form, setForm] = useState({
    name: "", email: "", cpf: "",
    subjects: [] as string[],
    classes: [] as string[],
    schedule: [] as { class_id: string; day_of_week: string; time: string }[],
  });
  const [addressForm, setAddressForm] = useState<Address>({ ...emptyAddress });

  // Detail modal
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teacherAbsences, setTeacherAbsences] = useState<TeacherAbsence[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadTeachers();
    loadSubjects();
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

  const addNewSubject = async () => {
    const name = newSubjectInput.trim();
    if (!name) return;
    if (subjectsList.includes(name)) {
      setNewSubjectInput("");
      return;
    }
    try {
      await api.post("/subjects", { name });
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

  const toggleClass = (cls: string) => {
    setForm((prev) => ({
      ...prev,
      classes: prev.classes.includes(cls)
        ? prev.classes.filter((c) => c !== cls)
        : [...prev.classes, cls],
    }));
  };

  const addScheduleEntry = () => {
    setForm((prev) => ({
      ...prev,
      schedule: [...prev.schedule, { class_id: AVAILABLE_CLASSES[0], day_of_week: DAYS[0], time: TIMES[0] }],
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
    if (!form.email.trim()) newErrors.email = "Email é obrigatório";
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
    try {
      await api.post("/teachers", { ...form, address: formatAddress(addressForm) });
      setMessage({ text: "Professor cadastrado com sucesso!", type: "success" });
      setShowForm(false);
      setForm({ name: "", email: "", cpf: "", subjects: [], classes: [], schedule: [] });
      setAddressForm({ ...emptyAddress });
      setErrors({});
      loadTeachers();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || "Erro ao cadastrar", type: "error" });
    }
  };

  const deleteTeacher = async (id: string) => {
    if (!confirm("Remover este professor?")) return;
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
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showForm ? "Cancelar" : "Novo Professor"}
        </Button>
      </div>

      {message && (
        <div className={`rounded-lg px-4 py-3 text-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-2 font-bold">×</button>
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Cadastrar Professor</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} required />
                <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} required />
                <Input label="CPF" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: maskCPF(e.target.value) })} placeholder="000.000.000-00" error={errors.cpf} required />
              </div>

              <h3 className="pt-2 text-sm font-semibold text-foreground">Endereço</h3>
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

              {/* Turmas */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Turmas</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_CLASSES.map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => toggleClass(cls)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        form.classes.includes(cls)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-foreground hover:bg-muted"
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>

              {/* Horários */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Horários</label>
                  <Button type="button" variant="outline" size="sm" onClick={addScheduleEntry}>
                    <Plus className="mr-1 h-4 w-4" /> Horário
                  </Button>
                </div>
                {form.schedule.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-border p-2">
                    <select value={entry.class_id} onChange={(e) => updateScheduleEntry(i, "class_id", e.target.value)} className="rounded border border-border bg-card px-2 py-1 text-sm">
                      {AVAILABLE_CLASSES.map((cls) => <option key={cls} value={cls}>{cls}</option>)}
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

              <Button type="submit">Cadastrar</Button>
            </form>
          </CardContent>
        </Card>
      )}

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
                        <TableCell>{a.date}</TableCell>
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
                      <div onClick={(e) => e.stopPropagation()}>
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
