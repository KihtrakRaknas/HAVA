import styles from "./TransferInputField.module.css"
import {BigNumberInput} from "big-number-input";
import {formatEther, formatUnits} from '@ethersproject/units'

interface TransferInputFieldProps {
    currencyName: string
    balance: string
    symbol: string
    value: string
    decimals: number
    setValue: (value: string) => void
}

export function TransferInputField(props: TransferInputFieldProps) {
    let formatted = "0";
    if (props.balance) {
        formatted = formatUnits(props.balance, props.decimals);
        formatted = formatted.substring(0, Math.min(8, formatted.length));
    }

    return (
        <div className={styles.mainContainer}>
            <span
                className={styles.currencyName}>Balance: {formatted} {props.symbol}</span>
            <div className={styles.container}>
                <BigNumberInput decimals={props.decimals} value={props.value} onChange={props.setValue}
                                renderInput={(props) => (
                                    <input className={styles.input} type='text' value={props.value} {...props} />
                                )}/>

            </div>
        </div>
    );
}