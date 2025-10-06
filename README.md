# 💍 RingBet: Trustless, Transparent, and Social Wagering on Base

<img width="2033" height="1263" alt="image" src="https://github.com/user-attachments/assets/10f60071-f664-4020-9b81-186cd93e828d" />


RingBet transforms casual betting into a secure, transparent, and community-driven experience using smart contracts and Farcaster integration. It solves the core trust and fee issues plaguing traditional online wagering platforms.

-----

## 💡 The Problem RingBet Solves

Traditional online betting and casual wagering apps suffer from significant flaws:

❌ **Lack of transparency** – Users can't verify how winners are chosen or how funds are handled.
❌ **High fees & intermediaries** – Centralized platforms take large cuts and cause payout delays.
❌ **Limited social experience** – Betting often feels isolated instead of community-driven.
❌ **Trust issues** – Players must rely on a central authority not to manipulate results.

-----

## ✨ Solution & Key Features

RingBet makes this process simpler, safer, and more social by addressing these points directly:

✅ **Provable Fairness** – Outcomes are **random and verifiable on-chain**, ensuring full trust in the result.
✅ **Trustless Payouts** – **Smart contracts** manage the pool automatically, meaning **no middlemen**. Funds are locked until a winner is selected, making payouts instant and verifiable.
✅ **Low-Cost Participation** – Built on **Base** for **near-zero gas fees** and fast finality, lowering the barrier to entry.
✅ **Social Discovery** – "Rings" (wagering pools) can be shared and joined inside **Farcaster Mini Apps**, making it easy to invite friends and foster community.
✅ **Demo Mode** – Includes a **demo mode with AI players** so users can practice and understand the mechanics before betting real money.

In short, RingBet turns casual betting into a **trustless, transparent, and social experience.**

-----

## 🛠 Technologies Used

RingBet was built using a robust stack for decentralized development:

  * **Solidity** (for smart contracts)
  * **Node.js**
  * **JavaScript**
  * **WalletConnect**
  * **Tailwind CSS**

-----

## 🚧 Technical Challenges & Learnings

Building RingBet involved tackling common hurdles in decentralized application development:

| Challenge Area | Problem Description | Solution Implemented |
| :--- | :--- | :--- |
| **Randomness on-chain** | True randomness is hard to achieve on blockchains; using block data is insecure. | Implemented a **simple local pseudo-random generator** for the prototype flow, with a design ready for an upgrade to **Chainlink VRF** for production-ready provable randomness. |
| **Gas Efficiency** | Handling multiple players’ ETH buy-ins without unnecessary storage writes. | Optimized data structures and the payout flow so funds are **pooled and released in a single transaction**, significantly minimizing gas usage. |
| **Farcaster Mini App** | Mini Apps require a specific startup sequence (`sdk.actions.ready()`) to prevent the app from getting stuck. | Ensured the app signals readiness only after the UI and **wallet connection are initialized**, fixing the loading issue. |
| **Base Sepolia Deployment** | Contract verification failed initially due to mismatched constructor arguments. | Double-checked the Hardhat config and successfully verified the contract on Base testnet using **BaseScan’s verification API** with the correct constructor inputs. |

-----

## 🚀 Getting Started

To run RingBet locally or deploy your own version, follow the standard Web3 development setup:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/DWE-CLOUD/ringbet
    cd ringbet
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install
    ```
3.  **Configure:** Set up your environment variables (`.env`) for network connection (Base Sepolia) and wallet keys.
4.  **Deploy Smart Contracts:**
    ```bash
    npx hardhat run scripts/deploy.js --network base_sepolia
    ```
5.  **Start Frontend:**
    ```bash
    npm start
    ```

-----

## 📄 License & Contact

This project is licensed under MIT

  * **Team:** xAGI
  * **Devfolio Project Link:** `https://devfolio.co/projects/ringbet-3777`
