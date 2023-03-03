import Head from 'next/head';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useAccount, useSigner, useProvider } from 'wagmi';
import { useState, useEffect } from 'react';
import logo from '../public/logo.png';
import { BigNumber, ethers } from 'ethers';
import { PurplePay_Address, PurplePay_ABI } from '@/constant';
import Spinner from '@/components/Spinner';
import { Approve_ABI } from '@/constant';

export default function Home() {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const provider = useProvider();
  const [isConnected, setIsConnected] = useState(false);
  const [custom, setCustom] = useState(false);
  const [amount, setAmount] = useState('0');
  const [inputAddress, setInputAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [curAdmin, setCurAdmin] = useState('');
  const [admin, setAdmin] = useState('');
  const [adminFeePercentage, setAdminFeePercentage] = useState(0);
  const [curAdminFeePercentage, setCurAdminFeePercentage] = useState('');
  const [totalFeeCollected, setTotalFeeCollected] = useState('');

  const purplePayContract = new ethers.Contract(PurplePay_Address, PurplePay_ABI, signer || provider);

  const getAdmin = async () => {
    setLoading(true);
    const curAdmin = await purplePayContract.getAdmin();
    setCurAdmin(curAdmin);
    setLoading(false);
  };

  const getAdminFeePercentage = async () => {
    const curAdminFeePercentage = await purplePayContract.getAdminFeePercentage();
    setCurAdminFeePercentage(String(curAdminFeePercentage));
  };

  const getTotalFeeCollected = async () => {
    let totalFeeCollected = await purplePayContract.getTotalFeeCollected();
    const etherValue = ethers.utils.formatEther(totalFeeCollected);
    setTotalFeeCollected(parseFloat(etherValue).toFixed(2));
  };

  const withdrawFunds = async () => {
    setLoading(true);
    const tx = await purplePayContract.withdraw(inputAddress, amount);
    await tx.wait();
    setLoading(false);
  };

  const depositFunds = async () => {
    setLoading(true);
    if (!inputAddress) {
      setInputAddress('0xa177753Ad7b2847142631e76C65888c5a1390D17');
    }

    const tempAmount = ethers.utils.parseEther(String(amount));
    console.log(tempAmount);

    const tokenContract = new ethers.Contract(inputAddress, Approve_ABI, signer || provider);
    const approveTx = await tokenContract.approve(PurplePay_Address, tempAmount);
    await approveTx.wait();

    const tx = await purplePayContract.deposit(inputAddress, tempAmount);
    await tx.wait();

    setLoading(false);
  };

  const changeAdmin = async () => {
    setLoading(true);
    const tx = await purplePayContract.setAdmin(admin);
    await tx.wait();
    setLoading(false);
  };

  const changeAdminFeePercentage = async () => {
    setLoading(true);
    const tx = await purplePayContract.setAdminFeePercentage(amount);
    await tx.wait();
    setLoading(false);
  };

  useEffect(() => {
    if (address) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
    getAdmin();
    getTotalFeeCollected();
    getAdminFeePercentage();
  }, [address]);

  return (
    <>
      <Head>
        <title>PurplePay App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="top-0 flex flex-col w-screen bg-black">
        <div className="top-0 flex flex-row w-screen h-fit py-4 px-[10%] justify-between items-center text-primary">
          <Link href="/" className="text-xl font-bold">
            <Image src={logo} alt="PurplePay Logo" width={150} height={150} />
          </Link>
          <div className="flex flex-row space-x-4">
            <Link href="https://fluxpay-faucet.vercel.app/">
              <button className="btn">FXP Faucet</button>
            </Link>
            <ConnectButton showBalance={false} className="px-14" />
          </div>
        </div>

        {isConnected ? (
          address === curAdmin ? (
            <>
              <div className="w-full max-w-screen-sm flex flex-col bg-white rounded-2xl shadow-lg items-center justify-center mx-auto my-28 border-2 border-gray-100 p-8 space-y-8">
                <p className="text-2xl font-bold text-primary">Admin Page</p>
                <div className="w-3/4 flex space-x-2 rounded-lg border-2 border-fpurple p-1">
                  <p className="mx-2 text-lg">Total Fee Collected - </p>
                  <p className="">{totalFeeCollected}</p>
                </div>

                <div className="w-3/4 flex space-x-2 rounded-lg border-2 border-fpurple p-1">
                  <p className="mx-2 text-lg">Fee Percentage - </p>
                  <p className="">{curAdminFeePercentage}</p>
                </div>

                {!loading && (
                  <div className="w-3/4 flex justify-between space-x-2 p-1">
                    <button onClick={changeAdminFeePercentage} className="btn mx-2">
                      Change Fee%
                    </button>
                    <input
                      className="px-4 rounded-lg border-2 border-fpurple p-1"
                      type="text"
                      placeholder="Enter Fee Percentage"
                      value={adminFeePercentage}
                      onChange={(e) => setAdminFeePercentage(e.target.value)}
                    />
                  </div>
                )}
                {loading && <Spinner />}

                {!loading && (
                  <div className="w-3/4 flex justify-between space-x-2 p-1">
                    <button onClick={changeAdmin} className="btn mx-2">
                      Change Admin
                    </button>
                    <input
                      className="px-4 rounded-lg border-2 border-fpurple p-1"
                      type="text"
                      placeholder="Enter Fee Percentage"
                      value={admin}
                      onChange={(e) => setAdmin(e.target.value)}
                    />
                  </div>
                )}
                {loading && <Spinner />}
              </div>
              )
            </>
          ) : (
            <div>
              <div className="w-full max-w-screen-sm flex flex-col bg-white rounded-2xl shadow-lg items-center justify-center mx-auto my-28 border-2 border-gray-100 p-8 space-y-8">
                <p className="text-xl font-bold text-primary">Deposit Tokens</p>
                <div className="flex w-1/2 border-2 border-gray-200 cursor-pointer">
                  <span
                    className={'w-1/2 px-4 py-2 text-center' + (custom ? ' bg-white' : ' bg-fpurple text-white')}
                    onClick={() => setCustom(false)}
                  >
                    Default
                  </span>
                  <span
                    className={'w-1/2 px-4 py-2 text-center' + (!custom ? ' bg-white' : ' bg-fpurple text-white')}
                    onClick={() => setCustom(true)}
                  >
                    Custom
                  </span>
                </div>
                {custom && (
                  <div className="w-3/4 flex justify-between space-x-2 p-1">
                    <label className="mx-2 text-lg">Address</label>
                    <input
                      className="px-4 rounded-lg border-2 border-fpurple p-1"
                      type="text"
                      placeholder="0x..."
                      value={inputAddress}
                      onChange={(e) => setInputAddress(e.target.value)}
                    />
                  </div>
                )}
                <div className="w-3/4 flex justify-between space-x-2 p-1">
                  <label className="mx-2 text-lg">Enter amount</label>
                  <input
                    className="px-4 rounded-lg border-2 border-fpurple p-1"
                    type="text"
                    placeholder="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                {!loading && (
                  <div className="flex flex-row w-full mt-3 pr-2 justify-center">
                    <button onClick={depositFunds} className="btn mt-2 w-1/2">
                      Deposit {custom ? 'Custom Token' : 'FXP'}
                    </button>
                  </div>
                )}
                {loading && <Spinner />}
              </div>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center w-screen py-32 text-3xl text-white text-center">
            Please connect your wallet to continue
          </div>
        )}
      </div>
    </>
  );
}
