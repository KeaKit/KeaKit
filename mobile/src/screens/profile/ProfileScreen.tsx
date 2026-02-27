import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';


const ProfileScreen: React.FC = () => {
    const navigation = useNavigation();

  return (
    <View>
        <View> TODO: Profile screen</View>
        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
            <Text>Editar perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text>Atrás</Text>
        </TouchableOpacity>
    </View>

  );
};


export default ProfileScreen;
