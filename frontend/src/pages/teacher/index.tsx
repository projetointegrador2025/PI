import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { teacherNavItems } from "@/components/layout/Sidebar";
import TeacherDashboard from "./TeacherDashboard";
import TeacherStudents from "./TeacherStudents";
import TeacherGrades from "./TeacherGrades";
import TeacherNotes from "./TeacherNotes";
import TeacherAttendance from "./TeacherAttendance";

export default function TeacherPortal() {
  return (
    <DashboardLayout navItems={teacherNavItems}>
      <Routes>
        <Route index element={<TeacherDashboard />} />
        <Route path="alunos" element={<TeacherStudents />} />
        <Route path="notas" element={<TeacherGrades />} />
        <Route path="chamada" element={<TeacherAttendance />} />
        <Route path="anotacoes" element={<TeacherNotes />} />
      </Routes>
    </DashboardLayout>
  );
}
