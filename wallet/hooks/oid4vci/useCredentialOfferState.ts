import { useRecoilState } from 'recoil';
import { CredentialOfferState } from '@/states/oid4vci';
import { CredentialOffer } from '@/types/oid4vci';
import { Alert } from 'react-native';

export const useCredentialOfferState = () => {
    const [credentialOfferParams, setCredentialOfferParams] = useRecoilState(CredentialOfferState);

    const parseQr = async (data: string): Promise<void> => {
        try {
            setCredentialOfferParams(() => undefined);
            const [_, query] = data.split("://?");
            const [method, str] = decodeURIComponent(query).split("=");
            if (method === "credential_offer") {
                const params = JSON.parse(str);
                validateParams(params) && setCredentialOfferParams(() => params);
            } else if (method === "credential_offer_uri") {
                const res = await fetch(str);
                const params = await res.json();
                validateParams(params) && setCredentialOfferParams(() => params);
            }
        } catch (e) {
            console.error(e);
        }
    }

    const validateParams = (params: unknown): params is CredentialOffer => {
        const isValid = "credential_issuer" in (params as CredentialOffer) && "credentials" in (params as CredentialOffer) && (params as CredentialOffer).credentials.length > 0
            && "grants" in (params as CredentialOffer) && ("authorization_code" in (params as CredentialOffer).grants || "pre-authorized_code" in (params as CredentialOffer).grants)
        if (!isValid) {
            Alert.alert("invalid_credentil_offer", "Required paraeters are missing.")
        }
        return isValid;
    }

    return {
        credentialOfferParams,
        parseQr
    };
};
