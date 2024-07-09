// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract Challenges {
    using ECDSA for bytes32;
    uint256 public constant START_BIT = 30;
    uint256 public constant BIT_RANGE = 35;
    uint256 public constant BLOCK_LIMIT = 40;


    struct Challenge {
        address recipient;
        string challengeText;
        bytes32[] subChallenges; // Hashes of the sub-challenges
        string[] subSolutions;  // Solutions to the sub-challenges (empty initially)
        uint256 startBlock;  // block starting challenge
        uint solved;
    }

    Challenge[] public challenges;

    event ChallengeCreated(address indexed recipient, string challengeText, bytes32[] groupHashArray, uint indexed challengeId);
    event ChallengeSubmitted(uint indexed challengeId, uint solved);
    event log(string challengeId);
    event log2(bytes solved);
    event log3(bytes32 solved);

    function createChallenge(address _recipient, string memory _challengeText, bytes32[] memory _subChallenges) public {
        require(_subChallenges.length == BIT_RANGE, "There must be exactly 35 sub-challenges.");
        string[] memory emptySolutions = new string[](BIT_RANGE);
        uint challengeId = challenges.length;
        challenges.push(Challenge({
            recipient: _recipient,
            challengeText: _challengeText,
            subChallenges: _subChallenges,
            subSolutions: emptySolutions,
            startBlock: block.number,
            solved: 0
        }));
        emit ChallengeCreated(_recipient, _challengeText, _subChallenges, challengeId);
    }

    function solveChallenge(uint _challengeIndex, string[] memory _subSolutions) public {
        require(_challengeIndex < challenges.length, "Challenge does not exist.");
        require(_subSolutions.length <= BIT_RANGE, "Too many solutions.");
        Challenge storage challenge = challenges[_challengeIndex];
        require(challenge.solved == 0, "Challenge already solved.");
        require(msg.sender == challenge.recipient, "Only the recipient can solve this challenge.");
        require(block.number <= challenge.startBlock+BLOCK_LIMIT, "Solutions can only be reported before block time limit");

        for (uint i = 0; i < _subSolutions.length; i++) {
            challenge.subSolutions[i] = _subSolutions[i];
        }
        uint j;
        for (j = 0; j < _subSolutions.length; j++) {
            if (sha256(fromHex(_subSolutions[j])) != challenge.subChallenges[j]) {
                break;
            }
        }
        challenge.solved = j;
        emit ChallengeSubmitted(_challengeIndex, j);

    }

   // Convert an hexadecimal character to their value
    function fromHexChar(uint8 c) public pure returns (uint8) {
        if (bytes1(c) >= bytes1('0') && bytes1(c) <= bytes1('9')) {
            return c - uint8(bytes1('0'));
        }
        if (bytes1(c) >= bytes1('a') && bytes1(c) <= bytes1('f')) {
            return 10 + c - uint8(bytes1('a'));
        }
        if (bytes1(c) >= bytes1('A') && bytes1(c) <= bytes1('F')) {
            return 10 + c - uint8(bytes1('A'));
        }
        revert("fail");
    }

    // Convert an hexadecimal string to raw bytes
    function fromHex(string memory s) public pure returns (bytes memory) {
        bytes memory ss = bytes(s);
        require(ss.length%2 == 0); // length must be even
        bytes memory r = new bytes(ss.length/2);
        for (uint i=0; i<ss.length/2; ++i) {
            r[i] = bytes1(fromHexChar(uint8(ss[2*i])) * 16 +
                        fromHexChar(uint8(ss[2*i+1])));
        }
        return r;
    }

    function getChallenge(uint _index) public view returns (address, string memory, bytes32[] memory, string[] memory, uint256, uint) {
        require(_index < challenges.length, "Challenge does not exist.");
        Challenge storage ch = challenges[_index];
        return (ch.recipient, ch.challengeText, ch.subChallenges, ch.subSolutions, ch.startBlock, ch.solved);
    }

    function getStartBit() public pure returns (uint256) {
        return START_BIT;
    }

    function getBitRange() public pure returns (uint256) {
        return BIT_RANGE;
    }
}
