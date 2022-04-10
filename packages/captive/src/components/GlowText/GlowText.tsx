import styles from './GlowText.module.css'
import {PropsWithChildren} from "react";

export function GlowText(props: PropsWithChildren<any>) {
    return <span className={styles.text_glow}>{props.children}</span>
}