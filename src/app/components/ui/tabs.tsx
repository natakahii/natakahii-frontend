"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { motion } from "motion/react";
import { cn } from "./utils";

const TabsContext = React.createContext<{ value?: string; onValueChange?: (val: string) => void }>({});

function Tabs({
  className,
  value,
  onValueChange,
  defaultValue,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue || "");
  
  return (
    <TabsContext.Provider value={{ 
      value: value !== undefined ? value : activeTab, 
      onValueChange: (v) => {
        setActiveTab(v);
        if (onValueChange) onValueChange(v);
      }
    }}>
      <TabsPrimitive.Root
        data-slot="tabs"
        value={value !== undefined ? value : activeTab}
        onValueChange={(v) => {
          setActiveTab(v);
          if (onValueChange) onValueChange(v);
        }}
        className={cn("flex flex-col gap-2", className)}
        {...props}
      />
    </TabsContext.Provider>
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px] flex",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  value,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const { value: activeValue } = React.useContext(TabsContext);
  const isActive = activeValue === value;
  
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      value={value}
      className={cn(
        "relative text-foreground dark:text-muted-foreground inline-flex h-10 flex-1 items-center justify-center gap-1.5 px-4 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-[var(--color-primary)] bg-transparent border-0",
        className,
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {isActive && (
        <motion.div
          layoutId="tabs-indicator-underline"
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-primary)] rounded-t-sm z-0"
          transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
        />
      )}
    </TabsPrimitive.Trigger>
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
