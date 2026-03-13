import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DrawerActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import axiosClient from "../../api/axiosClient";
import { useShopStore } from "../../store/useShopStore";
import { useFocusEffect } from "@react-navigation/native";
import { createPayment } from "../../api/paymentService";

// IMPORT CUSTOM TOAST
import CustomToast from "../../components/CustomToast";

export default function CourseDetailScreen({ route, navigation }: any) {
  const { courseId, slug } = route.params || {};

  const [activeTab, setActiveTab] = useState("curriculum");
  const [course, setCourse] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const isFirstMount = useRef(true);

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [courseInComboWarning, setCourseInComboWarning] = useState<
    string | null
  >(null);

  // --- STATE CHO CHỨC NĂNG ĐÁNH GIÁ ---
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // STATE ĐỂ QUẢN LÝ THÔNG BÁO (TOAST)
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as any,
  });

  // =========================================================
  // FIX LỖI REACTIVE (TRÁI TIM ĐỔI MÀU NGAY LẬP TỨC)
  // Phải lắng nghe trực tiếp mảng wishlist và cart từ Zustand
  // =========================================================
  const toggleWishlist = useShopStore((state) => state.toggleWishlist);
  const addToCart = useShopStore((state) => state.addToCart);
  const getCourseIdsInCombos = useShopStore(
    (state) => state.getCourseIdsInCombos,
  );

  const wishlist = useShopStore((state) => state.wishlist);
  const cart = useShopStore((state) => state.cart);

  const isLiked = course
    ? wishlist.some((item: any) => item._id === course._id)
    : false;
  const alreadyInCart = course
    ? cart.some((item: any) => item._id === course._id)
    : false;
  const isCourseInCombo = course
    ? getCourseIdsInCombos().includes(course._id)
    : false;

  // HÀM HIỂN THỊ TOAST TỰ ẨN SAU 2 GIÂY
  const showToast = (
    message: string,
    type: "success" | "info" | "warning" = "success",
  ) => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2000);
  };

  const fetchCourseDetail = async () => {
    if (!courseId && !slug) return;

    try {
      setLoading(true);
      const fetchIdentifier = slug || courseId;
      const validCourseId = courseId || slug;

      const [courseRes, reviewRes, enrollCheckRes] = await Promise.all([
        axiosClient.get(`/courses/${fetchIdentifier}`),
        axiosClient
          .get(`/reviews/course/${validCourseId}`)
          .catch(() => ({ data: [] })),
        axiosClient
          .get(`/users/enroll/${validCourseId}/check`)
          .catch(() => ({ data: { isEnrolled: false } })),
      ]);

      const courseData =
        courseRes.data?.course || courseRes.data?.data || courseRes.data;
      const reviewsData =
        reviewRes.data?.reviews || reviewRes.data?.data || reviewRes.data || [];

      const enrolledStatus =
        enrollCheckRes.data?.isEnrolled ||
        enrollCheckRes.data?.enrolled ||
        enrollCheckRes.data?.data?.isEnrolled ||
        false;

      setCourse(courseData);
      setReviews(reviewsData);
      setIsEnrolled(enrolledStatus);
    } catch (error: any) {
      console.error("Fetch course error:", error);
      Alert.alert(
        "Lỗi",
        "Không thể tải chi tiết khóa học. Vui lòng thử lại sau!",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetail();
  }, [courseId, slug]);

  useFocusEffect(
    React.useCallback(() => {
      if (isFirstMount.current) {
        isFirstMount.current = false;
        return;
      }
      fetchCourseDetail();
    }, []),
  );

  const handleBuyNow = async () => {
    if (!course) return;

    if (isEnrolled) {
      Alert.alert("Đã sở hữu", "Bé đã có khóa học này rồi!");
      return;
    }

    Alert.alert(
      "Xác nhận thanh toán",
      `Bạn muốn mua khóa học "${course.title}" với giá ${course.price?.toLocaleString("vi-VN")} đ?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          onPress: async () => {
            try {
              setIsProcessingPayment(true);

              const paymentData = await createPayment({
                itemType: "course",
                itemId: course._id,
              });

              if (paymentData.success && paymentData.paymentUrl) {
                navigation.navigate("PaymentWebview", {
                  paymentUrl: paymentData.paymentUrl,
                  txnRef: paymentData.txnRef,
                  courseId: course._id,
                });
              } else {
                Alert.alert(
                  "Lỗi",
                  "Không thể tạo thanh toán. Vui lòng thử lại!",
                );
              }
            } catch (error: any) {
              console.error("Payment error:", error);
              Alert.alert(
                "Lỗi thanh toán",
                error.response?.data?.message ||
                  "Không thể tạo thanh toán. Vui lòng thử lại!",
              );
            } finally {
              setIsProcessingPayment(false);
            }
          },
        },
      ],
    );
  };

  const handlePressLesson = (lesson: any) => {
    const isFreeOrTrial = lesson.isTrial || lesson.isFree || false;
    if (isEnrolled || isFreeOrTrial) {
      navigation.navigate("Learning", {
        courseTitle: course?.title,
        sections: course?.sections,
        initialLesson: lesson,
      });
    } else {
      Alert.alert(
        "Khóa học bị khóa",
        "Bé hãy nhờ bố mẹ mua khóa học để xem bài này nhé! 🔒",
      );
    }
  };

  const handleToggleWishlist = () => {
    if (!course) return;
    toggleWishlist(course);
    if (!isLiked)
      showToast("Đã thêm khóa học vào danh sách Yêu thích!", "success");
    else showToast("Đã bỏ khỏi danh sách Yêu thích", "info");
  };

  const handleAddToCart = async () => {
    if (!course) return;

    if (isEnrolled) {
      Alert.alert(
        "Đã sở hữu",
        "Bé đã có khóa học này rồi, hãy vào Bàn học để xem nhé!",
      );
      return;
    }

    if (isCourseInCombo) {
      Alert.alert(
        "Không thể thêm vào giỏ",
        courseInComboWarning ||
          "Khóa học này đã có trong một Combo ở giỏ hàng.",
        [
          { text: "Ở lại", style: "cancel" },
          {
            text: "Đi đến Giỏ hàng",
            onPress: () => navigation.navigate("Cart"),
          },
        ],
      );
      return;
    }

    if (alreadyInCart) {
      Alert.alert("Giỏ hàng", "Khóa học này đã có trong giỏ hàng rồi nhé!", [
        { text: "Đi đến Giỏ hàng", onPress: () => navigation.navigate("Cart") },
        { text: "Ở lại", style: "cancel" },
      ]);
      return;
    }

    addToCart(course);

    Alert.alert(
      "Thành công! 🛒",
      "Đã thêm khóa học vào Giỏ hàng của phụ huynh!",
      [
        { text: "Ở lại trang", style: "cancel" },
        { text: "Đi đến Giỏ hàng", onPress: () => navigation.navigate("Cart") },
      ],
    );
  };

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung đánh giá!");
      return;
    }

    try {
      setIsSubmittingReview(true);
      await axiosClient.post("/reviews", {
        courseId: course._id,
        rating,
        comment,
      });

      showToast("Cảm ơn bạn đã đánh giá!", "success");
      setIsReviewModalVisible(false);
      setComment("");
      setRating(5);

      fetchCourseDetail();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message;
      if (errorMsg && errorMsg.includes("đã đánh giá")) {
        Alert.alert("Thông báo", "Bạn đã đánh giá khóa học này rồi!");
      } else {
        Alert.alert(
          "Lỗi",
          "Không thể gửi đánh giá lúc này. Vui lòng thử lại sau.",
        );
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const renderCurriculum = () => {
    if (!course?.sections || course.sections.length === 0)
      return (
        <Text style={styles.emptyText}>Giáo trình đang được cập nhật...</Text>
      );
    return (
      <View style={styles.tabContent}>
        {course.sections.map((section: any, index: number) => (
          <View key={section._id || index} style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>
              {section.title || `Chương ${index + 1}`}
            </Text>
            {(section.lessonsId || section.lessons) &&
              (section.lessonsId || section.lessons).map(
                (lesson: any, lIndex: number) => {
                  const canPlay = isEnrolled || lesson.isTrial || lesson.isFree;
                  return (
                    <TouchableOpacity
                      key={lesson._id || lIndex}
                      style={styles.lessonItem}
                      onPress={() => handlePressLesson(lesson)}
                    >
                      <View style={styles.lessonLeft}>
                        <View
                          style={[
                            styles.iconBox,
                            canPlay ? styles.iconBoxFree : styles.iconBoxLocked,
                          ]}
                        >
                          <Ionicons
                            name={canPlay ? "play" : "lock-closed"}
                            size={16}
                            color={canPlay ? "#00B894" : "#B2BEC3"}
                          />
                        </View>
                        <Text
                          style={[
                            styles.lessonTitle,
                            !canPlay && { color: "#B2BEC3" },
                          ]}
                        >
                          {lesson.title || `Bài học ${lIndex + 1}`}
                        </Text>
                      </View>
                      <Text style={styles.lessonDuration}>
                        {lesson.duration || "0"}m
                      </Text>
                    </TouchableOpacity>
                  );
                },
              )}
          </View>
        ))}
      </View>
    );
  };

  const renderInstructor = () => {
    const instructor = course?.instructor;
    if (!instructor)
      return (
        <Text style={styles.emptyText}>
          Thông tin giáo viên đang cập nhật...
        </Text>
      );
    return (
      <View style={styles.tabContent}>
        <View style={styles.instructorCard}>
          <Image
            source={{
              uri:
                instructor.avatar ||
                "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",
            }}
            style={styles.instructorAvatar}
          />
          <View style={styles.instructorInfo}>
            <Text style={styles.instructorName}>
              {instructor.name || instructor.fullname || "Giáo viên ArtKids"}
            </Text>
            <Text style={styles.instructorRole}>Giảng viên Nghệ thuật</Text>
          </View>
        </View>
        <Text style={styles.instructorBio}>
          {instructor.bio ||
            "Một họa sĩ tài năng và đầy tâm huyết với giáo dục trẻ em."}
        </Text>
      </View>
    );
  };

  const renderReviews = () => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.reviewTabHeader}>
          <Text style={styles.sectionTitle}>Đánh giá từ học viên</Text>
          {isEnrolled && (
            <TouchableOpacity
              style={styles.writeReviewBtn}
              onPress={() => setIsReviewModalVisible(true)}
            >
              <Ionicons name="pencil" size={16} color="#FFF" />
              <Text style={styles.writeReviewText}>Viết đánh giá</Text>
            </TouchableOpacity>
          )}
        </View>

        {reviews.length === 0 ? (
          <Text style={styles.emptyText}>
            Chưa có đánh giá nào cho khóa học này.
          </Text>
        ) : (
          reviews.map((review: any, index: number) => (
            <View key={review._id || index} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewUser}>
                  {review.user?.fullname || "Phụ huynh"}
                </Text>
                <View style={styles.starsRow}>
                  {[...Array(review.rating || 5)].map((_, i) => (
                    <Ionicons key={i} name="star" size={14} color="#FFA000" />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewComment}>
                {review.comment || review.content}
              </Text>
            </View>
          ))
        )}
      </View>
    );
  };

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8A80" />
        <Text style={{ marginTop: 10, color: "#78909C" }}>
          Đang tải khóa học...
        </Text>
      </View>
    );
  if (!course)
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 18, color: "#D63031", fontWeight: "bold" }}>
          Không tìm thấy khóa học!
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 20,
            padding: 10,
            backgroundColor: "#FF8A80",
            borderRadius: 10,
          }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: "#FFF", fontWeight: "bold" }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={styles.container}>
      <CustomToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
      />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.headerImageContainer}>
          <Image
            source={{
              uri:
                course.thumbnail ||
                "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=400",
            }}
            style={styles.thumbnail}
          />
          <SafeAreaView style={styles.floatingHeader}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="#37474F" />
            </TouchableOpacity>

            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={[styles.iconButton, { marginRight: 10 }]}
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              >
                <Ionicons name="menu" size={24} color="#37474F" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleToggleWishlist}
              >
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={24}
                  color="#FF5252"
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.mainInfo}>
          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.description}>{course.description}</Text>
          <View style={styles.statsRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={16} color="#FFA000" />
              <Text style={styles.ratingText}>
                {course.averageRating || "0"} ({course.numOfReviews || 0})
              </Text>
            </View>
            <Text style={styles.price}>
              {course.price === 0
                ? "Miễn phí"
                : `${course.price?.toLocaleString("vi-VN")} đ`}
            </Text>
          </View>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity
            onPress={() => setActiveTab("curriculum")}
            style={[
              styles.tabButton,
              activeTab === "curriculum" && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "curriculum" && styles.tabTextActive,
              ]}
            >
              Giáo trình
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("instructor")}
            style={[
              styles.tabButton,
              activeTab === "instructor" && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "instructor" && styles.tabTextActive,
              ]}
            >
              Giáo viên
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("reviews")}
            style={[
              styles.tabButton,
              activeTab === "reviews" && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "reviews" && styles.tabTextActive,
              ]}
            >
              Đánh giá
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentArea}>
          {activeTab === "curriculum" && renderCurriculum()}
          {activeTab === "instructor" && renderInstructor()}
          {activeTab === "reviews" && renderReviews()}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {!isEnrolled && (
          <>
            {isCourseInCombo && courseInComboWarning && (
              <View style={styles.warningBanner}>
                <Ionicons name="information-circle" size={20} color="#FF9800" />
                <Text style={styles.warningBannerText} numberOfLines={2}>
                  {courseInComboWarning}
                </Text>
              </View>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  isCourseInCombo && styles.disabledButton,
                ]}
                onPress={handleAddToCart}
                disabled={isCourseInCombo || isProcessingPayment}
              >
                <Ionicons
                  name="cart-outline"
                  size={18}
                  color={isCourseInCombo ? "#B0BEC5" : "#FF8A80"}
                />
                <Text
                  style={[
                    styles.secondaryButtonText,
                    isCourseInCombo && styles.disabledButtonText,
                  ]}
                >
                  {isCourseInCombo ? "Đã có trong Combo" : "Thêm vào giỏ"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  isProcessingPayment && { opacity: 0.7 },
                ]}
                onPress={handleBuyNow}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Mua ngay</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        {isEnrolled && (
          <TouchableOpacity
            style={styles.enrolledButton}
            onPress={() =>
              navigation.navigate("Learning", {
                courseTitle: course?.title,
                sections: course?.sections,
              })
            }
          >
            <Text style={styles.primaryButtonText}>Vào học ngay 🚀</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* --- MODAL VIẾT ĐÁNH GIÁ --- */}
      <Modal
        visible={isReviewModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsReviewModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Viết đánh giá</Text>
              <TouchableOpacity onPress={() => setIsReviewModalVisible(false)}>
                <Ionicons name="close" size={28} color="#37474F" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubTitle}>
              Bạn thấy khóa học này thế nào?
            </Text>

            <View style={styles.ratingSelectRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={40}
                    color="#FFA000"
                    style={{ marginHorizontal: 5 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              placeholder="Chia sẻ cảm nhận của bạn về khóa học..."
              placeholderTextColor="#90A4AE"
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
            />

            <TouchableOpacity
              style={[
                styles.submitReviewBtn,
                isSubmittingReview && { opacity: 0.7 },
              ]}
              onPress={handleSubmitReview}
              disabled={isSubmittingReview}
            >
              {isSubmittingReview ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitReviewText}>Gửi Đánh Giá</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFBF7" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FDFBF7",
  },
  emptyText: {
    fontSize: 15,
    color: "#90A4AE",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
  },
  headerImageContainer: { position: "relative", width: "100%", height: 280 },
  thumbnail: {
    width: "100%",
    height: "100%",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  floatingHeader: {
    position: "absolute",
    top: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainInfo: { padding: 20, marginTop: -15 },
  title: { fontSize: 24, fontWeight: "900", color: "#37474F", marginBottom: 8 },
  description: {
    fontSize: 14,
    color: "#78909C",
    lineHeight: 22,
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9C4",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFA000",
    marginLeft: 5,
  },
  price: { fontSize: 24, fontWeight: "900", color: "#FF8A80" },
  tabBar: { flexDirection: "row", paddingHorizontal: 20, marginBottom: 10 },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  tabButtonActive: { backgroundColor: "#FFF9C4" },
  tabText: { fontSize: 15, fontWeight: "bold", color: "#B0BEC5" },
  tabTextActive: { color: "#FFA000" },
  contentArea: { paddingHorizontal: 20, paddingBottom: 100 },
  tabContent: { marginTop: 10 },
  sectionBlock: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#37474F",
    marginBottom: 12,
  },
  lessonItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  lessonLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconBoxFree: { backgroundColor: "#E8F5E9" },
  iconBoxLocked: { backgroundColor: "#F5F5F5" },
  lessonTitle: { fontSize: 15, fontWeight: "600", color: "#37474F", flex: 1 },
  lessonDuration: { fontSize: 13, color: "#90A4AE", fontWeight: "bold" },
  instructorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
  },
  instructorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E0F7FA",
    marginRight: 15,
  },
  instructorInfo: { flex: 1 },
  instructorName: { fontSize: 18, fontWeight: "bold", color: "#37474F" },
  instructorRole: {
    fontSize: 14,
    color: "#FF8A80",
    marginTop: 4,
    fontWeight: "bold",
  },
  instructorBio: { fontSize: 14, color: "#78909C", lineHeight: 22 },

  reviewTabHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  writeReviewBtn: {
    flexDirection: "row",
    backgroundColor: "#00B894",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignItems: "center",
  },
  writeReviewText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 13,
    marginLeft: 5,
  },
  reviewCard: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewUser: { fontSize: 15, fontWeight: "bold", color: "#37474F" },
  starsRow: { flexDirection: "row" },
  reviewComment: { fontSize: 14, color: "#78909C", lineHeight: 20 },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#FFF",
    padding: 20,
    paddingBottom: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#FF8A80",
    gap: 6,
  },
  secondaryButtonText: { color: "#FF8A80", fontSize: 14, fontWeight: "700" },
  primaryButton: {
    flex: 2,
    backgroundColor: "#FF8A80",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: { color: "#FFF", fontSize: 15, fontWeight: "900" },
  enrolledButton: {
    backgroundColor: "#0984E3",
    padding: 16,
    borderRadius: 25,
    alignItems: "center",
    width: "100%",
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 10,
    gap: 8,
  },
  warningBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#F57C00",
  },
  disabledButton: { backgroundColor: "#F5F5F5", borderColor: "#E0E0E0" },
  disabledButtonText: { color: "#B0BEC5" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    minHeight: 350,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: { fontSize: 20, fontWeight: "900", color: "#37474F" },
  modalSubTitle: {
    fontSize: 15,
    color: "#78909C",
    textAlign: "center",
    marginBottom: 20,
  },
  ratingSelectRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 25,
  },
  reviewInput: {
    backgroundColor: "#F5F6FA",
    borderRadius: 15,
    padding: 15,
    fontSize: 15,
    color: "#2D3436",
    textAlignVertical: "top",
    minHeight: 100,
    marginBottom: 20,
  },
  submitReviewBtn: {
    backgroundColor: "#0984E3",
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitReviewText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});
