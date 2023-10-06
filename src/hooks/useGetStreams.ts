import {useEffect, useState, useCallback} from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { GenericStreamClient, Types } from "@streamflow/stream";

const client =
  new GenericStreamClient<Types.IChain.Solana>({
    chain: Types.IChain.Solana, // Blockchain
    clusterUrl: "https://api.devnet.solana.com", // RPC cluster URL
    cluster: Types.ICluster.Devnet, // (optional) (default: Mainnet)
  });

export const useGetStreams = () => {
  const [data, setData] = useState<[string, Types.Stream][]>([]);
  const { publicKey } = useWallet();

  const getData = useCallback(async function () {
    if (publicKey && data.length === 0) {
      const data: Types.IGetAllData = {
        address: publicKey.toBase58(),
        type: Types.StreamType.All,
        direction: Types.StreamDirection.All,
      };

      await (async function () {
        try {
          const streams = await client.get(data);
          setData(streams);
        } catch (exception) {
          console.log(exception);
        }
      })();
    }
  }, [publicKey])


  useEffect(() => {
    (async function () {
      await getData();
    })()
  }, []);

  return { data, getData };
};
