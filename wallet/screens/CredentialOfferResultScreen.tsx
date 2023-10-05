import React, { FC, useState } from 'react';
import tw from 'tailwind-rn';
import { Text, SafeAreaView, View, Button } from 'react-native';
import { useCredentialOfferState } from '@/hooks/oid4vci/useCredentialOfferState';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types';
import { Title } from '@/components/Title';
import { useAuthorization } from '@/hooks/oid4vci/useAuthorization';
import { useToken } from '@/hooks/oid4vci/useToken';
import { InputField } from '@/components/InputField';
import { AuthTokenResponse } from '@/auth-session/tokenRequest';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DemoMenu'>;
};
export const CredentialOfferResultScreen: FC<Props> = ({ navigation }) => {
  const [error, setError] = useState('');
  const [userPinReq, setUserPinReq] = useState(false);
  const [token, setToken] = useState<AuthTokenResponse | undefined>();
  const [userPin, setUserPin] = useState('');
  const { credentialOfferParams } = useCredentialOfferState();
  const { authorization } = useAuthorization(credentialOfferParams);
  const { AuthTokenRequest, PreAuthTokenRequest } = useToken();

  const onPress = async () => {
    if (
      credentialOfferParams &&
      'authorization_code' in credentialOfferParams?.grants
    ) {
      const { result, codeVerifier } = await authorization();
      if (result.params.error) {
        setError(result.params.error);
        return;
      }
      setToken(await AuthTokenRequest(result, codeVerifier));
      return;
    }
    if (
      credentialOfferParams &&
      credentialOfferParams.grants[
        'urn:ietf:params:oauth:grant-type:pre-authorized_code'
      ]?.user_bin_required
    ) {
      setUserPinReq(true);
      return;
    }
    if (
      !credentialOfferParams ||
      !credentialOfferParams.grants[
        'urn:ietf:params:oauth:grant-type:pre-authorized_code'
      ]?.['pre-authorized_code']
    ) {
      setError('authorized_code is undefined');
      return;
    }
    const preAuthorizedCode =
      credentialOfferParams.grants[
        'urn:ietf:params:oauth:grant-type:pre-authorized_code'
      ]['pre-authorized_code'];
    setToken(await PreAuthTokenRequest(preAuthorizedCode));
  };

  const onPressPin = async () => {
    if (
      !credentialOfferParams ||
      !credentialOfferParams.grants[
        'urn:ietf:params:oauth:grant-type:pre-authorized_code'
      ]?.['pre-authorized_code']
    ) {
      setError('authorized_code is undefined');
      return;
    }
    const preAuthorizedCode =
      credentialOfferParams.grants[
        'urn:ietf:params:oauth:grant-type:pre-authorized_code'
      ]['pre-authorized_code'];
    setToken(await PreAuthTokenRequest(preAuthorizedCode, userPin));
  };

  const reset = () => {
    setToken(undefined);
  };

  if (token) {
    return (
      <SafeAreaView style={tw('flex-1 bg-gray-100 items-center')}>
        <Title first="Token" last="Result" />
        <View style={[tw('flex flex-col justify-center items-center')]}>
          <Text style={[tw('bg-white mx-2 py-4')]}>
            {JSON.stringify(token, null, 2)}
          </Text>
          <Button title={'Tap to Reset'} onPress={reset} />
        </View>
      </SafeAreaView>
    );
  }

  if (userPinReq) {
    return (
      <SafeAreaView style={tw('flex-1 bg-gray-100 items-center')}>
        <Title first="Input" last="Pin" />
        <View style={[tw('flex flex-col justify-center items-center')]}>
          <InputField
            leftIcon="keyboard"
            placeholder="User Pin"
            autoFocus
            value={userPin}
            onChangeText={(text: string) => setUserPin(text)}
          />
          <Button title={'Submit'} onPress={onPressPin} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={tw('flex-1 bg-gray-100 items-center')}>
        <Title first="Offer" last="Result" />
        <View style={[tw('flex flex-col justify-center items-center')]}>
          <Text style={[tw('text-2xl')]}>{error}</Text>
          <Button
            title={'Tap to Return'}
            onPress={() => {
              navigation.goBack();
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw('flex-1 bg-gray-100 items-center')}>
      <Title first="Offer" last="Result" />
      <View style={[tw('flex flex-col justify-center items-center')]}>
        <Text style={[tw('text-2xl')]}>
          {credentialOfferParams ? 'Result' : 'Faild'}
        </Text>
        {credentialOfferParams && (
          <Text style={[tw('bg-white mx-2 py-4')]}>
            {JSON.stringify(credentialOfferParams, null, 2)}
          </Text>
        )}
        <Button title={'get Access Token'} onPress={onPress} />
        <Button
          title={'Tap to Return'}
          onPress={() => {
            navigation.goBack();
          }}
        />
      </View>
    </SafeAreaView>
  );
};
