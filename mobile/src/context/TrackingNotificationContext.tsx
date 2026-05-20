import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeliveryStatus, TrackingNotification } from "../types";
import { useAuth } from "./AuthContext"

type TrackingNotificationsContextType = {
  notifications: TrackingNotification[];
  unreadCount: number;
  addNotification: (n: TrackingNotification) => Promise<void>;
  markAllRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
};

const BASE_STORAGE_KEY = "@tracking_notifications";

const TrackingNotificationsContext = createContext<TrackingNotificationsContextType | undefined>(undefined);

export const TrackingNotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<TrackingNotification[]>([]);

  const { user } = useAuth();
  const storageKey = user?.id ? `${BASE_STORAGE_KEY}_${user.id}` : null;
  
  useEffect(() => {
    if (!storageKey) {
      setNotifications([]);
      return;
    }
    
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) {
          setNotifications(JSON.parse(stored));
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error("Error cargando tracking notifications del storage:", error);
        setNotifications([]);
      }
    })();
  }, [storageKey]);

  const persist = async (list: TrackingNotification[]) => {
    if (!storageKey) return;
    await AsyncStorage.setItem(storageKey, JSON.stringify(list));
  };

  const addNotification = async (n: TrackingNotification) => {
    setNotifications(prev => {
      const exists = prev.some(x => x.id === n.id);
      const next = exists ? prev : [n, ...prev];

      save(next);
      return next;
    });
  };

  const markAllRead = async () => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      save(next);
      return next;
    });
  };

  const removeNotification = async (id: string) => {
    setNotifications(prev => {
      const next = prev.filter(n => n.id !== id);
      save(next);
      return next;
    });
  };

  const save = async (list: TrackingNotification[]) => {
    if (!storageKey) return;
    await AsyncStorage.setItem(storageKey, JSON.stringify(list));
  };

  const clearAll = async () => {
    setNotifications([]);
    await save([]);
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
