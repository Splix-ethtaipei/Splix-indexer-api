export const abi = [
    {
      "type": "constructor",
      "inputs": [
        {
          "name": "_messageTransmitter",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "_chainFlag",
          "type": "uint8",
          "internalType": "enum ReceiptStorage.ChainFlag"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "chainFlag",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint8",
          "internalType": "enum ReceiptStorage.ChainFlag"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "createGroup",
      "inputs": [
        {
          "name": "groupInfo",
          "type": "tuple",
          "internalType": "struct ReceiptStorage.GroupInfo",
          "components": [
            { "name": "groupName", "type": "string", "internalType": "string" },
            { "name": "items", "type": "string[]", "internalType": "string[]" },
            {
              "name": "prices",
              "type": "uint256[]",
              "internalType": "uint256[]"
            }
          ]
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "editGroup",
      "inputs": [
        { "name": "_groupId", "type": "uint256", "internalType": "uint256" },
        {
          "name": "groupInfo",
          "type": "tuple",
          "internalType": "struct ReceiptStorage.GroupInfo",
          "components": [
            { "name": "groupName", "type": "string", "internalType": "string" },
            { "name": "items", "type": "string[]", "internalType": "string[]" },
            {
              "name": "prices",
              "type": "uint256[]",
              "internalType": "uint256[]"
            }
          ]
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "getGroupItems",
      "inputs": [
        { "name": "_groupId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        { "name": "names", "type": "string[]", "internalType": "string[]" },
        { "name": "prices", "type": "uint256[]", "internalType": "uint256[]" },
        { "name": "paidStatus", "type": "bool[]", "internalType": "bool[]" },
        { "name": "paidBy", "type": "address[]", "internalType": "address[]" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "groupId",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "groupItemHasPaidMap",
      "inputs": [
        { "name": "", "type": "uint256", "internalType": "uint256" },
        { "name": "", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "groupItemNameMap",
      "inputs": [
        { "name": "", "type": "uint256", "internalType": "uint256" },
        { "name": "", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "groupItemNumMap",
      "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "groupItemPaidByMap",
      "inputs": [
        { "name": "", "type": "uint256", "internalType": "uint256" },
        { "name": "", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "groupItemPriceMap",
      "inputs": [
        { "name": "", "type": "uint256", "internalType": "uint256" },
        { "name": "", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "groupOwnerMap",
      "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "messageTransmitter",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "contract IReceiverV2"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "payForItems",
      "inputs": [
        { "name": "_groupId", "type": "uint256", "internalType": "uint256" },
        { "name": "itemIds", "type": "uint256[]", "internalType": "uint256[]" },
        { "name": "amount", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "relay",
      "inputs": [
        { "name": "message", "type": "bytes", "internalType": "bytes" },
        { "name": "attestation", "type": "bytes", "internalType": "bytes" },
        { "name": "_groupId", "type": "uint256", "internalType": "uint256" },
        { "name": "itemIds", "type": "uint256[]", "internalType": "uint256[]" },
        { "name": "amount", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        { "name": "relaySuccess", "type": "bool", "internalType": "bool" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "supportedMessageBodyVersion",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint32", "internalType": "uint32" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "supportedMessageVersion",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint32", "internalType": "uint32" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "usdcToken",
      "inputs": [],
      "outputs": [
        { "name": "", "type": "address", "internalType": "contract IERC20" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "event",
      "name": "GroupCreated",
      "inputs": [
        {
          "name": "groupId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "owner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "groupName",
          "type": "string",
          "indexed": false,
          "internalType": "string"
        },
        {
          "name": "itemCount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "GroupEdited",
      "inputs": [
        {
          "name": "groupId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "owner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "itemCount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "ItemCreated",
      "inputs": [
        {
          "name": "groupId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "itemId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "itemName",
          "type": "string",
          "indexed": false,
          "internalType": "string"
        },
        {
          "name": "itemPrice",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "ItemEdited",
      "inputs": [
        {
          "name": "groupId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "itemId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "itemName",
          "type": "string",
          "indexed": false,
          "internalType": "string"
        },
        {
          "name": "itemPrice",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "ItemsPaid",
      "inputs": [
        {
          "name": "groupId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "payer",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "itemIds",
          "type": "uint256[]",
          "indexed": false,
          "internalType": "uint256[]"
        },
        {
          "name": "totalAmount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    }
]