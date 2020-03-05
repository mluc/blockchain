## Project3
### Github link 
https://github.com/mluc/blockchain

### Versions:
- Truffle v5.1.15

### Steps to run:
cd project-6
- Tab1: Launch Ganache
   - npm install
   - ganache-cli -m "spirit supply whale amount human item harsh scare congress discover talent hamster"
- Tab2: smart contracts
   - truffle compile
   - truffle migrate
   - truffle test
- Tab3: client
   - npm run dev
###  Deploy to RINKEBY test network
`truffle migrate --reset --network rinkeby`
https://rinkeby.etherscan.io/address/0xef74dd7cc72e0b020a077ebd3cd22fbfecb7d821

   Deploying 'FarmerRole'
   - transaction hash:    0x23db6c231b53d46743887f39140f6dd22520326d44dcddf48014a888d9ab0eae
   - contract address:    0x988234cc6261e8Fe726e03763f457ec9Fd127199

   Deploying 'DistributorRole'
   - transaction hash:    0x4576510d48de3db4e9a8e97454068cbeff0026a6a6ff649dd15268cab1c33468
   - contract address:    0x6703A2412Bb3fCDDC79292B475B7f5B11671cE36

   Deploying 'RetailerRole'
   - transaction hash:    0x6942c974ce1f065d2050b7d5b4bbc3f777a5032d5e33261bfea2a9c5f7bdf2a4
   - contract address:    0x9704F16c530F3D404052d1E8317Ddb74998495b8

   Deploying 'ConsumerRole'
   - transaction hash:    0xc438df6f7a380ec69aca6d96f527abc2e4d3ae601b88fab52c6997226de8d941
   - contract address:    0x50C18A806210067407786235b40e9a7549eFb9da

   Deploying 'SupplyChain'
   -  transaction hash:    0x84a413c44bfbe90e5c5d8c1eef5f3244a85cced580403963ad52420e0a5aee6d
   - contract address:    0xD213d7eAbaF3f2ddDFE5Be37dd222a93b85f8b4a
