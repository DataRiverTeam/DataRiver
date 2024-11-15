import { memo } from "react";
import NerCard from "../../../NerCard/NerCard";
import { TParsedNerDocProps, TFailedNerDocProps } from "../../../../types/ner";

type TNerCardsListProps = {
    docs: (TParsedNerDocProps | TFailedNerDocProps)[];
};

function NerCardsList({ docs }: TNerCardsListProps) {
    return (
        <>
            {docs.map((item) => {
                return <NerCard key={item.id} item={item} />;
            })}
        </>
    );
}

// re-rendering multiple NerCards every time the NerBrowser changes turned out to be very heavy
export default memo(NerCardsList);
