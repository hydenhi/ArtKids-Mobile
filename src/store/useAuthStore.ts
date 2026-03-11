import { create } from "zustand";
import { setAuthToken } from "../api/paymentService";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  _id: string;
  fullname: string;
  email: string;
  role: "customer" | "instructor" | "staff" | "admin";
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean; // Thêm state loading
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>; // Thêm hàm load token
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoggedIn: false,
  isLoading: true, // App đang load token

  login: async (userData, token) => {
    set({ user: userData, token: token, isLoggedIn: true });
    await AsyncStorage.setItem("authToken", token);
    await AsyncStorage.setItem("userData", JSON.stringify(userData));
    setAuthToken(token); // Set vào axios header
  },

  logout: async () => {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("userData");
    setAuthToken(""); // Xóa token khỏi axios header
    set({ user: null, token: null, isLoggedIn: false });
  },

  // ✨ HÀM MỚI: Load token khi app khởi động
  loadStoredAuth: async () => {
    try {
      const [storedToken, storedUserData] = await Promise.all([
        AsyncStorage.getItem("authToken"),
        AsyncStorage.getItem("userData"),
      ]);

      if (storedToken && storedUserData) {
        const userData = JSON.parse(storedUserData);
        setAuthToken(storedToken); // Quan trọng: Set vào axios header
        set({
          user: userData,
          token: storedToken,
          isLoggedIn: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Failed to load stored auth:", error);
      set({ isLoading: false });
    }
  },
}));
