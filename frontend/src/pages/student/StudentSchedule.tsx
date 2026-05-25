import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/services/api";

interface ScheduleItem {
  day_of_week: string;
  time: string;
  subject: string;
  teacher_id: string;
  teacher_name?: string;
}

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

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

  const getScheduleForDayAndTime = (day: string, time: string) => {
    return schedule.find((s) => s.day_of_week === day && s.time === time);
  };

  const times = [...new Set(schedule.map((s) => s.time))].sort();

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
                                {item.teacher_name && (
                                  <span className="text-[10px] text-muted-foreground">
                                    {item.teacher_name}
                                  </span>
                                )}
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
    </div>
  );
}
