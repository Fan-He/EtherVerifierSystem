// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol"; 
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol"; 
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol"; 

contract GroupAssignment is VRFConsumerBaseV2, ConfirmedOwner {
    VRFCoordinatorV2Interface private coordinator;

    // Chainlink VRF related variables
    bytes32 private keyHash;
    uint256 private fee;
    uint64 private s_subscriptionId;
    uint256 public lastRequestId;

    // User grouping related variables
    uint256 public constant GROUP_SIZE = 10;  
    address[] public users;
    mapping(uint256 => address[]) public groups;  

    event UsersAssigned(uint256 requestId, address[] usersAssigned);

    constructor(uint64 subscriptionId)
        VRFConsumerBaseV2(0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625) // VRF Coordinator address
        ConfirmedOwner(msg.sender)
    {
        coordinator = VRFCoordinatorV2Interface(0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625);
        keyHash = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;
        fee = 0.25 * 10 ** 18;  // 0.25 LINK
        s_subscriptionId = subscriptionId;
    }

    // Function to request random numbers
    function requestRandomUsers() external onlyOwner {
        uint256 requestId = coordinator.requestRandomWords(
            keyHash,
            s_subscriptionId,
            3,  // requestConfirmations
            200000,  // callbackGasLimit
            1  // numWords
        );
        lastRequestId = requestId;
    }

    // Callback function used by VRF Coordinator
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 randomIndex = randomWords[0] % users.length;
        address[] memory selectedUsers = new address[](GROUP_SIZE);

        for (uint256 i = 0; i < GROUP_SIZE; i++) {
            selectedUsers[i] = users[(randomIndex + i) % users.length];
        }

        groups[requestId] = selectedUsers;
        emit UsersAssigned(requestId, selectedUsers);
    }

    // Function to add users (this can be controlled via access modifiers as necessary)
    function addUser(address _user) public {
        users.push(_user);
    }

    // Function to retrieve assigned users from a particular request
    function getAssignedUsers(uint256 requestId) public view returns (address[] memory) {
        return groups[requestId];
    }
}
