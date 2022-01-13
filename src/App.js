import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import AccordionWrapper from './components/AccordionWrapper'; 
import AccordionItem from './components/AccordionItem';
import * as s from "./styles/globalStyles";
import styled from "styled-components";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: #ffd587;
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: #000773;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  
  const Web3Modal = window.Web3Modal.default;
  const WalletConnectProvider = window.WalletConnectProvider.default;
  const Fortmatic = window.Fortmatic;
  
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 20) {
      newMintAmount = 20;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  useEffect(() => {
    const initWalletConnect = () => {
      const providerOptions = {
        disableInjectedProvider: true,
        injected: {
          display: {
            name: "MetaMask",
            description: "For desktop web wallets",
          },
          package: null,
        },
        walletconnect: {
          display: {
            name: "WalletConnect",
            description: "For Mobile App Wallets",
          },
          package: WalletConnectProvider,
          options: {
            // infuraId: "40bd58898adb4907b225865d9cedcd4a",   //mainnet
            rpc: {
              97: "https://data-seed-prebsc-1-s1.binance.org:8545/",
              //56: 'https://bsc-dataseed.binance.org/'
            },
            network: "binance", // here
          },
          // network: 'mainnet',
        },
        fortmatic: {
          package: Fortmatic,
          options: {
            // Mikko's TESTNET api key
            key: "pk_test_391E26A3B43A3350"
          }
        },
        'custom-binance': {
          display: {
            name: 'Binance',
            description: 'Binance Chain Wallet',
            // logo: require(`images/wallets/binance-wallet.png`)
            logo: 'data:image/png;base64,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'
          },
          package: 'binance',
          connector: async (ProviderPackage, options) => {
            const provider = window.BinanceChain;
            await provider.enable();
            return provider;
          },
        },
        // 'custom-math': {
        //   display: {
        //     name: 'Math',
        //     description: 'Math Wallet',
        //   },
        //   package: 'math',
        //   connector: connectors.injected,
        // },
        // 'custom-twt': {
        //   display: {
        //     name: 'Trust',
        //     description: 'Trust Wallet',
        //   },
        //   package: 'twt',
        //   connector: connectors.injected,
        // },
        // 'custom-safepal': {
        //   display: {
        //     name: 'SafePal',
        //     description: 'SafePal App',
        //   },
        //   package: 'safepal',
        //   connector: connectors.injected,
        // },
      };

      let web3ModalObj = new Web3Modal({
        // network: "mainnet",
        cacheProvider: false,
        providerOptions,
      });
      window.web3Modal = web3ModalObj;
    };
    initWalletConnect();
  }, [WalletConnectProvider, Web3Modal]);

  const data1 = [
    {
      "title": "Why do you have two open seas?",
      "description": "We originally started our project on Polygon and after lots of requests, we decided to switch to Ethereum. As a result this required a new Open Sea."
    },
    {
      "title": "How will shares in the holding company work? Who will choose the start up?",
      "description": "Our team will shortlist companies that fall within our investment criteria and the community will vote on which to invest in."
    },
    {
      "title": "Whats your investment philosophy?",
      "description": "We are specifically focused on seed round artificial intelligence, sustainable agriculture and biotechnology start up. We believe these industries will rapidly grow over the next 20 years."
    },
    {
      "title": "Why is your trading volume low?",
      "description": "In order for our core utilities: The private mastermind, holding company & business coaching to be successful, we need to choose our NFT holders. This means making growth a lower priority and quality of NFT holders a higher priority."
    },
    {
      "title": "Why is the first 1000 NFTS sold whitelist only?",
      "description": "A skyscraper built on a shaky foundation will collapse”. The quality of our initial holders is crucial to the success of our utilities."
    },
    {
      "title": "How will you use your profits?",
      "description": "The team will take distributions and the rest will be reinvested back into making the project successful. We will reinvest back into marketing so our holders can sell at higher prices."
    },
    {
      "title": "What are the utilities?",
      "description": "Weekly business coaching with different members of the community. 2. Shares in a holding company. 3. Private mastermind. 4. $100K distributed to holders randomly at sell out."
    },
    {
      "title": "What is the long term vision?",
      "description": "Our goal is to make so our project has the #1 utility NFT."
    },
    {
      "title": "How likely is your success?",
      "description": "Nothing in life is certain except death, gravity and taxes. However, we will do whatever it takes to make this project successful. Even if that means pitching strangers on the street or doing door to door sales in wealthy neighborhoods."
    },
    {
      "title": "What makes you qualified for this project?",
      "description": "Our team member David sold 4000 NTFS with Enigma, our team member Dev has  helped scale various crypto projects, our team member Tristen built an 8 figure company and our team member Theo has raised millions of dollars for investment banks."
    },
    {
      "title": "Whats your marketing strategy?",
      "description": "For the first 1000 NFTs we will sell through 1 on 1 conversations and using a “sales funnel”.After 1000 NFTS have sold we will focus on building a fanatic community of 50,000 discord members (we currently have 12,000). We will also get influencers in the entrepreneurship space on instagram, youtube and podcasts to promote the project."
    },
    {
      "title": "When is your public mint available to anyone?",
      "description": "We will announce it after 1000 NFTs are sold."
    }
  ];

  return (

    <s.Screen>

    <div className="content__wrapper">
      <header className="header">
        <div className="container">
          <div className="row align-vertical-center header__row align-horisontal-between">
            <nav className="nav js-nav">
              <p className="nav__title">Menu</p>
              <button className="btn-close js-close-mobile-menu-btn" type="button">
                {/* <svg viewBox="0 0 14 14"  xmlns="http://www.w3.org/2000/svg">
                  <g >
                    <path d="M2.69 0H0V2.69H2.69V0Z" />
                    <path d="M5.41998 2.73001H2.72998V5.42001H5.41998V8.09001V8.11001H8.10998V10.78H10.8V8.09001H8.10998V5.42001V5.40001H5.41998V2.73001Z" fill="#FFD587"/>
                    <path d="M5.40997 8.10999H2.71997V10.8H5.40997V8.10999Z" />
                    <path d="M2.71002 10.81H0.0200195V13.5H2.71002V10.81Z" />
                    <path d="M13.52 10.81H10.83V13.5H13.52V10.81Z" />
                    <path d="M10.8 2.70999H8.10999V5.39999H10.8V2.70999Z"/>
                    <path d="M13.5001 0H10.8101V2.69H13.5001V0Z" />
                  </g>
                </svg> */}
              </button>
              <ul className="nav__list">
                <li className="nav__item"><a href="#story" className="nav__link js-smooth-scroll-link">Story</a></li>
                <li className="nav__item"><a href="#roadmap" className="nav__link js-smooth-scroll-link">Roadmap</a></li>
                <li className="nav__item"><a href="#collection" className="nav__link js-smooth-scroll-link">Collection</a></li>
                <li className="nav__item"><a href="#charity" className="nav__link js-smooth-scroll-link">Charity</a></li>
                <li className="nav__item"><a href="#team" className="nav__link js-smooth-scroll-link">Team</a></li>
              </ul>

            </nav>
            <button type="button" className="btn-hamburger js-open-mobile-menu-btn"></button>
          </div>
        </div>
      </header>
      <main className="main">
        <section className="sect__promo blend-overlay "   style={ { backgroundImage: "url('wp-content/uploads/2021/11/promo-bg.png')" } }>
          <div className="container">
            <div className="promo-block text-center">
              {/* <p className="date decor-title"> */}
                <div style={{ marginBottom: "4vw" }}>
                  <div>
                    {/* {data.totalSupply} / {CONFIG.MAX_SUPPLY} */}
                  </div>
                  <div>
                    {/* <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                      {//truncate(CONFIG.CONTRACT_ADDRESS, 15)}
                    </StyledLink> */}
                  </div>
                  {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
                    <>
                      <h3
                      >
                        The sale has ended.
                      </h3>
                      <h3
                      >
                        You can still find {CONFIG.NFT_NAME} on
                      </h3>
                      <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                        {CONFIG.MARKETPLACE}
                      </StyledLink>
                    </>
                  ) : (
                    <>
                      {/* <h3>
                        1 {//CONFIG.SYMBOL} costs {CONFIG.DISPLAY_COST}{" "}
                        {CONFIG.NETWORK.SYMBOL}.
                      </h3> */}
                      {/* <h3>
                        Excluding gas fees.
                      </h3> */}
                      <br/>
                      {blockchain.account === "" ||
                      blockchain.smartContract === null ? (
                        <div>
                          <h3>
                            {/* Connect to the {CONFIG.NETWORK.NAME} network */}
                          </h3>
                          <a href="#" className="btn" rel="nofollow" target="_blank"
                            style = {{marginBottom: "7px", fontSize: "14px"}}
                            onClick={(e) => {
                              e.preventDefault();
                              dispatch(connect());
                              getData();
                            }}
                          >
                            MINT HERE</a>
                          {blockchain.errorMsg !== "" ? (
                            <>
                              <h3>
                                {blockchain.errorMsg}
                              </h3>
                            </>
                          ) : null}
                        </div>
                      ) : (
                        <>
                          {/* <h3 >
                            {feedback}
                          </h3> */}
                          <div style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginBottom: "0.5vw"
                            }}  
                          >
                            <StyledRoundButton
                              style={{ lineHeight: 0.4 }}
                              disabled={claimingNft ? 1 : 0}
                              onClick={(e) => {
                                e.preventDefault();
                                decrementMintAmount();
                              }}
                            >
                              -
                            </StyledRoundButton>
                            <h3 style={{ marginLeft: "2vw", marginRight: "2vw", fontSize: "3vw"}}>
                              {mintAmount}
                            </h3>
                            <StyledRoundButton
                              disabled={claimingNft ? 1 : 0}
                              onClick={(e) => {
                                e.preventDefault();
                                incrementMintAmount();
                              }}
                            >
                              +
                            </StyledRoundButton>
                          </div>
                          <div>
                            <a href="#" className="btn" rel="nofollow" target="_blank" disabled={claimingNft ? 1 : 0}
                              onClick={(e) => {
                                e.preventDefault();
                                claimNFTs();
                                getData();
                            }}>
                              {claimingNft ? "BUSY" : "BUY"}
                            </a>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>


                {/* <span className="decor-title__text">Pre-Sale Sold Out! Next Launch: Dec 5th</span> */}
                {/* <span className="decor-title__corner decor-title__corner--left">
                  <svg viewBox="0 0 19 35" xmlns="http://www.w3.org/2000/svg">
                    <g>
                      <path d="M18.04 28.57H12.03V34.58H18.04V28.57Z" />
                      <path d="M6.01 0H0V6.01H6.01V0Z" />
                      <path d="M12.03 22.55H0V34.58H12.03V22.55Z" />
                    </g>
                  </svg>
                </span>
                <span className="decor-title__corner decor-title__corner--right">
                  <svg viewBox="0 0 19 35" xmlns="http://www.w3.org/2000/svg">
                    <g>
                      <path d="M18.04 28.57H12.03V34.58H18.04V28.57Z" />
                      <path d="M6.01 0H0V6.01H6.01V0Z" />
                      <path d="M12.03 22.55H0V34.58H12.03V22.55Z" />
                    </g>
                  </svg>
                </span>						 */}
              {/* </p> */}
              <h1 className="title">Own A Rare<br/> Inventor NFT</h1>
              <h2 className="subtitle">9200 famous inventors Inspiring the world with their creations</h2>
              {/* <div className="promo-btns">
                <a href="https://testnets.opensea.io/collection/inventor-club" className="btn" rel="nofollow" target="_blank">View On OpenSea</a>
                <a href="https://discord.gg/inventorclubnft" className="btn" rel="nofollow" target="_blank">Join Discord</a>
              </div> */}
            </div>
          </div>
          <div className="characters-slider js-characters-slider">
            <div className="character-card"><div className="character-card__img"><img  alt="" data-src="https://inventorclub.io/wp-content/uploads/2021/11/T8.jpg" className="lazyload" src="https://inventorclub.io/wp-content/uploads/2021/11/T8.jpg"/><noscript><img src="https://inventorclub.io/wp-content/uploads/2021/11/T8.jpg" alt=""/></noscript></div></div>
            <div className="character-card"><div className="character-card__img"><img  alt="" data-src="https://inventorclub.io/wp-content/uploads/2021/11/T2.jpg" className="lazyload" src="https://inventorclub.io/wp-content/uploads/2021/11/T2.jpg"/><noscript><img src="https://inventorclub.io/wp-content/uploads/2021/11/T2.jpg" alt=""/></noscript></div></div>
            <div className="character-card"><div className="character-card__img"><img  alt="" data-src="https://inventorclub.io/wp-content/uploads/2021/11/T3.jpg" className="lazyload" src="https://inventorclub.io/wp-content/uploads/2021/11/T3.jpg"/><noscript><img src="https://inventorclub.io/wp-content/uploads/2021/11/T3.jpg" alt=""/></noscript></div></div>
            <div className="character-card"><div className="character-card__img"><img  alt="" data-src="https://inventorclub.io/wp-content/uploads/2021/11/T4.jpg" className="lazyload" src="https://inventorclub.io/wp-content/uploads/2021/11/T4.jpg"/><noscript><img src="https://inventorclub.io/wp-content/uploads/2021/11/T4.jpg" alt=""/></noscript></div></div>
            <div className="character-card"><div className="character-card__img"><img  alt="" data-src="https://inventorclub.io/wp-content/uploads/2021/11/T5.jpg" className="lazyload" src="https://inventorclub.io/wp-content/uploads/2021/11/T5.jpg"/><noscript><img src="https://inventorclub.io/wp-content/uploads/2021/11/T5.jpg" alt=""/></noscript></div></div>
            <div className="character-card"><div className="character-card__img"><img  alt="" data-src="https://inventorclub.io/wp-content/uploads/2021/11/T6.jpg" className="lazyload" src="https://inventorclub.io/wp-content/uploads/2021/11/T6.jpg"/><noscript><img src="https://inventorclub.io/wp-content/uploads/2021/11/T6.jpg" alt=""/></noscript></div></div>
            <div className="character-card"><div className="character-card__img"><img  alt="" data-src="https://inventorclub.io/wp-content/uploads/2021/11/T7.jpg" className="lazyload" src="https://inventorclub.io/wp-content/uploads/2021/11/T7.jpg"/><noscript><img src="https://inventorclub.io/wp-content/uploads/2021/11/T7.jpg" alt=""/></noscript></div></div>
            <div className="character-card"><div className="character-card__img"><img  alt="" data-src="https://inventorclub.io/wp-content/uploads/2021/11/T8.jpg" className="lazyload" src="https://inventorclub.io/wp-content/uploads/2021/11/T8.jpg"/><noscript><img src="https://inventorclub.io/wp-content/uploads/2021/11/T8.jpg" alt=""/></noscript></div></div>
            <div className="character-card"><div className="character-card__img"><img  alt="" data-src="https://inventorclub.io/wp-content/uploads/2021/11/T9.jpg" className="lazyload" src="https://inventorclub.io/wp-content/uploads/2021/11/T9.jpg"/><noscript><img src="https://inventorclub.io/wp-content/uploads/2021/11/T9.jpg" alt=""/></noscript></div></div>
            <div className="character-card"><div className="character-card__img"><img  alt="" data-src="https://inventorclub.io/wp-content/uploads/2021/11/T10.jpg" className="lazyload" src="https://inventorclub.io/wp-content/uploads/2021/11/T10.jpg"/><noscript><img src="https://inventorclub.io/wp-content/uploads/2021/11/T10.jpg" alt=""/></noscript></div></div>
          </div>
          <div className="js-bg-parallax promo-bg" data-parallax-direction="vertical-bottom" data-parallax-speed="0.15"></div>
        </section>
        <section className="sect__information">
          <div className="container">
            <div className="row align-horisontal-start row-gutters information-items__row">
                <div className="information-item__wrapper col-w-33">
                  <div className="information-item decor-corners">
                    <span className="information-item__count">01</span>
                    <p>9200 Famous<br/>Inventor NFTs</p>
                  </div>
                </div>
                <div className="information-item__wrapper col-w-33">
                  <div className="information-item decor-corners">
                    <span className="information-item__count">02</span>
                    <p>Featuring:<br/> Jeff Bezos, Elon Musk, Benjamin Franklin, Albert Einstein, Thomas Edison & More!</p>
                  </div>
                </div>
                <div className="information-item__wrapper col-w-33">
                  <div className="information-item decor-corners">
                    <span className="information-item__count">03</span>
                    <p>Each NFT eventually gives the owner exclusive rights to sell their own NFTS on our future marketplace.</p>
                  </div>
                </div>
            </div>
          </div>
          <svg viewBox="0 0 188 88"  xmlns="http://www.w3.org/2000/svg" className="cube-corners-svg cube-corners-svg__top"> 
            <g >
              <path d="M187.24 43.79H143.45V87.58H187.24V43.79Z" />
              <path d="M43.79 43.79H0V87.58H43.79V43.79Z" />
              <path d="M143.44 0H99.65V43.79H143.44V0Z" />
            </g>
          </svg>
          <svg viewBox="0 0 188 88" xmlns="http://www.w3.org/2000/svg" className="cube-corners-svg cube-corners-svg__bottom">
            <g>
              <path d="M43.79 0H0V43.79H43.79V0Z" />
              <path d="M187.24 0H143.45V43.79H187.24V0Z" />
              <path d="M87.58 43.79H43.79V87.58H87.58V43.79Z"/>
            </g>
          </svg>
        </section>
        <section className="sect__story gutters  gradient-bg" id="story">
          <div className="container">
            <div className="story">
              <div className="row align-vertical-center align-horisontal-between story__row row-norwap">
                <div className="story-text__col">
                  <h2 className="sect-title js-typing-text" >The Story</h2>
                  <div className="content">
                    <p>In pursuit of greater prosperity, Earth’s Chief Simulation Officer created 9,200 famous inventors responsible for making the world a better place. Only these inventors have the courage, creativity & grit to turn their ideas into inventions. A sense of purpose is everywhere in our discord. The Inventor’s Club is a collection of 9,200 AI-generated collectibles enhancing the Ethereum Blockchain.</p>
                    <p>&nbsp;</p>
                    <p><a href="https://drive.google.com/file/d/1-09aUc3sO0Ld8VbNFFyYPJJXxnmozBdm/view?usp=sharing"><strong>READ OUR WHITEPAPER HERE</strong></a></p>
                  </div>
                </div>
                  <div className="story-slider__col">
                    <div className="row align-vertical-end  story-slider__row">
                      <div className="story-slider__main js-story-slider">
                        <div className="character-card"><div className="character-card__img"><img  alt="" data-src="wp-content/uploads/2021/11/T11.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img  alt="" data-src="wp-content/uploads/2021/11/T11.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T11.jpg" alt=""/></noscript></noscript></div></div>
                        <div className="character-card"><div className="character-card__img"><img  alt="" data-src="wp-content/uploads/2021/11/T12.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img  alt="" data-src="wp-content/uploads/2021/11/T12.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T12.jpg" alt=""/></noscript></noscript></div></div>
                        <div className="character-card"><div className="character-card__img"><img  alt="" data-src="wp-content/uploads/2021/11/T13.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img  alt="" data-src="wp-content/uploads/2021/11/T13.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T13.jpg" alt=""/></noscript></noscript></div></div>
                        <div className="character-card"><div className="character-card__img"><img  alt="" data-src="wp-content/uploads/2021/11/T14.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img  alt="" data-src="wp-content/uploads/2021/11/T14.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T14.jpg" alt=""/></noscript></noscript></div></div>
                        <div className="character-card"><div className="character-card__img"><img  alt="" data-src="wp-content/uploads/2021/11/T15.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img  alt="" data-src="wp-content/uploads/2021/11/T15.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T15.jpg" alt=""/></noscript></noscript></div></div>
                        <div className="character-card"><div className="character-card__img"><img  alt="" data-src="wp-content/uploads/2021/11/T16.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img  alt="" data-src="wp-content/uploads/2021/11/T16.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T16.jpg" alt=""/></noscript></noscript></div></div>
                      </div>
                      <div className="story-slider__thumbnails js-story-slider-thumbnails">
                        <div className="character-card character-card__sm"><div className="character-card__img"><img  alt="" data-src="wp-content/uploads/2021/11/T11.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img  alt="" data-src="wp-content/uploads/2021/11/T11.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T11.jpg" alt=""/></noscript></noscript></div></div>
                        <div className="character-card character-card__sm"><div className="character-card__img"><img  alt="" data-src="wp-content/uploads/2021/11/T12.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img  alt="" data-src="wp-content/uploads/2021/11/T12.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T12.jpg" alt=""/></noscript></noscript></div></div>
                        <div className="character-card character-card__sm"><div className="character-card__img"><img  alt="" data-src="wp-content/uploads/2021/11/T13.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img  alt="" data-src="wp-content/uploads/2021/11/T13.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T13.jpg" alt=""/></noscript></noscript></div></div>
                        <div className="character-card character-card__sm"><div className="character-card__img"><img  alt="" data-src="wp-content/uploads/2021/11/T14.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img  alt="" data-src="wp-content/uploads/2021/11/T14.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T14.jpg" alt=""/></noscript></noscript></div></div>
                        <div className="character-card character-card__sm"><div className="character-card__img"><img  alt="" data-src="wp-content/uploads/2021/11/T15.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img  alt="" data-src="wp-content/uploads/2021/11/T15.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T15.jpg" alt=""/></noscript></noscript></div></div>
                        <div className="character-card character-card__sm"><div className="character-card__img"><img  alt="" data-src="wp-content/uploads/2021/11/T16.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img  alt="" data-src="wp-content/uploads/2021/11/T16.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T16.jpg" alt=""/></noscript></noscript></div></div>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </div>
          <svg viewBox="0 0 188 88" xmlns="http://www.w3.org/2000/svg" className="cube-corners-svg cube-corners-svg__bottom">
            <g>
              <path d="M43.79 0H0V43.79H43.79V0Z" />
              <path d="M187.24 0H143.45V43.79H187.24V0Z" />
              <path d="M87.58 43.79H43.79V87.58H87.58V43.79Z"/>
            </g>
          </svg>
          <div className="stars-sky js-bg-parallax" data-parallax-direction="vertical-top" data-parallax-speed="0.1"></div>
        </section>
        <section className="sect__roadmap gutter-top" id="roadmap" style={ { backgroundImage: "url('wp-content/uploads/2021/11/frame-bg.svg')" } }>  
          <h2 className="sect-title js-typing-text container text-center">The Road Map</h2>
          <div className="container">
            <div className="roadmap">
              <div className="roadmap-stage decor-corners">
                <h3 className="roadmap-stage__title">Pre-Mint Launch:</h3>
                <ul className="roadmap-stage__list">
                  <li className="roadmap-stage__list--item">Community Building</li>
                  <li className="roadmap-stage__list--item">Hype Generation</li>
                  <li className="roadmap-stage__list--item">Facebook ads, Mass IG/Discord bots, Giveaway, Youtube sponsorships,<br/> banner ads on Crypto sites, performance crypto marketing agency</li>
                  <li className="roadmap-stage__list--item">Charity Fund</li>
                  <li className="roadmap-stage__list--item">Top Tier Team Building</li>
                </ul>
              </div>
              <div className="roadmap-stage__divider"></div>
              <div className="roadmap-stage decor-corners">
                <h3 className="roadmap-stage__title">Mint:</h3>
                <ul className="roadmap-stage__list roadmap-stage__list--percentage">
                  <li className="roadmap-stage__list--percentage_value"><span data-from="0">25</span>%</li>
                  <li className="roadmap-stage__list--item">10 ethereum given away to community members</li>
                  <li className="roadmap-stage__list--item">50 free NFTs given to community</li>
                </ul>
                <ul className="roadmap-stage__list roadmap-stage__list--percentage">
                  <li className="roadmap-stage__list--percentage_value"><span data-from="0">50</span>%</li>
                  <li className="roadmap-stage__list--item">30 ETH given to community</li>
                  <li className="roadmap-stage__list--item">Marketing Launch Phase 2</li>
                </ul>
                <ul className="roadmap-stage__list roadmap-stage__list--percentage">
                  <li className="roadmap-stage__list--percentage_value"><span data-from="0">75</span>%</li>
                  <li className="roadmap-stage__list--item">50 ETH given to community</li>
                  <li className="roadmap-stage__list--item">$10K donated to a start up of the community’s choosing</li>
                </ul>
                <ul className="roadmap-stage__list roadmap-stage__list--percentage">
                  <li className="roadmap-stage__list--percentage_value"><span data-from="0">90</span>%</li>
                  <li className="roadmap-stage__list--item">100 ETH held for marketing</li>
                  <li className="roadmap-stage__list--item">30 ETH invested into entrepreneurs with great ideas</li>
                  <li className="roadmap-stage__list--item">$100K put into marketing for resellers</li>
                </ul>
              </div>
              <div className="roadmap-stage__divider"></div>
              <div className="roadmap-stage decor-corners">
              <h3 className="roadmap-stage__title">The Mission Begins</h3>
                <ul className="roadmap-stage__list">
                  <li className="roadmap-stage__list--item">The mission map is released</li>
                  <li className="roadmap-stage__list--item">Marketplace development begins</li>
                  <li className="roadmap-stage__list--item">Companion NFTs are released</li>
                  <li className="roadmap-stage__list--item">Marketing push 2 begins</li>
                </ul>
              </div>
              <div className="roadmap-stage__divider"></div>
            <div className="roadmap-stage decor-corners">
              <h3 className="roadmap-stage__title">2022 & Beyond</h3>
              <ul className="roadmap-stage__list">
                <li className="roadmap-stage__list--item">Brand sponsorships</li>
                <li className="roadmap-stage__list--item">Marketplace release</li>
                <li className="roadmap-stage__list--item">Introduction of “digital patent NFTS”</li>
                <li className="roadmap-stage__list--item">Profit reinvested in hiring top talent, new NFTS,<br/> a marketplace, and next level marketing.</li>
              </ul>
            </div>
                <div className="roadmap-stage__divider"></div>
            </div>
          </div>
          <svg viewBox="0 0 188 88"  xmlns="http://www.w3.org/2000/svg" className="cube-corners-svg cube-corners-svg__top"> 
            <g >
              <path d="M187.24 43.79H143.45V87.58H187.24V43.79Z" />
              <path d="M43.79 43.79H0V87.58H43.79V43.79Z" />
              <path d="M143.44 0H99.65V43.79H143.44V0Z" />
            </g>
          </svg>
          <svg viewBox="0 0 188 88" xmlns="http://www.w3.org/2000/svg" className="cube-corners-svg cube-corners-svg__bottom">
            <g>
              <path d="M43.79 0H0V43.79H43.79V0Z" />
              <path d="M187.24 0H143.45V43.79H187.24V0Z" />
              <path d="M87.58 43.79H43.79V87.58H87.58V43.79Z"/>
            </g>
          </svg>			
        </section>

        <section className="sect__collection gutter-top gradient-bg blend-overlay" id="collection">
          <h2 className="sect-title js-typing-text container text-center">Featured Collection</h2>
          <div className="container">
            <div className="collection">
              <div className="row align-horisontal-start collection-items__row">
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T27.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T27.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T28.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T28.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T29.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T29.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T30.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T30.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T31.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T31.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T32.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T32.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T33.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T33.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T34.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T34.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T35.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T35.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T36.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T36.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T37.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T37.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T38.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T38.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T39.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T39.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T40.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T40.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T41.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T41.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T42.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T42.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T43.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T43.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T44.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T44.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T45.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T45.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T46.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T46.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T47.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T47.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T48.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T48.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T49.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T49.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T50.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T50.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T51.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T51.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T52.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T52.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T53.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T53.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T54.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T54.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T55.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T55.jpg" alt=""/></noscript></div></div>
                  <div className="collection-item__wrapper"><div className="collection-item"><img  alt="" data-src="wp-content/uploads/2021/11/T56.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T56.jpg" alt=""/></noscript></div></div>
              </div>
            </div>
          </div>
          <div className="stars-sky js-bg-parallax" data-parallax-direction="vertical-bottom" data-parallax-speed="0.15"></div>
          <svg viewBox="0 0 188 88"  xmlns="http://www.w3.org/2000/svg" className="cube-corners-svg cube-corners-svg__top"> 
            <g >
              <path d="M187.24 43.79H143.45V87.58H187.24V43.79Z" />
              <path d="M43.79 43.79H0V87.58H43.79V43.79Z" />
              <path d="M143.44 0H99.65V43.79H143.44V0Z" />
            </g>
          </svg>
        </section>

        <section className="sect__charity gutters blend-overlay bg" id="charity" style={ { backgroundImage: "url('wp-content/uploads/2021/11/lab-bg.png')" } }>
          <div className="container">
            <div className="charity">
              <div className="row align-vertical-center align-horisontal-between row-nowrap charity__row">
                              <div className="charity__img">
                    <img  alt="" data-src="wp-content/uploads/2021/11/idea.svg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/idea.svg" alt=""/></noscript>
                  </div>
                            <div className="charity__text">
                  <h2 className="sect-title js-typing-text">Utility</h2>
                                  <h3 className="sect-subtitle">Contributing To<br/> Humanity’s Progress</h3>
                  <div className="content">
                    <p>✅ 9,200 inventors with 13 different base characters, 18 different backgrounds, 13 different clothing items, 12 different inventions, and 6 skin colors.</p>
                    <p>✅$400K invested into seed round artificial intelligence, sustainable agriculture & biotechnology companies in 2022. Our community will research and vote on which companies to invest in. These startups will be put into a holding company and our community will receive shares. NFT holders will receive a larger amount of shares in proportion to NFT ownership.</p>
                    <p>✅$100K given away to holders at sell out.</p>
                    <p>✅ Private mastermind with big names in entrepreneurship, crypto and start-up world.</p>
                    <p>&nbsp;</p>
                    <p><a href="https://drive.google.com/file/d/1-09aUc3sO0Ld8VbNFFyYPJJXxnmozBdm/view?usp=sharing"><strong>READ OUR WHITEPAPER HERE</strong></a></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <svg viewBox="0 0 132 88"  xmlns="http://www.w3.org/2000/svg" className="cube-corners-svg cube-corners-svg__top">
            <g>
              <path d="M131.49 0H87.7V43.79H131.49V0Z" />
              <path d="M0 43.79V87.58H43.79H87.58V43.79H43.79H0Z" />
            </g>
          </svg>
          <svg viewBox="0 0 132 88"  xmlns="http://www.w3.org/2000/svg" className="cube-corners-svg cube-corners-svg__bottom">
            <g >
              <path d="M43.79 43.79H0V87.58H43.79V43.79Z"/>
              <path d="M131.5 0H87.7H43.91V43.79H87.7H131.5V0Z" />
            </g>
          </svg>
        </section>
        <section className="sect__team padding-b-50 gradient-bg gutter-top blend-overlay" id="team">
          <h2 className="sect-title js-typing-text container text-center">Leadership Team</h2>
          <div className="team">
            <div className="container">
              <div className="row align-horisontal-center team-members__row">
                <div className="team-member__wrapper col-w-33 gutter-bottom">
                  <div className="team-member">
                    <div className="team-member__top text-center">
                      <div className="team-member__top--content">
                        <div className="team-member__photo ">
                          <img  alt="Tristen Larsen" data-src="wp-content/uploads/2021/11/1.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/1.jpg" alt="Tristen Larsen"/></noscript>
                        </div>
                        <h3 className="team-member__name">Tristen Larsen</h3>
                        <p className="team-member__position">Founder</p>
                      </div>
                    </div>
                    <div className="team-member__bottom">
                      <p>Tristen is best known for reading 15 books a month recommended by billionaires. Tristen built an 8 figure company by age 23 and did it primarily with his marketing agency. Tristen reads half a book a day, works 16 hours a day, loves chess and beautiful views. Tristen is a workaholic obsessed with learning, creating and building companies. This project is meaningful to him because he deeply admires all inventors featured in this collection. Tristen is a liberatarian who is bullish on individual freedom and taking power from centralized organizations.</p>
                    </div>
                  </div>
                </div>
                
                <div className="team-member__wrapper col-w-33 gutter-bottom">
                  <div className="team-member">
                    <div className="team-member__top text-center">
                      <div className="team-member__top--content">
                        <div className="team-member__photo ">
                          <img  alt="Dev Motlani" data-src="wp-content/uploads/2021/11/2.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/2.jpg" alt="Dev Motlani"/></noscript>
                        </div>
                        <h3 className="team-member__name">Dev Motlani</h3>
                        <p className="team-member__position">CMO</p>
                      </div>
                    </div>
                    <div className="team-member__bottom">
                      <p>Dev moved from india to Dubai after scaling some of the biggest Crypto projects. Dev has connections with 880+ crypto publications. 250+ crypto based display ad channels. 100+ crypto youtubers, 2000 groups on telegrams & discord.</p>
                    </div>
                  </div>
                </div>

                <div className="team-member__wrapper col-w-33 gutter-bottom">
                  <div className="team-member">
                    <div className="team-member__top text-center">
                      <div className="team-member__top--content">
                        <div className="team-member__photo ">
                          <img  alt="Hugo Orellana" data-src="wp-content/uploads/2021/11/3.png" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/3.png" alt="Hugo Orellana"/></noscript>
                        </div>
                        <h3 className="team-member__name">Hugo Orellana</h3>
                        <p className="team-member__position">CAO</p>
                      </div>
                    </div>
                    <div className="team-member__bottom">
                      <p>Hugo is an inventor & extremely talented artist. After being responsible for designing the art for over 50 NFT projects, Hugo knows how to create an NFT that sells.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="join-club">
            <div className="container">
              <div className="join-club__block">
                <h2 className="join-club__title decor-title">
                  <span className="join-club__title--text decor-title__text js-typing-text">Join The Club</span>
                  <span className="decor-title__corner decor-title__corner--left">
                    <svg viewBox="0 0 19 35" xmlns="http://www.w3.org/2000/svg">
                      <g>
                        <path d="M18.04 28.57H12.03V34.58H18.04V28.57Z" />
                        <path d="M6.01 0H0V6.01H6.01V0Z" />
                        <path d="M12.03 22.55H0V34.58H12.03V22.55Z" />
                      </g>
                    </svg>
                  </span>
                  <span className="decor-title__corner decor-title__corner--right">
                    <svg viewBox="0 0 19 35" xmlns="http://www.w3.org/2000/svg">
                      <g>
                        <path d="M18.04 28.57H12.03V34.58H18.04V28.57Z" />
                        <path d="M6.01 0H0V6.01H6.01V0Z" />
                        <path d="M12.03 22.55H0V34.58H12.03V22.55Z" />
                      </g>
                    </svg>
                  </span>
                </h2>
                <form className="form decor-corners" />
                  <input type="hidden" name="project_name" value="NFT"/>
                  <input type="hidden" name="form_subject" value="Join the club"/>
                  <div className="row form-groups__row row-gutters">
                    <div className="form-group col-w-33 col-gutters">
                      <input type="text" className="form-input js-required-input" name="name" placeholder="Name"/>
                    </div>
                    <div className="form-group col-w-33 col-gutters">
                      <input type="email" className="form-input js-required-input" name="email" placeholder="email"/>
                    </div>
                    <div className="form-group col-w-33 col-gutters">
                      <button className="btn btn-wide btn-right-corner" type="submit">Join</button>
                    </div>
                  </div>
              </div>
            </div>
            <div className="characters-slider js-characters-slider">
              <div className="character-card"><div className="character-card__img"><img  alt="" data-src="wp-content/uploads/2021/11/T17.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T17.jpg" alt=""/></noscript></div></div>
              <div className="character-card"><div className="character-card__img"><img  alt="" data-src="wp-content/uploads/2021/11/T18.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T18.jpg" alt=""/></noscript></div></div>
              <div className="character-card"><div className="character-card__img"><img  alt="" data-src="wp-content/uploads/2021/11/T19.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T19.jpg" alt=""/></noscript></div></div>
              <div className="character-card"><div className="character-card__img"><img  alt="" data-src="wp-content/uploads/2021/11/T20.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T20.jpg" alt=""/></noscript></div></div>
              <div className="character-card"><div className="character-card__img"><img  alt="" data-src="wp-content/uploads/2021/11/T21.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T21.jpg" alt=""/></noscript></div></div>
              <div className="character-card"><div className="character-card__img"><img  alt="" data-src="wp-content/uploads/2021/11/T22.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T22.jpg" alt=""/></noscript></div></div>
              <div className="character-card"><div className="character-card__img"><img  alt="" data-src="wp-content/uploads/2021/11/T23.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T23.jpg" alt=""/></noscript></div></div>
              <div className="character-card"><div className="character-card__img"><img  alt="" data-src="wp-content/uploads/2021/11/T24.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T24.jpg" alt=""/></noscript></div></div>
              <div className="character-card"><div className="character-card__img"><img  alt="" data-src="wp-content/uploads/2021/11/T25.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T25.jpg" alt=""/></noscript></div></div>
              <div className="character-card"><div className="character-card__img"><img  alt="" data-src="wp-content/uploads/2021/11/T26.jpg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/T26.jpg" alt=""/></noscript></div></div>
            </div>
          </div>
        </section>



        
        <AccordionWrapper>
          {data1.map((item, index) => (
            <AccordionItem key={index} index={index} title={item.title} description={item.description} />
          ))}
        </AccordionWrapper>






      </main>
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="row align-vertical-center align-horisontal-between footer__row">
              <div className="footer-logo__col">
                <div className="row align-vertical-center align-horisontal-start">
                    <span className="logo">
                      <img  alt="" data-src="wp-content/uploads/2021/11/logo-footer.svg" className="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/><noscript><img src="wp-content/uploads/2021/11/logo-footer.svg" alt=""/></noscript>
                    </span>
                  <nav className="nav js-nav">
                    <p className="nav__title">Menu</p>
                    <button className="btn-close js-close-mobile-menu-btn" type="button">
                      <svg viewBox="0 0 14 14"  xmlns="http://www.w3.org/2000/svg">
                        <g >
                          <path d="M2.69 0H0V2.69H2.69V0Z" />
                          <path d="M5.41998 2.73001H2.72998V5.42001H5.41998V8.09001V8.11001H8.10998V10.78H10.8V8.09001H8.10998V5.42001V5.40001H5.41998V2.73001Z" fill="#FFD587"/>
                          <path d="M5.40997 8.10999H2.71997V10.8H5.40997V8.10999Z" />
                          <path d="M2.71002 10.81H0.0200195V13.5H2.71002V10.81Z" />
                          <path d="M13.52 10.81H10.83V13.5H13.52V10.81Z" />
                          <path d="M10.8 2.70999H8.10999V5.39999H10.8V2.70999Z"/>
                          <path d="M13.5001 0H10.8101V2.69H13.5001V0Z" />
                        </g>
                      </svg>
                    </button>
                    <ul className="nav__list">
                      <li className="nav__item"><a href="#story" className="nav__link js-smooth-scroll-link">Story</a></li>
                      <li className="nav__item"><a href="#roadmap" className="nav__link js-smooth-scroll-link">Roadmap</a></li>
                      <li className="nav__item"><a href="#collection" className="nav__link js-smooth-scroll-link">Collection</a></li>
                      <li className="nav__item"><a href="#charity" className="nav__link js-smooth-scroll-link">Charity</a></li>
                      <li className="nav__item"><a href="#team" className="nav__link js-smooth-scroll-link">Team</a></li>
                    </ul>
                  </nav>
                </div>
              </div>
                <ul className="socials">
                    <li className="socials-item">
                      <a href="https://discord.com/invite/inventorclubnft" className="socials-link" target="_blank" rel="nofollow">
                        <svg  viewBox="0 0 42 30" width="42" height="30" xmlns="http://www.w3.org/2000/svg">
                      <g >
                        <path d="M28.05 26.71C29.11 28.05 30.3801 29.56 30.3801 29.56C38.1501 29.31 41.14 24.21 41.14 24.21C41.0165 17.0732 39.2762 10.0573 36.05 3.69002C33.2157 1.46442 29.7596 0.174922 26.16 1.52588e-05L25.67 0.560013C31.67 2.39001 34.4301 5.03001 34.4301 5.03001C31.1543 3.22347 27.5567 2.07524 23.84 1.65001C21.4757 1.39084 19.0889 1.41435 16.73 1.72002C16.5286 1.72853 16.3281 1.75192 16.1301 1.79001C13.3642 2.10964 10.6651 2.85864 8.13005 4.01001C6.83005 4.61001 6.05005 5.01001 6.05005 5.01001C6.05005 5.01001 8.97005 2.23001 15.3101 0.400009L14.9601 -0.019989C11.3606 0.154917 7.90442 1.44441 5.07005 3.67001C1.86296 10.0482 0.146455 17.0715 0.0500488 24.21C0.0500488 24.21 3.05005 29.31 10.7801 29.56C10.7801 29.56 12.09 27.98 13.14 26.64C10.6677 26.0127 8.49012 24.5457 6.98005 22.49C6.98005 22.49 7.34005 22.73 7.98005 23.08C8.01832 23.1263 8.06606 23.1638 8.12005 23.19C8.22005 23.26 8.33005 23.3 8.44005 23.37C9.26752 23.8269 10.1263 24.2246 11.01 24.56C12.6825 25.226 14.4133 25.7349 16.18 26.08C19.1906 26.6432 22.2795 26.6432 25.2901 26.08C27.0461 25.7764 28.761 25.2696 30.4001 24.57C31.8067 24.0278 33.1483 23.3301 34.4001 22.49C32.8486 24.6029 30.5989 26.098 28.05 26.71ZM14.05 20.94C13.057 20.8933 12.1226 20.4562 11.4503 19.7239C10.7779 18.9916 10.422 18.0234 10.4601 17.03C10.4386 16.5375 10.5145 16.0455 10.6833 15.5823C10.8522 15.1191 11.1108 14.6937 11.4442 14.3305C11.7777 13.9674 12.1795 13.6735 12.6266 13.4658C13.0737 13.2581 13.5574 13.1406 14.05 13.12C14.5439 13.1366 15.0296 13.2515 15.4786 13.4578C15.9276 13.6642 16.331 13.958 16.6652 14.322C16.9994 14.686 17.2577 15.113 17.4251 15.5779C17.5925 16.0429 17.6656 16.5365 17.64 17.03C17.6615 17.5291 17.583 18.0274 17.4091 18.4958C17.2353 18.9641 16.9696 19.393 16.6277 19.7572C16.2859 20.1214 15.8746 20.4137 15.4183 20.6168C14.9619 20.8199 14.4695 20.9298 13.97 20.94H14.05ZM26.9001 20.94C25.907 20.8933 24.9726 20.4562 24.3003 19.7239C23.6279 18.9916 23.272 18.0234 23.3101 17.03C23.2886 16.5375 23.3645 16.0455 23.5333 15.5823C23.7022 15.1191 23.9608 14.6937 24.2942 14.3305C24.6277 13.9674 25.0295 13.6735 25.4766 13.4658C25.9237 13.2581 26.4075 13.1406 26.9001 13.12C27.3927 13.1406 27.8764 13.2581 28.3235 13.4658C28.7706 13.6735 29.1724 13.9674 29.5059 14.3305C29.8393 14.6937 30.0979 15.1191 30.2668 15.5823C30.4356 16.0455 30.5115 16.5375 30.4901 17.03C30.5115 17.5291 30.4329 18.0274 30.2591 18.4958C30.0853 18.9641 29.8196 19.393 29.4777 19.7572C29.1359 20.1214 28.7247 20.4137 28.2683 20.6168C27.8119 20.8199 27.3195 20.9298 26.8201 20.94H26.9001Z"/>
                      </g>
                    </svg>
                      </a>
                    </li>
                    <li className="socials-item">
                      <a href="#" className="socials-link" target="_blank" rel="nofollow">
                        <svg  viewBox="0 0 37 29"  xmlns="http://www.w3.org/2000/svg">
                      <g >
                        <path d="M35.6 1.48001L29.84 3.15001C29.0842 2.06047 28.0441 1.19907 26.8328 0.659546C25.6215 0.12002 24.2855 -0.0769618 22.97 0.0900116C21.8545 0.226045 20.7802 0.595559 19.8171 1.17448C18.8539 1.75341 18.0235 2.52876 17.38 3.45001C16.2419 5.28816 15.8151 7.47903 16.18 9.61C13.85 9.11 7.66003 4.32 3.81003 0C3.81003 0 2.52003 4.39001 4.81003 7.23001C4.10375 6.84935 3.43422 6.40411 2.81003 5.90001C2.81003 5.90001 2.81003 5.99001 2.81003 6.04001C2.81003 6.95001 2.81003 12.2 5.48003 14.35C4.90216 14.2157 4.33417 14.0419 3.78003 13.83C4.83631 16.7151 6.71337 19.2283 9.18002 21.06C7.35002 22.27 6.53002 22.67 1.54002 23.6C2.19021 23.9473 2.87803 24.2191 3.59003 24.41C2.44759 24.8321 1.24672 25.075 0.0300293 25.13L1.10004 25.57C5.18969 27.1505 9.5262 27.9969 13.91 28.07C21.63 28.07 31.09 24.85 32.44 9.54001L36.3 4.67001L31.2 5.98001L35.6 1.48001Z" />
                      </g>
                    </svg>
                      </a>
                    </li>
                    <li className="socials-item">
                      <a href="#" className="socials-link" target="_blank" rel="nofollow">
                        <svg viewBox="0 0 30 30"  xmlns="http://www.w3.org/2000/svg">
                      <g >
                        <path d="M25.41 0.0200043H4.55002C3.3449 0.0252669 2.19062 0.506338 1.33847 1.35849C0.486318 2.21064 0.00526258 3.36489 0 4.57001V25.45C0.00527871 26.6542 0.486677 27.8074 1.33911 28.658C2.19155 29.5085 3.34582 29.9874 4.55002 29.99H25.41C26.6142 29.9874 27.7685 29.5085 28.6209 28.658C29.4733 27.8074 29.9547 26.6542 29.96 25.45V4.57001C29.9547 3.36489 29.4737 2.21064 28.6215 1.35849C27.7694 0.506338 26.6151 0.0252669 25.41 0.0200043ZM14.97 23.41C12.7439 23.4074 10.6099 22.5212 9.03677 20.9462C7.46363 19.3711 6.58002 17.2361 6.58002 15.01C6.58002 12.7839 7.46363 10.6489 9.03677 9.07384C10.6099 7.49882 12.7439 6.61265 14.97 6.61C16.0769 6.60605 17.1738 6.82067 18.1976 7.24155C19.2214 7.66242 20.1521 8.28127 20.9362 9.06261C21.7203 9.84394 22.3425 10.7724 22.767 11.7947C23.1915 12.817 23.41 13.9131 23.41 15.02C23.3994 17.247 22.506 19.3789 20.9256 20.948C19.3452 22.5171 17.207 23.3953 14.98 23.39L14.97 23.41ZM24.41 7.73001C23.8345 7.73001 23.2825 7.50138 22.8756 7.09442C22.4686 6.68747 22.24 6.13552 22.24 5.56C22.24 4.98448 22.4686 4.43254 22.8756 4.02559C23.2825 3.61864 23.8345 3.39 24.41 3.39C24.9864 3.38999 25.5394 3.61831 25.948 4.02498C26.3565 4.43165 26.5874 4.98356 26.59 5.56C26.5874 6.13644 26.3565 6.68836 25.948 7.09503C25.5394 7.5017 24.9864 7.73002 24.41 7.73001Z" />
                        <path d="M14.99 21.11C18.37 21.11 21.11 18.37 21.11 14.99C21.11 11.61 18.37 8.87 14.99 8.87C11.61 8.87 8.87 11.61 8.87 14.99C8.87 18.37 11.61 21.11 14.99 21.11Z" />
                      </g>
                    </svg>
                      </a>
                    </li>
                                </ul>
                        </div>
          </div>
                    <p className="copyright text-center">All Rights Reserved.</p>
        </div>
      </footer>
      <div className="preloader__wrapper">
        <span className="preloader">
          <span className="preloader-inner"></span>
        </span>
        <div className="preloader__section preloader__section--left"></div> 
        <div className="preloader__section preloader__section--right"></div>
      </div>		
    </div>



    </s.Screen>

  );
}

export default App;
