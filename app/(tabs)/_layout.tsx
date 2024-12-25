import { ActionModal } from "@/components/action-modal";
import { AddOptionsMenu } from "@/components/add-options-menu";
import { CenterButton } from "@/components/center-button";
import { TabButton } from "@/components/tab-button";
import { TabList, Tabs, TabSlot, TabTrigger } from "expo-router/ui";
import React from "react";

export default function Layout() {
  return (
    <>
      <Tabs style={{ flex: 1, backgroundColor: "white" }}>
        <TabSlot />
        <TabList
          style={{
            padding: 8,
            backgroundColor: "#232D59",
            margin: 8,
            gap: 8,
            borderRadius: 32,
            overflow: "visible", // Allow the center button to be visible
            zIndex: 1000,
            position: "relative",
          }}
        >
          <TabTrigger name="home" href="/" asChild>
            <TabButton icon="home">Home</TabButton>
          </TabTrigger>
          <TabTrigger name="budget" href={"/(tabs)/budget"} asChild>
            <TabButton icon="newspaper">Budget</TabButton>
          </TabTrigger>
          <TabTrigger name="add-new" asChild>
            <CenterButton />
          </TabTrigger>
          <TabTrigger name="debt" href={"/(tabs)/debt"} asChild>
            <TabButton icon="newspaper">Debt</TabButton>
          </TabTrigger>
          <TabTrigger name="investment" href={"/(tabs)/investment"} asChild>
            <TabButton icon="newspaper">Portfolio</TabButton>
          </TabTrigger>
        </TabList>
      </Tabs>
      <AddOptionsMenu />
      <ActionModal />
    </>
  );
}
