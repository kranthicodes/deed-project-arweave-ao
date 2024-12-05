import { useState } from "react";
import { ConnectButton } from "arweave-wallet-kit";
import {
  createDataItemSigner,
  spawn,
  message,
  result,
} from "@permaweb/aoconnect";

const TOKEN_PID = "b87Jd4usKGyMjovbNeX4P3dcvkC4mrtBZ5HxW_ENtn4";
const DENOMINATION = 12;

function App() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payload, setPayload] = useState({
    lawyerAddress: "",
    beneficiaryAddress: "",
    unlockTime: "",
    amount: "",
  });
  // const [count, setCount] = useState(0);

  const handleChange = (e) => {
    setPayload({ ...payload, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const { lawyerAddress, beneficiaryAddress, unlockTime, amount } = payload;

      const formattedAmount = (+amount * 10 ** DENOMINATION).toString();
      const unlockTimeFormatted = new Date(
        Date.now() + unlockTime * 60 * 1000
      ).getTime().toString();

      const processId = await spawn({
        module: "oKBlsMP3UWrAUURWUzGO4ZGEqlurAL5UkidMLrYo8EM",
        scheduler: "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA",
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [
          {
            name: "Authority",
            value: "fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY",
          },
          { name: "LawyerAddress", value: lawyerAddress },
          { name: "BeneficiaryAddress", value: beneficiaryAddress },
          { name: "UnlockTime", value: unlockTimeFormatted },
          { name: "Amount", value: formattedAmount },
          { name: "TokenPID", value: TOKEN_PID },
        ],
      });

      const contractSrcFetch = await fetch("/deed-contract.lua");
      const contractSrc = await contractSrcFetch.text();

      await message({
        process: TOKEN_PID,
        tags: [{ name: "Action", value: "Eval" }],
        signer: createDataItemSigner(window.arweaveWallet),
        data: contractSrc,
      });

      const msgID = await message({
        process: TOKEN_PID,
        tags: [
          { name: "Action", value: "Transfer" },
          { name: "Recipient", value: processId },
          { name: "Quantity", value: formattedAmount },
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      let response = await result({
        message: msgID,
        process: TOKEN_PID,
      });

      console.log(response);
    } catch (error) {
      console.log(error);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <nav className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">
          DeedSmart <span className="text-teal-600">Contract</span>
        </h1>
        <ConnectButton
          accent="rgb(13,148,136)"
          profileModal={false}
          showBalance={true}
        />
      </nav>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Create New Deed
        </h2>
        <form onSubmit={handleSubmit} id="deedForm" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lawyer Address
              </label>
              <input
                onChange={handleChange}
                value={payload.lawyerAddress}
                type="text"
                id="lawyerAddress"
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beneficiary Address
              </label>
              <input
                onChange={handleChange}
                value={payload.beneficiaryAddress}
                type="text"
                id="beneficiaryAddress"
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unlock Time (Minutes)
              </label>
              <input
                onChange={handleChange}
                value={payload.unlockTime}
                type="number"
                id="unlockTime"
                required
                min="1"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (TUSDA)
              </label>
              <input
                onChange={handleChange}
                value={payload.amount}
                type="number"
                id="amount"
                required
                step="0.001"
                min="0"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full md:w-auto px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            Create Deed
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Active Deeds
        </h2>
        <div
          id="deedsList"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        ></div>
      </div>
    </div>
  );
}

export default App;
