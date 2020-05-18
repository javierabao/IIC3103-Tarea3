import { GoogleCharts } from 'google-charts';
import './tables.css'

export function drawStInfoTable(stocksDict) {
    const data = new GoogleCharts.api.visualization.DataTable();
    
    data.addColumn('string', 'Ticker');
    data.addColumn('string', 'Empresa');
    data.addColumn('string', 'País');
    data.addColumn('string', 'Moneda');

    let rows = []

    const stocks = Object.keys(stocksDict);

    stocks.forEach((stock) => {
        let row = []
        row.push(stocksDict[stock][0]) 
        row.push(stock)
        row.push(stocksDict[stock][1]) 
        row.push(stocksDict[stock][2]) 
        rows.push(row)
    })

    data.addRows(rows);

    const chart = new GoogleCharts.api.visualization.Table(
        document.getElementById('st_info_table_div'),
    );

    const cssClassNames = {
        headerRow: 'cssInfoHeaderRow',
        tableRow: 'cssTableRow',
        oddTableRow: 'cssOddTableRow',
        selectedTableRow: 'cssSelectedTableRow',
        hoverTableRow: 'cssHoverTableRow',
        hoverHeaderRow: 'cssHoverHeaderRow',
        headerCell: 'cssHeaderCell',
        tableCell: 'cssTableCell',
    };

    const options = {
        title: 'Stocks y sus empresas',
        cssClassNames,
    };

    chart.draw(data, options);

}