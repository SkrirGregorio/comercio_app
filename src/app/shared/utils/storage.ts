export const TOKEN_KEY = 'auth_token';

export const storage = {
  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  set token(value: string | null) {
    if (value) {
      localStorage.setItem(TOKEN_KEY, value);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
  }
};
