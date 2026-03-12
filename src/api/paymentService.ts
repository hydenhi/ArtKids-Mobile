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
  itemType: "course" | "combo"; // Loại item
  itemId: string; // ID của khóa học hoặc combo
}

// Interface cho response từ backend
export interface PaymentResponse {
  success: boolean;
  paymentUrl: string;
  txnRef: string;
}

// API: Tạo thanh toán cho 1 khóa học
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

// API: Checkout giỏ hàng (sử dụng sau)
export const checkoutCart = async (courseIds: string[]) => {
  const response = await axiosClient.post("/payments/checkout-cart", {
    courseIds,
  });
  return response.data;
};
