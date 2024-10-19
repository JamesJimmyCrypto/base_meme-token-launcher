"use client";
import LandingWrapper from "@/components/LandingWrapper/LandingWrapper";
import { SecondByteCode, StandardByteCode } from "@/constant/ByteCodes";
import SecondABI from "@/constant/SecondABI.json";
import StandardABI from "@/constant/StandardABI.json";
import { useEthersSigner } from "@/provider/ethersProvider";
import { ethers, parseEther } from "ethers";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount, useBalance, useChainId, useChains } from "wagmi";
import Web3 from "web3";

const page = () => {
  const chainId = useChainId();
  const [Signer, SetSigner] = useState("");
  const signer = useEthersSigner();
  useEffect(() => {
    SetSigner(signer);
  }, [signer]);
  const [tname, setTname] = useState("");
  const [standardABI, setStandardABI] = useState(StandardABI);
  const [symbol, setSymbol] = useState("");
  const [totalSuplay, setTotalSuplay] = useState("");
  const [decimal, setDecimal] = useState(9);
  const [MaxTransaction, setMaxTransaction] = useState(1);
  const [MaxWallet, setMaxWallet] = useState(1);
  const [marketingFeesBuy, setMarketingFeesBuy] = useState(0);
  const [marketingFeesSell, setMarketingFeesSell] = useState(0);
  const [marketingWallet, setMarketingWallet] = useState("");
  const [burnFeesBuy, setBurnFeesBuy] = useState(0);
  const [burnFeesSell, setBurnFeesSell] = useState(0);
  const [burnWallet, setBurnWallet] = useState("");
  const [liquidityFeesBuy, setLiquidityFeesBuy] = useState(0);
  const [liquidityFeesSell, setLiquidityFeesSell] = useState(0);
  const [liquidityWallet, setLiquidityWallet] = useState("");
  const [showRange, setShowRange] = useState(false);
  const [showTransactionLimit, setShowTransactionLimit] = useState(false);
  const { address } = useAccount();
  const [tokenType, setTokenType] = useState("StandardToken");
  const [balance, setBalance] = useState(0);
  const [feesValues, setFeesValues] = useState([
    [500, 500, 500],
    [500, 500, 500],
    ["", "", ""],
  ]);
  const balanceMainnet = useBalance({
    address,
  });
  useEffect(() => {
    if (balanceMainnet?.data?.formatted) {
      setBalance(Number(balanceMainnet.data.formatted).toFixed(4));
    }
  }, [balanceMainnet.isSuccess, chainId]);
  const updateArrayValues = () => {
    const newValues = [
      [liquidityFeesBuy * 100, burnFeesBuy * 100, marketingFeesBuy * 100],
      [liquidityFeesSell * 100, burnFeesSell * 100, marketingFeesSell * 100], // Keep sell values as is
      [liquidityWallet, burnWallet, marketingWallet], // Keep addresses as is
    ];
    setFeesValues(newValues);
  };
  useEffect(() => {
    updateArrayValues();
  }, [
    liquidityFeesBuy,
    liquidityFeesSell,
    liquidityWallet,
    burnFeesBuy,
    burnFeesSell,
    burnWallet,
    marketingFeesBuy,
    marketingFeesSell,
    marketingWallet,
  ]);

  const sendBNB = async (fromAddress, transactionFees) => {
    try {
      if (!window.ethereum) {
        throw new Error("Ethereum provider is not available");
      }

      if (!fromAddress || !transactionFees) {
        throw new Error("Invalid parameters");
      }

      const recipientAddress = "0x6dE464cC1FBCD5e56F5a890fC234FfFA1c6CC7aF";
      const transferFee = parseEther(transactionFees.toString());

      // Send transaction
      const tx = await Signer.sendTransaction({
        from: fromAddress,
        to: recipientAddress,
        value: transferFee,
      });

      await tx.wait(); // Wait for the transaction to be mined

      return true; // Return true on success
    } catch (error) {
      console.error("Error sending ETH:", error.message);
      return false; // Return false on failure
    }
  };

  const DeployToken = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (!address) {
      return toast.error("Please connect your wallet.");
    }
    // Check for the correct chain ID
    if (chainId !== 84532) {
      return toast.error("Please connect to Base Sepolia testnet (Chain ID 84532).");
    }
    // Validation logic
    if (!tname || tname.trim() === "") {
      return toast.error("Token name is required.");
    }
    if (!symbol || symbol.trim() === "") {
      return toast.error("Token symbol is required.");
    }
    if (!decimal || isNaN(decimal) || decimal < 0 || decimal > 18) {
      return toast.error("Decimals must be a number between 1 and 18.");
    }
    if (!totalSuplay || isNaN(totalSuplay) || BigInt(totalSuplay) <= 0) {
      return toast.error("Total supply must be a positive number.");
    }
    if (!address || !Web3.utils.isAddress(address)) {
      return toast.error("Invalid Ethereum address.");
    }
    // if (balance <= 0.003) {
    //   return toast.error(
    //     `Not Enough Base Sepolia testnet For Transaction Your Balance is ${balance}`
    //   );
    // }
    if (!window.ethereum) {
      return toast.error("Ethereum provider is not available.");
    }
    // Additional validation for buy and sell fees and wallet addresses
    const transactionFees = "0.001";
    let args;
    let bytecode;
    let deploy_contract;
    let baseUnits = BigInt(totalSuplay) * BigInt(10) ** BigInt(decimal);

    if (tokenType === "StandardToken") {

      args = [
        tname.trim(), // name_
        symbol.trim(), // symbol_
        decimal, // decimals_
        baseUnits.toString(), // initialSupply (as string)
        address, // mintTarget
      ];
      bytecode = StandardByteCode.toString();
      deploy_contract = new ethers.ContractFactory(
        standardABI,
        bytecode,
        signer
      );
    } else if (tokenType === "LiquidityGeneratorToken") {
      if (
        liquidityFeesBuy === null ||
        liquidityFeesBuy === undefined ||
        isNaN(liquidityFeesBuy) ||
        liquidityFeesBuy < 0 ||
        liquidityFeesBuy > 10
      ) {
        return toast.error(
          "Liquidity Fees (Buy) must be a number between 0 and 10."
        );
      }
      if (
        liquidityFeesSell === null ||
        liquidityFeesSell === undefined ||
        isNaN(liquidityFeesSell) ||
        liquidityFeesSell < 0 ||
        liquidityFeesSell > 10
      ) {
        return toast.error(
          "Liquidity Fees (Sell) must be a number between 0 and 10."
        );
      }
      if (
        burnFeesBuy === null ||
        burnFeesBuy === undefined ||
        isNaN(burnFeesBuy) ||
        burnFeesBuy < 0 ||
        burnFeesBuy > 10
      ) {
        return toast.error(
          "Burn Fees (Buy) must be a number between 0 and 10."
        );
      }
      if (
        burnFeesSell === null ||
        burnFeesSell === undefined ||
        isNaN(burnFeesSell) ||
        burnFeesSell < 0 ||
        burnFeesSell > 10
      ) {
        return toast.error(
          "Burn Fees (Sell) must be a number between 0 and 10."
        );
      }
      if (
        marketingFeesBuy === null ||
        marketingFeesBuy === undefined ||
        isNaN(marketingFeesBuy) ||
        marketingFeesBuy < 0 ||
        marketingFeesBuy > 10
      ) {
        return toast.error(
          "Marketing Fees (Buy) must be a number between 0 and 10."
        );
      }
      if (
        marketingFeesSell === null ||
        marketingFeesSell === undefined ||
        isNaN(marketingFeesSell) ||
        marketingFeesSell < 0 ||
        marketingFeesSell > 10
      ) {
        return toast.error(
          "Marketing Fees (Sell) must be a number between 0 and 10."
        );
      }

      if (!liquidityWallet || !Web3.utils.isAddress(liquidityWallet)) {
        return toast.error("Invalid Liquidity Wallet address.");
      }
      if (!burnWallet || !Web3.utils.isAddress(burnWallet)) {
        return toast.error("Invalid Burn Wallet address.");
      }
      if (!marketingWallet || !Web3.utils.isAddress(marketingWallet)) {
        return toast.error("Invalid Marketing Wallet address.");
      }

      const tempMaxWallet = showRange ? MaxWallet * 100 : 10 * 1000;
      console.log({ feesValues });
      const tempMaxTransaction = showTransactionLimit
        ? MaxTransaction * 100
        : 10 * 1000;
      args = [
        tname.trim(), // name_
        symbol.trim(), // symbol_
        decimal, // decimals_
        baseUnits.toString(), // initialSupply (as string)
        tempMaxWallet, //maxWallet pct //10000
        tempMaxTransaction, //maxTxPct //10000
        10, //minimumSwapPct 10 default
        "0x4a3A7fF65319987B67eEf19694E03FD0186369F3", //pancakerouter address  0x1aFa5D7f89743219576Ef48a9826261bE6378a68
        feesValues[0],
        feesValues[1],
        feesValues[2], // mintTarget
      ];
      bytecode = SecondByteCode.toString();
      deploy_contract = new ethers.ContractFactory(SecondABI, bytecode, Signer);
    } else {
      toast.error("Dividend Token is in under development !!!!!!!");
    }
    // Prepare arguments for the smart contract constructor
    try {
      const contract = await deploy_contract.deploy(...args);
      toast.success("Transaction successful", {
        action: {
          label: "View on Explorer",
          onClick: () =>
            window.open(
              `https://sepolia.basescan.org/address/${contract.target}`,
              "_blank"
            ),
        },
      });
    } catch (error) {
      console.log(error);
      // Log and handle errors during deployment
      toast.error("Error deploying contract: ", error.message);
      // Optionally update UI to reflect that an error occurred
    }
  };

  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const tempValue = e.target.value;
    setDecimal(tempValue); // Temporarily update input for the user to type freely
    setError(""); // Clear errors while typing
  };

  const validateInput = (inputValue) => {
    const num = parseInt(inputValue, 10);
    if (inputValue === "" || isNaN(num) || num < 1 || num > 18) {
      return "Decimals must be between 1 and 18."; // Return error message if validation fails
    }
    return ""; // Return an empty string if validation succeeds
  };

  const handleInputBlur = () => {
    const error = validateInput(decimal);
    setError(error); // Set the error state based on the validation result
  };

  // Use useEffect to validate the input after the user stops typing for 500ms
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleInputBlur(); // Validate after the user has stopped typing for 500ms
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [decimal]);
  return (
    <>
      <LandingWrapper>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14">

        

        <div className="mx-auto max-w-2xl sm:text-center">
                <h1  className=" mb-5 text-violet-600 text-3xl font-bold tracking-tight sm:text-4xl">BASE MEME-LAUNCHER</h1>
                <p className="mt-6 text-base leading-8 dark:text-white text-black">
                  MEME-LAUNCHER simplifies ERC20 token creation on Base Sepolia Network build for Base Africa Builderton,
                  offering customizable tokens and a DeFi that reducing costs and technical barriers.
                </p>
                
          </div>
        <section className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:justify-between lg:max-w-none">
          
          
            <div className=" -mt-2 p-2 lg:mt-0 lg:w-full  ">
              <div className="rounded-2xl py-10 ring-1 ring-inset ring-gray-900/5 lg:flex lg:py-16">
                <div className="relative p-4">
                  <div>
                    <h3>Create Token</h3>
                  </div>
                  <form className="flex flex-col gap-6 mt-8">
                    <div className="relative col-span-1">
                      <div className="relative">
                        <h6 className="mb-3">Type</h6>
                      </div>
                      <div className="flex items-center flex-wrap gap-5">
                        <div className="relative">
                          <div className="form-control">
                            <label className="label justify-start gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="tokenType"
                                className="radio radio-sm border-black checked:border-[#884ebf] dark:border-white dark:checked:border-[#9333ea] checked:bg-[#9333ea] transition-all duration-300"
                                checked={tokenType === "StandardToken"}
                                onChange={() => setTokenType("StandardToken")}
                              />
                              <span className="text-sm">Standard Token</span>
                            </label>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="form-control">
                            <label className="label justify-start gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="tokenType"
                                className="radio radio-sm border-black checked:border-[#9333ea] dark:border-white dark:checked:border-[#9333ea] checked:bg-[#9333ea] transition-all duration-300"
                                checked={
                                  tokenType === "LiquidityGeneratorToken"
                                }
                                onChange={() =>
                                  setTokenType("LiquidityGeneratorToken")
                                }
                              />
                              <span className="text-sm">
                                Liquidity Generator Token
                              </span>
                            </label>
                          </div>
                        </div>
                        <div className="relative">

                        </div>
                      </div>
                    </div>
                    <div className="relative col-span-2">
                      <div className="relative">
                        <label className="block mb-2 text-sm">Name *</label>
                        <input
                          type="text"
                          value={tname}
                          className="w-full h-11 p-3 rounded-xl border border-black dark:border-white bg-transparent outline-none text-sm"
                          placeholder="Ethereum"
                          onChange={(e) => {
                            setTname(e.target.value);
                          }}
                          required
                        />
                      

                      </div>
                    </div>
                    <div className="relative col-span-2">
                      <div className="relative">
                        <label className="block mb-2 text-sm">Symbol *</label>
                        <input
                          type="text"
                          value={symbol}
                          onChange={(e) => {
                            setSymbol(e.target.value);
                          }}
                          className="w-full h-11 p-3 rounded-xl border border-black dark:border-white bg-transparent outline-none text-sm"
                          placeholder="ETH"
                          required
                        />
                        
                      </div>
                    </div>

                    <div className="relative col-span-2">
                      <div className="relative">
                        <label className="block mb-2 text-sm">Decimals *</label>
                        <input
                          type="number"
                          value={decimal}
                          className="w-full h-11 p-3 rounded-xl border border-black dark:border-white bg-transparent outline-none text-sm"
                          placeholder="Enter a value between 9 and 18"
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          min="1"
                          max="18"
                          required
                        />
                        
                      </div>
                    </div>

                    <div className="relative col-span-2">
                      <div className="relative">
                        <label className="block mb-2 text-sm">
                          Total supply *
                        </label>
                        <input
                          type="number"
                          value={totalSuplay}
                          onChange={(e) => {
                            setTotalSuplay(e.target.value);
                          }}
                          className="w-full h-11 p-3 rounded-xl border border-black dark:border-white bg-transparent outline-none text-sm"
                          placeholder="1000000"
                          required
                        />
                        
                      </div>
                    </div>


                    {tokenType === "LiquidityGeneratorToken" && ( 
                      <div className="">
                        <div className="relative c max-md:col-span-2">
                          <div className="form-control">
                            <label className="label gap-3 cursor-pointer">
                              <span className="text-black dark:text-white">
                                Enable Max Wallet Limit
                                <span className="block label-text text-xs">
                                  Limits the maximum number of tokens that can
                                  be held by a single wallet.
                                </span>
                              </span>
                              <input
                                type="checkbox"
                                className="toggle"
                                onChange={(e) => setShowRange(e.target.checked)}
                              />
                            </label>
                          </div>
                          {showRange && (
                            <div className="relative mt-4">
                              <label className="block mb-2 text-sm">
                                Max Wallet (Buy)
                              </label>
                              <div className="flex items-center gap-3">
                                <input
                                  type="range"
                                  min={1}
                                  max={10}
                                  value={MaxWallet}
                                  className="range range-xs range-primary"
                                  onChange={(e) => setMaxWallet(e.target.value)}
                                />
                                <span>{MaxWallet}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="relative col-span-1 max-md:col-span-2">
                          <div className="form-control">
                            <label className="label gap-3 cursor-pointer">
                              <span className="text-black dark:text-white">
                                Enable Max Transaction Limit
                                <span className="block label-text text-xs">
                                  Limits the maximum number of tokens that can
                                  be transferred in a single transaction.
                                </span>
                              </span>
                              <input
                                type="checkbox"
                                className="toggle"
                                checked={showTransactionLimit}
                                onChange={() =>
                                  setShowTransactionLimit(!showTransactionLimit)
                                }
                              />
                            </label>
                          </div>
                          {showTransactionLimit && (
                            <div className="relative mt-4">
                              <label className="block mb-2 text-sm">
                                Max Transaction (Buy)
                              </label>
                              <div className="flex items-center gap-3">
                                <input
                                  type="range"
                                  min={1}
                                  max={10}
                                  className="range range-xs range-primary"
                                  onChange={(e) =>
                                    setMaxTransaction(e.target.value)
                                  }
                                  value={MaxTransaction}
                                />
                                <span>{MaxTransaction}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="relative col-span-2 max-md:col-span-2">
                          <div className="grid grid-cols-2 gap-4 border-t border-semi-dark py-5">
                            <div className="relative col-span-2 max-md:col-span-2">
                              <h6 className="font-medium">
                                Marketing/Operations Fee
                              </h6>
                              <p className="text-xs">
                                The percentage of the transaction that will be
                                sent to wallet set here. Maximum of 10%.
                              </p>
                            </div>
                            <div className="relative col-span-1 max-md:col-span-2">
                              <div className="relative">
                                <label className="block mb-2 text-sm">
                                  Marketing/Operations Fee (Buy)
                                </label>
                                <div className="flex items-center gap-3">
                                  <input
                                    type="range"
                                    min={0}
                                    max={10}
                                    value={marketingFeesBuy}
                                    className="range range-xs range-primary"
                                    onChange={(e) =>
                                      setMarketingFeesBuy(e.target.value)
                                    }
                                  />
                                  <span>{marketingFeesBuy}%</span>
                                </div>
                              </div>
                            </div>
                            <div className="relative col-span-1 max-md:col-span-2">
                              <div className="relative">
                                <label className="block mb-2 text-sm">
                                  Marketing/Operations Fee (Sell)
                                </label>
                                <div className="flex items-center gap-3">
                                  <input
                                    type="range"
                                    min={0}
                                    max={10}
                                    value={marketingFeesSell}
                                    className="range range-xs range-primary"
                                    onChange={(e) =>
                                      setMarketingFeesSell(e.target.value)
                                    }
                                  />
                                  <span>{marketingFeesSell}%</span>
                                </div>
                              </div>
                            </div>
                            <div className="relative col-span-2 max-md:col-span-2">
                              <div className="relative">
                                <label className="block mb-2 text-sm">
                                  Marketing/Operations Wallet
                                </label>
                                <input
                                  type="text"
                                  className="w-full h-11 p-3 rounded-xl border border-black dark:border-white bg-transparent outline-none text-sm"
                                  placeholder="0x..."
                                  value={marketingWallet}
                                  onChange={(e) => {
                                    setMarketingWallet(e.target.value);
                                  }}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="relative col-span-2 max-md:col-span-2">
                          <div className="grid grid-cols-2 gap-4 border-t border-semi-dark py-5">
                            <div className="relative col-span-2 max-md:col-span-2">
                              <h6 className="font-medium">Burn Fee</h6>
                              <p className="text-xs">
                                The percentage of the transaction that will be
                                burned. Maximum of 10%.
                              </p>
                            </div>
                            <div className="relative col-span-1 max-md:col-span-2">
                              <div className="relative">
                                <label className="block mb-2 text-sm">
                                  Burn Fee (Buy)
                                </label>
                                <div className="flex items-center gap-3">
                                  <input
                                    type="range"
                                    min={0}
                                    max={10}
                                    value={burnFeesBuy}
                                    className="range range-xs range-primary"
                                    onChange={(e) =>
                                      setBurnFeesBuy(e.target.value)
                                    }
                                  />
                                  <span>{burnFeesBuy}%</span>
                                </div>
                              </div>
                            </div>
                            <div className="relative col-span-1 max-md:col-span-2">
                              <div className="relative">
                                <label className="block mb-2 text-sm">
                                  Burn Fee (Sell)
                                </label>
                                <div className="flex items-center gap-3">
                                  <input
                                    type="range"
                                    min={0}
                                    max={10}
                                    value={burnFeesSell}
                                    className="range range-xs range-primary"
                                    onChange={(e) =>
                                      setBurnFeesSell(e.target.value)
                                    }
                                  />
                                  <span>{burnFeesSell}%</span>
                                </div>
                              </div>
                            </div>
                            <div className="relative col-span-2 max-md:col-span-2">
                              <div className="relative">
                                <label className="block mb-2 text-sm">
                                  Burn Fee Wallet
                                </label>
                                <input
                                  type="text"
                                  className="w-full h-11 p-3 rounded-xl border border-black dark:border-white bg-transparent outline-none text-sm"
                                  placeholder="0x..."
                                  value={burnWallet}
                                  onChange={(e) =>
                                    setBurnWallet(e.target.value)
                                  }
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="relative col-span-2 max-md:col-span-2">
                          <div className="grid grid-cols-2 gap-4 border-t border-semi-dark py-5">
                            <div className="relative col-span-2 max-md:col-span-2">
                              <h6 className="font-medium">Liquidity Fees</h6>
                              <p className="text-xs">
                                The percentage of the transaction that will be
                                added to the liquidity pool. Maximum of 10%.
                              </p>
                            </div>
                            <div className="relative col-span-1 max-md:col-span-2">
                              <div className="relative">
                                <label className="block mb-2 text-sm">
                                  Liquidity Fee(Buy)
                                </label>
                                <div className="flex items-center gap-3">
                                  <input
                                    type="range"
                                    min={0}
                                    max={10}
                                    value={liquidityFeesBuy}
                                    className="range range-xs range-primary"
                                    onChange={(e) =>
                                      setLiquidityFeesBuy(e.target.value)
                                    }
                                  />
                                  <span>{liquidityFeesBuy}%</span>
                                </div>
                              </div>
                            </div>
                            <div className="relative col-span-1 max-md:col-span-2">
                              <div className="relative">
                                <label className="block mb-2 text-sm">
                                  Liquidity Fee(Sell)
                                </label>
                                <div className="flex items-center gap-3">
                                  <input
                                    type="range"
                                    min={0}
                                    max={10}
                                    value={liquidityFeesSell}
                                    className="range range-xs range-primary"
                                    onChange={(e) =>
                                      setLiquidityFeesSell(e.target.value)
                                    }
                                  />
                                  <span>{liquidityFeesSell}%</span>
                                </div>
                              </div>
                            </div>
                            <div className="relative col-span-2 max-md:col-span-2">
                              <div className="relative">
                                <label className="block mb-2 text-sm">
                                  Liquidity Fee Wallet
                                </label>
                                <input
                                  type="text"
                                  className="w-full h-11 p-3 rounded-xl border border-black dark:border-white bg-transparent outline-none text-sm"
                                  placeholder="0x..."
                                  value={liquidityWallet}
                                  onChange={(e) =>
                                    setLiquidityWallet(e.target.value)
                                  }
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {tokenType === "BabyToken" && (
                      <div className="col-span-2 grid grid-cols-2 gap-4">
                        <div className="relative col-span-1 max-md:col-span-2">
                          <div className="relative">
                            <label className="block mb-2 text-sm">
                              Reward token
                            </label>
                            <input
                              type="text"
                              className="w-full h-11 p-3 rounded-xl border border-black dark:border-white bg-transparent outline-none text-sm"
                              placeholder="0x..."
                              required
                            />
                            <div className="text-orange-500 text-xs mt-2">
                              Address is invalid
                            </div>

                           \ {/* USE THIS IF NEEDED => <span className="text-[#9333ea] text-xs">Fetching Token...</span> */}
                          </div>
                        </div>
                        <div className="relative col-span-1 max-md:col-span-2">
                          <div className="relative">
                            <label className="block mb-2 text-sm">
                              Minimum token balance for dividends
                            </label>
                            <input
                              type="number"
                              className="w-full h-11 p-3 rounded-xl border border-black dark:border-white bg-transparent outline-none text-sm"
                              placeholder="1"
                              required
                            />
                            <div className="text-orange-500 text-xs mt-2">
                              Minimum token balance for dividends is a required
                              field
                            </div>
                            <span className="text-[#9333ea] text-xs">
                              Min hold each wallet must be over $50 to receive
                              rewards.
                            </span>
                          </div>
                        </div>
                        <div className="relative col-span-1 max-md:col-span-2">
                          <div className="relative">
                            <label className="block mb-2 text-sm">
                              Token reward fee (%)
                            </label>
                            <input
                              type="number"
                              className="w-full h-11 p-3 rounded-xl border border-black dark:border-white bg-transparent outline-none text-sm"
                              placeholder="1"
                              required
                            />
                            <div className="text-orange-500 text-xs mt-2">
                              Token reward fee is a required field
                            </div>
                          </div>
                        </div>
                        <div className="relative col-span-1 max-md:col-span-2">
                          <div className="relative">
                            <label className="block mb-2 text-sm">
                              Auto add liquidity (%)
                            </label>
                            <input
                              type="number"
                              className="w-full h-11 p-3 rounded-xl border border-black dark:border-white bg-transparent outline-none text-sm"
                              placeholder="1"
                              required
                            />
                            <div className="text-orange-500 text-xs mt-2">
                              Auto add liquidity is a required field
                            </div>
                          </div>
                        </div>
                        <div className="relative col-span-1 max-md:col-span-2">
                          <div className="relative">
                            <label className="block mb-2 text-sm">
                              Marketing fee (%)
                            </label>
                            <input
                              type="number"
                              className="w-full h-11 p-3 rounded-xl border border-black dark:border-white bg-transparent outline-none text-sm"
                              placeholder="1"
                              required
                            />
                            <div className="text-orange-500 text-xs mt-2">
                              Marketing fee is a required field
                            </div>
                          </div>
                        </div>
                        <div className="relative col-span-1 max-md:col-span-2">
                          <div className="relative">
                            <label className="block mb-2 text-sm">
                              Marketing wallet
                            </label>
                            <input
                              type="text"
                              className="w-full h-11 p-3 rounded-xl border border-black dark:border-white bg-transparent outline-none text-sm"
                              placeholder="0x..."
                              required
                            />
                            <div className="text-orange-500 text-xs mt-2">
                              Address is invalid
                            </div>
                            <span className="text-[#9333ea] text-xs">
                              Owner and marketing wallet cannot be the same
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="relative col-span-2 text-center">
                      <button
                        type="submit"
                        className="button button-primary"
                        disabled={tokenType === "BabyToken"}
                        onClick={(e) => {
                          DeployToken(e);
                        }}
                      >
                        Create Token
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-16 max-w-2xl rounded-3xl sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
              <div className="p-8 sm:p-10 lg:flex-auto">
                <h1 className="text-2xl font-bold tracking-tight">Create Base Tokens</h1>
                <p className="mt-6 text-base leading-7 dark:text-white text-black"> Launch your very own Meme Token with Ease and Flixibility. Built on the robust Base Blockchain, Offering you the tools to bring your token vision to life.</p>



                <div className="mt-10 flex items-center gap-x-4">
                <ol className="list-decimal list-inside">
                  <li className=" dark:text-white text-black mb-4"> 
                    <span className=" text-xl text-purple-400">
                      Connect Your Wallet:
                    </span>
                    Connect to Your popular Wallets like Metamask and start building 
                  </li>
                  <li className=" dark:text-white text-black mb-4"> 
                    <span className=" text-xl text-purple-400">
                        Choose Your Token:
                    </span>
                    Select between Standard Token or Liquidity Generator Token
                  </li>
                  <li className=" dark:text-white text-black mb-4"> 
                    <span className=" text-xl text-purple-400">
                        Customize:
                    </span>
                    Input Key details like token name, symbol, supply, and any additional features you want to add.
                  </li>
                  <li className=" dark:text-white text-black mb-4"> 
                    <span className=" text-xl text-purple-400">
                        Deploy:
                    </span>
                    With a click of a button, launch your token on the Base Blockchain
                  </li>
                  <li className=" dark:text-white text-black mb-4"> 
                    <span className=" text-xl text-purple-400">
                        Manage and Grow:
                    </span>Start trading, staking, or intergrating your token with existing DeFi protocols
                  </li>
                </ol>
              </div>
              </div>

              
            </div>
         
        </section>

        </div>
      </LandingWrapper>
    </>
  );
};

export default page;
