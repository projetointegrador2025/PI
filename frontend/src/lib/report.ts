import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { parseCurrency, formatCurrency } from "./masks";
import { mean, median } from "./utils";

export interface ReportStudent {
  student_id: string;
  name?: string;
  class_id: string;
  family_income?: string;
  people_in_house?: number;
}

export interface ReportAverage {
  student_id: string;
  average: string; // média de notas (ex "7.5" ou "N/A")
}

interface ReportOptions {
  classLabel: string; // "Todas as turmas" ou "Turma X"
}

/**
 * Gera e dispara o download de um PDF com dados dos alunos (renda e notas)
 * mais estatísticas de renda e notas da escola (média e mediana).
 */
export function generateStudentReport(
  students: ReportStudent[],
  averages: ReportAverage[],
  options: ReportOptions
): void {
  const avgByStudent = new Map(averages.map((a) => [a.student_id, a.average]));

  // Monta linhas e coleta valores numéricos para estatísticas
  const incomeValues: number[] = [];
  const perCapitaValues: number[] = [];
  const gradeValues: number[] = [];

  const rows = students
    .slice()
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
    .map((s) => {
      const income = parseCurrency(s.family_income || "");
      const people = s.people_in_house || 0;
      const hasIncome = !isNaN(income) && income > 0;
      const perCapita = hasIncome && people > 0 ? income / people : NaN;

      const avgStr = avgByStudent.get(s.student_id);
      const avgNum = avgStr && avgStr !== "N/A" ? parseFloat(avgStr) : NaN;

      if (hasIncome) incomeValues.push(income);
      if (!isNaN(perCapita)) perCapitaValues.push(perCapita);
      if (!isNaN(avgNum)) gradeValues.push(avgNum);

      return [
        s.name || "—",
        s.class_id || "—",
        hasIncome ? formatCurrency(income) : "—",
        people > 0 ? String(people) : "—",
        !isNaN(perCapita) ? formatCurrency(perCapita) : "—",
        !isNaN(avgNum) ? avgNum.toFixed(1) : "N/A",
      ];
    });

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Cabeçalho
  doc.setFontSize(16);
  doc.text("Relatório de Alunos — Renda e Notas", pageWidth / 2, 18, { align: "center" });
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(options.classLabel, pageWidth / 2, 25, { align: "center" });
  const now = new Date().toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  doc.text(`Gerado em ${now}`, pageWidth / 2, 31, { align: "center" });
  doc.setTextColor(0);

  // Resumo estatístico
  const fmtMoney = (v: number) => (isNaN(v) ? "—" : formatCurrency(v));
  const fmtGrade = (v: number) => (isNaN(v) ? "—" : v.toFixed(1));

  autoTable(doc, {
    startY: 38,
    head: [["Indicador", "Média", "Mediana"]],
    body: [
      ["Renda familiar mensal", fmtMoney(mean(incomeValues)), fmtMoney(median(incomeValues))],
      ["Renda per capita", fmtMoney(mean(perCapitaValues)), fmtMoney(median(perCapitaValues))],
      ["Nota dos alunos", fmtGrade(mean(gradeValues)), fmtGrade(median(gradeValues))],
    ],
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235] },
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  });

  // Tabela de alunos
  const afterSummary = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 60;
  doc.setFontSize(12);
  doc.text(`Alunos (${rows.length})`, 14, afterSummary + 10);

  autoTable(doc, {
    startY: afterSummary + 14,
    head: [["Nome", "Turma", "Renda familiar", "Pessoas", "Renda per capita", "Média"]],
    body: rows,
    theme: "striped",
    headStyles: { fillColor: [37, 99, 235] },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  const stamp = new Date().toISOString().slice(0, 10);
  const classSlug = options.classLabel.replace(/[^\w]+/g, "-").toLowerCase();
  doc.save(`relatorio-alunos-${classSlug}-${stamp}.pdf`);
}
