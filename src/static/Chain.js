export const Base_Sepolia = {
  id: 84532,
  name: "Base Sepolia Testnet",
  iconUrl:
    "https://miro.medium.com/v2/resize:fill:176:176/1*8MPVs56Z5F7i1wEdLOReuQ.jpeg",
  iconBackground: "#fff",
  nativeCurrency: {
    name: "Base Sepolia Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://sepolia.base.org"] },
    public: { http: ["https://sepolia.base.org"] },
  },
  blockExplorers: {
    default: {
      name: "Base Sepolia Testnet",
      url: "https://sepolia.basescan.org/",
    },
  },
  testnet: true,
};

export const rpcUrl = "https://sepolia.base.org";
