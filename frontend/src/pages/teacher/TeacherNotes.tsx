import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import api from "@/services/api";

interface Student {
  student_id: string;
  name?: string;
  class_id: string;
}

interface Note {
  note_id: string;
  note: string;
  created_at: string;
  teacher_id: string;
}

export default function TeacherNotes() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filterClass, setFilterClass] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const availableClasses = [...new Set(students.map((s) => s.class_id))].sort();
  const filteredStudents = filterClass === "all" ? students : students.filter((s) => s.class_id === filterClass);

  useEffect(() => { loadStudents(); }, []);

  useEffect(() => {
    if (selectedStudent) loadNotes(selectedStudent);
  }, [selectedStudent]);

  const loadStudents = async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data.data || []);
    } catch { /* empty */ }
  };

  const loadNotes = async (studentId: string) => {
    try {
      const res = await api.get("/teacher-notes", { params: { student_id: studentId } });
      setNotes(res.data.data || []);
    } catch { setNotes([]); }
  };

  const submitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !noteText.trim()) return;
    try {
      await api.post("/teacher-notes", { student_id: selectedStudent, note: noteText });
      setMessage({ text: "Anotação registrada!", type: "success" });
      setNoteText("");
      loadNotes(selectedStudent);
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || "Erro ao registrar", type: "error" });
    }
  };

  const studentName = students.find((s) => s.student_id === selectedStudent)?.name || "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Anotações</h1>
        <p className="text-muted-foreground">Registre observações sobre os alunos</p>
      </div>

      {message && (
        <div role="alert" className={`rounded-lg border px-4 py-3 text-sm font-medium ${message.type === "success" ? "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "border-red-300 bg-red-100 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300"}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-2 font-bold">×</button>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Nova Anotação</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submitNote} className="space-y-4">
            <div className="flex items-center gap-2 pb-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Todas as turmas</option>
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls}>Turma {cls}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Aluno *</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="">Selecione um aluno...</option>
                {filteredStudents.map((s) => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.name || s.student_id} ({s.class_id})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Anotação *</label>
              <textarea
                className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Escreva sua observação sobre o aluno..."
                required
              />
            </div>
            <Button type="submit" disabled={!selectedStudent || !noteText.trim()}>Salvar Anotação</Button>
          </form>
        </CardContent>
      </Card>

      {selectedStudent && notes.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Histórico - {studentName}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notes.map((n) => (
                <div key={n.note_id} className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
                  <p className="text-sm">{n.note}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(n.created_at)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedStudent && notes.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhuma anotação registrada para este aluno.</p>
      )}
    </div>
  );
}
