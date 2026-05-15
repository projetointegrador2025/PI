const config = {
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  COGNITO_USER_POOL_ID: import.meta.env.VITE_COGNITO_USER_POOL_ID || "",
  COGNITO_CLIENT_ID: import.meta.env.VITE_COGNITO_CLIENT_ID || "",
  COGNITO_REGION: import.meta.env.VITE_COGNITO_REGION || "us-east-1",
};

export default config;
