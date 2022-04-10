import styles from './StyledButton.module.css'
import {PropsWithChildren} from "react";

export type StyledButtonProps = {
    theme?: 'default' | 'danger' | 'borderless',
    onClick?: () => void,
    disabled?: boolean
} & PropsWithChildren<any>;

export function StyledButton(props: StyledButtonProps) {
    return (
        <button
            onClick={props.onClick ? props.onClick : () => ''}
            disabled={!!props.disabled}
            className={`${styles.button} ${styles[props.theme]}`}>
            {props.children}
        </button>
    );
}