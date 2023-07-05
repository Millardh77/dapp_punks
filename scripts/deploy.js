// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const NAME = 'Dapp Punks'
  const SYMBOL = 'DP'
  const COST = ethers.utils.parseUnits('10', 'ether')
  const MAX_SUPPLY = 25
  const MAX_MINT_AMOUNT = 5
  const MINUTES_TO_ADD = 60000 * 1  // 1 minute
  const NFT_MINT_DATE = (new Date().getTime() + (MINUTES_TO_ADD)).toString().slice(0, 10);
  const IPFS_METADATA_URI = 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/'

  // Deploy NFT
  const NFT = await hre.ethers.getContractFactory('NFT')
  let nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT_AMOUNT, NFT_MINT_DATE, IPFS_METADATA_URI)

  await nft.deployed()
  let allowMintingOn = await nft.allowMintingOn();
  allowMintingOn = Number(allowMintingOn);

  console.log(`NFT Mint Time: ${allowMintingOn}\n`)
  console.log(`NFT deployed to: ${nft.address}\n`)
  let accounts, deployer, transaction

  accounts = await ethers.getSigners()
  deployer = accounts[0]

  // Add accounts to white list
  transaction = await nft.connect(deployer).addToWhiteList(accounts[0].address)
  transaction = await nft.connect(deployer).addToWhiteList(accounts[1].address)
  transaction = await nft.connect(deployer).addToWhiteList(accounts[2].address)
  await transaction.wait()

  console.log(`White Listed accounts added to NFT\n`)  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
