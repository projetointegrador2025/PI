import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { studentNavItems } from "@/components/layout/Sidebar";
import StudentDashboard from "./StudentDashboard";
import StudentSchedule from "./StudentSchedule";

export default function StudentPortal() {
  return (
    <DashboardLayout navItems={studentNavItems}>
      <Routes>
        <Route index element={<StudentDashboard />} />
        <Route path="grade" element={<StudentSchedule />} />
      </Routes>
    </DashboardLayout>
  );
}
