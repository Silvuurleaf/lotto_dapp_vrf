/*  solidity: "0.8.17",*/
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomiclabs/hardhat-waffle");

const ALCHEMY_API_KEY = 'USDQAFXjgl_4glvJd8zMW_PjIHP3-EA8';
const GOERLI_PRIVATE_KEY = '77c38a50c3ac99daf55907bf48aec6061cf0f2b38baf60bb2440be62ddf60bd7';


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: ">=0.5.0 <0.9.0",
  solidity: "0.8.17",

  defaultNetwork: "hardhat",
  networks: {
    hardhat: {

    },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY]
    }

  }

};
