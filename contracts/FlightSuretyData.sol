pragma solidity >=0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false

    uint256 public constant REGISTRATION_FEE = 10000000000000000000; // 10 either
    uint256 public constant CONSENSUS_PERCENTAGE = 50;

    struct AirlineProfile{
        bool isRegistered;
        bool isFundSubmitted;
        uint256 voteCount;
        address[] votedAirlines;
    }
    mapping(address => AirlineProfile) airlines;
    uint256 private registeredAirlineCount =0;

    mapping(address => uint256) private authorizedContracts;

    uint256 internal balances;
    uint256 internal test;


    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                    address firstAirline
                                ) 
                                public 
    {
        contractOwner = msg.sender;
        airlines[firstAirline] = AirlineProfile({isRegistered: true, isFundSubmitted:false, voteCount:1, votedAirlines:new address[](0)});
        registeredAirlineCount = registeredAirlineCount +1;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireIsCallerAuthorized()
    {
        require(msg.sender == contractOwner || authorizedContracts[msg.sender] == 1, "Caller is not authorized");
        _;
    }

    modifier requireIsRegisteredAirline()
    {
        require(airlines[msg.sender].isRegistered, "Caller is not a register airline");
        _;
    }

    modifier requireIsActiveAirline()
    {
        require(airlines[tx.origin].isFundSubmitted, "Original caller is not an active airline");
        _;
    }
    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/
    function testing()
        public
        view
        returns(uint256)

    {
        return test;
    }

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            public 
                            view
                            requireIsCallerAuthorized
                            returns(bool)

    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode
                            ) 
                            external
                            requireContractOwner
    {
        require(mode != operational, "New mode must be different from existing mode");
        operational = mode;
    }

    function isAirlineActive(address airlineAddress)
        external
        view
        returns(bool)
    {
        return airlines[airlineAddress].isFundSubmitted;
    }

    function isAirlineRegistered(address airlineAddress)
        external
        view
        returns(bool)
    {
        return airlines[airlineAddress].isRegistered;
    }


    function authorizeContract(address contractAddress)
        external
        requireContractOwner
    {
        authorizedContracts[contractAddress] = 1;
    }

    function deauthorizeContract(address contractAddress)
        external
        requireContractOwner
    {
        delete authorizedContracts[contractAddress];
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    function setTestingMode()
        external
        view
        requireIsOperational
    {

    }

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline(
                                address airlineAddress
                            )
                            external
                            requireIsCallerAuthorized
                            requireIsOperational
                            requireIsActiveAirline
    {
        require(!airlines[airlineAddress].isRegistered, "airline is already registered.");

        if(registeredAirlineCount <4){
            airlines[airlineAddress] = AirlineProfile({isRegistered: true, isFundSubmitted:false, voteCount:1,votedAirlines:new address[](0)});
            registeredAirlineCount = registeredAirlineCount +1;
        }else{
            if(airlines[airlineAddress].voteCount > 0){
                //check duplicate votes
                bool isDuplicate = false;
                for(uint c=0; c<airlines[airlineAddress].votedAirlines.length; c++) {
                    if (airlines[airlineAddress].votedAirlines[c] == tx.origin) {
                        isDuplicate = true;
                        break;
                    }
                }
                require(!isDuplicate, "Caller has already voted this airline.");

                uint256 newVoteCount=airlines[airlineAddress].voteCount+1;
                bool canBeRegistered = newVoteCount >= (registeredAirlineCount * CONSENSUS_PERCENTAGE / 100);
                if(canBeRegistered){
                    registeredAirlineCount = registeredAirlineCount +1;
                }
                airlines[airlineAddress].isRegistered=canBeRegistered;
                airlines[airlineAddress].voteCount=newVoteCount;
                airlines[airlineAddress].votedAirlines.push(tx.origin);
            }else{
                //first vote
                airlines[airlineAddress] = AirlineProfile({isRegistered: false, isFundSubmitted:false, voteCount:1, votedAirlines:new address[](0)});
                airlines[airlineAddress].votedAirlines.push(tx.origin);
            }

        }

    }


   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy
                            (                             
                            )
                            external
                            payable
                            requireIsOperational
    {

    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                )
                                external
                                //pure
                                requireIsOperational
    {
        //TODO: don't fund directly, credit the user, then pay themself
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                            )
                            external
                            //pure
                            requireIsOperational
    {
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (
                            )
                            public
                            payable
                            requireIsOperational
                            requireIsRegisteredAirline
    {
        //TODO: airline used to activate itself, airline goes to 2 steps: register, fund. If after 4th airline, need to wait to be voted in, then "fund" 10 eth
        require(msg.value >= REGISTRATION_FEE);
        balances = balances.add(REGISTRATION_FEE);
        uint amountToReturn = msg.value - REGISTRATION_FEE;
//        address payable senderAddressPayable = _make_payable(msg.sender);
//        senderAddressPayable.transfer(amountToReturn);
        msg.sender.transfer(amountToReturn);
        airlines[msg.sender].isFundSubmitted=true;
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
                            external 
                            payable
                            requireIsOperational
    {
        fund();
    }


}

