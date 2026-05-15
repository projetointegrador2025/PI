import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PrivateRoute } from "@/components/PrivateRoute";
import Login from "@/pages/Login";
import AdminPortal from "@/pages/admin";
import TeacherPortal from "@/pages/teacher";
import StudentPortal from "@/pages/student";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin/*"
              element={
                <PrivateRoute allowedGroups={["Admin"]}>
                  <AdminPortal />
                </PrivateRoute>
              }
            />
            <Route
              path="/professor/*"
              element={
                <PrivateRoute allowedGroups={["Teacher"]}>
                  <TeacherPortal />
                </PrivateRoute>
              }
            />
            <Route
              path="/aluno/*"
              element={
                <PrivateRoute allowedGroups={["Student"]}>
                  <StudentPortal />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
