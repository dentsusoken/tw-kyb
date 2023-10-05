import React, { FC } from 'react';
import tw from 'tailwind-rn';
import { SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '@/types';
import { Title } from '@/components/Title';
import { useCredentialOfferState } from '@/hooks/oid4vci/useCredentialOfferState';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DemoMenu'>;
};

export const DemoMenu: FC<Props> = ({ navigation }) => {
  const { execCredentialOffer } = useCredentialOfferState();
  const exec = async () => {
    await execCredentialOffer();
    navigation.navigate('CredentialOfferResult');
  };

  return (
    <SafeAreaView style={tw('flex-1 bg-gray-100 items-center')}>
      <Title first="Demo" last="Menu" />
      <TouchableOpacity
        style={tw('mt-2')}
        onPress={() => navigation.navigate('QRScanNav')}
      >
        <MaterialCommunityIcons name="qrcode" size={40} color="#5f9ea0" />
      </TouchableOpacity>
      <Text style={tw('text-gray-700 mt-2 mb-5')}>Scan QR code</Text>
      <TouchableOpacity style={tw('mt-2')} onPress={exec}>
        <MaterialCommunityIcons name="link" size={40} color="#5f9ea0" />
      </TouchableOpacity>
      <Text style={tw('text-gray-700 mt-2 mb-5')}>Deep Link</Text>
    </SafeAreaView>
  );
};
