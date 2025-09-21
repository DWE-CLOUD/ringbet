export const RINGS_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "_buyIn", type: "uint256" },
      { internalType: "uint256", name: "_maxPlayers", type: "uint256" }
    ],
    name: "createRing",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "_ringId", type: "uint256" }
    ],
    name: "joinRing",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "nextRingId",
    outputs: [
      { internalType: "uint256", name: "", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" }
    ],
    name: "rings",
    outputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "uint256", name: "buyIn", type: "uint256" },
      { internalType: "uint256", name: "maxPlayers", type: "uint256" },
      { internalType: "bool", name: "isActive", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "ringId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "buyIn", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "maxPlayers", type: "uint256" }
    ],
    name: "RingCreated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "ringId", type: "uint256" },
      { indexed: false, internalType: "address", name: "player", type: "address" }
    ],
    name: "PlayerJoined",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "ringId", type: "uint256" },
      { indexed: false, internalType: "address", name: "winner", type: "address" },
      { indexed: false, internalType: "uint256", name: "prize", type: "uint256" }
    ],
    name: "WinnerDeclared",
    type: "event"
  }
] as const;

export const RINGS_CONTRACT_ADDRESS = "0xcabe8c3b9718fd4ef8e9b4b0e808ffbedeaeaf3e" as const;
