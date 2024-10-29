import { TDagRun } from "../../types/airflow";

import Card from "@mui/material/Card";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import s from "./DagRunsList.module.css";

type TDagRunsListProps = {
    dagRuns: TDagRun[];
};

function DagRunsList({ dagRuns }: TDagRunsListProps) {
    return (
        <div className={s.list}>
            {dagRuns.length
                ? dagRuns.map((dagRun) => {
                      let { conf, dag_run_id, state, start_date } = dagRun;
                      let [date, time] = start_date.split("T");

                      return (
                          <Card key={dag_run_id}>
                              <Accordion defaultExpanded>
                                  <AccordionSummary
                                      aria-controls="dagrun-details"
                                      id="content-header"
                                      expandIcon={<ArrowDropDownIcon />}
                                  >
                                      {dag_run_id}
                                  </AccordionSummary>
                                  <AccordionDetails>
                                      <table>
                                          <tr>
                                              <td>Launched</td>
                                              <td>{`${date}, ${time}`}</td>
                                          </tr>
                                          <tr>
                                              <td>State</td>
                                              <td>{`${state}`}</td>
                                          </tr>
                                      </table>
                                      <Card>
                                          <Accordion>
                                              <AccordionSummary
                                                  aria-controls="dagrun-conf"
                                                  id="content-header"
                                                  expandIcon={
                                                      <ArrowDropDownIcon />
                                                  }
                                              >
                                                  Parameters:
                                              </AccordionSummary>
                                              <AccordionDetails>
                                                  <pre className="code">
                                                      {JSON.stringify(
                                                          conf,
                                                          null,
                                                          2
                                                      )}
                                                  </pre>
                                              </AccordionDetails>
                                          </Accordion>
                                      </Card>
                                  </AccordionDetails>
                              </Accordion>
                          </Card>
                      );
                  })
                : "No DAG runs to display."}
        </div>
    );
}

export default DagRunsList;
