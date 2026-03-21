import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeliveryStatus, TrackingNotification } from "../types";

type TrackingNotificationsContextType = {
  notifications: TrackingNotification[];
  unreadCount: number;
  addNotification: (n: TrackingNotification) => Promise<void>;
  markAllRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
};

const STORAGE_KEY = "@tracking_notifications";

const TrackingNotificationsContext = createContext<TrackingNotificationsContextType | undefined>(undefined);

export const TrackingNotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<TrackingNotification[]>([]);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    })();
  }, []);

  const persist = async (list: TrackingNotification[]) => {
    setNotifications(list);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const addNotification = async (n: TrackingNotification) => {
    const next = [n, ...notifications];
    await persist(next);
  };

  const markAllRead = async () => {
    const next = notifications.map((n) => ({ ...n, read: true }));
    await persist(next);
  };

  const removeNotification = async (id: string) => {
    const next = notifications.filter((n) => n.id !== id);
    await persist(next);
  };

  const clearAll = async () => {
    await persist([]);
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  return (
    <TrackingNotificationsContext.Provider
      value={{ notifications, unreadCount, addNotification, markAllRead, clearAll, removeNotification }}
    >
      {children}
    </TrackingNotificationsContext.Provider>
  );
};

export const useTrackingNotifications = () => {
  const ctx = useContext(TrackingNotificationsContext);
  if (!ctx) {
    throw new Error("useTrackingNotifications must be used within TrackingNotificationsProvider");
  }
  return ctx;
};
