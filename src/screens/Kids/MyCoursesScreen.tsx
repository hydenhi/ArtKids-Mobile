import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axiosClient from "../../api/axiosClient";

export default function MyCoursesScreen({ navigation }: any) {
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      console.log("⏳ Đang lấy danh sách khóa học của bé...");

      const response = await axiosClient.get("/users/enrolled-courses");

      const enrolledList = response.data?.data || [];

      const fullCourses = enrolledList.map((item: any) => ({
        ...item.course,
        progress: item.progress || 0,
      }));

      console.log(`Đã tải xong thông tin ${fullCourses.length} khóa học!`);
      setMyCourses(fullCourses);
    } catch (error: any) {
      console.log("Lỗi tải Bàn học:", error.response?.status, error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleContinueLearning = (courseId: string, slug: string) => {
    navigation.navigate("CourseDetail", {
      courseId: courseId,
      slug: slug,
    });
  };

  const totalCourses = myCourses.length;
  const averageProgress =
    totalCourses > 0
      ? Math.round(
          myCourses.reduce((sum, course) => sum + (course.progress || 0), 0) /
            totalCourses,
        )
      : 0;
  const completedCourses = myCourses.filter(
    (course) => (course.progress || 0) >= 100,
  ).length;

  // CỰC KỲ QUAN TRỌNG: Dùng 'focus' để mỗi lần bấm vào Tab Bàn Học nó đều gọi lại API để làm mới dữ liệu
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchMyCourses();
    });

    return unsubscribe;
  }, [navigation]);

  const renderCourseItem = ({ item }: { item: any }) => {
    const courseId = item._id;
    const title = item.title || "Khóa học nghệ thuật";
    const thumbnail =
      item.thumbnail &&
      !item.thumbnail.startsWith("data:") &&
      !item.thumbnail.includes("youtube")
        ? item.thumbnail
        : "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=400";
    const progress = item.progress || 0;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => handleContinueLearning(courseId, item.slug)}
      >
        <View style={styles.thumbWrap}>
          <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
          <View style={styles.thumbOverlayBadge}>
            <Ionicons name="color-palette" size={12} color="#F57F17" />
            <Text style={styles.thumbOverlayText}>Art</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Ionicons name="flame-outline" size={13} color="#FB8C00" />
              <Text style={styles.metaChipText}>Học đều mỗi ngày</Text>
            </View>
          </View>

          <View style={styles.progressRow}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progress}%` as any },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>

          <TouchableOpacity
            style={styles.studyButton}
            onPress={() => handleContinueLearning(courseId, item.slug)}
          >
            <Ionicons name="play" size={14} color="#0F766E" />
            <Text style={styles.studyButtonText}>Tiếp tục học</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => {
    return (
      <View>
        <View style={styles.heroWrap}>
          <Text style={styles.headerTitle}>Bàn học của bé</Text>
          <Text style={styles.headerSubtitle}>
            Theo dõi tiến độ và tiếp tục hành trình sáng tạo mỗi ngày.
          </Text>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: "#FFF7E6" }]}>
              <Ionicons name="book" size={18} color="#F59E0B" />
              <Text style={styles.statValue}>{totalCourses}</Text>
              <Text style={styles.statLabel}>Khóa đang học</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#E8F7FF" }]}>
              <Ionicons name="trending-up" size={18} color="#0284C7" />
              <Text style={styles.statValue}>{averageProgress}%</Text>
              <Text style={styles.statLabel}>Tiến độ trung bình</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#E9F8EF" }]}>
              <Ionicons name="trophy" size={18} color="#16A34A" />
              <Text style={styles.statValue}>{completedCourses}</Text>
              <Text style={styles.statLabel}>Đã hoàn thành</Text>
            </View>
          </View>
        </View>

        {totalCourses > 0 && (
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Khóa học của bé</Text>
            <Text style={styles.sectionCount}>{totalCourses} mục</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F6F8" />
      <View style={styles.bgStrokeOne} />
      <View style={styles.bgStrokeTwo} />

      {loading ? (
        <View style={styles.centerContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#0F766E" />
            <Text style={styles.loadingText}>Đang dọn dẹp bàn học...</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={myCourses}
          keyExtractor={(item, index) => item._id || index.toString()}
          renderItem={renderCourseItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/3069/3069172.png",
                }}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>Bàn học đang trống</Text>
              <Text style={styles.emptySubText}>
                Bé hãy nhờ bố mẹ mua khóa học để bắt đầu nhé!
              </Text>

              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => navigation.navigate("Home")}
              >
                <Text style={styles.exploreButtonText}>Đi khám phá ngay</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6F8" },
  bgStrokeOne: {
    position: "absolute",
    width: 230,
    height: 84,
    borderRadius: 28,
    backgroundColor: "#FFE9A9",
    right: -78,
    top: 72,
    transform: [{ rotate: "-14deg" }],
    opacity: 0.68,
  },
  bgStrokeTwo: {
    position: "absolute",
    width: 170,
    height: 68,
    borderRadius: 24,
    backgroundColor: "#B3E5FC",
    right: 18,
    top: 132,
    transform: [{ rotate: "12deg" }],
    opacity: 0.58,
  },
  heroWrap: {
    marginTop: 8,
    marginHorizontal: 16,
    marginBottom: 14,
  },
  headerTitle: { fontSize: 30, fontWeight: "900", color: "#2F3A43" },
  headerSubtitle: {
    fontSize: 14,
    color: "#708090",
    marginTop: 6,
    fontWeight: "600",
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E8EDF3",
  },
  statValue: {
    marginTop: 6,
    fontSize: 17,
    fontWeight: "900",
    color: "#2F3A43",
  },
  statLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
    color: "#778899",
  },
  sectionHeaderRow: {
    marginHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#3B4A58",
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: "700",
    color: "#90A0AE",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#E8EDF3",
    alignItems: "center",
    minWidth: 240,
  },
  loadingText: {
    marginTop: 10,
    color: "#78909C",
    fontSize: 14,
    fontWeight: "600",
  },
  listContainer: { paddingBottom: 30, paddingTop: 4 },

  card: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 22,
    padding: 12,
    marginBottom: 14,
    marginHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8EDF3",
    shadowColor: "#C9D7E6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  thumbWrap: {
    position: "relative",
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
  },
  thumbOverlayBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FFF5CC",
    borderWidth: 1,
    borderColor: "#FFE08A",
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  thumbOverlayText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#F57F17",
  },
  infoBox: { flex: 1, marginLeft: 15, justifyContent: "center" },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#37474F",
    marginBottom: 6,
  },
  metaRow: {
    marginBottom: 8,
  },
  metaChip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#FFF4E8",
    borderWidth: 1,
    borderColor: "#FFE1BF",
  },
  metaChipText: {
    fontSize: 11,
    color: "#D97706",
    fontWeight: "700",
  },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 7,
    backgroundColor: "#EAF4EE",
    borderRadius: 4,
    marginRight: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#0F766E",
    borderRadius: 4,
  },
  progressText: { fontSize: 12, fontWeight: "800", color: "#0F766E" },

  studyButton: {
    backgroundColor: "#E7F6F3",
    borderWidth: 1,
    borderColor: "#C8ECE5",
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  studyButtonText: { color: "#0F766E", fontWeight: "900", fontSize: 14 },

  emptyBox: {
    alignItems: "center",
    marginTop: 40,
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 24,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#E8EDF3",
  },
  emptyIcon: { width: 120, height: 120, opacity: 0.8, marginBottom: 15 },
  emptyText: {
    fontSize: 20,
    color: "#37474F",
    fontWeight: "800",
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    color: "#90A4AE",
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: "#FFE6B6",
    borderWidth: 1,
    borderColor: "#FFD486",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 18,
  },
  exploreButtonText: { color: "#BF360C", fontWeight: "900", fontSize: 16 },
});
