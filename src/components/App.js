import { useEffect, useState } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import Countdown from 'react-countdown'
import { ethers } from 'ethers'

// IMG
import preview from '../preview.png';

// Components
import Navigation from './Navigation';
import Data from './Data';
import Mint from './Mint';
import Owner from './Owner';
import Loading from './Loading';
import '../App.css'

// ABIs: Import your contract ABIs here
import NFT_ABI from '../abis/NFT.json'

// Config: Import your network config here
import config from '../config.json';

function App() {
  const [provider, setProvider] = useState(null)
  const [nft, setNFT] = useState(null)

  const [account, setAccount] = useState(null)

  const [revealTime, setRevealTime] = useState(0)
  const [maxSupply, setMaxSupply] = useState(0)
  const [totalSupply, setTotalSupply] = useState(0)
  const [cost, setCost] = useState(0)
  const [balance, setBalance] = useState(0)
  const [mintMessage, setMintMessage] = useState(null)
  const [lastTokenID, setLastTokenID] = useState(0)

  const [isOwner, setIsOwner] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isWhitelisted, setIsWhitelisted] = useState(false)

  const [nfts, setNFTs] = useState([])

  const [isLoading, setIsLoading] = useState(true)

  const loadBlockchainData = async () => {
    // Initiate provider
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    // Initiate contract
    const nft = new ethers.Contract(config[31337].nft.address, NFT_ABI, provider)
    setNFT(nft)
   

    // Fetch accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account)
    //console.log(`Account: ${account}\n`)

    // Fetch Countdown
    // For Testing
    // const MINUTES_TO_ADD = 60000 * 1  // 1 minute
    // const NFT_MINT_DATE = (new Date().getTime() + (MINUTES_TO_ADD)).toString().slice(0, 10);
    // let allowMintingOn = NFT_MINT_DATE
    // For Testing
  
    let allowMintingOn = await nft.allowMintingOn() // Uncomment when in production
    setRevealTime(allowMintingOn.toString() + '000')

    console.log("Allow minting on:", Number(allowMintingOn))

    // Fetch maxSupply
    setMaxSupply(await nft.maxSupply())

    // Fetch totalSupply
    setTotalSupply(await nft.totalSupply())

    // Fetch cost
    setCost(await nft.cost())

    // Fetch account balance
    setBalance(await nft.balanceOf(account))


    // Get Owner
    const owner = await nft.owner()
    const isOwner = owner === account ? true : false;
    setIsOwner(isOwner)
    //console.log(`Is Owner: ${isOwner}\n`)

    // Get white list
    const whiteListed = Boolean(await nft.whiteListed(account))
    const isWhitelisted = whiteListed === true ? true : false

    setIsWhitelisted(isWhitelisted)
    //console.log(`Is whiteListed: ${isWhitelisted}\n`)

    const mintMessage = whiteListed === true ? "Minting is Paused" : "Unauthorized to Mint"
    setMintMessage(mintMessage)
     // Get whether minting is paused
     const isPaused = await nft.mintingPaused()
     setIsPaused(isPaused)
     //console.log(`Is Paused: ${isPaused}\n`)

     // Get all of the account's NFTs
     const tokenIds = await nft.walletOfOwner(account)
     const lastTokenID = Number(tokenIds.length)
     setLastTokenID(lastTokenID)
     //console.log(`tokenIds: ${tokenIds}\n`)
     //console.log(`Last TokenId: ${lastTokenID}\n`)

     const nfts = []
     for (var i = 1; i <= lastTokenID; i++) {
      let str = await nft.tokenURI(i)
      let newstr = str.substr(7, str.length - 1) 
      let uri = `https://ipfs.io/ipfs/${newstr}`
      //console.log(`uri: ${uri}\n`)
      //uri = `https://ipfs.io/${uri}`
      const response = await fetch(uri)
      const metadata = await response.json()
      nfts.push(metadata)
    }

    setNFTs(nfts)


   


    setIsLoading(false)
  }

  useEffect(() => {
    if (isLoading) {
      loadBlockchainData()
    }
  }, [isLoading]);

  // Random component
const Completionist = () => <strong>The Mint is Open!</strong>;

// Renderer callback with condition
const renderer = ({ days, hours, minutes, seconds, completed }) => {
  if (completed) {
    // setCountdownComplete(true)
    // Render a completed state
    return (
      <>
    <Completionist />
    {isPaused || !isWhitelisted ? (
      <h2 className='my-4 text-center'>{mintMessage}</h2>
  ) : (
    <Mint
      provider={provider}
      nft={nft}
      cost={cost}
      setIsLoading={setIsLoading}
      isPaused={isPaused}
    />
  )}
  </>)
  } else {
    // Render a countdown
    return (
      <>
      <strong>Minting starts in: </strong>
      <strong>{days}:{hours}:{minutes}:{seconds}</strong>
    </>
    );
  }
};

  return(
    <Container>
      <Navigation account={account} />

      <h1 className='my-4 text-center'>MCH Media Punks</h1>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <Row>
          <Col>
              {lastTokenID > 0 ? (
                <>
                <div className='text-center'>
                  <img
                    src={`https://gateway.pinata.cloud/ipfs/QmQPEMsfd1tJnqYPbnTQCjoa8vczfsV1FmqZWgRdNQ7z3g/${lastTokenID}.png`}
                    alt="Open Punk"
                    width="400px"
                    height="400px"
                  />
                </div>
                <hr />
                 <div className='cards my-2'>
                 {nfts.map((nft, index) => (
                              <div className='my-2' key={index}>
                              <div className='my-2'>
                                <img 
                                src={`https://gateway.pinata.cloud/ipfs/QmQPEMsfd1tJnqYPbnTQCjoa8vczfsV1FmqZWgRdNQ7z3g/${index+1}.png`} 
                                alt="NFT" 
                                width="100px"
                                height="100px"
                                />
                              </div>
                            <div className='my-2'>
                                <h4>Name: {nft.name}</h4>
                                <p>ID: {nft.id}</p>
                                <p>Description: {nft.description}</p>
                              </div>
                              <hr />
                            </div>
                
                 ))}
                  </div>
                  </>

              ) : (
                <img src={preview} alt="" />
              )}
            </Col>
            <Col>
              {isOwner &&
                (
                  <Owner 
                    provider={provider}
                    nft={nft}
                    setIsLoading={setIsLoading}
                    setIsPaused={setIsPaused}
                  />
                )
              }
              <Data
                maxSupply={maxSupply}
                totalSupply={totalSupply}
                cost={cost}
                balance={balance}
              />
              <div className='my-4 text-center'>
                <Countdown date={parseInt(revealTime)} className='h2' renderer={renderer} />
              </div>

            </Col>
          </Row>
        </>
      )}
    </Container>
  )
}

export default App;
