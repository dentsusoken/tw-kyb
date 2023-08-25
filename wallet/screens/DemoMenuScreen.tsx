import React, { FC } from 'react';
import tw from 'tailwind-rn';
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList, Tag } from '@/types';
import { Title } from '@/components/Title';


type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DemoMenu'>;
};

export const DemoMenu: FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={tw('flex-1 bg-gray-100 items-center')}>
      <Title first="Demo" last="Menu" />
      <TouchableOpacity
        style={tw('mt-2')}
        onPress={() => navigation.navigate('QRScan')}
      >
        <MaterialCommunityIcons name="qrcode" size={40} color="#5f9ea0" />
      </TouchableOpacity>
      <Text style={tw('text-gray-700 mt-2 mb-5')}>Scan QR code</Text>
    </SafeAreaView>
  );
};
