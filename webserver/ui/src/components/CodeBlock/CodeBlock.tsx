import { KeyboardEvent } from "react";
import s from "./CodeBlock.module.css";

type TCodeBlockProps = {
    code: string;
    editable?: boolean;
    onInput?: (code: string) => any;
    copy?: boolean;
};

function CodeBlock({
    code,
    editable = false,
    onInput: _onInput,
}: // copy = false,
TCodeBlockProps) {
    let handleKey = (e: KeyboardEvent<any>) => {
        if (e.code === "Tab") {
            e.stopPropagation();
            e.preventDefault();
        }

        //TODO: pass current value to onInput
    };

    return (
        <pre
            className={s.code}
            contentEditable={editable}
            onKeyDown={handleKey}
        >
            {code}
        </pre>
    );
}

export default CodeBlock;
