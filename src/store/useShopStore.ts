import { create } from "zustand";

interface ShopState {
  cart: any[];
  wishlist: any[];
  addToCart: (course: any) => void;
  removeFromCart: (courseId: string) => void;
  clearCart: () => void;
  toggleWishlist: (course: any) => void;
  removeFromWishlist: (courseIds: string[]) => void; // MỚI: Xóa nhiều
  clearWishlist: () => void; // MỚI: Xóa tất cả
  isInWishlist: (courseId: string) => boolean;
  isInCart: (courseId: string) => boolean;
}

export const useShopStore = create<ShopState>((set, get) => ({
  cart: [],
  wishlist: [],

  // --- CÁC HÀM XỬ LÝ GIỎ HÀNG ---
  addToCart: (course) => {
    const cart = get().cart;
    if (!cart.find((item) => item._id === course._id)) {
      set({ cart: [...cart, course] });
    }
  },
  removeFromCart: (courseId) => {
    set({ cart: get().cart.filter((item) => item._id !== courseId) });
  },
  clearCart: () => set({ cart: [] }),

  // --- CÁC HÀM XỬ LÝ YÊU THÍCH (WISHLIST) ---
  toggleWishlist: (course) => {
    const wishlist = get().wishlist;
    const exists = wishlist.find((item) => item._id === course._id);
    if (exists) {
      set({ wishlist: wishlist.filter((item) => item._id !== course._id) });
    } else {
      set({ wishlist: [...wishlist, course] });
    }
  },

  // MỚI: Xóa danh sách các ID được chọn
  removeFromWishlist: (courseIds) => {
    set({
      wishlist: get().wishlist.filter((item) => !courseIds.includes(item._id)),
    });
  },

  // MỚI: Làm sạch toàn bộ danh sách
  clearWishlist: () => set({ wishlist: [] }),

  // --- CÁC HÀM KIỂM TRA TRẠNG THÁI ---
  isInWishlist: (courseId) => {
    return !!get().wishlist.find((item) => item._id === courseId);
  },
  isInCart: (courseId) => {
    return !!get().cart.find((item) => item._id === courseId);
  },
}));
