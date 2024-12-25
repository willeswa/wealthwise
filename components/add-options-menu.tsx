import { Link } from "expo-router";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMenuStore } from "@/store/menu-store";
import { useModalStore } from "@/store/modal-store";

type Option = {
  title: string;
  icon: string;
  route: string;
};

interface AddOptionsMenuProps {
  visible: boolean;
  onClose: () => void;
}

const OPTIONS: Option[] = [
  { title: "Add Income", icon: "cash", route: "add-income" },
  { title: "Add Expense", icon: "card", route: "add-expense" },
  { title: "Add Debt", icon: "trending-down", route: "add-debt" },
  { title: "Add Investment", icon: "trending-up", route: "add-investment" },
];

export function AddOptionsMenu() {
  const { isOptionsMenuVisible, hideOptionsMenu } = useMenuStore();
  const { openModal } = useModalStore();

  if (!isOptionsMenuVisible) return null;

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={hideOptionsMenu} />
      <View style={styles.container}>
        {OPTIONS.map((option) => (
          <Pressable 
            key={option.route}
            style={styles.option} 
            onPress={() => {
              hideOptionsMenu();
              openModal(option.route as any);
            }}
          >
            <Ionicons name={option.icon as any} size={24} color="#FBEDDA" />
            <Text style={styles.optionText}>{option.title}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    bottom: 80,
    left: 8,
    right: 8,
    backgroundColor: '#232D59',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    elevation: 5, // Add shadow for Android
    shadowColor: "#000", // iOS shadow
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
  },
  optionText: {
    color: '#FBEDDA',
    fontSize: 16,
    fontWeight: '500',
  },
});
