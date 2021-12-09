import Head from 'next/head';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from '../abi/YourContract.json';
import Confetti from 'react-confetti';

export default function Home() {
  const size = useWindowSize();

  const [metamask, setMetamask] = useState(false);
  const [account, setAccount] = useState('');
  const [network, setNetwork] = useState();
  const [balance, setBalance] = useState(0);
  const [bakerBalance, setBakerBalance] = useState(0);
  const [mintProgress, setMintProgress] = useState('Not Minting');

  const contractAddress = '0x23c9bbd98d4f4e0f79f4a7f8a28c06674771b9d4';

  useEffect(() => {
    if (network === 4) {
      const network = 'rinkeby'; // use rinkeby testnet
      const provider = ethers.getDefaultProvider(network);
      provider.getBalance(account).then((balance) => {
        // convert a currency unit from wei to ether
        const balanceInEth = ethers.utils.formatEther(balance);
        console.log(`balance: ${balanceInEth} ETH`);
        setBalance(balanceInEth);
      });
    }
  }, [metamask, account, network]);

  useEffect(async () => {
    if (network === 4) {
      try {
        const { ethereum } = window;

        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();

          /*
           * You're using contractABI here
           */
          const bakerContract = new ethers.Contract(contractAddress, abi.abi, signer);

          let count = await bakerContract.balanceOf(account);
          console.log('Baker tokens are:', count / Math.pow(10, 18));
          setBakerBalance(count / Math.pow(10, 18));
        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      setBakerBalance(0);
    }
  }, [metamask, account, network]);

  useEffect(() => {
    if (window !== undefined) {
      if (window.ethereum) {
        setMetamask(true);
      }
    }
  }, []);

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Connected', accounts[0]);
      setAccount(accounts[0]);
      // Store network ID
      const provider = new ethers.providers.Web3Provider(window.web3.currentProvider);
      const { chainId } = await provider.getNetwork();
      setNetwork(chainId);
    } catch (error) {
      console.log(error);
    }
  };

  const connectRinkeby = async () => {
    // Check if MetaMask is installed
    // MetaMask injects the global API into window.ethereum
    if (window.ethereum) {
      try {
        // check if the chain to connect to is installed
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x4' }], // chainId must be in hexadecimal numbers
        });
      } catch (error) {
        // This error code indicates that the chain has not been added to MetaMask
        // if it is not, then install it into the user MetaMask
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x4',
                  rpcUrl: 'https://rinkeby-light.eth.linkpool.io/',
                },
              ],
            });
          } catch (addError) {
            console.error(addError);
          }
        }
        console.error(error);
      }
      const provider = new ethers.providers.Web3Provider(window.web3.currentProvider);
      const { chainId } = await provider.getNetwork();
      setNetwork(chainId);
    } else {
      // if no window.ethereum then MetaMask is not installed
      alert(
        'MetaMask is not installed. Please consider installing it: https://metamask.io/download.html'
      );
    }
  };

  const addTokenToWallet = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert('Get MetaMask!');
      return;
    }
    const tokenAddress = contractAddress;
    const tokenSymbol = 'BSC';
    const tokenDecimals = 18;
    const tokenImage =
      'https://previews.123rf.com/images/mr_vector/mr_vector1603/mr_vector160302537/52950676-detective-sherlock-holmes-vector-profile-icon.jpg';

    try {
      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      const wasAdded = await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: tokenAddress, // The address that the token is at.
            symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
            decimals: tokenDecimals, // The number of decimals in the token
            image: tokenImage, // A string url of the token logo
          },
        },
      });

      if (wasAdded) {
        console.log('Thanks for your interest!');
      } else {
        console.log('Your loss!');
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {size.width + size.height > 1 && mintProgress === 'Minted' && (
        <Confetti width={size.width} height={size.height} />
      )}
      <Head>
        <title>Baker Street Coins</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="w-full min-h-screen h-full bg-gray-900 flex py-8 space-y-3 flex-col items-center">
        <div className="text-white text-4xl font-bold">Claim your 🔍 Baker Street Coins!</div>
        <div className="text-white text-lg italic">
          This is the community coin supporting the Baker Street Detective's Ongoing Investigations!
        </div>
        {/* Step 1 */}
        <div className="flex flex-row space-x-2">
          <div className="border-white border-2 p-2 max-w-xl text-white">
            Step 1. Install MetaMask using this{' '}
            <a
              className="underline"
              href="https://blog.wetrust.io/how-to-install-and-use-metamask-7210720ca047"
              target="_blank"
            >
              guide
            </a>
          </div>

          {metamask ? (
            <div className="pointer-events-none border-2 p-2 max-w-xl text-green-200 border-green-200">
              Success!
            </div>
          ) : (
            <div className="border-2 p-2 max-w-xl text-red-200 border-red-200 flex flex-row mr-2">
              <div className="pr-2">Metamask not active</div>
              <button
                type="button"
                className="bg-red-100 hover:bg-red-200 text-red-900 rounded-sm cursor-pointer px-2"
                onClick={() => {
                  if (window.ethereum) {
                    setMetamask(true);
                  }
                }}
              >
                Check again
              </button>
            </div>
          )}
        </div>
        {/* Step Two */}
        <div className="flex flex-row space-x-2">
          <div className="border-white border-2 p-2 max-w-xl text-white">
            Step 2. Connect your wallet
          </div>

          {account !== '' ? (
            <div className="pointer-events-none border-2 p-2 max-w-xl text-green-200 border-green-200">
              {`Success! Wallet: ${account} `}
            </div>
          ) : (
            <div className="border-2 p-2 max-w-xl text-red-200 border-red-200 flex flex-row mr-2">
              <button
                type="button"
                className="bg-red-100 hover:bg-red-200 text-red-900 rounded-sm cursor-pointer px-2"
                onClick={connectWallet}
              >
                Connect your wallet
              </button>
            </div>
          )}
        </div>
        {/* Step Three */}
        <div className="flex flex-row space-x-2">
          <div className="border-white border-2 p-2 max-w-xl text-white">
            Step 3. Connect to Rinkeby Test Network
          </div>

          {network === 4 ? (
            <div className="pointer-events-none border-2 p-2 max-w-xl text-green-200 border-green-200">
              {`Success!`}
            </div>
          ) : (
            <div className="border-2 p-2 max-w-xl text-red-200 border-red-200 flex flex-row mr-2">
              <button
                type="button"
                className="bg-red-100 hover:bg-red-200 text-red-900 rounded-sm cursor-pointer px-2"
                onClick={connectRinkeby}
              >
                Switch to Rinkeby Network
              </button>
            </div>
          )}
        </div>
        {/* Step Four */}
        <div className="flex flex-row space-x-2">
          <div className="border-white border-2 p-2 max-w-xl text-white">
            Step 4. Get some Ether for gas. Use this{' '}
            <a className="underline" href="https://faucets.chain.link/rinkeby" target="_blank">
              faucet
            </a>{' '}
            or ask Neil
          </div>

          {balance > 0 ? (
            <div className="pointer-events-none border-2 p-2 max-w-xl text-green-200 border-green-200">
              {`Success! You have ${balance} ETH`}
            </div>
          ) : (
            <div className="border-2 p-2 max-w-xl text-red-200 border-red-200 flex flex-row mr-2">
              <button
                type="button"
                className="bg-red-100 hover:bg-red-200 text-red-900 rounded-sm cursor-pointer px-2"
                onClick={() => {
                  if (network === 4) {
                    const network = 'rinkeby'; // use rinkeby testnet
                    const provider = ethers.getDefaultProvider(network);
                    provider.getBalance(account).then((balance) => {
                      // convert a currency unit from wei to ether
                      const balanceInEth = ethers.utils.formatEther(balance);
                      console.log(`balance: ${balanceInEth} ETH`);
                      setBalance(balanceInEth);
                    });
                  }
                }}
              >
                Check again
              </button>
            </div>
          )}
        </div>
        {/* Step Five */}
        <div className="flex flex-row space-x-2">
          <div className="border-white border-2 p-2 max-w-xl text-white">
            Step 4. Get some Baker Street Coin!
          </div>

          {bakerBalance > 1 ? (
            <div className="pointer-events-none border-2 p-2 max-w-xl text-green-200 border-green-200">
              {`Success! You have ${bakerBalance} BSC`}
            </div>
          ) : (
            <div className="border-2 p-2 max-w-xl text-red-200 border-red-200 flex flex-row mr-2">
              <button
                type="button"
                className="bg-red-100 hover:bg-red-200 text-red-900 rounded-sm cursor-pointer px-2"
                onClick={async () => {
                  if (network === 4) {
                    try {
                      const { ethereum } = window;

                      if (ethereum) {
                        const provider = new ethers.providers.Web3Provider(ethereum);
                        const signer = provider.getSigner();

                        /*
                         * You're using contractABI here
                         */
                        const bakerContract = new ethers.Contract(contractAddress, abi.abi, signer);

                        let count = await bakerContract.balanceOf(account);
                        console.log('Baker tokens are:', count / Math.pow(10, 18));
                        setBakerBalance(count / Math.pow(10, 18));

                        // Mint some tokens
                        const mintTxn = await bakerContract.mint(
                          account,
                          ethers.utils.parseEther('1000.0')
                        );
                        setMintProgress('Minting');
                        console.log('Mining', mintTxn.hash);

                        await mintTxn.wait();
                        console.log('mined --', mintTxn.hash);
                        setMintProgress('Minted');
                        count = await bakerContract.balanceOf(account);
                        setBakerBalance(count / Math.pow(10, 18));
                      } else {
                        console.log("Ethereum object doesn't exist!");
                      }
                    } catch (error) {
                      console.log(error);
                    }
                  } else {
                    setBakerBalance(0);
                  }
                }}
              >
                {mintProgress === 'Not Minting' && 'Mint some for yourself!'}
                {mintProgress === 'Minting' && 'Minting in progress!'}
                {mintProgress === 'Minted' && 'Minting completed!'}
              </button>
            </div>
          )}
        </div>
        <button
          onClick={addTokenToWallet}
          className="cursor-pointer bg-green-100 text-green-500 p-2 rounded-lg hover:bg-green-200"
        >
          Add Baker Street Coin to Metamask UI
        </button>
        {mintProgress === 'Minted' && (
          <div className="font-bold text-lg italic animate-bounce text-green-200 pt-10">
            Add the coin to Metamask and then go open MetaMask and checkout your new fancy Baker
            Street Coins!
          </div>
        )}
      </div>
    </div>
  );
}

// Hook
function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // only execute all the code below in client side
    if (typeof window !== 'undefined') {
      // Handler to call on window resize
      function handleResize() {
        // Set window width/height to state
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }

      // Add event listener
      window.addEventListener('resize', handleResize);

      // Call handler right away so state gets updated with initial window size
      handleResize();

      // Remove event listener on cleanup
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}
