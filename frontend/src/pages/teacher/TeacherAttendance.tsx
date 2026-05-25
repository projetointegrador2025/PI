import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle } from "lucide-react";
import api from "@/services/api";

interface Student {
  student_id: string;
  name?: string;
  class_id: string;
}

export default function TeacherAttendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const [mySubjects, setMySubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Filtros
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // Chamada
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  // Calcula o bimestre automaticamente pela data
  const getBimesterFromDate = (dateStr: string): number => {
    const month = new Date(dateStr + "T12:00:00").getMonth() + 1; // 1-12
    if (month <= 3) return 1;       // Jan-Mar: 1º bimestre
    if (month <= 6) return 2;       // Abr-Jun: 2º bimestre
    if (month <= 9) return 3;       // Jul-Set: 3º bimestre
    return 4;                        // Out-Dez: 4º bimestre
  };

  const currentBimester = getBimesterFromDate(selectedDate);

  const availableClasses = [...new Set(students.map((s) => s.class_id))].sort();
  const filteredStudents = selectedClass ? students.filter((s) => s.class_id === selectedClass) : [];

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [studentsRes, teacherRes] = await Promise.all([
        api.get("/students"),
        api.get("/teachers/me"),
      ]);
      setStudents(studentsRes.data.data || []);
      const teacher = teacherRes.data.data;
      const subjects = teacher?.subjects || [];
      setMySubjects(subjects);
      if (subjects.length > 0) setSelectedSubject(subjects[0]);
      const classes = [...new Set((studentsRes.data.data || []).map((s: Student) => s.class_id))].sort();
      if (classes.length > 0) setSelectedClass(classes[0] as string);
    } catch { /* empty */ } finally { setLoading(false); }
  };

  // Quando muda a turma, resetar chamada
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    filteredStudents.forEach((s) => { initial[s.student_id] = true; });
    setAttendance(initial);
    setSubmitted(false);
  }, [selectedClass, students]);

  const toggleAttendance = (studentId: string) => {
    if (submitted) return;
    setAttendance((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const markAllPresent = () => {
    if (submitted) return;
    const all: Record<string, boolean> = {};
    filteredStudents.forEach((s) => { all[s.student_id] = true; });
    setAttendance(all);
  };

  const markAllAbsent = () => {
    if (submitted) return;
    const all: Record<string, boolean> = {};
    filteredStudents.forEach((s) => { all[s.student_id] = false; });
    setAttendance(all);
  };

  const submitAttendance = async () => {
    if (!selectedClass || !selectedSubject || !selectedDate) return;

    // Registrar faltas para alunos ausentes
    const absentStudents = filteredStudents.filter((s) => !attendance[s.student_id]);

    try {
      // Para cada aluno ausente, incrementar falta
      for (const student of absentStudents) {
        await api.post("/absences", {
          entity_type: "student",
          entity_id: student.student_id,
          subject_id: selectedSubject,
          bimester: currentBimester,
          date: selectedDate,
        });
      }

      const presentCount = filteredStudents.length - absentStudents.length;
      setMessage({
        text: `Chamada registrada! ${presentCount} presentes, ${absentStudents.length} ausentes.`,
        type: "success",
      });
      setSubmitted(true);
    } catch {
      setMessage({ text: "Erro ao registrar chamada", type: "error" });
    }
  };

  const resetAttendance = () => {
    const initial: Record<string, boolean> = {};
    filteredStudents.forEach((s) => { initial[s.student_id] = true; });
    setAttendance(initial);
    setSubmitted(false);
    setMessage(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Chamada</h1></div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const presentCount = filteredStudents.filter((s) => attendance[s.student_id]).length;
  const absentCount = filteredStudents.length - presentCount;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Chamada</h1>
        <p className="text-muted-foreground">Registre a presença dos alunos</p>
      </div>

      {message && (
        <div role="alert" className={`rounded-lg border px-4 py-3 text-sm font-medium ${message.type === "success" ? "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "border-red-300 bg-red-100 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300"}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-2 font-bold">×</button>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Turma</label>
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {availableClasses.map((cls) => <option key={cls} value={cls}>Turma {cls}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Disciplina</label>
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {mySubjects.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Data</label>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              <p className="text-xs text-muted-foreground">{currentBimester}º Bimestre</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de chamada */}
      {filteredStudents.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Turma {selectedClass} — {selectedSubject}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="success">{presentCount} presentes</Badge>
                <Badge variant="destructive">{absentCount} ausentes</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!submitted && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={markAllPresent}>Todos presentes</Button>
                <Button variant="outline" size="sm" onClick={markAllAbsent}>Todos ausentes</Button>
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead className="text-center">Presença</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((s) => (
                  <TableRow
                    key={s.student_id}
                    className={`cursor-pointer transition-colors ${submitted ? "" : "hover:bg-muted/50"}`}
                    onClick={() => toggleAttendance(s.student_id)}
                  >
                    <TableCell className="font-medium">{s.name || s.student_id}</TableCell>
                    <TableCell className="text-center">
                      {attendance[s.student_id] ? (
                        <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-500" />
                      ) : (
                        <XCircle className="mx-auto h-6 w-6 text-red-500" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex gap-2">
              {!submitted ? (
                <Button onClick={submitAttendance}>Registrar Chamada</Button>
              ) : (
                <Button variant="outline" onClick={resetAttendance}>Nova Chamada</Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
