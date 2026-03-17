import axiosClient from "./axiosClient";

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const changePassword = async (payload: ChangePasswordPayload) => {
  const response = await axiosClient.patch("/users/change-password", payload);
  return response.data;
};
