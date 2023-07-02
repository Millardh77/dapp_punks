import { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

const Create = ({ provider, nft, setIsLoading, setIsPaused }) => {
    const [address, setAddress] = useState('')
    const [isWaiting, setIsWaiting] = useState(false)
    const [isNowPaused, setIsNowPaused] = useState(false)

    // Call the function on component mount
useEffect(() => {
  async function fetchData() {
    // Get whether minting is paused
    const isPaused = await nft.mintingPaused()
    // console.log(`Is Paused: ${isPaused}\n`)
 
    setIsNowPaused(isPaused)
    // handleVote();
    // addVotes();

  }
  fetchData();
  }, [nft]);    
  
    const whitelistHandler = async (e) => {
        e.preventDefault()
        setIsWaiting(true)

        try {
            const signer = await provider.getSigner()
      
            const transaction = await nft.connect(signer).addToWhiteList(address)

            await transaction.wait()
          } catch {
            window.alert('User rejected or transaction reverted')
          }
      
          setIsLoading(true)
      
    }
    const pauseHandler = async (e) => {
        e.preventDefault()
            // Get whether minting is paused
            const isPaused = isNowPaused
            // console.log(`Is Paused: ${isPaused}\n`)

            const pauseMinting = !isPaused ? true : false
            // console.log(`Setting Paused: ${pauseMinting}\n`)
    
        
         try {
           const signer = await provider.getSigner()
            const transaction = await nft.connect(signer).pauseMinting(pauseMinting)
            await transaction.wait()
    
            const isPaused = await nft.mintingPaused()
            setIsPaused(isPaused)
            setIsNowPaused(isPaused)
       
        } catch {
          window.alert('User rejected or transaction reverted')
        }
    
      }
    
    return(<>
      <h2 className='my-4 text-center'>Owner Functions</h2>
      <div className='my-4 text-center'>
         <Button variant="primary" type="submit" style={{ width: '100%' }} onClick={pauseHandler}>
               { isNowPaused ? "UnPause Minting" : "Pause Minting"}
                </Button>
       </div>
      <Form onSubmit={whitelistHandler}>
        <Form.Group style={{ maxWidth: '450px', margin: '50px auto' }}>
            <Form.Control 
             type='text' 
             placeholder='Enter address' 
             className='my-2' 
             onChange={(e) => setAddress(e.target.value)} 
            />
            {isWaiting ? (
            <Spinner animation="border" style={{ display: 'block', margin: '0 auto' }} />
            ) : (
            <Button variant='primary' type='submit' style={{ width: '100%' }}>
                Save White List Address
            </Button>
            )}
        </Form.Group>
      </Form>
      <hr />

    </>)
}

export default Create;
