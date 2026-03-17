import axiosClient from "./axiosClient";

export interface LessonProgress {
  lesson: string;
  completedAt: string;
}

export interface ProgressResponse {
  success: boolean;
  data: LessonProgress[];
}

export interface MarkCompleteResponse {
  success: boolean;
  message: string;
}

/**
 * Đánh dấu bài học đã hoàn thành
 * @param lessonId ID của bài học
 */
export const markLessonComplete = async (lessonId: string): Promise<MarkCompleteResponse> => {
  const response = await axiosClient.post(`/lessons/${lessonId}/complete`);
  return response.data;
};

/**
 * Lấy danh sách các bài học đã hoàn thành của user trong một khóa học cụ thể
 * @param courseId ID của khóa học
 */
export const getCourseProgress = async (courseId: string): Promise<ProgressResponse> => {
  const response = await axiosClient.get(`/lessons/progress/${courseId}`);
  return response.data;
};
