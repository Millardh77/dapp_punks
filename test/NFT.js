const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('Token', () => {
  const NAME = 'MCH Media Punks'
  const SYMBOL = 'MCHPP'
  const COST = ether(10)
  const COST20 = ether(20)
  const MAX_SUPPLY = 2500
  const MAX_MINT_AMOUNT = 5
  const BASE_URI = 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/'
  // Example of where the json and image are located for 1st nft
  // https://ipfs.io/ipfs/QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/1.json  -- json
  // https://ipfs.io/ipfs/QmQPEMsfd1tJnqYPbnTQCjoa8vczfsV1FmqZWgRdNQ7z3g/1.png   -- image

  const MINUTES_TO_ADD = 60000 * 30  // 10 minutes
  const ALLOW_MINTING_ON = (new Date().getTime() + (MINUTES_TO_ADD)).toString().slice(0, 10);



  let nft,
      deployer,
      minter, user2,
      accounts

  beforeEach(async () => {
    accounts = await ethers.getSigners()
    deployer = accounts[0]
    minter = accounts[1]
    user2 = accounts[2]
  })

  describe('Deployment', () => {
    //const ALLOW_MINTING_ON = (Date.now().getTime() + 12000).toString().slice(0,10) // 2 minutes from now

    beforeEach(async () => {
      const NFT = await ethers.getContractFactory('NFT')
      nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT_AMOUNT, ALLOW_MINTING_ON, BASE_URI)
    })

    it('has correct name', async () => {
      expect(await nft.name()).to.equal(NAME)
    })

    it('has correct symbol', async () => {
      expect(await nft.symbol()).to.equal(SYMBOL)
    })

    it('returns the cost to mint', async () => {
      expect(await nft.cost()).to.equal(COST)
    })

    it('returns the maximum total supply', async () => {
      expect(await nft.maxSupply()).to.equal(MAX_SUPPLY)
    })

    it('returns the allowed minting time', async () => {
      expect(await nft.allowMintingOn()).to.equal(ALLOW_MINTING_ON)
    })

    it('returns the base URI', async () => {
        expect(await nft.baseURI()).to.equal(BASE_URI)
    })

    it('returns the owner', async () => {
        //console.log(`Owner: ${await nft.owner()}\n`)
        expect(await nft.owner()).to.equal(deployer.address)
    })
  })

  describe('Minting', () => {
    let transaction, result

    describe('Success', async () => {
      const ALLOW_MINTING_ON = Date.now().toString().slice(0,10) // Now

      beforeEach(async () => {
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT_AMOUNT, ALLOW_MINTING_ON, BASE_URI)
        // Add accounts to white list
        transaction = await nft.connect(deployer).addToWhiteList(accounts[0].address)
        transaction = await nft.connect(deployer).addToWhiteList(accounts[1].address)
        transaction = await nft.connect(minter).mint(1, { value: COST })
        result = await transaction.wait()
      })

      it('returns the address of the minter', async () => {
        expect(await nft.ownerOf(1)).to.equal(minter.address)
      })

      it('returns total number of tokens the minter owns', async () => {
        expect(await nft.balanceOf(minter.address)).to.equal(1)
      })

      it('returns IPFS URI', async () => {
        // EG: 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/1.json'
        // Uncomment this line to see example
        // console.log(await nft.tokenURI(1))
        expect(await nft.tokenURI(1)).to.equal(`${BASE_URI}1.json`)
      })

      it('updates the total supply', async () => {
        expect(await nft.totalSupply()).to.equal(1)
      })
  
      it('updates the contract ether balance', async () => {
        expect(await ethers.provider.getBalance(nft.address)).to.equal(COST)
      })

      it('emits Mint event', async () => {
        await expect(transaction).to.emit(nft, 'Mint')
          .withArgs(1, minter.address)
      })
    })

    describe('Failure', async () => {
      it('rejects insufficient payment', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0,10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT_AMOUNT, ALLOW_MINTING_ON, BASE_URI)

        // Add accounts to white list
        transaction = await nft.connect(deployer).addToWhiteList(accounts[0].address)
        transaction = await nft.connect(deployer).addToWhiteList(accounts[1].address)
        await expect(nft.connect(minter).mint(1, { value: ether(1) })).to.be.reverted
        result = await transaction.wait()
      })
      it('requires minting not be paused', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0,10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT_AMOUNT, ALLOW_MINTING_ON, BASE_URI)

        // Add accounts to white list
        transaction = await nft.connect(deployer).addToWhiteList(accounts[0].address)
        transaction = await nft.connect(deployer).addToWhiteList(accounts[1].address)
        await nft.connect(deployer).pauseMinting(true)
        result = await transaction.wait()
        await expect(nft.connect(minter).mint(1, { value:COST })).to.be.reverted
        //console.log("minting paused?", await nft.mintingPaused())
      })
      it('requires at least 1 NFT to be minted', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0,10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT_AMOUNT, ALLOW_MINTING_ON, BASE_URI)

        // Add accounts to white list
        transaction = await nft.connect(deployer).addToWhiteList(accounts[0].address)
        transaction = await nft.connect(deployer).addToWhiteList(accounts[1].address)
        await expect(nft.connect(minter).mint(0, { value:COST })).to.be.reverted
        result = await transaction.wait()
      })
      it('rejects minting before allowed time', async () => {
        const ALLOW_MINTING_ON = new Date('May 26, 2030 18:00:00').getTime().toString().slice(0,10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT_AMOUNT, ALLOW_MINTING_ON, BASE_URI)

        // Add accounts to white list
        transaction = await nft.connect(deployer).addToWhiteList(accounts[0].address)
        transaction = await nft.connect(deployer).addToWhiteList(accounts[1].address)
        await expect(nft.connect(minter).mint(1, { value: COST })).to.be.reverted
        result = await transaction.wait()
      })
      it('does not allow more NFTs to be minted than max amount', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT_AMOUNT, ALLOW_MINTING_ON, BASE_URI)
        // Add accounts to white list
        transaction = await nft.connect(deployer).addToWhiteList(accounts[0].address)
        transaction = await nft.connect(deployer).addToWhiteList(accounts[1].address)
        const mintAmount = 6
        const tranCost = ether(10 * mintAmount)
        // console.log("Max amount:", await nft.maxMintAmount())
        // console.log("transaction cost", tranCost)
        await expect(nft.connect(minter).mint(mintAmount, { value: tranCost })).to.be.reverted
      })
      it('rejects not whitelisted', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT_AMOUNT, ALLOW_MINTING_ON, BASE_URI)
        // Add accounts to white list
        transaction = await nft.connect(deployer).addToWhiteList(accounts[0].address)
        transaction = await nft.connect(deployer).addToWhiteList(accounts[1].address)
        await expect(nft.connect(user2).mint(1, { value: COST })).to.be.reverted
      })

      it('does not return URIs for invalid tokens', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT_AMOUNT, ALLOW_MINTING_ON, BASE_URI)
        // Add accounts to white list
        transaction = await nft.connect(deployer).addToWhiteList(accounts[0].address)
        transaction = await nft.connect(deployer).addToWhiteList(accounts[1].address)
        nft.connect(minter).mint(1, { value: COST })

        await expect(nft.tokenURI('99')).to.be.reverted
      })

    })
  })

  describe('Displaying NFTs', () => {
    let transaction, result

    const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now

    beforeEach(async () => {
      const NFT = await ethers.getContractFactory('NFT')
      nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT_AMOUNT, ALLOW_MINTING_ON, BASE_URI)

        // Add accounts to white list
        transaction = await nft.connect(deployer).addToWhiteList(accounts[0].address)
        transaction = await nft.connect(deployer).addToWhiteList(accounts[1].address)
      // Mint 3 nfts
      transaction = await nft.connect(minter).mint(3, { value: ether(30) })
      result = await transaction.wait()
    })

    it('returns all the NFTs for a given owner', async () => {
      let tokenIds = await nft.walletOfOwner(minter.address)
      // Uncomment this line to see the return value
      // console.log("owner wallet", tokenIds)
      expect(tokenIds.length).to.equal(3)
      expect(tokenIds[0].toString()).to.equal('1')
      expect(tokenIds[1].toString()).to.equal('2')
      expect(tokenIds[2].toString()).to.equal('3')
    })
  })
  describe('Minting', () => {
    let transaction
    describe('Success', async () => {
      let result, balanceBefore

      const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now

      beforeEach(async () => {
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT_AMOUNT, ALLOW_MINTING_ON, BASE_URI)
        // Add accounts to white list
        transaction = await nft.connect(deployer).addToWhiteList(accounts[0].address)
        transaction = await nft.connect(deployer).addToWhiteList(accounts[1].address)

        transaction = await nft.connect(minter).mint(1, { value: COST })
        result = await transaction.wait()

        balanceBefore = await ethers.provider.getBalance(deployer.address)

        transaction = await nft.connect(deployer).withdraw()
        result = await transaction.wait()
      })

      it('deducts contract balance', async () => {
        expect(await ethers.provider.getBalance(nft.address)).to.equal(0)
      })

      it('sends funds to the owner', async () => {
        expect(await ethers.provider.getBalance(deployer.address)).to.be.greaterThan(balanceBefore)
      })

      it('emits a withdraw event', async () => {
        expect(transaction).to.emit(nft, 'Withdraw')
          .withArgs(COST, deployer.address)
      })
    })

    describe('Failure', async () => {
      it('prevents non-owner from withdrawing', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT_AMOUNT, ALLOW_MINTING_ON, BASE_URI)
        // Add accounts to white list
        transaction = await nft.connect(deployer).addToWhiteList(accounts[0].address)
        transaction = await nft.connect(deployer).addToWhiteList(accounts[1].address)
        nft.connect(minter).mint(1, { value: COST })

        await expect(nft.connect(minter).withdraw()).to.be.reverted
      })
    })
  })


  
})
