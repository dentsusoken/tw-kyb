import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { CredentialOfferState } from '@/states/oid4vci';
import { CredentialOffer } from '@/types/oid4vci';

export const useCredentialOfferState = () => {
    const [credentialOfferParams, setCredentialOfferParams] = useRecoilState(CredentialOfferState);


    const parseQr = async (data: string): Promise<void> => {
        const [endpoint, query] = data.split("://?");
        const [method, str] = decodeURIComponent(query).split("=");
        if (method === "credential_offer") {
            const params = JSON.parse(str);
            // if (validateParams(params)) {
            setCredentialOfferParams(params);
            // } else {
            //     // TODO implement proper error
            //     throw new Error("invalid credential offer");
            // }
        } else if (method === "credential_offer_uri") {
            // TODO fetch uri
            const res = await fetch(str);

        }
    }

    const validateParams = (params: object): params is CredentialOffer => {
        return "credential_offer" in (params as CredentialOffer) && "credentials" in (params as CredentialOffer) && (params as CredentialOffer).credentials.length > 0
            && "grants" in (params as CredentialOffer) && ("issuer_state" in (params as CredentialOffer).grants || "pre-authorized_code" in (params as CredentialOffer).grants)
    }

    return {
        credentialOfferParams,
        parseQr
    };
};
