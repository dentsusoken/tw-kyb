import React, { FC, useState } from 'react';
import tw from 'tailwind-rn';
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Button,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '@/types';
import { Title } from '@/components/Title';
import { useCredentialOfferState } from '@/hooks/oid4vci/useCredentialOfferState';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DemoMenu'>;
};

export const DemoMenu: FC<Props> = ({ navigation }) => {
  const [scanned, setScanned] = useState(false);
  const { execCredentialOffer, credentialOfferParams } = useCredentialOfferState();
  const exec = async () => {
    await execCredentialOffer();
    setScanned(true);
  }

  return (
    <SafeAreaView style={tw('flex-1 bg-gray-100 items-center')}>
      {!scanned && (
        <>
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
        </>
      )}
      {scanned && (
        <View style={[tw('flex flex-col justify-center items-center')]}>
          <Text style={[tw('text-2xl')]}>
            {credentialOfferParams ? 'Result' : 'Faild'}
          </Text>
          {credentialOfferParams && (
            <Text style={[tw('bg-white mx-2 py-4')]}>
              {JSON.stringify(credentialOfferParams, null, 2)}
            </Text>
          )}
          <Button
            title={'Tap to Return'}
            onPress={() => setScanned(false)}
          />
        </View>
      )}
    </SafeAreaView>
  );
};
