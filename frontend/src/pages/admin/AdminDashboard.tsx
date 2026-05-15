import { useEffect, useState } from "react";
import { Users, GraduationCap, TrendingUp, Filter } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/services/api";

interface GradeBySubject {
  subject: string;
  grade: string;
  bimesters: { bimester: number; grade: string }[];
}

interface StudentAverage {
  student_id: string;
  name: string;
  class_id: string;
  average: string;
  grades_by_subject: GradeBySubject[];
}

interface SubjectAverage {
  subject: string;
  average: string;
}

interface DashboardData {
  total_students: number;
  total_teachers: number;
  average_geral: string;
  average_by_subject: SubjectAverage[];
  students: StudentAverage[];
  teachers: { teacher_id: string; name: string; subject: string | string[] }[];
  available_classes: string[];
  selected_class: string;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, [selectedClass]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const params = selectedClass !== "all" ? `?class_id=${selectedClass}` : "";
      const res = await api.get(`/dashboard${params}`);
      setData(res.data.data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {selectedClass === "all" ? "Visão geral do sistema" : `Turma ${selectedClass}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setExpandedStudent(null);
            }}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Filtrar por turma"
          >
            <option value="all">Todas as turmas</option>
            {data.available_classes.map((cls) => (
              <option key={cls} value={cls}>Turma {cls}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total de Alunos" value={data.total_students} icon={Users} />
        <StatCard title="Total de Professores" value={data.total_teachers} icon={GraduationCap} />
        <StatCard title="Média Geral" value={data.average_geral} icon={TrendingUp} />
      </div>

      {/* Média por Matéria */}
      {data.average_by_subject.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Média por Matéria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.average_by_subject.map((item) => (
                <div key={item.subject} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="text-sm font-medium">{item.subject}</span>
                  <span className={`text-sm font-bold ${parseFloat(item.average) >= 7 ? "text-emerald-600" : parseFloat(item.average) >= 5 ? "text-amber-600" : "text-red-500"}`}>
                    {item.average}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Professores da turma */}
      {selectedClass !== "all" && data.teachers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Professores da Turma</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Matéria</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.teachers.map((teacher) => (
                  <TableRow key={teacher.teacher_id}>
                    <TableCell className="font-medium">{teacher.name}</TableCell>
                    <TableCell>{Array.isArray(teacher.subject) ? teacher.subject.join(", ") : teacher.subject}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Alunos */}
      <Card>
        <CardHeader>
          <CardTitle>Alunos {selectedClass !== "all" ? `da Turma ${selectedClass}` : ""}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                {selectedClass === "all" && <TableHead>Turma</TableHead>}
                <TableHead>Média Geral</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.students.map((student) => (
                <>
                  <TableRow key={student.student_id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    {selectedClass === "all" && <TableCell>{student.class_id}</TableCell>}
                    <TableCell>
                      <span className={`font-bold ${student.average !== "N/A" && parseFloat(student.average) >= 7 ? "text-emerald-600" : student.average !== "N/A" && parseFloat(student.average) >= 5 ? "text-amber-600" : "text-red-500"}`}>
                        {student.average}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => setExpandedStudent(expandedStudent === student.student_id ? null : student.student_id)}
                        className="text-sm text-primary hover:underline"
                      >
                        {expandedStudent === student.student_id ? "Ocultar" : "Ver notas"}
                      </button>
                    </TableCell>
                  </TableRow>
                  {expandedStudent === student.student_id && student.grades_by_subject.length > 0 && (
                    <TableRow key={`${student.student_id}-grades`}>
                      <TableCell colSpan={selectedClass === "all" ? 4 : 3}>
                        <div className="space-y-2 py-2">
                          {student.grades_by_subject.map((g) => (
                            <div key={g.subject} className="flex flex-wrap items-center gap-2 rounded border border-border/50 bg-muted/30 px-3 py-2 text-sm">
                              <span className="font-medium min-w-[100px]">{g.subject}</span>
                              {g.bimesters.map((b) => (
                                <span key={b.bimester} className={`rounded px-2 py-0.5 text-xs font-bold ${parseFloat(b.grade) >= 7 ? "bg-emerald-100 text-emerald-700" : parseFloat(b.grade) >= 5 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                                  {b.bimester}º: {b.grade}
                                </span>
                              ))}
                              <span className={`ml-auto font-bold ${parseFloat(g.grade) >= 7 ? "text-emerald-600" : parseFloat(g.grade) >= 5 ? "text-amber-600" : "text-red-500"}`}>
                                Média: {g.grade}
                              </span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
