export interface AuthUser {
  token: string;
  groups: string[];
  name: string;
  email: string;
}

const isMockEnabled = import.meta.env.VITE_MOCK_ENABLED === "true";

export async function login(email: string, password: string): Promise<AuthUser> {
  if (isMockEnabled) {
    const { mockLogin } = await import("@/mocks/auth-mock");
    return mockLogin(email, password);
  }

  // Lazy import para evitar carregar cognito quando mock está ativo
  const { CognitoUserPool, CognitoUser, AuthenticationDetails } = await import("amazon-cognito-identity-js");
  const config = (await import("@/config")).default;

  const userPool = new CognitoUserPool({
    UserPoolId: config.COGNITO_USER_POOL_ID,
    ClientId: config.COGNITO_CLIENT_ID,
  });

  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });

    user.authenticateUser(authDetails, {
      onSuccess: (result) => {
        const idToken = result.getIdToken().getJwtToken();
        const payload = result.getIdToken().decodePayload();
        const groups: string[] = payload["cognito:groups"] || [];
        const name = payload.name || payload.email || email;

        localStorage.setItem("idToken", idToken);
        localStorage.setItem("userGroups", JSON.stringify(groups));
        localStorage.setItem("userName", name);
        localStorage.setItem("userEmail", email);

        resolve({ token: idToken, groups, name, email });
      },
      onFailure: (err) => reject(err),
    });
  });
}

export async function logout() {
  if (isMockEnabled) {
    localStorage.clear();
    return;
  }

  const { CognitoUserPool } = await import("amazon-cognito-identity-js");
  const config = (await import("@/config")).default;

  const userPool = new CognitoUserPool({
    UserPoolId: config.COGNITO_USER_POOL_ID,
    ClientId: config.COGNITO_CLIENT_ID,
  });

  const user = userPool.getCurrentUser();
  if (user) user.signOut();
  localStorage.clear();
}

export function getCurrentUser(): AuthUser | null {
  const token = localStorage.getItem("idToken");
  if (!token) return null;
  return {
    token,
    groups: JSON.parse(localStorage.getItem("userGroups") || "[]"),
    name: localStorage.getItem("userName") || "",
    email: localStorage.getItem("userEmail") || "",
  };
}
