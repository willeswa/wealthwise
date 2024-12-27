import { useMenuStore } from "@/store/menu-store";
import { useModalStore } from "@/store/modal-store";
import { colors } from "@/utils/colors";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

const OPTIONS = [
  {
    id: 'income',
    title: "Income",
    subtitle: "Salary, freelance, etc.",
    icon: "wallet",
    action: "add-income", // Changed from route to action
    color: "#00C853",
  },
  {
    id: 'expense',
    title: "Expense",
    subtitle: "Track spending",
    icon: "card",
    action: "add-expense", // Changed from route to action
    color: "#FF385C",
    subOptions: [
      {
        id: 'quick',
        title: "Quick Entry",
        icon: "flash",
        action: "add-expense", // Changed from route to action
      },
      {
        id: 'scan',
        title: "Scan Receipt",
        icon: "scan",
        action: "scan-receipt", // Changed from route to action
      },
      {
        id: 'bulk',
        title: "Bulk Entry",
        icon: "list",
        action: "bulk-expense", // Changed from route to action
      },
    ],
  },
  {
    id: 'debt',
    title: "Debt",
    subtitle: "Loans & payments",
    icon: "trending-down",
    action: "add-debt", // Changed from route to action
    color: "#FF9500",
  },
  {
    id: 'investment',
    title: "Investment",
    subtitle: "Grow wealth",
    icon: "trending-up",
    action: "add-investment", // Changed from route to action
    color: "#007AFF",
  },
];

export function AddOptionsMenu() {
  const { isOptionsMenuVisible, hideOptionsMenu } = useMenuStore();
  const { openModal } = useModalStore();
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const [primaryScale] = React.useState(OPTIONS.map(() => new Animated.Value(1)));
  const [expandedOption, setExpandedOption] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOptionsMenuVisible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 65,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isOptionsMenuVisible]);

  const handlePress = (option: typeof OPTIONS[0], index: number) => {
    if (option.subOptions) {
      setExpandedOption(expandedOption === option.id ? null : option.id);
      return;
    }

    hideOptionsMenu();
    openModal(option.action as any);
  };

  const handleSubOptionPress = (action: string) => {
    hideOptionsMenu();
    openModal(action as any);
  };

  if (!isOptionsMenuVisible) return null;

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={hideOptionsMenu}>
        <BlurView intensity={15} tint="dark" style={StyleSheet.absoluteFill} />
      </Pressable>

      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              {
                scale: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1],
                }),
              },
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
            opacity: slideAnim,
          },
        ]}
      >
       

        <View style={styles.grid}>
          {OPTIONS.map((option, index) => (
              <Pressable
              key={index}
                style={[
                  styles.gridItem,
                  expandedOption === option.id && styles.gridItemExpanded
                ]}
                onPress={() => handlePress(option, index)}
              >
                <View style={styles.gridItemHeader}>
                  <View style={[styles.iconBg, { backgroundColor: `${option.color}15` }]}>
                    <Ionicons name={option.icon as any} size={20} color={option.color} />
                  </View>
                  <View style={styles.gridItemContent}>
                    <Text style={styles.gridItemTitle}>Add {option.title}</Text>
                    <Text style={styles.gridItemSubtitle}>{option.subtitle}</Text>
                  </View>
                  {option.subOptions && (
                    <Ionicons
                      name={expandedOption === option.id ? "chevron-up" : "chevron-down"}
                      size={20}
                      color={colors.text.light}
                    />
                  )}
                </View>

                {expandedOption === option.id && option.subOptions && (
                  <View style={styles.subOptionsContainer}>
                    {option.subOptions.map((subOption) => (
                      <Pressable
                        key={subOption.id}
                        style={styles.subOption}
                        onPress={() => handleSubOptionPress(subOption.action)}
                      >
                        <Ionicons name={subOption.icon as any} size={18} color={option.color} />
                        <Text style={styles.subOptionText}>{subOption.title}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </Pressable>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: colors.background.main,
    borderRadius: 24,
    width: '94%',
    maxWidth: 400,
    maxHeight: '80%',
    padding: 20,
    position: "absolute",
    bottom: 80,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  closeButton: {
    padding: 4,
    borderRadius: 16,
    backgroundColor: colors.background.highlight,
  },
  grid: {
    gap: 8,
  },
  gridItem: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.background.highlight,
  },
  gridItemExpanded: {
    backgroundColor: colors.background.highlight,
  },
  gridItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  gridItemContent: {
    flex: 1,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  gridItemSubtitle: {
    fontSize: 12,
    color: colors.text.light,
    marginTop: 1,
  },
  subOptionsContainer: {
    padding: 8,
    paddingLeft: 54,
    gap: 6,
    backgroundColor: colors.background.main,
    borderTopWidth: 1,
    borderTopColor: colors.background.highlight,
  },
  subOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  subOptionText: {
    fontSize: 14,
    color: colors.text.primary,
  },
});
