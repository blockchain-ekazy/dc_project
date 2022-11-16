require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const GOERLI_URL = "https://eth-goerli.g.alchemy.com/v2/iVdQ5frXbmIvL17Cei12tckgBCRuGxUE";
const PRIVATE_KEY = "2e01d593a5cc21264954b32c09bcb05e48b1c47a2796fd5ab77ad5f70e72bd48;

module.exports = {
  solidity: "0.8.4",
  networks: {
    goerli: {
      url: GOERLI_URL,
      accounts: [PRIVATE_KEY],
    },
  },
  paths: {
    artifacts: "./src/hardhat/artifacts",
    sources: "./src/hardhat/contracts",
    cache: "./src/hardhat/cache",
    tests: "./src/hardhat/test",
  },
};
