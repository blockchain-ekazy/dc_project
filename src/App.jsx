import { useState, useEffect } from "react";
import { ethers } from "ethers";
import MarketplaceAddress from './contractData/DeloreanCodes-address.json'
import MarketplaceABI from './contractData/DeloreanCodes.json'
import NFTAddress from './contractData/DeloreanOriginals-address.json'
import NFTABI from './contractData/DeloreanOriginals.json'
import Header from './components/header/Header';
import { Routes, Route, Link } from "react-router-dom";
import Home from "./components/home/Home";
import Footer from "./components/footer/Footer";
import Explore from "./components/explore/Explore";
import Create from "./components/create/Create";
import Stats from "./components/stats/Stats";
// import Profile from "./components/profile/Profile";
import Admin from "./components/admin/Admin";
import Invite from "./components/invite/Invite";
import Contact from "./components/contact/Contact";
function App() {
  const [connected, setConnected] = useState(false);
  const [getCurrentAccount, setCurrentAccount] = useState("");
  const [getCurrentNetwork, setCurrentNetwork] = useState("");
  const [getProvider, setProvider] = useState(false);
  const [getEtherBal, setEtherBal] = useState("");
  const [getWidth, setWidth] = useState(1000)
  const [marketContract, setMarketContract] = useState("");
  const [nftContract, setNftContract] = useState("")
  const [getRpcContract, setRpcContract] = useState("")
  const detectProvider = () => {
    // Get provider
    let provider;
    if(window.ethereum) {
      provider = window.ethereum;
    } else if (window.web3) {
      provider = window.web3.currentProvider;
    }else{
      window.alert("No Ethereum browser detected")
    }
    return provider
  }
  useEffect(() => {
    getRPCContractProvider()
  }, [NFTAddress])
  

  const getRPCContractProvider = () => {
    const RPC = process.env.REACT_APP_RPC_ADDRESS;
    const provider = new ethers.providers.JsonRpcProvider(RPC);
    const rpcContract = new ethers.Contract(NFTAddress.Token, NFTABI.abi, provider);
    setRpcContract(rpcContract)
  }

  useEffect(()=> {
    // Set provider and check connection
    const Disconnect = () => {
      setConnected(false)
      setCurrentAccount("")
      setCurrentNetwork("")
    }

    const provider = detectProvider()
    setProvider(provider)
    if(provider){
      provider.request({ method: 'eth_accounts' })
      .then((res) => {
        if(res.length > 0){
          setConnected(true)
          onConnect(provider)
        }else{
          Disconnect()
        }
      })
    }
  },[getCurrentAccount, getProvider])

  useEffect(() => { 
    // Handle account and network changes
    const handleAccountsChanged = async () => {
      const accounts = await getProvider.request({method: 'eth_accounts'})
      setCurrentAccount(accounts)
    }

    const handleNetworkChanged = async () => {
      const chainId = await getProvider.request({ method: 'eth_chainId' });
      setCurrentNetwork(parseInt(chainId))
    }

    if(connected){
      getProvider.on('accountsChanged', handleAccountsChanged);
      getProvider.on('chainChanged', handleNetworkChanged);
      return () => {
        getProvider.removeListener('accountsChanged', handleAccountsChanged);
        getProvider.removeListener('chainChanged', handleNetworkChanged);
      }
    }
  }, [connected, getProvider])
  
  const Connect = async () => {
    // METAMASK CONNECT
    if(getProvider) {
      if(getProvider !== window.ethereum) {
        console.error("Not window.ethereum provider!")
      }
      try{
        await getProvider.request({
          method: "eth_requestAccounts"
        })
      }catch(err){
        console.log(err);
      }
      onConnect(getProvider)
    }
  }

  const onConnect = async (provider) => {
    // ETHERS.JS CONNECT
    const chain_id = await provider.request({ method: 'eth_chainId' })
    const eth = new ethers.providers.Web3Provider(provider);
    const accounts = await eth.listAccounts()
    try{
      const weiBalance = (await eth.getBalance(accounts[0])).toString()
      const etherBalance = (Number(weiBalance)/10**18).toFixed(5)
      await loadContract(eth)
      provider.request({ method: 'eth_accounts' })
      .then((res) => {
        if(res.length > 0){
          setConnected(true)
          setCurrentAccount(accounts[0])
          setCurrentNetwork(parseInt(chain_id))
          setEtherBal(etherBalance)
        }else{
          setConnected(false)
        }
      })
    }catch (err) {
      console.log(err)
    }
  }

  const loadContract = async (provider) => {
    const signer = provider.getSigner();
    try{
      const marketplace = new ethers.Contract(MarketplaceAddress.Token, MarketplaceABI.abi, signer)
      setMarketContract(marketplace)
    }catch(err){
      console.log("Error loading marketplace contract: \n",err)
    }
    try{
      const nft = new ethers.Contract(NFTAddress.Token, NFTABI.abi, signer);
      setNftContract(nft)
    }catch(err){
      console.log("Error loading nft contract: \n", err)
    }
  }

  useEffect(() => {
      const jsUpdateSize = () => {
        // Get the dimensions of the viewport
        var width = window.innerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth;
        setWidth(width)
      };
      jsUpdateSize();
      window.onresize = jsUpdateSize;
  }, [getWidth])

  return (
    <div className="App">
      <div className="app-wrap">
        <Header 
          connected={connected}
          account={getCurrentAccount}
          currentNetwork={getCurrentNetwork}
          marketplace={marketContract}
          balance={getEtherBal}
          connect={Connect} 
          width={getWidth}/>
          <div id="cover" className="cover hide"></div>
          <div id="main-wrap" className="main-wrap">
            <Routes>
              <Route exact path="/" element={<Home
                rpcContract = {getRpcContract}
                marketplace={marketContract}
                nft={nftContract}/>
              }/>
              <Route exact path="/market" element={<Explore 
                marketplace={marketContract}
                nft={nftContract}/>
              }/>
              <Route exact path="/items" element={<Stats 
                marketplace={marketContract}
                nft={nftContract}
                account={getCurrentAccount}/>
              }/>
              <Route exact path="/link" element={<Create 
                marketplace={marketContract}
                nft={nftContract}/>
              }/>
              <Route exact path="/invite/:userAddress/:tokenID/:itemID" element={<Invite 
                marketplace={marketContract}
                nft={nftContract}
                account={getCurrentAccount}/>
              }/>
              <Route exact path="/contact" element={<Contact/>}/>
            </Routes>
          </div>
          <Footer />
      </div>
    </div>
  );
}

export default App;
