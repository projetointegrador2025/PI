import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import { AddressInput, emptyAddress, formatAddress, type Address } from "@/components/ui/address-input";
import { Plus, Trash2, X, UserPlus, Users, Filter } from "lucide-react";
import { maskCPF, maskPhone, maskRA, validateCPF } from "@/lib/masks";
import api from "@/services/api";

interface Student {
  student_id: string;
  user_id: string;
  class_id: string;
  birth_date: string;
  name?: string;
  cpf?: string;
  ra?: string;
  address?: string;
}

interface Guardian {
  guardian_id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  relationship_type: string;
}

interface Grade {
  subject_id: string;
  grade: string;
  bimester: number;
  teacher_id: string;
}

interface Absence {
  subject_id: string;
  absences: number;
  bimester: number;
}

interface GuardianForm {
  name: string;
  cpf: string;
  phone: string;
  email: string;
  relationship_type: string;
}

const emptyGuardian: GuardianForm = { name: "", cpf: "", phone: "", email: "", relationship_type: "" };

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [filterClass, setFilterClass] = useState<string>("all");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [form, setForm] = useState({ name: "", email: "", class_id: "", birth_date: "", cpf: "", ra: "" });
  const [addressForm, setAddressForm] = useState<Address>({ ...emptyAddress });
  const [guardianForms, setGuardianForms] = useState<GuardianForm[]>([{ ...emptyGuardian }]);

  // Guardian management for existing students
  const [managingGuardians, setManagingGuardians] = useState<string | null>(null);
  const [studentGuardians, setStudentGuardians] = useState<Guardian[]>([]);
  const [newGuardianForm, setNewGuardianForm] = useState<GuardianForm>({ ...emptyGuardian });
  const [showAddGuardian, setShowAddGuardian] = useState(false);
  const [guardianErrors, setGuardianErrors] = useState<Record<string, string>>({});

  // Student detail modal
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailGuardians, setDetailGuardians] = useState<Guardian[]>([]);
  const [detailGrades, setDetailGrades] = useState<Grade[]>([]);
  const [detailAbsences, setDetailAbsences] = useState<Absence[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const availableClasses = [...new Set(students.map((s) => s.class_id))].sort();

  useEffect(() => { loadStudents(); }, []);

  const loadStudents = async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data.data || []);
    } catch { /* empty */ } finally { setLoading(false); }
  };

  const filteredStudents = filterClass === "all" ? students : students.filter((s) => s.class_id === filterClass);

  const openStudentDetail = async (student: Student) => {
    setSelectedStudent(student);
    setDetailLoading(true);
    try {
      const [guardiansRes, gradesRes, absencesRes] = await Promise.all([
        api.get(`/guardians?student_id=${student.student_id}`),
        api.get(`/grades?student_id=${student.student_id}`),
        api.get(`/absences?student_id=${student.student_id}`),
      ]);
      setDetailGuardians(guardiansRes.data.data || []);
      setDetailGrades(gradesRes.data.data || []);
      setDetailAbsences(absencesRes.data.data || []);
    } catch {
      // fallback
    } finally {
      setDetailLoading(false);
    }
  };

  const closeStudentDetail = () => {
    setSelectedStudent(null);
    setDetailGuardians([]);
    setDetailGrades([]);
    setDetailAbsences([]);
  };

  const getAbsencesForSubject = (subjectId: string): number => {
    return detailAbsences.filter((a) => a.subject_id === subjectId).reduce((sum, a) => sum + a.absences, 0);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!form.class_id.trim()) newErrors.class_id = "Turma é obrigatória";
    if (!form.birth_date) newErrors.birth_date = "Data de nascimento é obrigatória";
    if (!form.cpf.trim()) newErrors.cpf = "CPF é obrigatório";
    else if (!validateCPF(form.cpf)) newErrors.cpf = "CPF inválido";
    if (!form.ra.trim()) newErrors.ra = "RA é obrigatório";
    else if (form.ra.replace(/\D/g, "").length < 5) newErrors.ra = "RA deve ter no mínimo 5 dígitos";

    // Validar endereço
    if (addressForm.cep) {
      const cepDigits = addressForm.cep.replace(/\D/g, "");
      if (cepDigits.length !== 8) newErrors.address = "CEP inválido";
      else if (!addressForm.street) newErrors.address = "CEP não encontrado - verifique o CEP";
    }

    guardianForms.forEach((g, i) => {
      if (!g.name.trim()) newErrors[`guardian_${i}_name`] = "Nome é obrigatório";
      if (!g.cpf.trim()) newErrors[`guardian_${i}_cpf`] = "CPF é obrigatório";
      else if (!validateCPF(g.cpf)) newErrors[`guardian_${i}_cpf`] = "CPF inválido";
      if (!g.phone.trim()) newErrors[`guardian_${i}_phone`] = "Telefone é obrigatório";
      if (!g.email.trim()) newErrors[`guardian_${i}_email`] = "Email é obrigatório";
      if (!g.relationship_type.trim()) newErrors[`guardian_${i}_relationship`] = "Parentesco é obrigatório";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await api.post("/students", { ...form, address: formatAddress(addressForm), guardians: guardianForms });
      setMessage({ text: "Aluno cadastrado com sucesso!", type: "success" });
      setShowForm(false);
      setForm({ name: "", email: "", class_id: "", birth_date: "", cpf: "", ra: "" });
      setAddressForm({ ...emptyAddress });
      setGuardianForms([{ ...emptyGuardian }]);
      setErrors({});
      loadStudents();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || "Erro ao cadastrar", type: "error" });
    }
  };

  const deleteStudent = async (id: string) => {
    if (!confirm("Remover este aluno?")) return;
    try {
      await api.delete(`/students/${id}`);
      setMessage({ text: "Aluno removido com sucesso!", type: "success" });
      loadStudents();
    } catch { setMessage({ text: "Erro ao remover", type: "error" }); }
  };

  const loadGuardians = async (studentId: string) => {
    try {
      const res = await api.get(`/guardians?student_id=${studentId}`);
      setStudentGuardians(res.data.data || []);
      setManagingGuardians(studentId);
      setShowAddGuardian(false);
      setNewGuardianForm({ ...emptyGuardian });
    } catch {
      setMessage({ text: "Erro ao carregar responsáveis", type: "error" });
    }
  };

  const addGuardianToStudent = async () => {
    const newErrors: Record<string, string> = {};
    if (!newGuardianForm.name.trim()) newErrors.new_guardian_name = "Nome é obrigatório";
    if (!newGuardianForm.cpf.trim()) newErrors.new_guardian_cpf = "CPF é obrigatório";
    else if (!validateCPF(newGuardianForm.cpf)) newErrors.new_guardian_cpf = "CPF inválido";
    if (!newGuardianForm.phone.trim()) newErrors.new_guardian_phone = "Telefone é obrigatório";
    if (!newGuardianForm.email.trim()) newErrors.new_guardian_email = "Email é obrigatório";
    if (!newGuardianForm.relationship_type.trim()) newErrors.new_guardian_relationship = "Parentesco é obrigatório";
    setGuardianErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    try {
      await api.post("/guardians", { ...newGuardianForm, student_id: managingGuardians });
      setMessage({ text: "Responsável adicionado!", type: "success" });
      loadGuardians(managingGuardians!);
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || "Erro ao adicionar responsável", type: "error" });
    }
  };

  const removeGuardian = async (guardianId: string) => {
    if (studentGuardians.length <= 1) {
      setMessage({ text: "O aluno deve ter no mínimo 1 responsável. Adicione outro antes de remover.", type: "error" });
      return;
    }
    if (!confirm("Remover este responsável?")) return;
    try {
      await api.delete(`/guardians/${guardianId}?student_id=${managingGuardians}`);
      setMessage({ text: "Responsável removido!", type: "success" });
      loadGuardians(managingGuardians!);
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || "Erro ao remover responsável", type: "error" });
    }
  };

  const addGuardianField = () => setGuardianForms([...guardianForms, { ...emptyGuardian }]);
  const removeGuardianField = (index: number) => {
    if (guardianForms.length <= 1) return;
    setGuardianForms(guardianForms.filter((_, i) => i !== index));
  };
  const updateGuardianField = (index: number, field: keyof GuardianForm, value: string) => {
    const updated = [...guardianForms];
    updated[index] = { ...updated[index], [field]: value };
    setGuardianForms(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alunos</h1>
          <p className="text-muted-foreground">Gerencie os alunos do sistema</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Filtrar por turma"
            >
              <option value="all">Todas as turmas</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>Turma {cls}</option>
              ))}
            </select>
          </div>
          <Button onClick={() => { setShowForm(!showForm); setManagingGuardians(null); }}>
            {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {showForm ? "Cancelar" : "Novo Aluno"}
          </Button>
        </div>
      </div>

      {message && (
        <div className={`rounded-lg px-4 py-3 text-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-2 font-bold">×</button>
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Cadastrar Aluno</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} required />
                <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Input label="CPF" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: maskCPF(e.target.value) })} placeholder="000.000.000-00" error={errors.cpf} required />
                <Input label="RA (Registro do Aluno)" value={form.ra} onChange={(e) => setForm({ ...form, ra: maskRA(e.target.value) })} placeholder="0000000000" error={errors.ra} required />
                <Input label="Turma" value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} placeholder="Ex: 1A, 2B" error={errors.class_id} required />
                <Input label="Data de Nascimento" type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} error={errors.birth_date} required />
              </div>

              <h3 className="pt-2 text-sm font-semibold text-foreground">Endereço</h3>
              <AddressInput value={addressForm} onChange={setAddressForm} error={errors.address} />
              <div className="flex items-center justify-between pt-2">
                <h3 className="text-sm font-semibold text-foreground">Responsáveis</h3>
                <Button type="button" variant="outline" size="sm" onClick={addGuardianField}>
                  <UserPlus className="mr-1 h-4 w-4" /> Adicionar Responsável
                </Button>
              </div>
              {guardianForms.map((g, i) => (
                <div key={i} className="space-y-3 rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Responsável {i + 1}</span>
                    {guardianForms.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeGuardianField(i)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Nome" value={g.name} onChange={(e) => updateGuardianField(i, "name", e.target.value)} error={errors[`guardian_${i}_name`]} required />
                    <Input label="CPF" value={g.cpf} onChange={(e) => updateGuardianField(i, "cpf", maskCPF(e.target.value))} placeholder="000.000.000-00" error={errors[`guardian_${i}_cpf`]} required />
                    <Input label="Telefone" value={g.phone} onChange={(e) => updateGuardianField(i, "phone", maskPhone(e.target.value))} placeholder="(00) 00000-0000" error={errors[`guardian_${i}_phone`]} required />
                    <Input label="Email" type="email" value={g.email} onChange={(e) => updateGuardianField(i, "email", e.target.value)} error={errors[`guardian_${i}_email`]} required />
                    <Input label="Parentesco" value={g.relationship_type} onChange={(e) => updateGuardianField(i, "relationship_type", e.target.value)} placeholder="Ex: Mãe, Pai, Avó" error={errors[`guardian_${i}_relationship`]} required />
                  </div>
                </div>
              ))}
              <Button type="submit">Cadastrar</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Guardian Management */}
      {managingGuardians && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Responsáveis - {students.find((s) => s.student_id === managingGuardians)?.name}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setManagingGuardians(null)}><X className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {studentGuardians.length === 0 ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Parentesco</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentGuardians.map((g) => (
                    <TableRow key={g.guardian_id}>
                      <TableCell className="font-medium">{g.name}</TableCell>
                      <TableCell>{g.cpf}</TableCell>
                      <TableCell>{g.phone}</TableCell>
                      <TableCell>{g.relationship_type}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => removeGuardian(g.guardian_id)} disabled={studentGuardians.length <= 1} title={studentGuardians.length <= 1 ? "Não é possível remover o único responsável" : "Remover"}>
                          <Trash2 className={`h-4 w-4 ${studentGuardians.length <= 1 ? "text-muted-foreground" : "text-destructive"}`} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {studentGuardians.length <= 1 && (
              <p className="text-xs text-amber-600">O aluno deve ter no mínimo 1 responsável. Adicione outro para poder remover.</p>
            )}
            {!showAddGuardian ? (
              <Button variant="outline" size="sm" onClick={() => setShowAddGuardian(true)}>
                <UserPlus className="mr-1 h-4 w-4" /> Adicionar Responsável
              </Button>
            ) : (
              <div className="space-y-3 rounded-lg border border-border p-4">
                <h4 className="text-sm font-medium">Novo Responsável</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Nome" value={newGuardianForm.name} onChange={(e) => setNewGuardianForm({ ...newGuardianForm, name: e.target.value })} error={guardianErrors.new_guardian_name} required />
                  <Input label="CPF" value={newGuardianForm.cpf} onChange={(e) => setNewGuardianForm({ ...newGuardianForm, cpf: maskCPF(e.target.value) })} placeholder="000.000.000-00" error={guardianErrors.new_guardian_cpf} required />
                  <Input label="Telefone" value={newGuardianForm.phone} onChange={(e) => setNewGuardianForm({ ...newGuardianForm, phone: maskPhone(e.target.value) })} placeholder="(00) 00000-0000" error={guardianErrors.new_guardian_phone} required />
                  <Input label="Email" type="email" value={newGuardianForm.email} onChange={(e) => setNewGuardianForm({ ...newGuardianForm, email: e.target.value })} error={guardianErrors.new_guardian_email} required />
                  <Input label="Parentesco" value={newGuardianForm.relationship_type} onChange={(e) => setNewGuardianForm({ ...newGuardianForm, relationship_type: e.target.value })} placeholder="Ex: Mãe, Pai, Avó" error={guardianErrors.new_guardian_relationship} required />
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={addGuardianToStudent}>Salvar</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => { setShowAddGuardian(false); setGuardianErrors({}); }}>Cancelar</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Student Detail Modal */}
      <Modal open={!!selectedStudent} onClose={closeStudentDetail}>
        {selectedStudent && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">{selectedStudent.name}</h2>
              <p className="text-sm text-muted-foreground">Detalhes do aluno</p>
            </div>

            {/* Info pessoal */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Turma</p>
                <p className="font-medium">{selectedStudent.class_id}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">RA</p>
                <p className="font-mono font-medium">{selectedStudent.ra || "—"}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">CPF</p>
                <p className="font-medium">{selectedStudent.cpf || "—"}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Data de Nascimento</p>
                <p className="font-medium">{selectedStudent.birth_date}</p>
              </div>
              <div className="rounded-lg border border-border p-3 sm:col-span-2">
                <p className="text-xs text-muted-foreground">Endereço</p>
                <p className="font-medium">{selectedStudent.address || "—"}</p>
              </div>
            </div>

            {detailLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20" />
                <Skeleton className="h-32" />
              </div>
            ) : (
              <>
                {/* Responsáveis */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold">Responsáveis</h3>
                  {detailGuardians.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum responsável cadastrado.</p>
                  ) : (
                    <div className="space-y-2">
                      {detailGuardians.map((g) => (
                        <div key={g.guardian_id} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border p-3 text-sm">
                          <span className="font-medium">{g.name}</span>
                          <Badge variant="secondary">{g.relationship_type}</Badge>
                          <span className="text-muted-foreground">{g.phone}</span>
                          <span className="text-muted-foreground">{g.email}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notas e Faltas */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold">Notas e Faltas por Matéria</h3>
                  {detailGrades.length === 0 && detailAbsences.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma nota ou falta registrada.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Matéria</TableHead>
                          <TableHead className="text-center">1º Bim</TableHead>
                          <TableHead className="text-center">2º Bim</TableHead>
                          <TableHead className="text-center">3º Bim</TableHead>
                          <TableHead className="text-center">4º Bim</TableHead>
                          <TableHead className="text-center">Média</TableHead>
                          <TableHead className="text-center">Faltas</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                          const subjects = [...new Set([
                            ...detailGrades.map((g) => g.subject_id),
                            ...detailAbsences.map((a) => a.subject_id),
                          ])].sort();
                          return subjects.map((subject) => {
                            const subjectGrades = detailGrades.filter((g) => g.subject_id === subject);
                            const absences = getAbsencesForSubject(subject);
                            const gradeValues = subjectGrades.map((g) => parseFloat(g.grade));
                            const avg = gradeValues.length > 0 ? (gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length).toFixed(1) : "—";
                            return (
                              <TableRow key={subject}>
                                <TableCell className="font-medium">{subject}</TableCell>
                                {[1, 2, 3, 4].map((b) => {
                                  const g = subjectGrades.find((gr) => gr.bimester === b);
                                  return (
                                    <TableCell key={b} className="text-center">
                                      {g ? (
                                        <span className={`font-bold ${parseFloat(g.grade) >= 7 ? "text-emerald-600" : parseFloat(g.grade) >= 5 ? "text-amber-600" : "text-red-500"}`}>{g.grade}</span>
                                      ) : <span className="text-muted-foreground">—</span>}
                                    </TableCell>
                                  );
                                })}
                                <TableCell className="text-center">
                                  <span className={`font-bold ${avg !== "—" && parseFloat(avg) >= 7 ? "text-emerald-600" : avg !== "—" && parseFloat(avg) >= 5 ? "text-amber-600" : "text-red-500"}`}>{avg}</span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className={`font-bold ${absences === 0 ? "text-emerald-600" : absences <= 3 ? "text-amber-600" : "text-red-500"}`}>
                                    {absences}
                                  </span>
                                </TableCell>
                              </TableRow>
                            );
                          });
                        })()}
                      </TableBody>
                    </Table>
                  )}
                  {detailGrades.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                      <span className="text-sm text-muted-foreground">Média Geral:</span>
                      <span className="text-lg font-bold">
                        {(detailGrades.reduce((acc, g) => acc + parseFloat(g.grade), 0) / detailGrades.length).toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alunos Cadastrados ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : filteredStudents.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Nenhum aluno encontrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>RA</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Nascimento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((s) => (
                  <TableRow key={s.student_id} className="cursor-pointer" onClick={() => openStudentDetail(s)}>
                    <TableCell className="font-medium">{s.name || s.student_id.slice(0, 8)}</TableCell>
                    <TableCell className="font-mono text-xs">{s.ra || "—"}</TableCell>
                    <TableCell className="text-xs">{s.cpf || "—"}</TableCell>
                    <TableCell><Badge variant="secondary">{s.class_id}</Badge></TableCell>
                    <TableCell>{s.birth_date}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" onClick={() => loadGuardians(s.student_id)} title="Gerenciar responsáveis">
                          <Users className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteStudent(s.student_id)} title="Remover aluno">
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
