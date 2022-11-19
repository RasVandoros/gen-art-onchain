import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import osLogo from './assets/OpenSea_icon.svg';

import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import myEpicNft from './utils/MyEpicNFT.json';

const TWITTER_HANDLE = '__gvan__';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
let opensea_link = 'https://testnets.opensea.io/collection/squarenft-ymmy0uohn8';
let tx_hash = '';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0x02B7453D3a8DB3Ba1C0ccC47AC55f12D6dB07602";

const App = () => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [loading, setLoading] = useState(false);
    const [minted, setMinted] = useState(false);
    const checkIfWalletIsConnected = async () => {
      const { ethereum } = window;

      if (!ethereum) {
          console.log("Make sure you have metamask!");
          return;
      } else {
          console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
					setCurrentAccount(account)
          setupEventListener()

      } else {
          console.log("No authorized account found")
      }
  }

  
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      
      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);
      const goerliChainId = "0x5"; 
      if (chainId !== goerliChainId) {
      	alert("You are not connected to the Goerli Test Network!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      setupEventListener() 
    } catch (error) {
      console.log(error)
    }
  }


  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
        console.log(from, tokenId.toNumber())
        opensea_link = `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`;
        setMinted(true);

        });
        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  
  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
        let nftTxn = await connectedContract.makeAnEpicNFT();
        tx_hash = nftTxn.hash;
        setLoading(true);
        await nftTxn.wait();
        console.log(nftTxn);
        setLoading(false);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }


  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );
  
  const renderMintUI = () => (
    <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
      Mint NFT
    </button>
  )
  
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">XYZ by g-van</p>
          <p className="sub-text">
            Generative. Fully on-chain.
          </p>
          {currentAccount === "" ? renderNotConnectedContainer() : renderMintUI()}
        </div>

        {loading && (
          <div> 
            <div className="sub-text"> Mining... </div>
            <div className="sub-text" href={tx_hash}> {`Tx: https://goerli.etherscan.io/tx/${tx_hash}`} </div>
            <div className="lds-circle"><div></div></div>
          </div>
        )}
          
        {minted && (
            <div> 
              <div className="sub-text">
                Success! 🍻
              </div>
              <div className="sub-text" href={opensea_link}>
                {`NFT link: ${opensea_link}`}
              </div>
          </div>
          )}
          
        <div className="footer-container">
          
          <a
            className="footer-text"
            href={opensea_link}
            target="_blank"
            rel="noreferrer"
          ><img alt="Opensea Logo" className="os-logo" src={osLogo} /></a>
        </div>
        
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;