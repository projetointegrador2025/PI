import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/services/api";

interface ScheduleItem {
  day_of_week: string;
  time: string;
  subject: string;
  teacher_id: string;
}

export default function StudentSchedule() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadSchedule(); }, []);

  const loadSchedule = async () => {
    try {
      const res = await api.get("/schedule", { params: { class_id: "current" } });
      setSchedule(res.data.data || []);
    } catch { /* empty */ } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Grade de Aulas</h1>
        <p className="text-muted-foreground">Confira seus horários da semana</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Horários</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : schedule.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Nenhuma aula cadastrada para sua turma.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dia</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Disciplina</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.map((s, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{s.day_of_week}</TableCell>
                    <TableCell>{s.time}</TableCell>
                    <TableCell>{s.subject}</TableCell>
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
