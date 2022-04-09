import {POLYSCAN_ADDR_BASE, POLYSCAN_TX_BASE} from "@my-app/contracts/src/environment";
import {trimHash} from "../../utils/WalletDisplay";

type PolyscanLinkProps = {
    type: 'address' | 'transaction',
    value: string
}

export function PolyscanLink(props: PolyscanLinkProps) {
    const base = props.type === 'address' ? POLYSCAN_ADDR_BASE : POLYSCAN_TX_BASE;

    return (
        <a href={base + props.value} target="_blank" rel="noreferrer">
            {trimHash(props.value)} (Polyscan)
        </a>
    );
}