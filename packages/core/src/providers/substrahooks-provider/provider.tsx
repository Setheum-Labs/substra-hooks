import React, { ReactNode, useEffect, useState } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ApiProviders, SubstraHooksContext } from './context';
import { fetchSystemProperties } from '../../helpers/fetch-system-properties';
import { ExtensionProvider } from '../extension';
import { useIsMountedRef } from '../../helpers/use-is-mounted-ref';
import { RegistryTypes } from '@polkadot/types/types';

const _apiProviders: ApiProviders = {};

export type ApiProviderConfig = Record<
  string,
  { id: string; wsProviderUrl: string; types?: RegistryTypes }
>;

interface ISubstraHooksProviderProps {
  apiProviderConfig: ApiProviderConfig | null;
  defaultApiProviderId: string;
  autoInitialiseExtension?: boolean;
  children: ReactNode;
}

export const initPolkadotPromise = async (
  id: string,
  wsProviderUrl: string,
  types?: RegistryTypes,
) => {
  if (_apiProviders[id]) return _apiProviders[id];
  const wsProvider = new WsProvider(wsProviderUrl);
  const polkadotApi = await ApiPromise.create({ provider: wsProvider, types: types });
  await polkadotApi.isReady;
  const systemProperties = await fetchSystemProperties(polkadotApi);
  _apiProviders[id] = {
    systemProperties,
    apiProvider: polkadotApi,
  };
  return _apiProviders[id];
};

const initAllApis = async (apiProviderConfig: ApiProviderConfig) => {
  await Promise.all(
    Object.keys(apiProviderConfig).map(async (configId) =>
      initPolkadotPromise(
        apiProviderConfig[configId].id,
        apiProviderConfig[configId].wsProviderUrl,
        apiProviderConfig[configId].types,
      ),
    ),
  );
  return _apiProviders;
};

export const createSubstraHooksProvider = () => {
  const SubstraHooksProvider = ({
    children,
    apiProviderConfig,
    defaultApiProviderId,
    autoInitialiseExtension,
  }: ISubstraHooksProviderProps) => {
    const [apiProviders, setApiProviders] = useState<ApiProviders>(_apiProviders);
    const isMountedRef = useIsMountedRef();

    useEffect(() => {
      if (apiProviderConfig) {
        initAllApis(apiProviderConfig).then((apiProviders) => {
          if (isMountedRef.current) {
            setApiProviders(apiProviders);
          }
        });
      }
    }, [JSON.stringify(apiProviderConfig), isMountedRef]);

    return (
      <SubstraHooksContext.Provider value={{ apiProviders, defaultApiProviderId }}>
        <ExtensionProvider autoInitialiseExtension={autoInitialiseExtension}>
          {children}
        </ExtensionProvider>
      </SubstraHooksContext.Provider>
    );
  };

  return SubstraHooksProvider;
};

export const SubstraHooksProvider = createSubstraHooksProvider();
