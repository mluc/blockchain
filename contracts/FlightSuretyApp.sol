pragma solidity ^0.4.25;

// It's important to avoid vulnerabilities due to numeric overflow bugs
// OpenZeppelin's SafeMath library, when used correctly, protects agains such bugs
// More info: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2018/november/smart-contract-insecurity-bad-arithmetic/

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

/************************************************** */
/* FlightSurety Smart Contract                      */
/************************************************** */
contract FlightSuretyApp {
    using SafeMath for uint256; // Allow SafeMath functions to be called for all uint256 types (similar to "prototype" in Javascript)

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    // Flight status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20; //TODO: delay due to airline, pay out
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    address private contractOwner;          // Account used to deploy contract

    struct Flight { //TODO: support oracles
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;        
        address airline;
    }
    mapping(bytes32 => Flight) private flights;

    FlightSuretyData flightSuretyData;

    uint256 public constant CONSENSUS_PERCENTAGE = 50;
    uint256 public constant AIRLINE_REGISTRATION_FEE = 10000000000000000000; // 10 either
    uint256 public constant PAYOUT_PERCENTAGE = 150;
    uint256 public constant INSURANCE_MAX = 1000000000000000000; // 1 either


    bytes32 test2;
    function testing2()
    public
    view
    returns(bytes32)

    {

        return test2;
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
         // Modify to call data contract's status
        require(isOperational(), "Contract is currently not operational");
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

    /********************************************************************************************/
    /*                                       CONSTRUCTOR                                        */
    /********************************************************************************************/

    /**
    * @dev Contract constructor
    *
    */
    constructor
                                (
                                    address dataContract
                                ) 
                                public 
    {
        contractOwner = msg.sender;
        flightSuretyData = FlightSuretyData(dataContract);
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    function isOperational() 
                            public 
                            //pure
                            view
                            returns(bool)
    {
        return flightSuretyData.isOperational();  // Modify to call data contract's status
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

  
   /**
    * @dev Add an airline to the registration queue
    *
    */   
    function registerAirline
                            (
                                address airlineAddress
                            )
                            external
                            //pure
                            requireIsOperational
                            returns(bool success, uint256 votes)
    {
        flightSuretyData.registerAirline(airlineAddress, CONSENSUS_PERCENTAGE); //TODO
        return (success, 0);
    }


   /**
    * @dev Register a future flight for insuring.
    *
    */  
    function registerFlight
                                (
                                    string flight,
                                    uint256 timestamp
                                )
                                external
                                //pure
                                requireIsOperational
    {
        address airlineAddress = msg.sender;
        require(flightSuretyData.isAirlineActive(airlineAddress), 'only active airline can register flights');
        //TODO: it can be list of flights user can choose( hard coded).
        //Do this if you want to be more challenge: register a flight and then retrieve a list of flights that are registered when the user ready make a selection from UI.
        // Flights has timestamp, only show flights for the future
        bytes32 key = keccak256(abi.encodePacked(airlineAddress, flight, timestamp));
        flights[key] = Flight({isRegistered:true, statusCode:STATUS_CODE_UNKNOWN, updatedTimestamp:timestamp, airline:airlineAddress});

    }

    function isFlightRegistered(address airline, string flight, uint256 timestamp)
        external
        view
        requireContractOwner
        returns(bool isRegistered)
    {
        bytes32 key = keccak256(abi.encodePacked(airline, flight, timestamp));
        isRegistered=flights[key].isRegistered;
    }

   /**
    * @dev Called after oracle has updated flight status
    *
    */  
    function processFlightStatus
                                (
                                    address airline,
                                    string memory flight,
                                    uint256 timestamp,
                                    uint8 statusCode
                                )
                                internal
                                //pure
                                requireIsOperational
    {
        //TODO: triggered when oracle come back with result, and it decide where thing goes: if statusCode not 20, noop, if statusCode 20, look for passengers with that flights + purchase insurance, start the process of how much they should be paid

        if(statusCode==STATUS_CODE_LATE_AIRLINE){
            bytes32 flightKey = getFlightKey(airline,flight,timestamp);
            flightSuretyData.creditInsurees(flightKey);
        }
    }


    //TODO: a button clicked on the client
    // Generate a request for oracles to fetch flight information
    function fetchFlightStatus
                        (
                            address airline,
                            string flight,
                            uint256 timestamp
                        )
                        external
                        requireIsOperational
    {
        uint8 index = getRandomIndex(msg.sender);

        // Generate a unique key for storing the request
        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));
        oracleResponses[key] = ResponseInfo({
                                                requester: msg.sender,
                                                isOpen: true
                                            });
        emit OracleRequest(index, airline, flight, timestamp);
    }

    function calculatePayout
        (
            uint256 insurance
        )
        internal
        pure
        returns(uint256)
    {
        return insurance.mul(PAYOUT_PERCENTAGE).div(100);
    }

    function buyInsurance
        (
            address airline,
            string flight,
            uint256 timestamp
        )
        external
        payable
        requireIsOperational
    {
        require(msg.value <= INSURANCE_MAX, 'max insurance amount is 1 ether');
        require(msg.value > 0, 'insurance amount cannot <= 0');
        address(flightSuretyData).transfer(msg.value);

        bytes32 flightKey = getFlightKey(airline, flight, timestamp);
        uint256 payout = calculatePayout(msg.value);
        flightSuretyData.buy(flightKey, msg.value, payout);
    }

    function airlineFund()
        public
        payable
    requireIsOperational
    {
        require(msg.value >= AIRLINE_REGISTRATION_FEE, 'airline registration fee is 10 ether');

        address(flightSuretyData).transfer(msg.value);
        flightSuretyData.fund(AIRLINE_REGISTRATION_FEE, msg.value);

    }

    function payCustomer
        (
            address airline,
            string flight,
            uint256 timestamp
        )
        external
        payable
        requireIsOperational
    {
        bytes32 flightKey = getFlightKey(airline, flight, timestamp);
        flightSuretyData.pay(flightKey);
    }


// region ORACLE MANAGEMENT

    // Incremented to add pseudo-randomness at various points
    uint8 private nonce = 0;    

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 ether; //TODO 10 ether?

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 3;


    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;        
    }

    // Track all registered oracles
    mapping(address => Oracle) private oracles;
    // Model for responses from oracles
    struct ResponseInfo {
        address requester;                              // Account that requested status
        bool isOpen;                                    // If open, oracle responses are accepted
        mapping(uint8 => address[]) responses;          // Mapping key is the status code reported
        // This lets us group responses and identify
        // the response that majority of the oracles
    }


    // Track all oracle responses
    // Key = hash(index, flight, timestamp)
    mapping(bytes32 => ResponseInfo) private oracleResponses;

    // Event fired each time an oracle submits a response
    event FlightStatusInfo(address airline, string flight, uint256 timestamp, uint8 status, bool verified);

    event OracleReport(address airline, string flight, uint256 timestamp, uint8 status);

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(uint8 index, address airline, string flight, uint256 timestamp);


    // Register an oracle with the contract
    function registerOracle
                            (
                            )
                            external
                            payable
                            requireIsOperational
    {
        // Require registration fee
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");

        uint8[3] memory indexes = generateIndexes(msg.sender);

        oracles[msg.sender] = Oracle({
                                        isRegistered: true,
                                        indexes: indexes
                                    });
    }

    function getMyIndexes
                            (
                            )
                            view
                            external
                            returns(uint8[3])
    {
        require(oracles[msg.sender].isRegistered, "Not registered as an oracle");

        return oracles[msg.sender].indexes;
    }




    // Called by oracle when a response is available to an outstanding request
    // For the response to be accepted, there must be a pending request that is open
    // and matches one of the three Indexes randomly assigned to the oracle at the
    // time of registration (i.e. uninvited oracles are not welcome)
    function submitOracleResponse
                        (
                            uint8 index,
                            address airline,
                            string flight,
                            uint256 timestamp,
                            uint8 statusCode
                        )
                        external
    {

        require((oracles[msg.sender].indexes[0] == index) || (oracles[msg.sender].indexes[1] == index) || (oracles[msg.sender].indexes[2] == index), "Index does not match oracle request");

        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));

        require(oracleResponses[key].isOpen, "Flight or timestamp do not match oracle request");

        bytes32 flightKey = keccak256(abi.encodePacked(airline, flight, timestamp));
        require(flights[flightKey].isRegistered, "Flight is not registered");

        oracleResponses[key].responses[statusCode].push(msg.sender);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(airline, flight, timestamp, statusCode);
        if (oracleResponses[key].responses[statusCode].length >= MIN_RESPONSES) {
            //Prevent any more responses since MIN_RESPONSE threshold has been reached
            oracleResponses[key].isOpen = false;
            //Announce to the world that verified flight status information is available
            emit FlightStatusInfo(airline, flight, timestamp, statusCode, true);

            // Save the flight information for posterity
            flights[flightKey].statusCode = statusCode;

            // Handle flight status as appropriate
            processFlightStatus(airline, flight, timestamp, statusCode);
        }else{
            emit FlightStatusInfo(airline, flight, timestamp, statusCode, false);
        }
    }


    function viewFlightStatus
    (
        address airline,
        string flight,
        uint256 timestamp
    )
    external
    view
    returns(uint8)
    {
        bytes32 key = keccak256(abi.encodePacked(airline, flight, timestamp));
        require(flights[key].statusCode != STATUS_CODE_UNKNOWN, "Flight status not available");

        return flights[key].statusCode;

    }

    function getFlightKey
                        (
                            address airline,
                            string flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32)
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    // Returns array of three non-duplicating integers from 0-9
    function generateIndexes
                            (                       
                                address account         
                            )
                            internal
                            returns(uint8[3])
    {
        uint8[3] memory indexes;
        indexes[0] = getRandomIndex(account);
        
        indexes[1] = indexes[0];
        while(indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(account);
        }

        indexes[2] = indexes[1];
        while((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account);
        }

        return indexes;
    }

    // Returns array of three non-duplicating integers from 0-9
    function getRandomIndex
                            (
                                address account
                            )
                            internal
                            returns (uint8)
    {
        uint8 maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - nonce++), account))) % maxValue);

        if (nonce > 250) {
            nonce = 0;  // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }

    //Fallback function to receive and transfer Ether
    function() external payable{
        address(flightSuretyData).transfer(msg.value);
    }

// endregion

}

contract FlightSuretyData{
    function isOperational() public view returns(bool);
    function registerAirline(address airlineAddress, uint256 concensusPercentage) external;
    function buy(bytes32 flightKey, uint256 insuranceAmount, uint256 payoutAmount) external payable;
    function fund(uint256 airlineRegistrationFree, uint256 msgValue) public payable;
    function creditInsurees(bytes32 flightKey) external;
    function isAirlineActive(address airlineAddress) external view returns(bool);
    function pay(bytes32 flightKey) external;
}