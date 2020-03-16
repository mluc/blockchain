# FlightSurety

## Github link:
- https://github.com/mluc/blockchain

## Setup Ganache GUI:
- HTTP://127.0.0.1:7545
- ACCOUNT DEFAULT BALANCE: 1000
- TOTAL ACCOUNTS TO GENERATE: 50
- GAS LIMIT: 500000000
- GAS PRICE: 30000000000

## Version:
- node: v10.19.0
- truffle: v5.1.15

## Run tests:
- sudo truffle compile
- sudo truffle test

## Run Dapp:
- sudo truffle migrate --reset
- npm run dapp
- npm run server (wait for all the oracles registered before selecting Submit to oracle button)
- http://localhost:8000/