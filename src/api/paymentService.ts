import axiosClient from "./axiosClient";

// Set JWT token vào axios headers
export const setAuthToken = (token: string) => {
  if (token) {
    axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosClient.defaults.headers.common["Authorization"];
  }
};

// Interface cho payload tạo payment
export interface CreatePaymentPayload {
  itemType: "course" | "combo";
  itemId: string;
}

// Interface cho response từ backend
export interface PaymentResponse {
  success: boolean;
  flow?: "vnpay" | "free";
  paymentUrl?: string;
  txnRef?: string;
  message?: string;
}

// Interface cho check course in cart response
export interface CheckCourseInCartResponse {
  success: boolean;
  inCart: boolean;
  type?: "direct" | "combo";
  comboTitle?: string;
  comboId?: string;
  message: string;
}

// API: Tạo thanh toán cho 1 khóa học/combo
export const createPayment = async (
  payload: CreatePaymentPayload,
): Promise<PaymentResponse> => {
  const response = await axiosClient.post("/payments/create", payload);
  return response.data;
};

// API: Kiểm tra trạng thái thanh toán
export const getPaymentStatus = async (txnRef: string) => {
  const response = await axiosClient.get(`/payments/${txnRef}/status`);
  return response.data;
};

// API: Lấy danh sách thanh toán của tôi
export const getMyPayments = async () => {
  const response = await axiosClient.get("/payments/my-payments");
  return response.data;
};

// ✅ API: Check xem course có trong cart không
export const checkCourseInCart = async (
  courseId: string,
): Promise<CheckCourseInCartResponse> => {
  const response = await axiosClient.get(`/cart/check-course/${courseId}`);
  return response.data;
};

// ✅ API: Checkout toàn bộ giỏ hàng
export const checkoutCart = async (): Promise<PaymentResponse> => {
  const response = await axiosClient.post("/payments/checkout-cart");
  return response.data;
};

// ========== CART APIs ==========

// ✅ API: Get backend cart
export const getBackendCart = async () => {
  const response = await axiosClient.get("/cart");
  return response.data;
};

// ✅ API: Add item to backend cart
export const addToBackendCart = async (
  productId: string,
  productModel: "Course" | "Combo",
) => {
  const response = await axiosClient.post("/cart/add", {
    productId,
    productModel,
  });
  return response.data;
};

// ✅ API: Remove item from backend cart
export const removeFromBackendCart = async (productId: string) => {
  const response = await axiosClient.post("/cart/remove", {
    productId,
  });
  return response.data;
};

// ✅ API: Clear backend cart
export const clearBackendCart = async () => {
  const response = await axiosClient.post("/cart/clear");
  return response.data;
};

// ✅ API: Sync local cart to backend
export const syncCartToBackend = async (cartItems: any[]) => {
  try {
    console.log("📤 Starting cart sync to backend...");
    console.log("🛒 Items to sync:", cartItems.length);

    // Clear backend cart first
    await clearBackendCart();
    console.log("✅ Backend cart cleared");

    // Add all local items to backend
    for (const item of cartItems) {
      const productModel = item.isCombo ? "Combo" : "Course";
      await addToBackendCart(item._id, productModel);
      console.log(`✅ Added ${productModel}: ${item.title || item._id}`);
    }

    console.log("✅ Cart synced to backend successfully");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Failed to sync cart to backend:", error);
    console.error("❌ Error details:", error.response?.data);
    throw error;
  }
};
