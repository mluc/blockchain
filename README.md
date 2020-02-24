# Project2
## Info:
- Truffle v5.1.14 (core: 5.1.14)
- openzeppelin-solidity@2.1.2
- truffle-hdwallet-provider@1.0.2
- ERC-721 Token Name: Project2 Token
- ERC-721 Token Symbol: USD
- Token Address on the Rinkeby Network: 0x5e383C742dD86B6876c1D4FF4458786Db7d20Aa8

## Start backend
- `truffle develop`
  - Note the following info: URL http://127.0.0.1/9545, accounts, and private keys.
  - Use an account and private key above to import account to metamask
- `compile`
- `test`
- `migrate --reset` to start a clean smart contract section and migrate it to local network
  - Note the contract address

## Start frontend
- `cd app`
- `npm run dev`
  - Note URL project running at

## Deploy to Rinkeby:
- `truffle migrate --reset --network rinkeby`