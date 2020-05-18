import { GoogleCharts } from 'google-charts';

export function drawLineChart(tickers, rows) {
    const data = new GoogleCharts.api.visualization.DataTable();
    data.addColumn('datetime', 'Time');

    const stocks = Object.keys(tickers);

    stocks.forEach((stock) => {
        data.addColumn('number', stock);  
    })

    data.addRows(rows);

    const chart = new GoogleCharts.api.visualization.LineChart(
        document.getElementById('line_chart_div'),
    );

    const options = {
        title: 'Acciones en el Tiempo',
        titleTextStyle: {
            color: '#f4511e',
            fontSize: 28,
            fontName: 'Raleway',
            bold: true,
            italic: false,
        },
        hAxis: {
            title: 'Tiempo',
            format: 'hh:mm:ss',
            gridlines: {count: 15},
            titleTextStyle: {
                fontName: 'Lato',
                bold: true,
                italic: false,
            },
            textStyle: {
                fontName: 'Lato',
                bold: true,
            },
        },
        vAxis: {
        title: 'Precio',
            titleTextStyle: {
                fontName: 'Lato',
                bold: true,
                italic: false,
            },
            textStyle: {
                fontName: 'Lato',
                bold: true,
            },
        },
        chartArea: {
            backgroundColor: '#F0F1F2',
        },
        backgroundColor: '#F0F1F2',
        tooltip: {
            textStyle: {
                fontName: 'Raleway',
            }
        },
        legend: {
            textStyle: {
                fontName: 'Raleway',
            }
        }
    };

    chart.draw(data, options);

}