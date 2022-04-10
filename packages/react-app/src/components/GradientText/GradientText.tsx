import styles from './GradientText.module.css'
import {PropsWithChildren} from "react";

export function GradientText(props: PropsWithChildren<any>) {
    return <span className={styles.text_gradient}>{props.children}</span>
}