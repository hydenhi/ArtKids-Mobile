// import React from "react";
// import { TouchableOpacity } from "react-native";
// import { createStackNavigator } from "@react-navigation/stack";
// import { Ionicons } from "@expo/vector-icons";
// import { useAuthStore } from "../store/useAuthStore";

// // Import các màn hình
// import DrawerNavigator from "./DrawerNavigator";
// import LoginScreen from "../screens/Auth/LoginScreen";
// import RegisterScreen from "../screens/Auth/RegisterScreen";
// import CourseDetailScreen from "../screens/Kids/CourseDetailScreen";
// import CartScreen from "../screens/Parent/CartScreen";
// import PaymentWebviewScreen from "../screens/Parent/PaymentWebviewScreen";
// import LearningScreen from "../screens/Kids/LearningScreen";
// import EditProfileScreen from "../screens/Kids/EditProfileScreen";

// const Stack = createStackNavigator();

// export default function AppNavigator() {
//   const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       {!isLoggedIn ? (
//         <>
//           <Stack.Screen name="Login" component={LoginScreen} />
//           <Stack.Screen name="Register" component={RegisterScreen} />
//         </>
//       ) : (
//         <>
//           {/* DrawerNavigator bọc toàn bộ app chính (Tabs + Drawer) */}
//           <Stack.Screen name="DrawerMain" component={DrawerNavigator} />

//           {/* CourseDetail: header nổi tùy chỉnh trên ảnh nền */}
//           <Stack.Screen
//             name="CourseDetail"
//             component={CourseDetailScreen}
//             options={{ headerShown: false }}
//           />

//           {/* Cart: Stack header nền vàng */}
//           <Stack.Screen
//             name="Cart"
//             component={CartScreen}
//             options={{
//               headerShown: false,
//               title: "Giỏ hàng",
//               headerStyle: { backgroundColor: "#FDFBF7" },
//               headerTintColor: "#00B894",
//               headerTitleStyle: { fontWeight: "900", fontSize: 22 },
//               headerRight: () => (
//                 <TouchableOpacity>
//                   <Ionicons name="cart-outline" size={24} color="#00B894" />
//                 </TouchableOpacity>
//               ),
//             }}
//           />

//           {/* PaymentWebview: Stack header trắng */}
//           <Stack.Screen
//             name="PaymentWebview"
//             component={PaymentWebviewScreen}
//             options={{
//               headerShown: true,
//               title: "Thanh toán An toàn",
//               headerStyle: { backgroundColor: "#FFF" },
//               headerTintColor: "#2D3436",
//               headerTitleStyle: { fontWeight: "bold", fontSize: 18 },
//             }}
//           />

//           {/* Learning: Stack header sáng */}
//           <Stack.Screen
//             name="Learning"
//             component={LearningScreen}
//             options={{
//               headerShown: true,
//               title: "Học bài",
//               headerStyle: { backgroundColor: "#FDFBF7" },
//               headerTintColor: "#37474F",
//               headerTitleStyle: { fontWeight: "bold" },
//             }}
//           />

//           {/* EditProfile: Stack header */}
//           <Stack.Screen
//             name="EditProfile"
//             component={EditProfileScreen}
//             options={{
//               headerShown: true,
//               title: "Chỉnh sửa thông tin",
//               headerStyle: { backgroundColor: "#FDFBF7" },
//               headerTintColor: "#00B894",
//               headerTitleStyle: { fontWeight: "900", fontSize: 22 },
//             }}
//           />
//         </>
//       )}
//     </Stack.Navigator>
//   );
// }

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "../store/useAuthStore";

// Import các màn hình
import DrawerNavigator from "./DrawerNavigator";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import CourseDetailScreen from "../screens/Kids/CourseDetailScreen";
import CartScreen from "../screens/Parent/CartScreen";
import PaymentWebviewScreen from "../screens/Parent/PaymentWebviewScreen";
import LearningScreen from "../screens/Kids/LearningScreen";
import EditProfileScreen from "../screens/Kids/EditProfileScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return (
    // Tắt toàn bộ header mặc định của thư viện bằng headerShown: false
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="DrawerMain" component={DrawerNavigator} />
          <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen
            name="PaymentWebview"
            component={PaymentWebviewScreen}
          />
          <Stack.Screen name="Learning" component={LearningScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}