import styles from "./TransferInputField.module.css"

interface TransferInputFieldProps {
    currencyName: string,
    balance: string
}

export function TransferInputField(props: TransferInputFieldProps) {
    return (
        <div className={styles.container}>
            <span className={styles.currencyName}>{props.currencyName}</span>
            <span className={styles.balance}>{props.balance}</span>
        </div>
    );
}