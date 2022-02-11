import { cloneDeep } from 'lodash';

export const RESET_CUSTOM_DATA = 'gas/RESET_CUSTOM_DATA';
export const SET_CUSTOM_DATA = 'gas/SET_CUSTOM_DATA';
export const SET_CUSTOM_GAS_LIMIT = 'gas/SET_CUSTOM_GAS_LIMIT';
export const SET_CUSTOM_GAS_PRICE = 'gas/SET_CUSTOM_GAS_PRICE';
export const SET_GAS_TYPE = 'gas/SET_GAS_TYPE';
export const RESET_GAS_TYPE = 'gas/SET_GAS_TYPE';
export const SET_CUSTOM_TYPE = 'gas/SET_CUSTOM_TYPE';

const initState = {
  customType: false,
  customData: {
    gasLimit: 21000,
    maxPriorityFee: null,
    maxFee: null,
  },
  gasType: 'medium',
};

// Reducer
export default function reducer(state = initState, action) {
  switch (action.type) {
    case SET_CUSTOM_GAS_PRICE:
      return {
        ...state,
        customData: {
          ...state.customData,
          price: action.value,
        },
      };
    case SET_CUSTOM_GAS_LIMIT:
      return {
        ...state,
        customData: {
          ...state.customData,
          limit: action.value,
        },
      };
    case SET_CUSTOM_TYPE:
      return {
        ...state,
        customType: action.value,
      };
    case SET_CUSTOM_DATA:
      return {
        ...state,
        customData: action.value,
      };
    case RESET_CUSTOM_DATA:
      return {
        ...state,
        customData: cloneDeep(initState.customData),
      };
    case SET_GAS_TYPE:
      return {
        ...state,
        gasType: action.value,
      };
    case RESET_GAS_TYPE:
      return {
        ...state,
        gasType: null,
      };
    default:
      return state;
  }
}

// import { createSlice } from '@reduxjs/toolkit';

// const initState = {
//   customData: {
//     gasLimit: 21000,
//     maxPriorityFee: null,
//     maxFee: null,
//   },
//   gasType: null,
// };

// export const appStateSlice = createSlice<
//   any,
//   {
//     SET_CUSTOM_DATA: (state: any) => any;
//     // RESET_CUSTOM_DATA: (state: any) => any;
//     SET_GAS_TYPE: (state: any) => any;
//     // RESET_GAS_TYPE: (state: any) => any;
//   }
// >({
//   name: 'gas',
//   initialState: initState,
//   reducers: {
//     SET_CUSTOM_DATA(state) {
//       return {
//         ...state,
//         isLoading: true,
//       };
//     },
//     SET_GAS_TYPE(state) {
//       return {
//         ...state,
//         isLoading: false,
//       };
//     },
//   },
// });

// export const { SET_CUSTOM_DATA, SET_GAS_TYPE } = appStateSlice.actions;

// export default appStateSlice.reducer;
