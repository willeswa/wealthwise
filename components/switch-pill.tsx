import { colors } from "@/utils/colors";
import { Pressable, Text, View } from "react-native";

type Props = {
  selected: string; // The currently selected option
  onSelect: (option: string) => void;
  options: string[]; // Array of option strings
};

export const SwitchPill = ({ selected, onSelect, options }: Props) => {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "white",
        borderRadius: 32,
        padding: 4,
        overflow: "hidden", // Ensures children stay within the parent border
      }}
    >
      {options.map((option, index) => (
        <Pressable
          key={option}
          onPress={() => onSelect(option)}
          style={{
            flex: 1, // Ensures equal space for each option
            backgroundColor: selected === option ? "#FBEDDA" : "rgba(0,0,0,0.02)",
            paddingVertical: 8,
            justifyContent: "center",
            alignItems: "center",
            // Conditionally apply rounded corners only to external ends
            borderTopLeftRadius: index === 0 ? 32 : 0,
            borderBottomLeftRadius: index === 0 ? 32 : 0,
            borderTopRightRadius: index === options.length - 1 ? 32 : 0,
            borderBottomRightRadius: index === options.length - 1 ? 32 : 0,
          }}
        >
          <Text
            style={{
              color: "#232D59" , // Text color contrast
              fontWeight: "600",
            }}
          >
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};
