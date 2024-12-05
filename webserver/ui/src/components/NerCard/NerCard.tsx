import React, { useState, SyntheticEvent, ReactNode } from "react";

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

type TCardSectionProps = {
    title: string;
    children: ReactNode;
    defaultExpanded?: boolean;
    ariaControls: string;
};
function NerCardSection({
    title,
    children,
    defaultExpanded = false,
    ariaControls,
}: TCardSectionProps) {
    return (
        <Accordion defaultExpanded={defaultExpanded} disableGutters>
            <AccordionSummary
                aria-controls={ariaControls}
                id="content-header"
                expandIcon={<ArrowDropDownIcon />}
            >
                {title}
            </AccordionSummary>
            <AccordionDetails>{children}</AccordionDetails>
        </Accordion>
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
                width: "100%",
            }}
        >
            <CardHeader title={item.title} />
            <CardContent>
                <p> Details </p>
                <ul>
                    <li>Language: {item.language}</li>
                    <li>DAG run ID: {item.dag_run_id}</li>
                    {item.processed_date ? (
                        <li>Processed date: {item.processed_date}</li>
                    ) : null}
                </ul>
                <p>Dags info</p>
                {item.dags_info && Object.keys(item.dags_info).length > 0 ? (
                    <table
                        border={1}
                        style={{ borderCollapse: "collapse", width: "100%" }}
                    >
                        <thead>
                            <tr>
                                <th>Dag ID</th>
                                <th>Start Date</th>
                                <th>Run ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(item.dags_info).map(
                                ([dag_id, value]) => (
                                    <tr key={dag_id}>
                                        <td>{dag_id}</td>
                                        <td>{value.start_date}</td>
                                        <td>{value.run_id}</td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                ) : null}
            </CardContent>
            <NerCardSection
                title="Content"
                ariaControls="content-section-details"
                defaultExpanded
            >
                <q className={s.quote}>{item.content}</q>
            </NerCardSection>
            {item.translated ? (
                <NerCardSection
                    title="Translation"
                    ariaControls="translation-section-details"
                >
                    <q className={s.quote}>{item.translated}</q>
                </NerCardSection>
            ) : null}
            {item.ner ? (
                <NerCardSection
                    title="Named Entities"
                    ariaControls="ner-section-details"
                >
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
                </NerCardSection>
            ) : null}

            {item.ner_stats ? (
                <NerCardSection
                    title="Statistics"
                    ariaControls="stats-section-details"
                >
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
                </NerCardSection>
            ) : null}
            {"error" in item ? (
                <NerCardSection
                    title="Errors"
                    ariaControls="error-section-details"
                >
                    <p>
                        [{item.error.task_id}] {item.error.message}
                    </p>
                </NerCardSection>
            ) : null}
        </Card>
    );
}

export default NerCard;
