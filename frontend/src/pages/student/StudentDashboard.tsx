import { useEffect, useState } from "react";
import { ClipboardList, Calendar, TrendingUp, Award } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/services/api";

interface Grade {
  subject_id: string;
  grade: string;
  bimester: number;
}

interface Absence {
  subject_id: string;
  bimester: number;
  absences: number;
}

// Limite de faltas por bimestre por matéria (25% de 20 aulas = 5 faltas)
const ABSENCE_LIMIT_PER_BIMESTER = 5;

export default function StudentDashboard() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [gradesRes, absencesRes] = await Promise.all([
        api.get("/grades", { params: { student_id: "current" } }),
        api.get("/absences", { params: { student_id: "stu-001" } }),
      ]);
      setGrades(gradesRes.data.data || []);
      setAbsences(absencesRes.data.data || []);
    } catch { /* empty */ } finally { setLoading(false); }
  };

  // Agrupar por matéria
  const subjects = [...new Set([
    ...grades.map((g) => g.subject_id),
    ...absences.map((a) => a.subject_id),
  ])].sort();

  const subjectData = subjects.map((subject) => {
    const subGrades = grades.filter((g) => g.subject_id === subject);
    const subAbsences = absences.filter((a) => a.subject_id === subject);
    const gradeValues = subGrades.map((g) => parseFloat(g.grade));
    const avg = gradeValues.length > 0 ? (gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length) : 0;
    const totalAbsences = subAbsences.reduce((sum, a) => sum + a.absences, 0);
    return { subject, grades: subGrades, absences: subAbsences, average: avg, totalAbsences };
  });

  const allGradeValues = grades.map((g) => parseFloat(g.grade));
  const average = allGradeValues.length > 0
    ? (allGradeValues.reduce((a, b) => a + b, 0) / allGradeValues.length).toFixed(1)
    : "—";
  const bestGrade = allGradeValues.length > 0 ? Math.max(...allGradeValues).toFixed(1) : "—";
  const totalAbsences = absences.reduce((sum, a) => sum + a.absences, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meu Painel</h1>
        <p className="text-muted-foreground">Acompanhe seu desempenho acadêmico</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Disciplinas" value={subjects.length} icon={ClipboardList} />
        <StatCard title="Média Geral" value={average} icon={TrendingUp} />
        <StatCard title="Melhor Nota" value={bestGrade} icon={Award} />
        <StatCard title="Total de Faltas" value={totalAbsences} icon={Calendar} />
      </div>

      {/* Notas por Bimestre */}
      <Card>
        <CardHeader><CardTitle>Notas por Bimestre</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : subjects.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Nenhuma nota registrada.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Disciplina</TableHead>
                  <TableHead className="text-center">1º Bim</TableHead>
                  <TableHead className="text-center">2º Bim</TableHead>
                  <TableHead className="text-center">3º Bim</TableHead>
                  <TableHead className="text-center">4º Bim</TableHead>
                  <TableHead className="text-center">Média</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjectData.map((item) => (
                  <TableRow key={item.subject}>
                    <TableCell className="font-medium">{item.subject}</TableCell>
                    {[1, 2, 3, 4].map((b) => {
                      const g = item.grades.find((gr) => gr.bimester === b);
                      return (
                        <TableCell key={b} className="text-center">
                          {g ? (
                            <span className={`font-bold ${parseFloat(g.grade) >= 7 ? "text-emerald-600" : parseFloat(g.grade) >= 5 ? "text-amber-600" : "text-red-500"}`}>
                              {g.grade}
                            </span>
                          ) : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center">
                      {item.average > 0 ? (
                        <span className={`font-bold ${item.average >= 7 ? "text-emerald-600" : item.average >= 5 ? "text-amber-600" : "text-red-500"}`}>
                          {item.average.toFixed(1)}
                        </span>
                      ) : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.average > 0 && (
                        <Badge variant={item.average >= 7 ? "success" : item.average >= 5 ? "warning" : "destructive"}>
                          {item.average >= 7 ? "Aprovado" : item.average >= 5 ? "Recuperação" : "Reprovado"}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Faltas por Bimestre */}
      <Card>
        <CardHeader>
          <CardTitle>Faltas por Bimestre</CardTitle>
          <p className="text-xs text-muted-foreground">Limite: {ABSENCE_LIMIT_PER_BIMESTER} faltas por bimestre por matéria</p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-32" />
          ) : absences.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Nenhuma falta registrada.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Disciplina</TableHead>
                  <TableHead className="text-center">1º Bim</TableHead>
                  <TableHead className="text-center">2º Bim</TableHead>
                  <TableHead className="text-center">3º Bim</TableHead>
                  <TableHead className="text-center">4º Bim</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Situação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjectData.map((item) => {
                  const hasExceeded = item.absences.some((a) => a.absences >= ABSENCE_LIMIT_PER_BIMESTER);
                  const isNearLimit = item.absences.some((a) => a.absences >= ABSENCE_LIMIT_PER_BIMESTER - 1);
                  return (
                    <TableRow key={item.subject}>
                      <TableCell className="font-medium">{item.subject}</TableCell>
                      {[1, 2, 3, 4].map((b) => {
                        const a = item.absences.find((ab) => ab.bimester === b);
                        const count = a?.absences ?? 0;
                        const atLimit = count >= ABSENCE_LIMIT_PER_BIMESTER;
                        const nearLimit = count >= ABSENCE_LIMIT_PER_BIMESTER - 1;
                        return (
                          <TableCell key={b} className="text-center">
                            <span className={`font-bold ${atLimit ? "text-red-500" : nearLimit ? "text-amber-600" : "text-foreground"}`}>
                              {a ? count : "—"}
                            </span>
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center font-bold">{item.totalAbsences}</TableCell>
                      <TableCell className="text-center">
                        {hasExceeded ? (
                          <Badge variant="destructive">Limite excedido</Badge>
                        ) : isNearLimit ? (
                          <Badge variant="warning">Próximo do limite</Badge>
                        ) : (
                          <Badge variant="success">Regular</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
