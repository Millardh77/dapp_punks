import { useEffect, useState } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import Button from 'react-bootstrap/Button';
import Countdown from 'react-countdown'
import { ethers } from 'ethers'

// IMG
import preview from '../preview.png';

// Components
import Navigation from './Navigation';
import Data from './Data';
import Mint from './Mint';
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

  const [isOwner, setIsOwner] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isWhitelisted, setIsWhitelisted] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [active, setActive] = useState(true);

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

     // Get whether minting is paused
     const isPaused = await nft.mintingPaused()
     setIsPaused(isPaused)
     console.log(`Is Paused: ${isPaused}\n`)
   


    setIsLoading(false)
  }
  const pauseHandler = async (e) => {
    //e.preventDefault()
        // Get whether minting is paused
        const pauseMinting = !isPaused ? true : false
        console.log(`Setting Paused: ${pauseMinting}\n`)

    
    setActive(!active);
     try {
       const signer = await provider.getSigner()
        const transaction = await nft.connect(signer).pauseMinting(pauseMinting)
        await transaction.wait()

        const isPaused = await nft.mintingPaused()
        setIsPaused(isPaused)
   
    } catch {
      window.alert('User rejected or transaction reverted')
    }

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
              {balance > 0 ? (
                <div className='text-center'>
                  <img
                    src={`https://gateway.pinata.cloud/ipfs/QmQPEMsfd1tJnqYPbnTQCjoa8vczfsV1FmqZWgRdNQ7z3g/${balance.toString()}.png`}
                    alt="Open Punk"
                    width="400px"
                    height="400px"
                  />
                </div>
              ) : (
                <img src={preview} alt="" />
              )}
            </Col>
            <Col>
              <div className='my-4 text-center'>
                <Countdown date={parseInt(revealTime)} className='h2' />
              </div>
              <div className='my-4 text-center'>
                {isOwner &&
                (<Button variant="primary" type="submit" style={{ width: '100%' }} onClick={pauseHandler}>
                  { isPaused ? "UnPause" : "Pause"}
                </Button>)}
              </div>

              <Data
                maxSupply={maxSupply}
                totalSupply={totalSupply}
                cost={cost}
                balance={balance}
              />

              <Mint
                provider={provider}
                nft={nft}
                cost={cost}
                setIsLoading={setIsLoading}
                isPaused={isPaused}
              />

            </Col>
          </Row>
        </>
      )}
    </Container>
  )
}

export default App;
