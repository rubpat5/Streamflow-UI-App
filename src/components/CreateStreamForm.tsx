import { useWallet } from '@solana/wallet-adapter-react';

import {useEffect, useState} from "react";
import { BN } from "bn.js";
import { Types, GenericStreamClient, getBN } from "@streamflow/stream";
import { useGetBalance } from "../hooks/useGetBalance.ts";

import '../App.css';

const durations = [
  { name: 'Seconds', value: 1 },
  { name: 'Minutes', value: 60 },
  { name: 'Hours', value: 3600 },
]

const client =
  new GenericStreamClient<Types.IChain.Solana>({
    chain: Types.IChain.Solana, // Blockchain
    clusterUrl: "https://api.devnet.solana.com", // RPC cluster URL
    cluster: Types.ICluster.Devnet, // (optional) (default: Mainnet)
  });

export const CreateStreamForm = () => {
  const {  wallet, publicKey } = useWallet();
  const { data: balanceData } = useGetBalance();

  useEffect(() => {
    if (balanceData.length) {
      setPaymentForm({ ...paymentForm, ...{ tokenId: balanceData[0].mintAddress }})
    }
  }, [balanceData]);


  const initialState = {
    name: '',
    amountForm: '',
    period: '',
    recipient: '',
    tokenId: 'So11111111111111111111111111111111111111112',
    duration: '',
  };
  const [paymentForm, setPaymentForm] = useState<any>(initialState);

  const createStreamParams: Types.ICreateStreamData = {
    recipient: "BMsU2Xn8qq3SidsjBPD7pJQSYdoHWqcYDp4WeqmrWDTm", // Recipient address.
    start: Math.floor(Date.now() / 1000) + 20, // Timestamp (in seconds) when the stream/token vesting starts.
    amount: getBN(0.2, 9), // depositing 100 tokens with 9 decimals mint.
    period: 4, // Time step (period) in seconds per which the unlocking occurs.
    cliff: Math.floor(Date.now() / 1000) + 20, // Vesting contract "cliff" timestamp in seconds.
    cliffAmount: new BN(0), // Amount unlocked at the "cliff" timestamp.
    amountPerPeriod: getBN(0.05, 9), // Release rate: how many tokens are unlocked per each period.
    name: "Transfer to Jane Doe. 111", // The stream name or subject.
    canTopup: false, // setting to FALSE will effectively create a vesting contract.
    cancelableBySender: false, // Whether or not sender can cancel the stream.
    cancelableByRecipient: false, // Whether or not recipient can cancel the stream.
    transferableBySender: false, // Whether or not sender can transfer the stream.
    transferableByRecipient: false, // Whether or not recipient can transfer the stream.
    automaticWithdrawal: true, // Whether or not a 3rd party (e.g. cron job, "cranker") can initiate a token withdraw/transfer.
    withdrawalFrequency: 10, // Relevant when automatic withdrawal is enabled. If greater than 0 our withdrawor will take care of withdrawals. If equal to 0 our withdrawor will skip, but everyone else can initiate withdrawals.
    partner: null, //  (optional) Partner's wallet address (string | null).
  } as Types.ICreateStreamData;

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const solanaParams = {
      sender: wallet.adapter, //
      isNative: true
    };

    const data: Types.IGetAllData = {
      address: publicKey.toBase58(),
      type: Types.StreamType.All,
      direction: Types.StreamDirection.All,
    };

    paymentForm.period = parseInt(paymentForm.period);
    delete paymentForm.duration;
    const amountPerPeriod = paymentForm.amountForm / paymentForm.period;
    const decimals = balanceData.find(item => item.mintAddress === paymentForm.tokenId).decimals;

    paymentForm.amount = getBN(paymentForm.amountForm, decimals);
    paymentForm.amountPerPeriod = getBN(amountPerPeriod, decimals);
    const sendStreamParams = { ...createStreamParams, ...paymentForm };

    delete sendStreamParams.amountForm;

    try {
      const data = await client.create(sendStreamParams, solanaParams);
      window.alert('Payment Stream created successfully');
    } catch (exception) {
      console.log(exception);
    }
  }

  const handleChange = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    setPaymentForm({ ...paymentForm, ...{ [name]: value } })
  }

  return (
    <div>
      <div className="card">
        <div className="card-body">
          <h2>Create Stream</h2>
          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label htmlFor="nameInput">Name</label>
              <input
                type="text"
                name="name"
                value={paymentForm.name}
                onChange={handleChange}
                id="nameInput"
                placeholder="Name"/>
            </div>
            <div className="form-group-inline">
              <div className="form-group-item">
                <label htmlFor="emailInput">Amount</label>
                <input
                  name="amountForm"
                  value={paymentForm.amountForm}
                  onChange={handleChange}
                  id="amountInput"
                  placeholder="0.00"/>
              </div>
              <div className="form-group-item">
                <label htmlFor="emailInput">Amount</label>
                <select name="tokenId" onChange={handleChange} defaultValue={paymentForm.tokenId}>
                  {balanceData && balanceData.map(function(balance) {
                    return (
                      <option
                        key={`${balance.mintAddress}`}
                        value={balance.mintAddress}
                      >{balance.name}</option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="recipientInput">Recipient</label>
              <input
                name="recipient"
                type="recipient"
                value={paymentForm.recipient}
                onChange={handleChange}
                id="recipientInput"
                placeholder="Recipient"/>
            </div>
            <div className="form-group-inline">
              <div className="form-group-item">
                <label htmlFor="periodInput">Duration</label>
                <input
                  name="period"
                  type="period"
                  value={paymentForm.period}
                  onChange={handleChange}
                  id="periodInput"
                  placeholder="Period"/>
              </div>
              <div className="form-group-item">
                <label htmlFor="emailInput">Duration</label>
                <select name="duration" onChange={handleChange} defaultValue={paymentForm.duration}>
                  {durations.map(function(duration) {
                    return (
                      <option
                        key={duration.name}
                        value={duration.value}
                      >{duration.name}</option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="submit-button">
              <button type='submit' disabled={!paymentForm.amountForm || !paymentForm.recipient}>Submit</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

