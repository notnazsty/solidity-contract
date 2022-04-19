# Sample Solidity Contract Using ERC 721A & Merkle Tree Root Hashes

This contract is built upon the ERC721A token standard so that gas fees for minting becomes alot cheaper. The contract also implements merkle trees for white lists to make it infinitely cheaper to store whitelist addresses at the expense of minimal gas fees for the minter. This increase in gas fee for whitelist mints should be balanced out by the gas fee savings created by the ERC721A standard.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```
