import {useEffect, useState, useCallback} from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import solanaTokenList from "../solana-tokenlist.json";

export const useGetBalance = () => {
  const [data, setData] = useState<any>([]);
  const { connection }  = useConnection();
  const {  publicKey } = useWallet();

  const getBalance = useCallback(async function () {
    if (publicKey && data.length === 0) {
      const balance = await connection.getParsedTokenAccountsByOwner(
        publicKey, { programId: TOKEN_PROGRAM_ID }
      );
      const balanceState = [];

      balance.value.forEach((account, i) => {
        const parsedAccountInfo:any = account.account.data;
        const mintAddress:string = parsedAccountInfo["parsed"]["info"]["mint"];
        const tokenBalance: number = parsedAccountInfo["parsed"]["info"]["tokenAmount"]["uiAmount"];
        const solanaTokenListObj = solanaTokenList.tokens.find(token => token.address === mintAddress);
        balanceState.push({
          mintAddress,
          tokenBalance,
          name: solanaTokenListObj.symbol,
          decimals: solanaTokenListObj.decimals
        })
      });
      setData(balanceState);
    }
  }, [publicKey?.toBase58()])


  useEffect(() => {
    (async function () {
      await getBalance();
    })()
  }, []);

  return { data };
};
