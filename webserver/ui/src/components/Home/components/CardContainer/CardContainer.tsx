import { ReactNode } from "react";
import s from "./CardContainer.module.css";

function CardContainer({ children }: { children?: ReactNode }) {
    return <div className={s.container}>{children}</div>;
}

export default CardContainer;
