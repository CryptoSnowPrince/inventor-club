const initialState = {
  loading: false,
  account: "",
  chainId: 0,
  smartContract: null,
  web3: null,
  errorMsg: "",
};

const blockchainReducer = (state = initialState, action) => {
  switch (action.type) {
    // custom +
    case "GET_USER_INFO":
      return {
        ...state,
        account: (action.payload && action.payload.account) ? action.payload.account : state.account
      };
    case "UPDATE_CHAIN_ID":
      return {
        ...state,
        chainId: action.payload.chainId
      };
    // custom -
    case "CONNECTION_REQUEST":
      return {
        ...initialState,
        loading: true,
      };
    case "CONNECTION_SUCCESS":
      return {
        ...state,
        loading: false,
        account: action.payload.account,
        smartContract: action.payload.smartContract,
        web3: action.payload.web3,
      };
    case "CONNECTION_FAILED":
      return {
        ...initialState,
        loading: false,
        errorMsg: action.payload,
      };
    case "UPDATE_ACCOUNT":
      return {
        ...state,
        account: action.payload.account,
      };
    default:
      return state;
  }
};

export default blockchainReducer;
