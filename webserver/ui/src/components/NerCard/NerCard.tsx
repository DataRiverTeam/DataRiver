import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CardContent from "@mui/material/CardContent";

import { TNerDoc } from "../../types/ner";
import s from "./NerCard.module.css";

type NerCardProps = {
    item: TNerDoc;
};

function NerCard({ item }: NerCardProps) {
    return (
        <Card
            sx={{
                maxWidth: "960px",
            }}
        >
            <CardHeader title={item.title} />
            <CardContent>Language: {item.language}</CardContent>
            <Accordion defaultExpanded>
                <AccordionSummary
                    aria-controls="content-details"
                    id="content-header"
                    expandIcon={<ArrowDropDownIcon />}
                >
                    Content
                </AccordionSummary>
                <AccordionDetails>
                    <q className={s.quote}>{item.content}</q>
                </AccordionDetails>
            </Accordion>
            {item.translated ? (
                <Accordion>
                    <AccordionSummary
                        aria-controls="translation-details"
                        id="translation-header"
                        expandIcon={<ArrowDropDownIcon />}
                    >
                        Translation
                    </AccordionSummary>
                    <AccordionDetails>
                        <q className={s.quote}>{item.translated}</q>
                    </AccordionDetails>
                </Accordion>
            ) : null}
            <Accordion>
                <AccordionSummary
                    aria-controls="ner-details"
                    id="ner-header"
                    expandIcon={<ArrowDropDownIcon />}
                >
                    Named Entities
                </AccordionSummary>
                <AccordionDetails>
                    <pre className={s.code}>
                        {JSON.stringify(item.ner, null, 2)}
                    </pre>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    aria-controls="stats-details"
                    id="stats-header"
                    expandIcon={<ArrowDropDownIcon />}
                >
                    Statistics
                </AccordionSummary>
                <AccordionDetails>
                    <pre className={s.code}>
                        {JSON.stringify(item.ner_stats, null, 2)}
                    </pre>
                </AccordionDetails>
            </Accordion>
        </Card>
    );
}

export default NerCard;
