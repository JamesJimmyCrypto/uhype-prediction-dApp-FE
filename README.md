# Dehype Frontend

## Overview

Dehype is a frontend application built on the Solana blockchain, providing users with a decentralized and seamless experience. The app leverages **Next.js** for the framework, **Jotai** for state management, and integrates Solana wallet functionalities for blockchain interactions.

---

## Features

- **Solana Blockchain Integration**: Interact with the Solana network for transactions and token operations.
- **Wallet Support**: Integration with Solana wallets like Phantom and Sollet.
- **Efficient State Management**: Powered by **Jotai**, providing an atomic and simple state management solution.
- **Optimized Performance**: Built with Next.js for server-side rendering (SSR) and static site generation (SSG).

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Blockchain**: [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- **State Management**: [Jotai](https://jotai.org/)
- **UI Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Wallet Integration**: [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)

---

## Installation

### Prerequisites

- **Node.js** (v16.x or higher)
- **npm** (v7.x or higher) or **yarn**

### Steps

1. Clone the repository:

```bash
git clone https://github.com/your-username/dehype-solana-frontend.git
```

2. Navigate to the project directory:

```bash
cd dehype-solana-frontend
```

3. Install the dependencies:

```bash
npm install
# OR
yarn install
```

4. Configure the environment variables. Create a `.env.local` file at the root of the project and add the following:

```bash
NEXT_PUBLIC_SOLANA_NETWORK=devnet  # can be 'mainnet', 'devnet', or 'testnet'
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com  # Solana RPC URL
NEXT_PUBLIC_WALLET_PROVIDER=phantom  # preferred wallet provider
```

5. Start the development server:

```bash
npm run dev
# OR
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

---

## Project Structure

- **/pages**: Next.js pages for routing.
- **/components**: Reusable UI components.
- **/atoms**: Jotai atoms for state management.
- **/hooks**: Custom React hooks for wallet and blockchain interactions.
- **/styles**: Tailwind CSS styles and configurations.

---

## State Management with Jotai

Dehype uses **Jotai** to manage application-wide state, such as:

- **User Wallet State**: Track the connected wallet, balance, and account details.
- **Transaction State**: Handle real-time updates on transactions and token movements.
  
Example of how state is managed with Jotai:

```javascript
// atoms/walletAtom.js
import { atom } from 'jotai';

export const walletAtom = atom({
  address: '',
  connected: false,
  balance: 0,
});
```

To access the wallet state:

```javascript
import { useAtom } from 'jotai';
import { walletAtom } from '../atoms/walletAtom';

const WalletInfo = () => {
  const [wallet] = useAtom(walletAtom);

  return (
    <div>
      <p>Address: {wallet.address}</p>
      <p>Balance: {wallet.balance} SOL</p>
    </div>
  );
};
```

---

## Available Scripts

- `npm run dev` or `yarn dev`: Runs the development server.
- `npm run build` or `yarn build`: Builds the application for production.
- `npm run start` or `yarn start`: Starts the production server.
- `npm run lint` or `yarn lint`: Lints the codebase for code quality.

---

## Solana Wallet Integration

Dehype integrates with Solana wallets (e.g., Phantom) using the **Solana Wallet Adapter**. Here's how to connect a wallet:

```javascript
import { useWallet } from '@solana/wallet-adapter-react';

const ConnectWalletButton = () => {
  const { connect, connected, publicKey } = useWallet();

  return !connected ? (
    <button onClick={connect}>Connect Wallet</button>
  ) : (
    <p>Connected: {publicKey.toBase58()}</p>
  );
};
```

Ensure your wallet is installed and properly configured in your browser to connect.

---

## Deployment

### Vercel Deployment

To deploy on Vercel:

1. Install the Vercel CLI:

```bash
npm i -g vercel
```

2. Run the deployment command:

```bash
vercel
```

3. Follow the prompts to set up your project and deploy.

---

## Contribution

Contributions are welcome! To contribute to Dehype, please follow these steps:

1. **Fork the repository**.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m 'Add your feature'
   ```
4. Push your changes to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request to the main repository with a clear description of your changes.

---

## License

This project is licensed under the MIT License. For more details, see the [LICENSE](LICENSE) file.

---

## Contact

For questions or support, reach out to the Dehype team at **support@dehype.io**. You can also follow us on our social media channels:

- Twitter: [@dehype](https://twitter.com/dehype)
- Discord: [Dehype Discord](https://discord.gg/dehype)

---

## Acknowledgments

- Thanks to the Solana community for their support and resources.
- Special thanks to the developers of Next.js and Jotai for their incredible frameworks.

---

## Roadmap

- [ ] Integrate additional blockchain networks.
- [ ] Expand wallet support to more providers.
- [ ] Improve user experience with advanced analytics.
- [ ] Implement more features based on community feedback.

---

## Changelog

- **v1.0.0** - Initial release with basic wallet connection and state management.
```

This `README.md` provides comprehensive information about the project, including features, installation instructions, project structure, state management, and more. You can modify any sections to better suit your project's needs or add more details as necessary! Let me know if you need any further adjustments.