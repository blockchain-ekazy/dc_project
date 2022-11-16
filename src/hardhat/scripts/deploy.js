// const { ethers } = require("ethers");
const { artifacts } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const Token = await ethers.getContractFactory("DeloreanOriginals");
  const token = await Token.deploy();
  await token.deployed();
  console.log(`DeloreanOriginals NFT Contract deployed to:`, token.address);

  const DeloreanCodes = await ethers.getContractFactory("DeloreanCodes");
  const marketplace = await DeloreanCodes.deploy(token.address);
  await marketplace.deployed(token.address);

  
  console.log(`DeloreanCodes Contract deployed to:`, marketplace.address);
  
  saveFrontendFiles(token, "DeloreanOriginals");
  saveFrontendFiles(marketplace, "DeloreanCodes");
}


function saveFrontendFiles(token, name){
  const fs = require("fs");
  const contractsDir = __dirname + "/../../contractData";

  if(!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({Token: token.address}, undefined,2)
  );

  const TokenArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(TokenArtifact,null,2)
  );
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
