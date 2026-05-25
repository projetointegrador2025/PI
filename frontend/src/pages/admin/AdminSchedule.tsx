import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import { Filter, Plus, Trash2 } from "lucide-react";
import api from "@/services/api";

interface ScheduleItem {
  class_id: string;
  day_of_week: string;
  time: string;
  subject: string;
  teacher_id: string;
}

interface Teacher {
  teacher_id: string;
  name?: string;
}

interface ClassInfo {
  class_id: string;
  student_count: number;
}

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

export default function AdminSchedule() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Add class
  const [newClassYear, setNewClassYear] = useState("1");
  const [newClassLetter, setNewClassLetter] = useState("A");

  // Delete class modal
  const [deletingClass, setDeletingClass] = useState<string | null>(null);
  const [targetClass, setTargetClass] = useState<string>("");

  useEffect(() => {
    loadClasses();
    loadTeachers();
  }, []);

  useEffect(() => {
    if (selectedClass) loadSchedule();
  }, [selectedClass]);

  const loadClasses = async () => {
    try {
      const res = await api.get("/classes");
      const data: ClassInfo[] = res.data.data || [];
      setClasses(data);
      if (data.length > 0 && !selectedClass) {
        setSelectedClass(data[0].class_id);
      }
    } catch { /* empty */ }
  };

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const res = await api.get("/schedule", { params: { class_id: selectedClass } });
      setSchedule(res.data.data || []);
    } catch { /* empty */ } finally { setLoading(false); }
  };

  const loadTeachers = async () => {
    try {
      const res = await api.get("/teachers");
      setTeachers(res.data.data || []);
    } catch { /* empty */ }
  };

  const getTeacherName = (teacherId: string): string => {
    const teacher = teachers.find((t) => t.teacher_id === teacherId);
    return teacher?.name || "";
  };

  const getClassYear = (classId: string): string => classId.replace(/[^0-9]/g, "");

  const addClass = async () => {
    const name = `${newClassYear}${newClassLetter}`;
    if (classes.some((c) => c.class_id === name)) {
      setMessage({ text: "Essa turma já existe", type: "error" });
      return;
    }
    try {
      await api.post("/classes", { class_id: name });
      setMessage({ text: `Turma ${name} criada!`, type: "success" });
      setClasses([...classes, { class_id: name, student_count: 0 }]);
      if (!selectedClass) setSelectedClass(name);
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || "Erro ao criar turma", type: "error" });
    }
  };

  const deleteClass = async () => {
    if (!deletingClass || !targetClass) return;
    try {
      await api.delete(`/classes/${deletingClass}?target_class=${targetClass}`);
      setMessage({ text: `Turma ${deletingClass} excluída. Alunos realocados para ${targetClass}.`, type: "success" });
      setDeletingClass(null);
      setTargetClass("");
      const updated = classes.filter((c) => c.class_id !== deletingClass);
      setClasses(updated);
      if (selectedClass === deletingClass && updated.length > 0) {
        setSelectedClass(updated[0].class_id);
      }
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || "Erro ao excluir turma", type: "error" });
    }
  };

  const getScheduleForDayAndTime = (day: string, time: string) => {
    return schedule.find((s) => s.day_of_week === day && s.time === time);
  };

  const times = [...new Set(schedule.map((s) => s.time))].sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Grade de Aulas</h1>
          <p className="text-muted-foreground">Gerencie turmas e visualize horários</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Filtrar por turma"
          >
            {classes.map((cls) => (
              <option key={cls.class_id} value={cls.class_id}>Turma {cls.class_id}</option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <div role="alert" className={`rounded-lg border px-4 py-3 text-sm font-medium ${message.type === "success" ? "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "border-red-300 bg-red-100 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300"}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-2 font-bold">×</button>
        </div>
      )}

      {/* Gerenciar Turmas */}
      <Card>
        <CardHeader><CardTitle>Turmas</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Ano</label>
              <select
                value={newClassYear}
                onChange={(e) => setNewClassYear(e.target.value)}
                className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((y) => (
                  <option key={y} value={y}>{y}º Ano</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Letra</label>
              <select
                value={newClassLetter}
                onChange={(e) => setNewClassLetter(e.target.value)}
                className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {["A", "B", "C", "D", "E", "F"].map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <Button onClick={addClass}>
              <Plus className="mr-1 h-4 w-4" /> Criar Turma
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {classes.map((cls) => (
              <div key={cls.class_id} className="flex items-center gap-1 rounded-lg border border-border px-3 py-2">
                <Badge variant="secondary">{cls.class_id}</Badge>
                <span className="text-xs text-muted-foreground">{cls.student_count} alunos</span>
                {classes.length > 1 && (
                  <button
                    onClick={() => { setDeletingClass(cls.class_id); setTargetClass(""); }}
                    className="ml-1 rounded p-0.5 text-muted-foreground hover:text-destructive"
                    title="Excluir turma"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de exclusão com realocação */}
      <Modal open={!!deletingClass} onClose={() => setDeletingClass(null)}>
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Excluir Turma {deletingClass}</h2>
          <p className="text-sm text-muted-foreground">
            Todos os alunos desta turma serão realocados para outra turma do mesmo ano. Selecione a turma destino:
          </p>

          <select
            value={targetClass}
            onChange={(e) => setTargetClass(e.target.value)}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Selecione a turma destino...</option>
            {classes
              .filter((c) => c.class_id !== deletingClass && getClassYear(c.class_id) === getClassYear(deletingClass || ""))
              .map((cls) => (
                <option key={cls.class_id} value={cls.class_id}>
                  Turma {cls.class_id} ({cls.student_count} alunos)
                </option>
              ))}
          </select>

          {deletingClass && classes.filter((c) => c.class_id !== deletingClass && getClassYear(c.class_id) === getClassYear(deletingClass)).length === 0 && (
            <p className="text-xs text-red-500">Não há outra turma do mesmo ano para realocar os alunos. Crie outra turma do {getClassYear(deletingClass)}º ano primeiro.</p>
          )}

          <div className="flex gap-2">
            <Button onClick={deleteClass} disabled={!targetClass} variant="destructive">
              Excluir e Realocar
            </Button>
            <Button variant="outline" onClick={() => setDeletingClass(null)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Grade de horários */}
      {selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle>Horários - Turma {selectedClass}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
            ) : schedule.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">Nenhuma aula cadastrada para esta turma.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Horário</TableHead>
                      {DAYS.map((day) => (
                        <TableHead key={day} className="text-center">{day}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {times.map((time) => (
                      <TableRow key={time}>
                        <TableCell className="font-mono text-xs font-medium">{time}</TableCell>
                        {DAYS.map((day) => {
                          const item = getScheduleForDayAndTime(day, time);
                          return (
                            <TableCell key={day} className="text-center">
                              {item ? (
                                <div className="flex flex-col items-center gap-0.5">
                                  <Badge variant="secondary" className="text-xs">
                                    {item.subject}
                                  </Badge>
                                  <span className="text-[10px] text-muted-foreground">
                                    {getTeacherName(item.teacher_id)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
