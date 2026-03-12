import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DrawerActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import axiosClient from "../../api/axiosClient";
import { useShopStore } from "../../store/useShopStore";

export default function CourseDetailScreen({ route, navigation }: any) {
  const { courseId, slug } = route.params || {};

  const [activeTab, setActiveTab] = useState("curriculum");
  const [course, setCourse] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const toggleWishlist = useShopStore((state) => state.toggleWishlist);
  const isInWishlist = useShopStore((state) => state.isInWishlist);
  const addToCart = useShopStore((state) => state.addToCart);
  const isInCart = useShopStore((state) => state.isInCart);

  const isLiked = course ? isInWishlist(course._id) : false;
  const alreadyInCart = course ? isInCart(course._id) : false;

  useEffect(() => {
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
          reviewRes.data?.reviews ||
          reviewRes.data?.data ||
          reviewRes.data ||
          [];
        const enrolledStatus =
          enrollCheckRes.data?.isEnrolled ||
          enrollCheckRes.data?.enrolled ||
          enrollCheckRes.data?.data?.isEnrolled ||
          false;

        setCourse(courseData);
        setReviews(reviewsData);
        setIsEnrolled(enrolledStatus);
      } catch (error: any) {
        Alert.alert(
          "Lỗi",
          "Không thể tải chi tiết khóa học. Vui lòng thử lại sau!",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetail();
  }, [courseId, slug]);

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
      Alert.alert("Yêu thích 💖", "Đã thêm khóa học vào danh sách Yêu thích!");
  };

  const handleAddToCart = () => {
    if (!course) return;
    if (isEnrolled) {
      Alert.alert(
        "Đã sở hữu",
        "Bé đã có khóa học này rồi, hãy vào Bàn học để xem nhé!",
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
    if (reviews.length === 0)
      return (
        <Text style={styles.emptyText}>
          Chưa có đánh giá nào cho khóa học này.
        </Text>
      );
    return (
      <View style={styles.tabContent}>
        {reviews.map((review: any, index: number) => (
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
        ))}
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
            {/* CỤM NÚT TRÁI (Nút Quay lại) */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="#37474F" />
            </TouchableOpacity>

            {/* CỤM NÚT PHẢI (Menu + Trái tim) */}
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
                {course.averageRating || "5.0"} ({course.numOfReviews || 0})
              </Text>
            </View>
            <Text style={styles.price}>
              {course.price === 0 ? "Miễn phí" : `$${course.price}`}
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
        <TouchableOpacity
          style={[
            styles.buyButton,
            isEnrolled && { backgroundColor: "#0984E3", marginRight: 0 },
          ]}
          onPress={
            isEnrolled
              ? () =>
                  navigation.navigate("Learning", {
                    courseTitle: course?.title,
                    sections: course?.sections,
                  })
              : handleAddToCart
          }
        >
          <Text style={styles.buyButtonText}>
            {isEnrolled ? "Vào học ngay 🚀" : "Mua Khóa Học"}
          </Text>
        </TouchableOpacity>
        {!isEnrolled && (
          <TouchableOpacity
            style={[
              styles.cartIconButton,
              alreadyInCart && {
                backgroundColor: "#E8F5E9",
                borderColor: "#4CD137",
              },
            ]}
            onPress={handleAddToCart}
          >
            <Ionicons
              name={alreadyInCart ? "cart" : "cart-outline"}
              size={28}
              color={alreadyInCart ? "#4CD137" : "#FF8A80"}
            />
          </TouchableOpacity>
        )}
      </View>
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
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  cartIconButton: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#FF8A80",
    backgroundColor: "#FFF",
    marginLeft: 15,
  },
  buyButton: {
    flex: 1,
    backgroundColor: "#FF8A80",
    paddingVertical: 16,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  buyButtonText: { color: "#FFF", fontSize: 18, fontWeight: "900" },
});
