// import { BarChart } from "@mui/x-charts/BarChart";
import s from "./NerChart.module.css";

type TNerChartProps = {
    labels: string[];
    values: number[];
};

function NerChart({ labels, values }: TNerChartProps) {
    return (
        <div className={s.graphWrapper}>
            {/* <BarChart
                sx={{ marginBottom: "4rem" }}
                width={800}
                height={400}
                series={[
                    {
                        data: values,
                        id: "cId",
                    },
                ]}
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
            /> */}
            {JSON.stringify(labels)}
            {JSON.stringify(values)}
        </div>
    );
}

export default NerChart;
