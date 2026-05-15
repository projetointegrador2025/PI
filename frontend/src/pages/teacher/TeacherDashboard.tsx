import { useEffect, useState } from "react";
import { Users, ClipboardList, BookOpen, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
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
}

export default function TeacherDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>("all");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data.data || []);
    } catch { /* empty */ } finally { setLoading(false); }
  };

  const classes = [...new Set(students.map((s) => s.class_id))].sort();
  const filteredStudents = selectedClass === "all" ? students : students.filter((s) => s.class_id === selectedClass);

  if (loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Dashboard</h1></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo ao portal do professor</p>
        </div>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Filtrar por turma"
        >
          <option value="all">Todas as turmas</option>
          {classes.map((cls) => (
            <option key={cls} value={cls}>Turma {cls}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Meus Alunos" value={filteredStudents.length} icon={Users} />
        <StatCard title="Turmas" value={classes.length} icon={ClipboardList} />
        <StatCard title="Anotações" value={35} icon={BookOpen} />
        <StatCard title="Média Geral" value="7.4" icon={TrendingUp} />
      </div>

      <Card>
        <CardHeader><CardTitle>Ações Rápidas</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link to="/professor/notas" className="flex items-center gap-3 rounded-lg border border-border p-4 transition-all hover:border-primary hover:shadow-sm">
              <ClipboardList className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Registrar Nota</span>
            </Link>
            <Link to="/professor/anotacoes" className="flex items-center gap-3 rounded-lg border border-border p-4 transition-all hover:border-primary hover:shadow-sm">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Nova Anotação</span>
            </Link>
            <Link to="/professor/alunos" className="flex items-center gap-3 rounded-lg border border-border p-4 transition-all hover:border-primary hover:shadow-sm">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Ver Alunos</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
