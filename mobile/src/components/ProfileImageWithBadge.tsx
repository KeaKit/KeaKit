import React from 'react';
import { View, Image, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';

interface ProfileImageWithBadgeProps {
  imageUrl?: string | null;        // URL de la foto de perfil (Cloudinary)
  size?: number;                   // diámetro de la imagen (ej: 60)
  founderBadge?: boolean;          // si es true, muestra la insignia
  badgeSize?: number;              // tamaño de la insignia (por defecto size * 0.35)
  badgeImageUrl?: string;          // URL de tu imagen de insignia (circular)
  badgePosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  containerStyle?: ViewStyle;
  onPress?: () => void;
  defaultAvatar?: any;             // imagen local por defecto (require)
}

export const ProfileImageWithBadge: React.FC<ProfileImageWithBadgeProps> = ({
  imageUrl,
  size = 60,
  founderBadge = false,
  badgeSize,
  badgeImageUrl = 'https://res.cloudinary.com/dndpdkr7o/image/upload/q_auto/f_auto/v1775597474/WhatsApp_Image_2026-04-07_at_23.28.21_gzsmap.jpg', // 🔁 Cámbiala por tu URL real
  badgePosition = 'top-right',
  containerStyle,
  onPress,
  defaultAvatar = require('../../assets/logo.png'), 
}) => {
  const defaultBadgeSize = Math.max(20, size * 0.35);
  const finalBadgeSize = badgeSize || defaultBadgeSize;

  // Posición absoluta según badgePosition
  const getBadgePosition = () => {
    const offset = -finalBadgeSize * 0.15; // pequeño solapamiento
    switch (badgePosition) {
      case 'top-right':
        return { top: offset, right: offset };
      case 'top-left':
        return { top: offset, left: offset };
      case 'bottom-right':
        return { bottom: offset, right: offset };
      case 'bottom-left':
        return { bottom: offset, left: offset };
      default:
        return { top: offset, right: offset };
    }
  };

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      style={[styles.container, { width: size, height: size }, containerStyle]}
      disabled={!onPress}
    >
      <Image
        source={imageUrl ? { uri: imageUrl } : defaultAvatar}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
      {founderBadge && (
        <View
          style={[
            styles.badgeContainer,
            getBadgePosition(),
            {
              width: finalBadgeSize,
              height: finalBadgeSize,
              borderRadius: finalBadgeSize / 2,
            },
          ]}
        >
          <Image
            source={{ uri: badgeImageUrl }}
            style={{ width: finalBadgeSize, height: finalBadgeSize, borderRadius: finalBadgeSize / 2 }}
            resizeMode="contain"
          />
        </View>
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    backgroundColor: '#e1e1e1',
  },
  badgeContainer: {
    position: 'absolute',
    backgroundColor: 'transparent', // o blanco si tu insignia no es circular
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    // Opcional: sombra si quieres
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.2,
    // shadowRadius: 2,
    // elevation: 2,
  },
});