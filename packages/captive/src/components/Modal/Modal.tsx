import {MutableRefObject, PropsWithChildren, useEffect, useRef} from "react";
import styles from "./Modal.module.css";

interface ModalProps extends PropsWithChildren<any> {
    isOpen: boolean
}

export function Modal(props: ModalProps) {
    const dialogRef: MutableRefObject<HTMLDialogElement | null> = useRef(null);

    useEffect(() => {
        if (dialogRef.current) {
            if (props.isOpen) {
                // @ts-ignore
                dialogRef.current.showModal()
            } else {
                // @ts-ignore
                dialogRef.current.close();
            }
        }
    }, [props.isOpen])

    return (
        <dialog ref={dialogRef} className={styles.modal}>
            {props.children}
        </dialog>
    );
}