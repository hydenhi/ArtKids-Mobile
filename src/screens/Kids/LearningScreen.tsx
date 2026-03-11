import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Dữ liệu giả lập cho danh sách bài học khớp với thiết kế
const MOCK_LESSONS = [
  {
    id: "l1",
    title: "Bài 1: Làm quen với cọ vẽ",
    completed: true,
    isCurrent: false,
    locked: false,
  },
  {
    id: "l2",
    title: "Bài 2: Pha màu cơ bản",
    completed: false,
    isCurrent: true,
    locked: false,
  },
  {
    id: "l3",
    title: "Bài 3: Vẽ khu rừng diệu kỳ",
    completed: false,
    isCurrent: false,
    locked: true,
  },
  {
    id: "l4",
    title: "Bài 4: Vẽ bầu trời đêm",
    completed: false,
    isCurrent: false,
    locked: true,
  },
  {
    id: "l5",
    title: "Bài 5: Hoàn thiện bức tranh",
    completed: false,
    isCurrent: false,
    locked: true,
  },
];

export default function LearningScreen({ route, navigation }: any) {
  // Lấy tên khóa học từ màn trước (nếu có)
  const { courseTitle = "Khóa học nghệ thuật" } = route.params || {};

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Video Player Placeholder (Giữ an toàn cho máy ảo) */}
        <View style={styles.videoContainer}>
          <View style={styles.mockVideoBox}>
            <Ionicons name="play-circle" size={70} color="#FF8A80" />
            <Text style={styles.mockVideoText}>
              Video bài giảng sẽ phát ở đây
            </Text>
          </View>
          {/* Thanh tiến độ giả lập bên dưới video */}
          <View style={styles.videoProgressBar}>
            <View style={[styles.videoProgressFill, { width: "45%" }]} />
          </View>
          <View style={styles.videoTimeRow}>
            <Text style={styles.timeText}>0:45</Text>
            <Text style={styles.timeText}>10:00</Text>
          </View>
        </View>

        {/* Thông tin bài học hiện tại */}
        <View style={styles.currentLessonInfo}>
          <Text style={styles.subTitle}>Current Lesson:</Text>
          <Text style={styles.mainTitle}>Bài 2: Pha màu cơ bản</Text>
        </View>

        {/* Danh sách các bài học (Curriculum List) */}
        <View style={styles.lessonListContainer}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Lesson points</Text>
            <Text style={styles.accessText}>
              Access{" "}
              <Ionicons name="checkmark-circle" color="#00B894" size={16} />
            </Text>
          </View>

          {MOCK_LESSONS.map((lesson) => (
            <TouchableOpacity
              key={lesson.id}
              style={[
                styles.lessonItem,
                lesson.isCurrent && styles.lessonItemActive,
              ]}
              onPress={() => {
                if (lesson.locked) {
                  Alert.alert(
                    "Khóa học bị khóa",
                    "Vui lòng hoàn thành các bài học trước nhé!",
                  );
                } else {
                  Alert.alert("Chuyển bài", `Đang tải ${lesson.title}...`);
                }
              }}
            >
              <View style={styles.lessonLeft}>
                {/* Icon trạng thái bài học */}
                {lesson.completed ? (
                  <Ionicons name="checkmark-circle" size={24} color="#00B894" />
                ) : lesson.isCurrent ? (
                  <Ionicons name="play-circle" size={24} color="#FF8A80" />
                ) : (
                  <View style={styles.circleOutline} />
                )}

                <Text
                  style={[
                    styles.lessonTitle,
                    lesson.isCurrent && styles.lessonTitleActive,
                    lesson.locked && styles.lessonTitleLocked,
                  ]}
                >
                  {lesson.title}
                </Text>
              </View>

              <View style={styles.lessonRight}>
                {/* Huy chương cho bài đã học, Ổ khóa cho bài chưa mở */}
                {lesson.locked ? (
                  <Ionicons name="lock-closed" size={20} color="#B2BEC3" />
                ) : lesson.completed ? (
                  <Ionicons name="medal" size={24} color="#FFD54F" />
                ) : null}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Thanh điều hướng Bottom Bar (Previous / Next Lesson) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.navButtonSecondary}
          onPress={() => Alert.alert("Thông báo", "Quay lại bài 1")}
        >
          <Text style={styles.navButtonTextSecondary}>{"<"} Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButtonPrimary}
          onPress={() =>
            Alert.alert("Hoàn thành", "Tuyệt vời! Chuyển sang bài tiếp theo!")
          }
        >
          <Text style={styles.navButtonTextPrimary}>Next Lesson {">"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFBF7" },
  scrollContent: { paddingBottom: 100 }, // Tránh bị che bởi Bottom Bar

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#37474F" },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: "#FFF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  // Video Area
  videoContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  mockVideoBox: {
    width: "100%",
    height: 200,
    backgroundColor: "#FFE082",
    justifyContent: "center",
    alignItems: "center",
  },
  mockVideoText: {
    marginTop: 10,
    color: "#D84315",
    fontWeight: "bold",
    fontSize: 16,
  },
  videoProgressBar: { height: 6, backgroundColor: "#EEEEEE", width: "100%" },
  videoProgressFill: { height: "100%", backgroundColor: "#FF8A80" },
  videoTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#FFF",
  },
  timeText: { fontSize: 12, color: "#90A4AE", fontWeight: "bold" },

  // Lesson Info
  currentLessonInfo: { paddingHorizontal: 25, marginTop: 25 },
  subTitle: {
    fontSize: 14,
    color: "#90A4AE",
    fontWeight: "bold",
    marginBottom: 5,
  },
  mainTitle: { fontSize: 22, fontWeight: "900", color: "#37474F" },

  // Lesson List
  lessonListContainer: { paddingHorizontal: 20, marginTop: 25 },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  listTitle: { fontSize: 18, fontWeight: "bold", color: "#37474F" },
  accessText: { fontSize: 14, color: "#00B894", fontWeight: "bold" },

  lessonItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 8,
  },
  lessonItemActive: { backgroundColor: "#E8F5E9" }, // Nền xanh mint cho bài đang học

  lessonLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  circleOutline: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CFD8DC",
    marginLeft: 2,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#546E7A",
    marginLeft: 15,
    flex: 1,
  },
  lessonTitleActive: { color: "#00B894", fontWeight: "bold" },
  lessonTitleLocked: { color: "#B0BEC5" },

  lessonRight: { marginLeft: 10 },

  // Bottom Navigation Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  navButtonSecondary: {
    flex: 1,
    backgroundColor: "#E0F7FA",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginRight: 10,
  },
  navButtonTextSecondary: {
    color: "#00B894",
    fontSize: 16,
    fontWeight: "bold",
  },
  navButtonPrimary: {
    flex: 1,
    backgroundColor: "#FF8A80",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginLeft: 10,
  },
  navButtonTextPrimary: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});
