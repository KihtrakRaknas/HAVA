import {PropsWithChildren} from "react";
import styles from "./MainContainer.module.css";

export function MainContainer(props: PropsWithChildren<any>) {
    return (
        <div className={styles.container}>
            {props.children}
        </div>
    );
}