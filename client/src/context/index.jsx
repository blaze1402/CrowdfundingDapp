import React, { useContext, createContext } from "react";

import {
  useAddress,
  useContract,
  useMetamask,
  useContractWrite,
} from "@thirdweb-dev/react";
import { ethers } from "ethers";

const StateContext = createContext();

const test = {
  compiler: { version: "0.8.9+commit.e5eed63a" },
  language: "Solidity",
  output: {
    abi: [
      {
        inputs: [
          { internalType: "address", name: "_owner", type: "address" },
          { internalType: "string", name: "_title", type: "string" },
          { internalType: "string", name: "_description", type: "string" },
          { internalType: "uint256", name: "_target", type: "uint256" },
          { internalType: "uint256", name: "_deadline", type: "uint256" },
          { internalType: "string", name: "_image", type: "string" },
        ],
        name: "createCampaign",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "_id", type: "uint256" }],
        name: "donateToCampaign",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [],
        name: "getCampaigns",
        outputs: [
          {
            components: [
              { internalType: "address", name: "owner", type: "address" },
              { internalType: "string", name: "title", type: "string" },
              { internalType: "string", name: "description", type: "string" },
              { internalType: "uint256", name: "target", type: "uint256" },
              { internalType: "uint256", name: "deadline", type: "uint256" },
              {
                internalType: "uint256",
                name: "amountCollected",
                type: "uint256",
              },
              { internalType: "string", name: "image", type: "string" },
              {
                internalType: "address[]",
                name: "donators",
                type: "address[]",
              },
              {
                internalType: "uint256[]",
                name: "donations",
                type: "uint256[]",
              },
            ],
            internalType: "struct Crowdfunding.Campaign[]",
            name: "",
            type: "tuple[]",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "_id", type: "uint256" }],
        name: "getDonators",
        outputs: [
          { internalType: "address[]", name: "", type: "address[]" },
          { internalType: "uint256[]", name: "", type: "uint256[]" },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        name: "listOfCampaigns",
        outputs: [
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "string", name: "title", type: "string" },
          { internalType: "string", name: "description", type: "string" },
          { internalType: "uint256", name: "target", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "uint256", name: "amountCollected", type: "uint256" },
          { internalType: "string", name: "image", type: "string" },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "numberOfCompaigns",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    devdoc: { kind: "dev", methods: {}, version: 1 },
    userdoc: { kind: "user", methods: {}, version: 1 },
  },
  settings: {
    compilationTarget: { "contracts/Crowdfunding.sol": "Crowdfunding" },
    evmVersion: "london",
    libraries: {},
    metadata: { bytecodeHash: "ipfs" },
    optimizer: { enabled: true, runs: 200 },
    remappings: [],
  },
  sources: {
    "contracts/Crowdfunding.sol": {
      keccak256:
        "0xbe5f5a1b8309a0110fbcaaafea3a85df40c8272b78404d09b30abd2a63a745ba",
      license: "UNLICENSED",
      urls: [
        "bzz-raw://6a764ee02990aa9bae30a9d31e47570badde4c2715416492644d5e827f369659",
        "dweb:/ipfs/Qmdn9QPPmdCGVTmxwYmdNgm3xF1YdiNFT5xYyTYTatn8Qn",
      ],
    },
  },
  version: 1,
};

export const StateContextProvider = ({ children }) => {
  const { contract } = useContract(
    "0x7e7478572d4Dc760A16fe0156870a24aaEC272C9" , 
    (test.output.abi)
  );
  const { mutateAsync: createCampaign } = useContractWrite(
    contract,
    "createCampaign"
  );

  const address = useAddress();
  const connect = useMetamask();

  const publishCampaign = async (form) => {
    try {
      const data = await createCampaign({
        args: [
          address, //owner
          form.title, //title
          form.description, //description
          form.target, // target money
          new Date(form.deadline).getTime(),
          form.image,
        ],
      });
      console.log("contract call success", data);
    } catch (error) {
      console.log("contract call failure", error);
    }
  };

  const getCampaigns = async () => {
    const campaigns = await contract.call("getCampaigns");

    const parsedCampaigns = campaigns.map((campaign, i) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.utils.formatEther(campaign.target.toString()),
      deadline: campaign.deadline.toNumber(),
      amountCollected: ethers.utils.formatEther(
        campaign.amountCollected.toString()
      ),
      image: campaign.image,
      pId: i,
    }));

    return parsedCampaigns;
  };

  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns();

    const filteredCampaigns = allCampaigns.filter(
      (campaign) => campaign.owner === address
    );

    return filteredCampaigns;
  };

  const donate = async (pId, amount) => {
    const data = await contract.call("donateToCampaign", [pId], {
      value: ethers.utils.parseEther(amount),
    });

    return data;
  };

  const getDonations = async (pId) => {
    const donations = await contract.call("getDonators", [pId]);
    const numberOfDonations = donations[0].length;

    const parseDonations = [];

    for (let i = 0; i < numberOfDonations; i++) {
      parseDonations.push({
        donator: donations[0][i],
        donation: ethers.utils.formatEther(donations[1][i].toString()),
      });
    }

    return parseDonations;
  };

  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        connect,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
