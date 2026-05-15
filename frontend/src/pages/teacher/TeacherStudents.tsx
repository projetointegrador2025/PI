import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import { Filter } from "lucide-react";
import api from "@/services/api";

interface Student {
  student_id: string;
  class_id: string;
  birth_date: string;
  name?: string;
  cpf?: string;
  ra?: string;
  address?: string;
}

interface Grade {
  subject_id: string;
  grade: string;
  bimester: number;
}

interface Absence {
  subject_id: string;
  absences: number;
  bimester: number;
}

interface Guardian {
  guardian_id: string;
  name: string;
  phone: string;
  email: string;
  relationship_type: string;
}

export default function TeacherStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState<string>("all");

  // Detail modal
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailGrades, setDetailGrades] = useState<Grade[]>([]);
  const [detailAbsences, setDetailAbsences] = useState<Absence[]>([]);
  const [detailGuardians, setDetailGuardians] = useState<Guardian[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [mySubjects, setMySubjects] = useState<string[]>([]);

  const availableClasses = [...new Set(students.map((s) => s.class_id))].sort();

  useEffect(() => { loadStudents(); loadTeacherInfo(); }, []);

  const loadStudents = async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data.data || []);
    } catch { /* empty */ } finally { setLoading(false); }
  };

  const loadTeacherInfo = async () => {
    try {
      const res = await api.get("/teachers/me");
      setMySubjects(res.data.data?.subjects || []);
    } catch { /* empty */ }
  };

  const filteredStudents = filterClass === "all" ? students : students.filter((s) => s.class_id === filterClass);

  const openStudentDetail = async (student: Student) => {
    setSelectedStudent(student);
    setDetailLoading(true);
    try {
      const [gradesRes, absencesRes, guardiansRes] = await Promise.all([
        api.get(`/grades?student_id=${student.student_id}`),
        api.get(`/absences?student_id=${student.student_id}`),
        api.get(`/guardians?student_id=${student.student_id}`),
      ]);
      // Filtrar apenas notas e faltas das minhas disciplinas
      const allGrades: Grade[] = gradesRes.data.data || [];
      const allAbsences: Absence[] = absencesRes.data.data || [];
      setDetailGrades(allGrades.filter((g) => mySubjects.includes(g.subject_id)));
      setDetailAbsences(allAbsences.filter((a) => mySubjects.includes(a.subject_id)));
      setDetailGuardians(guardiansRes.data.data || []);
    } catch { /* empty */ } finally { setDetailLoading(false); }
  };

  const closeDetail = () => {
    setSelectedStudent(null);
    setDetailGrades([]);
    setDetailAbsences([]);
    setDetailGuardians([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meus Alunos</h1>
          <p className="text-muted-foreground">Lista de alunos das suas turmas</p>
        </div>
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
      </div>

      {/* Student Detail Modal */}
      <Modal open={!!selectedStudent} onClose={closeDetail}>
        {selectedStudent && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">{selectedStudent.name}</h2>
              <p className="text-sm text-muted-foreground">Turma {selectedStudent.class_id}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">RA</p>
                <p className="font-mono font-medium">{selectedStudent.ra || "—"}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Data de Nascimento</p>
                <p className="font-medium">{selectedStudent.birth_date}</p>
              </div>
            </div>

            {detailLoading ? (
              <Skeleton className="h-32" />
            ) : (
              <>
                {/* Responsáveis */}
                {detailGuardians.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold">Responsáveis</h3>
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
                  </div>
                )}

                {/* Notas e Faltas */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Notas e Faltas</h3>
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
                            const subjectAbsences = detailAbsences.filter((a) => a.subject_id === subject);
                            const totalAbsences = subjectAbsences.reduce((sum, a) => sum + a.absences, 0);
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
                                  <span className={`font-bold ${totalAbsences === 0 ? "text-emerald-600" : totalAbsences <= 6 ? "text-amber-600" : "text-red-500"}`}>
                                    {totalAbsences}
                                  </span>
                                </TableCell>
                              </TableRow>
                            );
                          });
                        })()}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      <Card>
        <CardHeader><CardTitle>Alunos ({filteredStudents.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : filteredStudents.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Nenhum aluno encontrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>RA</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Nascimento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((s) => (
                  <TableRow key={s.student_id} className="cursor-pointer" onClick={() => openStudentDetail(s)}>
                    <TableCell className="font-medium">{s.name || "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{s.ra || "—"}</TableCell>
                    <TableCell><Badge variant="secondary">{s.class_id}</Badge></TableCell>
                    <TableCell>{s.birth_date}</TableCell>
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
