import React, { FC } from 'react';
import tw from 'tailwind-rn';

import { useState, useEffect } from 'react';
import { Text, View, Button } from 'react-native';
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';
import { useCredentialOfferState } from "@/hooks/oid4vci/useCredentialOfferState"

export const QRScanScreen: FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [scanned, setScanned] = useState(false);
  const { credentialOfferParams, parseQr } = useCredentialOfferState();

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ data }: BarCodeScannerResult) => {
    setScanned(true);
    parseQr(data);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View
      style={[tw(`flex-1 flex-col justify-center ${scanned ? "bg-black" : ''}`)]}
    >
      {!scanned &&
        <>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={[tw('absolute inset-0')]}
          />
          <Text style={[tw('absolute text-white text-2xl pb-80 pl-16')]}>Scan QR code</Text>
          <View
            style={[tw('flex-1 flex-row justify-center items-center')]}
          >
            <View style={[tw('text-white border border-white border-4 h-64 w-64')]}></View>
          </View>
        </>
      }
      {scanned &&
        <View
          style={[tw('flex flex-col justify-center items-center')]}
        >
          <Text style={[tw('text-white text-2xl')]}>Scan Result</Text>
          <Text style={[tw('bg-white mx-2 py-4')]}>
            {JSON.stringify(credentialOfferParams, null, 2)}
          </Text>
          <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
        </View>
      }
    </View>
  );
}