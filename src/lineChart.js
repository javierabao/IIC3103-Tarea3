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
        hAxis: {
            format: 'hh:mm:ss',
            gridlines: {count: 15}
        },
    };

    chart.draw(data, options);

}