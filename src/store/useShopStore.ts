import { create } from "zustand";

interface ShopState {
  cart: any[];
  wishlist: any[];
  addToCart: (course: any) => void;
  removeFromCart: (courseId: string) => void;
  clearCart: () => void;
  toggleWishlist: (course: any) => void;
  isInWishlist: (courseId: string) => boolean;
  isInCart: (courseId: string) => boolean;
}

export const useShopStore = create<ShopState>((set, get) => ({
  cart: [],
  wishlist: [],

  // --- CÁC HÀM XỬ LÝ GIỎ HÀNG ---
  addToCart: (course) => {
    const cart = get().cart;
    // Kiểm tra xem khóa học đã có trong giỏ chưa (dựa vào _id)
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
      // Nếu đã thả tim rồi thì bỏ tim (xóa khỏi mảng)
      set({ wishlist: wishlist.filter((item) => item._id !== course._id) });
    } else {
      // Nếu chưa thả tim thì thêm vào mảng
      set({ wishlist: [...wishlist, course] });
    }
  },

  // --- CÁC HÀM KIỂM TRA TRẠNG THÁI ---
  isInWishlist: (courseId) => {
    return !!get().wishlist.find((item) => item._id === courseId);
  },

  isInCart: (courseId) => {
    return !!get().cart.find((item) => item._id === courseId);
  },
}));
