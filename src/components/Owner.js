import { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { ethers } from 'ethers'

const Create = ({ provider, dao, setIsLoading }) => {
    const [name, setName] = useState('')
    const [amount, setAmount] = useState(0)
    const [address, setAddress] = useState('')
    const [isWaiting, setIsWaiting] = useState(false)

    // Call the function on component mount
useEffect(() => {
    handleVote();
    addVotes();
  }, []);    
  
    const createHandler = async (e) => {
        e.preventDefault()
        setIsWaiting(true)

        try {
            const signer = await provider.getSigner()
            const formattedAmount = ethers.utils.parseUnits(amount.toString(), 'ether')
      
            const transaction = await dao.connect(signer).createProposal(name, formattedAmount, address)
            await transaction.wait()
          } catch {
            window.alert('User rejected or transaction reverted')
          }
      
          setIsLoading(true)
      
    }
    const pauseHandler = async (e) => {
        //e.preventDefault()
            // Get whether minting is paused
            const pauseMinting = !isPaused ? true : false
            console.log(`Setting Paused: ${pauseMinting}\n`)
    
        
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
    
    return(<>
      <Form onSubmit={createHandler}>
        <Form.Group style={{ maxWidth: '450px', margin: '50px auto' }}>
            <Form.Control 
             type='text' 
             placeholder='Enter name' 
             className='my-2'
             onChange={(e) => setName(e.target.value)}
             required 
            />
            <Form.Control 
             type='number' 
             placeholder='Enter amount' 
             className='my-2' 
             onChange={(e) => setAmount(e.target.value)} 
            />
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
                Create Proposal
            </Button>
            )}
        </Form.Group>
      </Form>
    </>)
}

export default Create;