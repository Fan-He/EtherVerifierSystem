pragma solidity ^0.8.7; 

contract GroupHashStorage {
    uint256 public groupHash;

    function storeGroupHash(uint256 _groupHash) public {
        groupHash = _groupHash;
    }
}

