import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../types';

type ProfileNav = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

interface ProfileField {
  label: string;
  value: string | undefined;
  icon: string;
}

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileNav>();
  const { user } = useAuth();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Usuario no encontrado</Text>
      </View>
    );
  }

  const profileFields: ProfileField[] = [
    { label: 'Nombre', value: user.name, icon: 'person-outline' },
    { label: 'Email', value: user.email, icon: 'mail-outline' },
    { label: 'Teléfono', value: user.phone, icon: 'call-outline' },
    { label: 'Dirección', value: user.address, icon: 'home-outline' },
    { label: 'Ciudad', value: user.city, icon: 'business-outline' },
    { label: 'País', value: user.country, icon: 'earth-outline' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#103a57" />
      </TouchableOpacity>

      <Image source={require('../../../assets/logo.png')} style={styles.logo} />

      <Text style={styles.title}>Perfil</Text>
      <Text style={styles.subtitle}>{user.email}</Text>

      {profileFields.map(({ label, value, icon }) => (
        <View key={label} style={styles.fieldWrapper}>
          <View style={styles.fieldContainer}>
            <Ionicons name={icon as any} size={20} color="#103a57" style={styles.fieldIcon} />
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>{label}</Text>
              <Text style={styles.fieldValue}>{value || 'No especificado'}</Text>
            </View>
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate('EditProfile', { user })}
      >
        <Ionicons name="pencil" size={18} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.editButtonText}>Editar perfil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 24,
    paddingTop: 48,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#103a57',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
    textAlign: 'center',
  },
  fieldWrapper: {
    width: '100%',
    marginBottom: 12,
  },
  fieldContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 16,
  },
  fieldIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontWeight: '600',
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  editButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#103a57',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
    flexDirection: 'row',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#d9534f',
    textAlign: 'center',
  },
});
