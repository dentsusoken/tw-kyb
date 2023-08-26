import React, { FC } from 'react';
import { useRecoilState } from 'recoil';
import tw from 'tailwind-rn';
import { View, Alert } from 'react-native';
import { auth } from '@/firebaseConfig';
import { userState } from '@/states';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types';
import { IconButton } from '@/components/IconButton';

import { QRScanStackNavigator } from "./QRScanStackNavigator"
import { DemoMenu } from '@/screens/DemoMenuScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const DemoStackNavigator: FC = () => {
  const [user, setUser] = useRecoilState(userState);
  const signOut = async () => {
    try {
      await auth.signOut();
      setUser({ uid: '', email: '' });
    } catch {
      Alert.alert('Logout error');
    }
  };
  return (
    <Stack.Navigator>
      <Stack.Group
        screenOptions={{
          headerStyle: {
            backgroundColor: '#008b8b',
          },
          headerTitle: user.email,
          headerTintColor: 'white',
          headerBackTitle: 'Back',
          headerRight: () => (
            <View style={tw('mr-3')}>
              <IconButton
                name="logout"
                size={20}
                color="white"
                onPress={signOut}
              />
            </View>
          ),
        }}
      >
        <Stack.Screen name="DemoMenu" component={DemoMenu} />
        <Stack.Screen name="QRScan" component={QRScanStackNavigator} />
      </Stack.Group>
    </Stack.Navigator>
  );
};
