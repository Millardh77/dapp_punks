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
    console.log(`Account: ${account}\n`)

    // Fetch Countdown
    let allowMintingOn = await nft.allowMintingOn()
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
    //console.log(`Owner: ${owner}\n`)
    console.log(`Is Owner: ${isOwner}\n`)

    // Get white list
    const whiteListed = Boolean(await nft.whiteListed(account))
    const isWhitelisted = whiteListed === true ? true : false
    //const tryWhitelisted = whiteListed ?? false

    setIsWhitelisted(isWhitelisted)
    console.log(`Is whiteListed: ${isWhitelisted}\n`)

    const mintMessage = whiteListed === true ? "Minting is Paused" : "Unauthorized to Mint"
    setMintMessage(mintMessage)
     // Get whether minting is paused
     const isPaused = await nft.mintingPaused()
     setIsPaused(isPaused)
     console.log(`Is Paused: ${isPaused}\n`)

     // Get all of the account's NFTs
     const tokenIds = await nft.walletOfOwner(account)
     const lastTokenID = Number(tokenIds.length)
     setLastTokenID(lastTokenID)
     console.log(`tokenIds: ${tokenIds}\n`)
     console.log(`Last TokenId: ${lastTokenID}\n`)

     const nfts = []
     const ipfsURI = "https://ipfs.io/ipfs/QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/"
     for (var i = 1; i <= lastTokenID; i++) {
      let str = await nft.tokenURI(i)
      let newstr = str.substr(7, str.length - 1) 
      let uri = `https://ipfs.io/ipfs/${newstr}`
      console.log(`uri: ${uri}\n`)
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

  return(
    <Container>
      <Navigation account={account} />

      <h1 className='my-4 text-center'>Dapp Punks</h1>

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
                 <div className='cards'>
                 {nfts.map((nft, index) => (
                              <div className='card' key={index}>
                              <div className='card__image'>
                                <img src={nft.image} alt="Home" />
                              </div>
                              <div className='card__info'>
                                <h4>{nft.attributes[0].value} ETH</h4>
                                <p>
                                  <strong>{nft.attributes[2].value}</strong> bds |
                                  <strong>{nft.attributes[3].value}</strong> ba |
                                  <strong>{nft.attributes[4].value}</strong> sqft
                                </p>
                                <p>{nft.name}</p>
                              </div>
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
              <div className='my-4 text-center'>
                <Countdown date={parseInt(revealTime)} className='h2' />
              </div>

              <Data
                maxSupply={maxSupply}
                totalSupply={totalSupply}
                cost={cost}
                balance={balance}
              />
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
            </Col>
          </Row>
        </>
      )}
    </Container>
  )
}

export default App;
