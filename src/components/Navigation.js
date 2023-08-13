import Navbar from 'react-bootstrap/Navbar';
import Blockies from 'react-blockies'
import Button from 'react-bootstrap/Button'

import logo from '../logo.png';

const Navigation = ({ account }) => {
  const connectHandler = async () => {

  }
  return (
    <Navbar className='my-3'>
      <img
        alt="logo"
        src={logo}
        width="40"
        height="40"
        className="d-inline-block align-top mx-3"
      />
      <Navbar.Brand href="#">MCH Media Punks</Navbar.Brand>
      <Navbar.Collapse className="justify-content-end">
      {account ? (
      <Navbar.Text className='d-flex align-items-center'>
              {account.slice(0, 5) + '...' + account.slice(38, 42)}
              <Blockies
                  seed={account}
                  size={10}
                  scale={3}
                  color="#0b0f11"
                  bgColor="#F1F2F9"
                  spotColor="#767F92"
                  className="identicon mx-2"
                />
            </Navbar.Text>
        ) : (
          <Button onClick={connectHandler}>Connect</Button>
        )}
      
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Navigation;
