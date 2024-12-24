import { Ionicons } from "@expo/vector-icons";
import { TabTriggerSlotProps } from "expo-router/ui";
import { Ref, forwardRef } from "react";
import { Pressable, View } from "react-native";

export const CenterButton = forwardRef(
  ({ isFocused, ...props }: TabTriggerSlotProps, ref: Ref<View>) => {
    return (
      <Pressable
        ref={ref}
        {...props}
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#232D59",
          alignItems: "center",
          justifyContent: "center",
          marginTop: -20, 
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          padding: 4
        }}
      >
        <View style={{
            width: "100%",
            height: "100%",
            borderRadius: 28,
            backgroundColor: "#FBEDDA",
            alignItems: "center",
            justifyContent: "center",
           
        }}>
          <Ionicons name="add" size={32} color="#232D59" />
        </View>
      </Pressable>
    );
  }
);
