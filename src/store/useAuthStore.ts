import { create } from 'zustand';

// Định nghĩa kiểu dữ liệu cho User dựa trên Model Database của bạn
interface User {
  _id: string;
  fullname: string;
  email: string;
  role: 'customer' | 'instructor' | 'staff' | 'admin';
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoggedIn: false, // Mặc định chưa đăng nhập

  login: async (userData, token) => {
    // Trong thực tế, bạn sẽ dùng AsyncStorage để lưu token vào bộ nhớ máy ở đây
    set({ user: userData, token: token, isLoggedIn: true });
  },

  logout: async () => {
    // Xóa token khỏi AsyncStorage ở đây
    set({ user: null, token: null, isLoggedIn: false });
  },
}));