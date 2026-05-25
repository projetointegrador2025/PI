import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { School, Moon, Sun } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [needsNewPassword, setNeedsNewPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (needsNewPassword) {
      if (newPassword !== confirmPassword) {
        setError("As senhas não coincidem");
        return;
      }
      if (newPassword.length < 8) {
        setError("A nova senha deve ter pelo menos 8 caracteres");
        return;
      }
    }

    setLoading(true);

    try {
      const result = await login(email, password, needsNewPassword ? newPassword : undefined);
      if (result.groups.includes("Admin")) navigate("/admin");
      else if (result.groups.includes("Teacher")) navigate("/professor");
      else if (result.groups.includes("Student")) navigate("/aluno");
    } catch (err: any) {
      if (err.code === "NEW_PASSWORD_REQUIRED") {
        setNeedsNewPassword(true);
        setError("Você precisa definir uma nova senha");
      } else {
        setError(err.message || "Credenciais inválidas");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute right-4 top-4">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <School className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">EduSystem</CardTitle>
          <CardDescription>
            {needsNewPassword
              ? "Defina sua nova senha para continuar"
              : "Entre com suas credenciais para acessar o sistema"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={needsNewPassword}
            />
            <Input
              id="password"
              label={needsNewPassword ? "Senha temporária" : "Senha"}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={needsNewPassword}
            />
            {needsNewPassword && (
              <>
                <Input
                  id="newPassword"
                  label="Nova senha"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <Input
                  id="confirmPassword"
                  label="Confirmar nova senha"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </>
            )}
            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : needsNewPassword ? "Definir senha e entrar" : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
