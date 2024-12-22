import clsx from "clsx";
import s from "./MessageBox.module.css";

type TMessageBoxVariant = "info" | "warning";

type TMessageBoxProps = {
    header?: string;
    text: string;
    variant?: TMessageBoxVariant;
};

function MessageBox({ header, text, variant = "info" }: TMessageBoxProps) {
    return (
        <div
            className={clsx(s.msgBoxContainer, {
                [s.msgBoxInfo]: variant === "info",
                [s.msgBoxWarning]: variant === "warning",
            })}
        >
            {header ? <h3> {header} </h3> : null}
            <p className={s.msgBoxText}> {text} </p>
        </div>
    );
}

export default MessageBox;
