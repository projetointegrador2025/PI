import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { adminNavItems } from "@/components/layout/Sidebar";
import AdminDashboard from "./AdminDashboard";
import AdminStudents from "./AdminStudents";
import AdminTeachers from "./AdminTeachers";
import AdminSchedule from "./AdminSchedule";

export default function AdminPortal() {
  return (
    <DashboardLayout navItems={adminNavItems}>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="alunos" element={<AdminStudents />} />
        <Route path="professores" element={<AdminTeachers />} />
        <Route path="grade" element={<AdminSchedule />} />
      </Routes>
    </DashboardLayout>
  );
}
