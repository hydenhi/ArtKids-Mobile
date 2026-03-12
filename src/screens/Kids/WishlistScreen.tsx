import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useShopStore } from "../../store/useShopStore";

export default function WishlistScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const wishlist = useShopStore((state) => state.wishlist);
  const toggleWishlist = useShopStore((state) => state.toggleWishlist);
  const removeFromWishlist = useShopStore((state) => state.removeFromWishlist);
  const clearWishlist = useShopStore((state) => state.clearWishlist);

  // Trạng thái cho chế độ chỉnh sửa (Edit Mode)
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 1. Xóa 1 mục (Khi KHÔNG ở chế độ Edit)
  const handleUnlike = (course: any) => {
    toggleWishlist(course);
    // Nếu xóa xong mà danh sách chỉ còn 1 hoặc 0 mục, tự động tắt chế độ sửa
    if (wishlist.length <= 2) {
      setIsEditMode(false);
      setSelectedIds([]);
    }
  };

  // 2. Chọn / Bỏ chọn 1 mục (Khi ĐANG ở chế độ Edit)
  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // 3. Chọn tất cả / Bỏ chọn tất cả
  const handleSelectAll = () => {
    if (selectedIds.length === wishlist.length) {
      setSelectedIds([]); // Nếu đang chọn hết thì bỏ chọn
    } else {
      setSelectedIds(wishlist.map((item) => item._id)); // Nếu chưa thì chọn hết
    }
  };

  // 4. Xóa các mục đã chọn
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn ít nhất 1 khóa học để xóa.");
      return;
    }
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc muốn xóa ${selectedIds.length} khóa học này khỏi danh sách yêu thích?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            removeFromWishlist(selectedIds);
            setSelectedIds([]);
            setIsEditMode(false); // Xong thì tắt Edit mode
          },
        },
      ],
    );
  };

  // 5. Xóa TẤT CẢ
  const handleDeleteAll = () => {
    Alert.alert(
      "Xóa tất cả",
      "Bạn có chắc chắn muốn xóa TOÀN BỘ khóa học trong danh sách yêu thích?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa sạch",
          style: "destructive",
          onPress: () => {
            clearWishlist();
            setSelectedIds([]);
            setIsEditMode(false);
          },
        },
      ],
    );
  };

  const renderWishlistItem = ({ item }: { item: any }) => {
    const isSelected = selectedIds.includes(item._id);

    return (
      <TouchableOpacity
        style={[styles.card, isEditMode && isSelected && styles.cardSelected]}
        activeOpacity={0.9}
        onPress={() => {
          if (isEditMode) {
            toggleSelection(item._id); // Chế độ sửa -> tick chọn
          } else {
            // THÊM ĐIỀU HƯỚNG: Bấm vào item nhảy sang trang Course Detail
            navigation.navigate("CourseDetail", {
              courseId: item._id,
              slug: item.slug,
            });
          }
        }}
        // Mẹo UX: Đè giữ lâu sẽ tự động bật chế độ sửa (chỉ hoạt động nếu có > 1 mục)
        onLongPress={() => {
          if (!isEditMode && wishlist.length > 1) {
            setIsEditMode(true);
            setSelectedIds([item._id]);
          }
        }}
      >
        {/* Nút Checkbox xuất hiện khi Edit Mode */}
        {isEditMode && (
          <View style={styles.checkboxContainer}>
            <Ionicons
              name={isSelected ? "checkmark-circle" : "ellipse-outline"}
              size={24}
              color={isSelected ? "#D81B60" : "#CFD8DC"}
            />
          </View>
        )}

        <Image
          source={{
            uri:
              item.thumbnail ||
              "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=400",
          }}
          style={styles.thumbnail}
        />

        <View style={styles.infoBox}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.price}>
            {item.price === 0 ? "Miễn phí" : `$${item.price}`}
          </Text>
        </View>

        {/* Nút thả tim chỉ xuất hiện khi KHÔNG Edit Mode */}
        {!isEditMode && (
          <TouchableOpacity
            onPress={() => handleUnlike(item)}
            style={styles.heartButton}
          >
            <Ionicons name="heart" size={24} color="#FF5252" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Yêu thích</Text>

        {/* ĐIỀU KIỆN MỚI: Chỉ hiển thị nút Chỉnh sửa nếu có nhiều hơn 1 mục */}
        {wishlist.length > 1 && (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => {
              setIsEditMode(!isEditMode);
              setSelectedIds([]); // Reset khi tắt/bật
            }}
          >
            <Text style={styles.editBtnText}>
              {isEditMode ? "Hủy" : "Chỉnh sửa"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={wishlist}
        keyExtractor={(item) => item._id || Math.random().toString()}
        renderItem={renderWishlistItem}
        contentContainerStyle={[
          styles.listContainer,
          isEditMode && { paddingBottom: 100 },
        ]} // Chừa chỗ cho Bottom Bar
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="heart-dislike-outline" size={80} color="#FFCDD2" />
            <Text style={styles.emptyText}>
              Bé chưa yêu thích khóa học nào.
            </Text>
          </View>
        }
      />

      {/* THANH CÔNG CỤ DƯỚI CÙNG (Chỉ hiện khi Edit Mode và có > 1 mục) */}
      {isEditMode && wishlist.length > 1 && (
        <View style={styles.bottomEditBar}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleSelectAll}>
            <Ionicons
              name="checkmark-done-circle-outline"
              size={24}
              color="#546E7A"
            />
            <Text style={styles.actionText}>
              {selectedIds.length === wishlist.length
                ? "Bỏ chọn"
                : "Chọn tất cả"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleDeleteSelected}
          >
            <Ionicons name="trash-outline" size={24} color="#FF8A80" />
            <Text style={[styles.actionText, { color: "#FF8A80" }]}>
              Xóa chọn
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleDeleteAll}>
            <Ionicons name="trash-bin" size={24} color="#D63031" />
            <Text
              style={[
                styles.actionText,
                { color: "#D63031", fontWeight: "bold" },
              ]}
            >
              Xóa tất cả
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFBF7" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: { fontSize: 24, fontWeight: "900", color: "#D81B60" },
  editBtn: {
    backgroundColor: "#FCE4EC",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  editBtnText: { color: "#D81B60", fontWeight: "bold", fontSize: 14 },

  listContainer: { paddingHorizontal: 20, paddingBottom: 30 },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 12,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#FF8A80",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: "transparent",
  },
  cardSelected: {
    borderColor: "#D81B60",
    backgroundColor: "#FCE4EC",
  },
  checkboxContainer: { marginRight: 10 },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 15,
    backgroundColor: "#F5F5F5",
  },
  infoBox: { flex: 1, marginLeft: 15, justifyContent: "center" },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#37474F",
    marginBottom: 8,
  },
  price: { fontSize: 18, fontWeight: "900", color: "#FF8A80" },
  heartButton: { padding: 10 },

  emptyBox: { alignItems: "center", marginTop: 80 },
  emptyText: {
    fontSize: 16,
    color: "#F06292",
    marginTop: 15,
    fontWeight: "bold",
  },

  bottomEditBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#FFF",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingBottom: 25,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontSize: 13,
    color: "#546E7A",
    marginTop: 4,
    fontWeight: "600",
  },
});
