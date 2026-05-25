import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter } from "lucide-react";
import api from "@/services/api";

interface Student {
  student_id: string;
  name?: string;
  class_id: string;
}

interface Grade {
  student_id: string;
  subject_id: string;
  grade: string;
  bimester: number;
}

const BIMESTERS = [1, 2, 3, 4];

export default function TeacherGrades() {
  const [students, setStudents] = useState<Student[]>([]);
  const [mySubjects, setMySubjects] = useState<string[]>([]);
  const [filterClass, setFilterClass] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedBimester, setSelectedBimester] = useState("1");
  const [gradeValue, setGradeValue] = useState("");

  // View grades
  const [viewStudent, setViewStudent] = useState("");
  const [studentGrades, setStudentGrades] = useState<Grade[]>([]);

  const availableClasses = [...new Set(students.map((s) => s.class_id))].sort();
  const filteredStudents = filterClass === "all" ? students : students.filter((s) => s.class_id === filterClass);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [studentsRes, teacherRes] = await Promise.all([
        api.get("/students"),
        api.get("/teachers/me"),
      ]);
      setStudents(studentsRes.data.data || []);
      setMySubjects(teacherRes.data.data?.subjects || []);
    } catch { /* empty */ } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedSubject || !gradeValue) return;
    try {
      await api.post("/grades", {
        student_id: selectedStudent,
        subject_id: selectedSubject,
        bimester: parseInt(selectedBimester),
        grade: parseFloat(gradeValue),
      });
      setMessage({ text: "Nota registrada com sucesso!", type: "success" });
      setGradeValue("");
      if (viewStudent === selectedStudent) loadStudentGrades(selectedStudent);
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || "Erro ao registrar nota", type: "error" });
    }
  };

  const loadStudentGrades = async (studentId: string) => {
    setViewStudent(studentId);
    try {
      const res = await api.get(`/grades?student_id=${studentId}`);
      const allGrades: Grade[] = res.data.data || [];
      setStudentGrades(allGrades.filter((g) => mySubjects.includes(g.subject_id)));
    } catch { setStudentGrades([]); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Registrar Notas</h1></div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Agrupar notas por matéria para exibição
  const gradesBySubject = mySubjects.map((subject) => {
    const subjectGrades = studentGrades.filter((g) => g.subject_id === subject);
    return { subject, grades: subjectGrades };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Registrar Notas</h1>
        <p className="text-muted-foreground">Suas disciplinas: {mySubjects.join(", ") || "—"}</p>
      </div>

      {message && (
        <div role="alert" className={`rounded-lg border px-4 py-3 text-sm font-medium ${message.type === "success" ? "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "border-red-300 bg-red-100 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300"}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-2 font-bold">×</button>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Nova Nota</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 pb-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="all">Todas as turmas</option>
                {availableClasses.map((cls) => <option key={cls} value={cls}>Turma {cls}</option>)}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Aluno *</label>
                <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required>
                  <option value="">Selecione...</option>
                  {filteredStudents.map((s) => <option key={s.student_id} value={s.student_id}>{s.name || s.student_id} ({s.class_id})</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Disciplina *</label>
                <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required>
                  <option value="">Selecione...</option>
                  {mySubjects.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Bimestre *</label>
                <select value={selectedBimester} onChange={(e) => setSelectedBimester(e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required>
                  {BIMESTERS.map((b) => <option key={b} value={b}>{b}º Bimestre</option>)}
                </select>
              </div>
              <Input label="Nota *" type="number" step="0.1" min="0" max="10" value={gradeValue} onChange={(e) => setGradeValue(e.target.value)} placeholder="0.0 a 10.0" required />
            </div>
            <Button type="submit" disabled={!selectedStudent || !selectedSubject || !gradeValue}>Registrar Nota</Button>
          </form>
        </CardContent>
      </Card>

      {/* Consultar notas */}
      <Card>
        <CardHeader><CardTitle>Consultar Notas por Bimestre</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Aluno</label>
            <select value={viewStudent} onChange={(e) => { if (e.target.value) loadStudentGrades(e.target.value); else setViewStudent(""); }} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">Selecione um aluno...</option>
              {students.map((s) => <option key={s.student_id} value={s.student_id}>{s.name || s.student_id} ({s.class_id})</option>)}
            </select>
          </div>

          {viewStudent && gradesBySubject.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matéria</TableHead>
                  {BIMESTERS.map((b) => <TableHead key={b} className="text-center">{b}º Bim</TableHead>)}
                  <TableHead className="text-center">Média</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gradesBySubject.map(({ subject, grades }) => {
                  const gradeValues = grades.map((g) => parseFloat(g.grade));
                  const avg = gradeValues.length > 0 ? (gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length).toFixed(1) : "—";
                  return (
                    <TableRow key={subject}>
                      <TableCell className="font-medium">{subject}</TableCell>
                      {BIMESTERS.map((b) => {
                        const g = grades.find((gr) => Number(gr.bimester) === b);
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
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          {viewStudent && studentGrades.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma nota registrada nas suas disciplinas para este aluno.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
