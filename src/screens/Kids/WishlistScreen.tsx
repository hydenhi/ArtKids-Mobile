import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useShopStore } from "../../store/useShopStore"; // <-- IMPORT KHO CHỨA

export default function WishlistScreen({ navigation }: any) {
  // Lấy danh sách yêu thích và hàm xóa khỏi kho chứa
  const wishlist = useShopStore((state) => state.wishlist);
  const toggleWishlist = useShopStore((state) => state.toggleWishlist);

  const handleUnlike = (course: any) => {
    toggleWishlist(course); // Bấm lần 2 là tự động xóa khỏi mảng
  };

  const renderWishlistItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate("CourseDetail", { courseId: item._id })
      }
    >
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

      <TouchableOpacity
        onPress={() => handleUnlike(item)}
        style={styles.heartButton}
      >
        <Ionicons name="heart" size={24} color="#FF5252" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={wishlist}
        keyExtractor={(item) => item._id || Math.random().toString()}
        renderItem={renderWishlistItem}
        contentContainerStyle={styles.listContainer}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFBF7" },
  header: { padding: 20, paddingTop: 10 },
  headerTitle: { fontSize: 26, fontWeight: "900", color: "#D81B60" },
  headerSubtitle: {
    fontSize: 15,
    color: "#F06292",
    marginTop: 5,
    fontWeight: "600",
  },
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
  },
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
});
