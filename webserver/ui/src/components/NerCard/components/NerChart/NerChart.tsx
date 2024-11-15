import s from "./NerChart.module.css";

import Paper from "@mui/material/Paper";
import { BarChart } from "@mui/x-charts/BarChart";

type TNerChartProps = {
    labels: string[];
    values: number[];
};

function NerChart({ labels, values }: TNerChartProps) {
    return (
        <div className={s.graphWrapper}>
            <Paper sx={{ width: "800px", height: "400px" }} elevation={1}>
                <BarChart
                    xAxis={[
                        {
                            data: labels,
                            scaleType: "band",

                            tickLabelStyle: {
                                angle: 90,
                                textAnchor: "start",
                                fontSize: 10,
                            },
                        },
                    ]}
                    series={[
                        {
                            data: values,
                            id: "cId",
                            type: "bar",
                        },
                    ]}
                />
            </Paper>
        </div>
    );
}

export default NerChart;
