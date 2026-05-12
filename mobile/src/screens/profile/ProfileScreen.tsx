import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../types';
import { getWalletByUserId } from '../../services/walletService';
import { ProfileImageWithBadge } from '../../components/ProfileImageWithBadge';
import { useNavbarOffset } from '../../hooks/useWindowDimensions';
import { Helmet } from 'react-helmet-async'; 

type ProfileNav = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

interface ProfileField {
  label: string;
  value: string | undefined;
  icon: string;
}

interface ActionButton {
  label: string;
  icon: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'secondary';
}

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileNav>();
  const navbarOffset = useNavbarOffset();
  const { user, signOut } = useAuth();

  const [availableBalance, setAvailableBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (user?.id && user?.token) {
        setLoadingBalance(true);
        try {
          const wallet = await getWalletByUserId(user.id, user.token);
          setAvailableBalance(wallet.balance);
        } catch (error) {
          setAvailableBalance(null);
        } finally {
          setLoadingBalance(false);
        }
      }
    };
    fetchBalance();
  }, [user?.id, user?.token]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Usuario no encontrado</Text>
      </View>
    );
  }

  const profileFields: ProfileField[] = [
    { label: 'Nombre', value: user.name, icon: 'person-outline' },
    { label: 'Teléfono', value: user.phone, icon: 'call-outline' },
    { label: 'Dirección', value: user.address, icon: 'home-outline' },
    { label: 'País', value: user.country, icon: 'earth-outline' },
    { label: 'Ciudad', value: user.city, icon: 'business-outline' },
  ];

  const baseButtons: ActionButton[] = [
    {
      label: 'Editar perfil',
      icon: 'pencil-outline',
      onPress: () => navigation.navigate('EditProfile', { user }),
      variant: 'primary',
    },
    {
      label: 'Mis alquileres',
      icon: 'calendar-outline',
      onPress: () => {navigation.navigate('MyKits');},
      variant: 'secondary',
    },
    {
      label: 'Mis artículos',
      icon: 'cube-outline',
      onPress: () => {navigation.navigate('MyArticles');},
      variant: 'secondary',
    },
  ];

  const roleSpecificButtons: ActionButton[] = [];

  if(user.role === 'USER'){
    roleSpecificButtons.push({
      label: 'Mis servicios',
      icon: 'construct-outline',
      onPress: () => {navigation.navigate('MyServices');},
      variant:'secondary',
    });
  }

  const logoutButton: ActionButton = {
    label: 'Cerrar sesión',
    icon: 'log-out-outline',
    onPress: handleLogout,
    variant: 'danger',
  };

  const actionButtons = [...baseButtons, ...roleSpecificButtons, logoutButton]

  const getButtonStyle = (variant?: string) => {
    switch (variant) {
      case 'danger': return styles.btnDanger;
      case 'secondary': return styles.btnSecondary;
      default: return styles.btnPrimary;
    }
  };

  const getButtonTextStyle = (variant?: string) => {
    return variant === 'secondary' ? styles.btnTextSecondary : styles.btnTextLight;
  };

  const getIconColor = (variant?: string) => {
    return variant === 'secondary' ? '#103a57' : '#fff';
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, {paddingBottom: navbarOffset > 0 ? navbarOffset + 20 : 20}]}>
      <Helmet>
        <title>Mi perfil | KeaKit</title>
        <meta name="description" content="Gestiona tu perfil en KeaKit: edita tu información personal, consulta tu saldo disponible, administra tus artículos, alquileres y servicios"/>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>            
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color="#103a57" />
      </TouchableOpacity>

      <View style={styles.headerCard}>
        <View style={styles.avatarSection}>
          <ProfileImageWithBadge
            imageUrl={user.profileImageUrl}
            size={100}
            founderBadge={user.founderBadge}
          />
          <Text style={styles.title}>Perfil</Text>
          <Text style={styles.subtitle}>{user.email}</Text>
          <View style={styles.balanceContainer}>
            <Text style={{color: '#151617'}}>Saldo: </Text>
            {loadingBalance ? ( 
              <ActivityIndicator size="small" color="#103a57" />
            ) : (
              <Text style={styles.balanceAmount}>
                {availableBalance !== null ? `${availableBalance.toFixed(2)}€` : 'No disponible'}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.buttonsSection}>
          {actionButtons.map((btn) => (
            <TouchableOpacity
              key={btn.label}
              style={[styles.btn, getButtonStyle(btn.variant)]}
              onPress={btn.onPress}
              activeOpacity={0.8}
            >
              <Ionicons
                name={btn.icon as any}
                size={15}
                color={getIconColor(btn.variant)}
                style={styles.btnIcon}
              />
              <Text style={[styles.btnText, getButtonTextStyle(btn.variant)]}>
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.fieldsSection}>
        {profileFields.map(({ label, value, icon }) => (
          <View key={label} style={styles.fieldContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name={icon as any} size={20} color="#103a57" />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>{label}</Text>
              <Text style={styles.fieldValue}>{value || 'No especificado'}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f0f4f8',
    paddingHorizontal: 20,
    marginTop: 10,
  },

  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',

    elevation: 2,
  },

  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#103a57',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  avatarSection: {
    flex: 1,
    alignItems: 'center',
  },

  logo: {
    width: 100,
    height: 100,
    borderRadius: 31,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#103a57',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 3,
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: '#e8edf2',
    marginHorizontal: 16,
  },
  buttonsSection: {
    flex: 1.4,
    gap: 8,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  btnPrimary: {
    backgroundColor: '#103a57',
  },
  btnDanger: {
    backgroundColor: '#e05252',
  },
  btnSecondary: {
    backgroundColor: '#eef4fa',
    borderWidth: 1,
    borderColor: '#d0e4f0',
  },
  btnIcon: {
    marginRight: 7,
  },
  btnText: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },
  btnTextLight: {
    color: '#fff',
  },
  btnTextSecondary: {
    color: '#103a57',
  },

  fieldsSection: {
    gap: 10,
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#103a57',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },

  editButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#103a57',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    flexDirection: 'row',
    shadowColor: '#103a57',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  errorText: {
    fontSize: 16,
    color: '#e05252',
    textAlign: 'center',
  },
  balanceContainer: {
    marginTop: 6,
    alignItems: 'center',
    flexDirection: 'row',
  },
  balanceAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#103a57',
  },
});