import { merge } from 'ramda';
import { ExtensionState } from './context';
import { ActionMap } from '../../types/reducer';

export enum Types {
  W3_ENABLE = 'W3_ENABLE',
  ACCOUNTS_SET = 'ACCOUNTS_SET',
  INITIALIZE = 'INITIALIZE',
}

type ExtensionPayload = {
  [Types.W3_ENABLE]: {
    w3Enabled: ExtensionState['w3Enabled'];
  };
  [Types.ACCOUNTS_SET]: {
    accounts: ExtensionState['accounts'];
  };
  [Types.INITIALIZE]: {
    initialised: ExtensionState['initialised'];
  };
};

export type ExtensionActions = ActionMap<ExtensionPayload>[keyof ActionMap<ExtensionPayload>];

export const extensionReducer = (state: ExtensionState, action: ExtensionActions) => {
  switch (action.type) {
    case Types.W3_ENABLE:
      return merge(state, { w3Enabled: action.payload.w3Enabled });

    case Types.ACCOUNTS_SET:
      return merge(state, { accounts: action.payload.accounts });

    case Types.INITIALIZE:
      return merge(state, { initialised: action.payload.initialised });

    default:
      return state;
  }
};
