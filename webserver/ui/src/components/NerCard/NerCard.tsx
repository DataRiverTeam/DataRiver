import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CardContent from "@mui/material/CardContent";
// import ToggleButton from "@mui/material/ToggleButton";
// import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import { TNerDoc } from "../../types/ner";
import s from "./NerCard.module.css";
import NerChart from "./components/NerChart/NerChart";

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
            <Accordion defaultExpanded disableGutters>
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
                <Accordion disableGutters>
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
            <Accordion disableGutters>
                <AccordionSummary
                    aria-controls="ner-details"
                    id="ner-header"
                    expandIcon={<ArrowDropDownIcon />}
                >
                    Named Entities
                </AccordionSummary>
                <AccordionDetails>
                    <div className={s.nerWrapper}>
                        {item.ner.map((ner) => (
                            <div>
                                <blockquote className={s.quote}>
                                    {ner.sentence}
                                </blockquote>
                                {ner.ents.length > 0 ? (
                                    <table className={s.statTable}>
                                        {ner.ents.map((ent) => {
                                            return (
                                                <tr
                                                    key={`${item.id}-ents-${ent.text}-${ent.label}`}
                                                >
                                                    <td className={s.statLabel}>
                                                        {ent.text}
                                                    </td>
                                                    <td> {ent.label} </td>
                                                </tr>
                                            );
                                        })}
                                    </table>
                                ) : (
                                    <p style={{ textAlign: "center" }}>
                                        No entities detected.
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </AccordionDetails>
            </Accordion>
            <Accordion disableGutters>
                <AccordionSummary
                    aria-controls="stats-details"
                    id="stats-header"
                    expandIcon={<ArrowDropDownIcon />}
                >
                    Statistics
                </AccordionSummary>
                <AccordionDetails>
                    {/* <ToggleButtonGroup
                        value={alignment}
                        exclusive
                        onChange={handleAlignment}
                        aria-label="text alignment"
                    ></ToggleButtonGroup> */}

                    <NerChart
                        labels={item.ner_stats.stats.labels.map(
                            (label) => label.value
                        )}
                        values={item.ner_stats.stats.labels.map(
                            (label) => label.count
                        )}
                    />

                    <table className={s.statTable}>
                        <thead>
                            <tr>
                                <th className={s.statLabel}>Label</th>
                                <th>Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {item.ner_stats.stats.labels.map((label) => (
                                <tr key={`ner-state-${label.value}`}>
                                    <td className={s.statLabel}>
                                        {label.value}
                                    </td>
                                    <td>{label.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <NerChart
                        labels={item.ner_stats.stats.entities.map(
                            (label) => label.value
                        )}
                        values={item.ner_stats.stats.entities.map(
                            (label) => label.count
                        )}
                    />
                    <table className={s.statTable}>
                        <thead>
                            <tr>
                                <th>Entity</th>
                                <th>Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {item.ner_stats.stats.entities.map((entity) => (
                                <tr key={`entity-${entity.value}`}>
                                    <td className={s.statLabel}>
                                        {entity.value}
                                    </td>
                                    <td>{entity.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </AccordionDetails>
            </Accordion>
        </Card>
    );
}

export default NerCard;
