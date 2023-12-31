export default [
    {
        inputs: [
            { internalType: "address", name: "base", type: "address" },
            { internalType: "address", name: "quote", type: "address" },
        ],
        name: "decimals",
        outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address", name: "base", type: "address"
            },
            {
                internalType: "address", name: "quote", type: "address"
            },
        ],
        name: "latestRoundData",
        outputs: [
            {
                internalType: "uint80", name: "roundId", type: "uint80"
            },
            {
                internalType: "int256", name: "answer", type: "int256"
            },
            {
                internalType: "uint256", name: "startedAt", type: "uint256"
            },
            {
                internalType: "uint256", name: "updatedAt", type: "uint256"
            },
            {
                internalType: "uint80", name: "answeredInRound", type: "uint80"
            },
        ],
        stateMutability: "view",
        type: "function",
    }
]