import { mockUsers } from "./users";
import type { AuthUser } from "@/services/auth";

/**
 * Mock do Cognito para desenvolvimento local.
 * Substitui completamente o fluxo de autenticação real.
 */
export function mockLogin(email: string, password: string): Promise<AuthUser> {
  return new Promise((resolve, reject) => {
    // Simula latência de rede
    setTimeout(() => {
      const user = mockUsers.find((u) => u.email === email && u.password === password);

      if (!user) {
        reject(new Error("Credenciais inválidas. Tente: admin@escola.com / admin123"));
        return;
      }

      const fakeToken = btoa(JSON.stringify({
        sub: user.user_id,
        email: user.email,
        name: user.name,
        "cognito:groups": user.groups,
      }));

      localStorage.setItem("idToken", fakeToken);
      localStorage.setItem("userGroups", JSON.stringify(user.groups));
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userEmail", user.email);

      resolve({
        token: fakeToken,
        groups: user.groups,
        name: user.name,
        email: user.email,
      });
    }, 500);
  });
}

export function mockLogout() {
  localStorage.clear();
}

export function mockGetCurrentUser(): AuthUser | null {
  const token = localStorage.getItem("idToken");
  if (!token) return null;
  return {
    token,
    groups: JSON.parse(localStorage.getItem("userGroups") || "[]"),
    name: localStorage.getItem("userName") || "",
    email: localStorage.getItem("userEmail") || "",
  };
}
