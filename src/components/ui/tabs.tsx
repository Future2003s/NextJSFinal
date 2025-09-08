"use client";
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  const listRef = React.useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = React.useState({});

  React.useEffect(() => {
    const listElement = listRef.current;
    if (!listElement) return;

    const updateIndicator = (activeTab: HTMLElement) => {
      setIndicatorStyle({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      });
    };

    // Set initial indicator position
    const initialActiveTab = listElement.querySelector<HTMLElement>(
      '[data-state="active"]'
    );
    if (initialActiveTab) {
      updateIndicator(initialActiveTab);
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-state"
        ) {
          const activeTab = listElement.querySelector<HTMLElement>(
            '[data-state="active"]'
          );
          if (activeTab) {
            updateIndicator(activeTab);
            break; // Found the active tab, no need to check other mutations
          }
        }
      }
    });

    // Observe changes on all child nodes (the TabsTrigger components)
    Array.from(listElement.children).forEach((child) => {
      observer.observe(child, { attributes: true });
    });

    return () => {
      observer.disconnect();
    };
  }, [props.children]);

  return (
    <TabsPrimitive.List
      ref={listRef}
      className={cn(
        "relative inline-flex h-auto items-center justify-center rounded-none bg-transparent p-0 border-b",
        className
      )}
      {...props}
    >
      {props.children}
      <div
        className="absolute bottom-[-1px] h-0.5 bg-primary transition-all duration-300 ease-in-out"
        style={indicatorStyle}
      />
    </TabsPrimitive.List>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-gray-500 hover:text-primary data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:bg-slate-200",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 ring-offset-background focus-visible:outline-none data-[state=active]:animate-in data-[state=active]:fade-in-95 data-[state=active]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
