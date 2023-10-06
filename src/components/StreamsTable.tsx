import { useWallet } from '@solana/wallet-adapter-react';
import {useCallback, useEffect, useState} from "react";
import { Types, GenericStreamClient, getNumberFromBN } from "@streamflow/stream";
import { useGetStreams } from "../hooks/useGetStreams.ts";
import solanaTokenList from "../solana-tokenlist.json";

import '../App.css';
import {TOKEN_PROGRAM_ID} from "@solana/spl-token";

const client =
  new GenericStreamClient<Types.IChain.Solana>({
    chain: Types.IChain.Solana, // Blockchain
    clusterUrl: "https://api.devnet.solana.com", // RPC cluster URL
    cluster: Types.ICluster.Devnet, // (optional) (default: Mainnet)
  });

export const StreamsTable = () => {
  const {  publicKey } = useWallet();
  const { data: streams } = useGetStreams();

  const formatDate = (date: Date) => {
    let year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
    let month = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
    let day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);

    return (`${month} ${day}, ${year}`);
  }

  const getStreamStatus = (cancelled: boolean, closed: boolean) => {
    return closed ? (cancelled ? 'Cancelled' : 'Completed') : 'Streaming';
  }

  const getTokenAmount = (stream: Types.Stream) => {
    const solanaTokenListObj = solanaTokenList.tokens.find(token => token.address === stream.mint);
    return `${getNumberFromBN(stream.depositedAmount, solanaTokenListObj.decimals)} ${solanaTokenListObj.symbol}`
  }

  return (
    <div className="card-table">
      <div className="card-body">
        <h2>All Streams</h2>
        <div className='tableFixHead'>
          <table>
            <thead>
            <tr>
              <th align='left'>Total streamed</th>
              <th>Subject/Created</th>
              <th>Direction</th>
              <th>Status</th>
            </tr>
            </thead>
            <tbody className='table-body'>
            {streams.length > 0 && streams.map(item => (
              <tr key={item[0]}>
                <td align='left'>{getTokenAmount(item[1])}</td>
                <td align='center'>
                  <div style={{display: 'flex', flexDirection: 'column'}}>
                    <span>{item[1].name ?? 'N/A'}</span>
                    <span>{formatDate(new Date(item[1].createdAt * 1000))}</span>
                  </div>
                </td>
                <td>{item[1].sender === publicKey?.toBase58() ? 'Outgoing' : 'Incoming'}</td>
                <td>{getStreamStatus(item[1].canceledAt > 0, item[1].closed)}</td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

