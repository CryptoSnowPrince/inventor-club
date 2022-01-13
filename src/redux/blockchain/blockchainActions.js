// constants
import Web3EthContract from "web3-eth-contract";
import Web3 from "web3";

// const provider = Web3.providers.HttpProvider(config.testNetUrl);
// const web3 = new Web3(Web3.givenProvider || provider);
const web3 = new Web3(Web3.givenProvider);
let CONFIG = null;

// log
import { fetchData } from "../data/dataActions";

const connectRequest = () => {
  return {
    type: "CONNECTION_REQUEST",
  };
};

const connectSuccess = (payload) => {
  return {
    type: "CONNECTION_SUCCESS",
    payload: payload,
  };
};

const connectFailed = (payload) => {
  return {
    type: "CONNECTION_FAILED",
    payload: payload,
  };
};

const updateAccountRequest = (payload) => {
  return {
    type: "UPDATE_ACCOUNT",
    payload: payload,
  };
};

const checkNetwork = (chainId) => {
  const ETH_MainChainId = 1;
  if (web3.utils.toHex(chainId) !== web3.utils.toHex(ETH_MainChainId)) {
    dispatch(connectFailed(`Change network to ethereum.`));
  }
}

export const connect = () => {
  return async (dispatch) => {
    dispatch(connectRequest());
    const abiResponse = await fetch("/config/abi.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const abi = await abiResponse.json();
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    CONFIG = await configResponse.json();

    let ethereum;
    try {
      if (window.ethereum) {
        await window.ethereum.enable();
      }
      // ethereum = await window.web3Modal.connect();
      // window.provider = ethereum;
    } catch (e) {
      console.log("Could not get a wallet connection", e);
      return;
    }
    // providerObj.on("accountsChanged", (accounts) => {
    //   console.log(`accountsChanged = ${accounts}`);
    //   //fetchAccountData();
    // });
    // providerObj.on("chainChanged", (chain_id) => {
    //   console.log(`chainChanged ${chain_id}`);
    //   fetchAccountData();
    // });

    // providerObj.on("disconnect", (error) => {
    //   console.log(`disconnect ${error}`);
    //   onDisconnect();
    // });
    // await fetchAccountData();


    // const { ethereum } = window;
    // const metamaskIsInstalled = ethereum && ethereum.isMetaMask;
    // if (metamaskIsInstalled) {
    console.log(window.ethereum, "======")
      // Web3EthContract.setProvider(ethereum);
      // let web3 = new Web3(ethereum);
      try {
        // const accounts = await ethereum.request({
        //   method: "eth_requestAccounts",
        // });
        // const networkId = await ethereum.request({
        //   method: "net_version",
        // });
        console.log(window.ethereum, "======1111")
        const accounts = await web3.eth.getAccounts();
        console.log(window.ethereum, "======1111")

        const networkId = await web3.eth.getChainId();
        if (networkId == CONFIG.NETWORK.ID) {
          const SmartContractObj = new web3.eth.Contract(
            abi,
            CONFIG.CONTRACT_ADDRESS
          );
          dispatch(
            connectSuccess({
              account: accounts[0],
              smartContract: SmartContractObj,
              web3: web3,
              chainId: networkId,
            })
          );
          // Add listeners start
          window.ethereum.on("accountsChanged", (accounts) => {
            dispatch(updateAccount(accounts[0]));
          });
          window.ethereum.on("chainChanged", () => {
            window.location.reload();
          });
          // Add listeners end
        } else {
          dispatch(connectFailed(`Change network to ${CONFIG.NETWORK.NAME}.`));
        }
      } catch (err) {
        dispatch(connectFailed("Something went wrong."));
      }
    // } else {
    //   dispatch(connectFailed("Install Metamask."));
    // }
  };
};

export const updateAccount = (account) => {
  return async (dispatch) => {
    dispatch(updateAccountRequest({ account: account }));
    dispatch(fetchData(account));
  };
};


// if (window.ethereum) {
//   window.ethereum.on('accountsChanged', function (accounts) {
//       dispatch({
//           type: "GET_USER_INFO",
//           payload: { account: accounts[0] }
//       });
//   })
//   window.ethereum.on('chainChanged', function (chainId) {
//       checkNetwork(chainId);
//       dispatch({
//           type: "UPDATE_CHAIN_ID",
//           payload: { chainId: chainId }
//       });
//   });
//   web3.eth.getChainId().then((chainId) => {
//       checkNetwork(chainId);
//       dispatch({
//           type: "UPDATE_CHAIN_ID",
//           payload: { chainId: chainId }
//       });
//   })
//   // updateGlobalInfo();
// }