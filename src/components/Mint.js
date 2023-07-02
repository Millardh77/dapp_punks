import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { ethers } from 'ethers'

const Mint = ({ provider, nft, cost, setIsLoading }) => {
  const [isWaiting, setIsWaiting] = useState(false)
  const [amount, setAmount] = useState(1)

  const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
  }
  
  const ether = tokens
 
  const min = 1;
  const max = 5;

  const handleChange = event => {
    const value = Math.max(min, Math.min(max, Number(event.target.value)));
    setAmount(value);
  };

  const mintHandler = async (e) => {
    e.preventDefault()
    setIsWaiting(true)

    try {
        const signer = await provider.getSigner()
        const convertedCost = ethers.utils.formatUnits(cost, 18)

        const totalCost = ether(convertedCost * amount)
        //console.log(`Cost: ${cost} /n Converted Cost: ${convertedCost} /n Amount: ${amount} /n Total Cost: ${totalCost}`)
        const transaction = await nft.connect(signer).mint(amount, { value: totalCost })
        await transaction.wait()
      } catch {
        window.alert('User rejected or transaction reverted')
      }
  
      setIsLoading(true)
  
  }
  return(
    <Form onSubmit={mintHandler} style={{ maxWidth: '450px', margin: '50px auto' }}>
    {isWaiting ? (
      <Spinner animation="border" style={{ display: 'block', margin: '0 auto' }} />
    ) : (
      <Form.Group>
         <Form.Control 
             type='number' 
             placeholder='Enter amount to Mint' 
             className='my-2' 
             onChange={handleChange}
            />
        <Button variant="primary" type="submit" style={{ width: '100%' }}>
          Mint
        </Button>
      </Form.Group>
    )}
  </Form>

  )
}

export default Mint;