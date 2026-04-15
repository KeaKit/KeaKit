import React, { createContext, useContext, useState } from 'react';
import { PushNotification } from '../components/PushNotification';

type NotificationType = 'success' | 'error' | 'info';

interface NotificationContextType {
  showNotification: (
    message: string, 
    type?: NotificationType, 
    action?: { label: string; onPress: () => void }
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('success');
  const [action, setAction] = useState<{ label: string; onPress: () => void } | undefined>();

  const showNotification = (
    msg: string, 
    notificationType: NotificationType = 'success', 
    notificationAction?: { label: string; onPress: () => void }
  ) => {
    setMessage(msg);
    setType(notificationType);
    setAction(notificationAction);
    setVisible(true);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <PushNotification
        visible={visible}
        message={message}
        type={type}
        onClose={() => setVisible(false)}
        action={action}
        duration={3000}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};