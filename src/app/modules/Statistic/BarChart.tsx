import React from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface SalesBarChartProps {
    yLabel: string[];
    yTitle: string[];
    data: any[];
}

const colors = [
    { bg: "#E3F2FD", border: "#2196F3" },
    { bg: "#FCE4EC", border: "#E91E63" },
    { bg: "#E8F5E9", border: "#4CAF50" },
    { bg: "#FFF3E0", border: "#FF9800" },
    { bg: "#F3E5F5", border: "#9C27B0" },
];

const SalesBarChart: React.FC<SalesBarChartProps> = ({
    yLabel,
    yTitle,
    data,
}) => {
    const chartData = {
        labels: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ],
        datasets: yTitle?.map((item, index) => ({
            label: item,
            data: new Array(12).fill(0),
            backgroundColor: colors[index % 5].bg,
            borderColor: colors[index % 5].border,
            borderWidth: 1,
        })),
    };

    yLabel.forEach((label, index: number) => {
        data.forEach((item) => {
            const month = new Date(item.FROM_DATE).getMonth();
            chartData.datasets[index].data[month] = item[label];
        });
    });

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Amount",
                },
            },
            x: {
                title: {
                    display: true,
                    text: "Month",
                },
            },
        },
    };

    return (
        <div>
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default SalesBarChart;
