const AUTH_KEY = 'milk_center_auth';

export interface AuthUser {
  username: string;
  isAuthenticated: boolean;
  loginTime: string;
}

export const login = (username: string, password: string): boolean => {
  // Simple authentication - in production, use proper auth
  // Default credentials: admin/admin123
  if (username === 'surendra' && password === 'dairy@123') {
    const user: AuthUser = {
      username,
      isAuthenticated: true,
      loginTime: new Date().toISOString(),
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return true;
  }
  return false;
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_KEY);
};

export const getAuthUser = (): AuthUser | null => {
  const data = localStorage.getItem(AUTH_KEY);
  if (data) {
    return JSON.parse(data);
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  const user = getAuthUser();
  return user?.isAuthenticated ?? false;
};
