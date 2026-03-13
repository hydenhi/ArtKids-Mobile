import { create } from "zustand";
// REMOVE: import { persist } from "zustand/middleware";
import { addToBackendCart, removeFromBackendCart } from "../api/paymentService";

interface ShopState {
  cart: any[];
  wishlist: any[];
  addToCart: (item: any) => Promise<{ removed: any[] }>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => void;
  toggleWishlist: (course: any) => void;
  isInWishlist: (courseId: string) => boolean;
  isInCart: (courseId: string) => boolean;
  getCourseIdsInCombos: () => string[];
  removeFromWishlist: (courseIds: string[]) => void;
  clearWishlist: () => void;
}

// ✅ Bỏ persist middleware để tránh lỗi storage
export const useShopStore = create<ShopState>((set, get) => ({
  cart: [],
  wishlist: [],

  // ✅ Add to cart with backend sync (return immediately, sync in background)
  addToCart: async (item) => {
    const cart = get().cart;
    const removed: any[] = [];

    if (cart.find((cartItem) => cartItem._id === item._id)) {
      return { removed };
    }

    let newCart = [...cart];

    // Auto-remove conflicting courses when adding combo
    if (item.isCombo && item.courses) {
      const courseIdsInCombo = item.courses.map((c: any) =>
        typeof c === "string" ? c : c._id,
      );

      const removedCourses = newCart.filter(
        (cartItem) =>
          !cartItem.isCombo && courseIdsInCombo.includes(cartItem._id),
      );

      newCart = newCart.filter(
        (cartItem) =>
          cartItem.isCombo || !courseIdsInCombo.includes(cartItem._id),
      );

      removed.push(...removedCourses);

      // Remove from backend (don't await, fire and forget)
      for (const course of removedCourses) {
        removeFromBackendCart(course._id)
          .then(() => console.log(`🗑️ Removed "${course.title}" from backend`))
          .catch((err) => console.error("Failed to remove from backend:", err));
      }
    }

    // Update local cart immediately
    newCart.push(item);
    set({ cart: newCart });

    // Sync to backend (don't await, fire and forget)
    const productModel = item.isCombo ? "Combo" : "Course";
    addToBackendCart(item._id, productModel)
      .then(() =>
        console.log(`✅ Added "${item.title || item._id}" to backend cart`),
      )
      .catch((err) => console.error("❌ Failed to add to backend cart:", err));

    return { removed };
  },

  // ✅ Remove from cart (fire and forget backend sync)
  removeFromCart: async (itemId) => {
    set({ cart: get().cart.filter((item) => item._id !== itemId) });

    // Sync to backend (don't await)
    removeFromBackendCart(itemId)
      .then(() => console.log(`✅ Removed item ${itemId} from backend cart`))
      .catch((err) =>
        console.error("❌ Failed to remove from backend cart:", err),
      );
  },

  clearCart: () => set({ cart: [] }),

  getCourseIdsInCombos: () => {
    const cart = get().cart;
    const combos = cart.filter((item) => item.isCombo);

    const courseIds: string[] = [];
    combos.forEach((combo) => {
      if (combo.courses) {
        combo.courses.forEach((c: any) => {
          const id = typeof c === "string" ? c : c._id;
          if (id && !courseIds.includes(id)) {
            courseIds.push(id);
          }
        });
      }
    });

    return courseIds;
  },

  toggleWishlist: (course) => {
    const wishlist = get().wishlist;
    const exists = wishlist.find((item) => item._id === course._id);
    if (exists) {
      set({
        wishlist: wishlist.filter((item) => item._id !== course._id),
      });
    } else {
      set({ wishlist: [...wishlist, course] });
    }
  },

  removeFromWishlist: (courseIds) => {
    set({
      wishlist: get().wishlist.filter((item) => !courseIds.includes(item._id)),
    });
  },

  clearWishlist: () => set({ wishlist: [] }),

  isInWishlist: (courseId) => {
    return !!get().wishlist.find((item) => item._id === courseId);
  },

  isInCart: (courseId) => {
    return !!get().cart.find((item) => item._id === courseId);
  },
}));
