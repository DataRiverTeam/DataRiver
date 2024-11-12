import { useState, SyntheticEvent } from "react";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import CardContent from "@mui/material/CardContent";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import { TNerDoc } from "../../types/ner";
import s from "./NerCard.module.css";
import NerChart from "./components/NerChart/NerChart";

type TNerCardProps = {
    item: TNerDoc;
};

type TTabDisplayProps = {
    children: React.ReactNode;
    index: number;
    value: number;
};

function TabDisplay({ children, index, value }: TTabDisplayProps) {
    return (
        <div hidden={index !== value} className={s.tabContainer}>
            {children}
        </div>
    );
}

function NerCard({ item }: TNerCardProps) {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Card
            sx={{
                maxWidth: "960px",
            }}
        >
            <CardHeader title={item.title} />
            <CardContent>
                <p> Details </p>
                <ul>
                    <li>Language: {item.language}</li>
                    <li>DAG run ID: {item.dag_run_id}</li>
                    {item.dag_start_date ? (
                        <li>Start date: {item.dag_start_date}</li>
                    ) : null}
                    {item.dag_processed_date ? (
                        <li>End date: {item.dag_processed_date}</li>
                    ) : null}
                </ul>
            </CardContent>
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
                        {item.ner.map((ner, index) => (
                            <div
                                key={`${item.id}-sentence-${ner.sentence}-${index}`}
                            >
                                <blockquote className={s.quote}>
                                    {ner.sentence}
                                </blockquote>
                                {ner.ents.length > 0 ? (
                                    <table className={s.statTable}>
                                        <tbody>
                                            {ner.ents.map((ent, index) => {
                                                return (
                                                    <tr
                                                        key={`${item.id}-sentence-${ner.sentence}-${index}-ent-${index}`}
                                                    >
                                                        <td
                                                            className={
                                                                s.statLabel
                                                            }
                                                        >
                                                            {ent.text}
                                                        </td>
                                                        <td> {ent.label} </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
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
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="Toggle data representation"
                    >
                        <Tab
                            label={"Charts"}
                            aria-controls={`${item.id}-charts`}
                        ></Tab>
                        <Tab
                            label={"Tables"}
                            aria-controls={`${item.id}-tables`}
                        ></Tab>
                    </Tabs>
                    <TabDisplay index={0} value={tabValue}>
                        <NerChart
                            labels={item.ner_stats.stats.entities.map(
                                (label) => label.value
                            )}
                            values={item.ner_stats.stats.entities.map(
                                (label) => label.count
                            )}
                        />
                        <NerChart
                            labels={item.ner_stats.stats.labels.map(
                                (label) => label.value
                            )}
                            values={item.ner_stats.stats.labels.map(
                                (label) => label.count
                            )}
                        />
                    </TabDisplay>

                    <TabDisplay index={1} value={tabValue}>
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
                    </TabDisplay>
                </AccordionDetails>
            </Accordion>
        </Card>
    );
}

export default NerCard;
