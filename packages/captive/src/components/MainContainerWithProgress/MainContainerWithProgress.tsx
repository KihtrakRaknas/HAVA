import {PropsWithChildren} from "react";
import styles from "./MainContainerWithProgress.module.css";

type MainContainerWithProgressProps = {
    max: number,
    value: number,
} & PropsWithChildren<any>;

export function MainContainerWithProgress(props: MainContainerWithProgressProps) {
    return (
        <div className={styles.mainContainer}>
            {props.max !== 0 ?
                <div className={styles.progress} style={{width: `${Math.min(100, (props.value / props.max) * 100)}%`}}/> : null}

            <div className={styles.container}>
                {props.children}

            </div>
        </div>
    );
}