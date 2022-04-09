import {PropsWithChildren, useEffect, useState} from "react";
import styles from './Alert.module.css'

export type AlertProps = {
    displayed: boolean,
    setDisplayed: (val: boolean) => void;
    theme?: 'default' | 'danger' | 'success',
    autoDismissSeconds: number
} & PropsWithChildren<any>;

export function Alert(props: AlertProps) {
    const [timeRemaining, setTimeRemaining] = useState<number>(props.autoDismissSeconds);

    const theme = props.theme || 'default';

    useEffect(() => {
        if (!props.displayed || props.autoDismissSeconds <= 0) {
            return;
        }

        let interval = window.setInterval(() => {
            if (timeRemaining <= 0) {
                props.setDisplayed(false);
                clearInterval(interval);
            }

            setTimeRemaining((val) => {
                return val - 1
            });
        }, 1000);

        return () => {
            clearInterval(interval);
        }
    }, [props, timeRemaining]);

    if (!props.displayed) {
        return <></>;
    }

    return (
        <div className={`${styles.alert} ${styles[theme]}`}>
            {props.children}
            <span className={styles.alert_close} onClick={() => props.setDisplayed(false)}>X</span>
        </div>
    )
}