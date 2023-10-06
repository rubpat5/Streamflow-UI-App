import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';

import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { CreateStreamForm } from "./CreateStreamForm.tsx";
import { StreamsTable } from "./StreamsTable.tsx";

import '../App.css';

// import the styles
import '@solana/wallet-adapter-react-ui/styles.css';
import { useWallet } from "@solana/wallet-adapter-react";

type PhantomEvent = "disconnect" | "connect" | "accountChanged";

interface ConnectOpts {
    onlyIfTrusted: boolean;
}

interface PhantomProvider {
    connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
    disconnect: () => Promise<void>;
    on: (event: PhantomEvent, callback: (args:any)=>void) => void;
    isPhantom: boolean;
}

type WindowWithSolana = Window & {
    solana?: PhantomProvider;
}

export const Container = () => {
    const [ provider, setProvider ] = useState<PhantomProvider | null>(null);
    const {  publicKey } = useWallet();

    useEffect( ()=>{
        if ("solana" in window) {
            const solWindow = window as WindowWithSolana;
            if (solWindow?.solana?.isPhantom) {
                setProvider(solWindow.solana);
                solWindow.solana.connect({ onlyIfTrusted: true });
            }
        }
    }, []);

    useEffect( () => {
        provider?.on("accountChanged", ()=> {
            window.location.reload();
            console.log("account change event");
        });
        provider?.on("disconnect", ()=>{
            console.log("account disconnected");
        });

    }, [provider]);


    return (
        <div>
            <div className='header'>
                <div>
                    <WalletMultiButton />
                </div>
                <div>
                    <WalletDisconnectButton />
                </div>
            </div>
            {publicKey ?
              (<div className='content'>
                    <CreateStreamForm />
                    <StreamsTable />
              </div>) : null}
        </div>
    );
}

