import { GoogleCharts } from 'google-charts';
import './tables.css'

export function drawExInfoTable(exchangesDict) {
    const data = new GoogleCharts.api.visualization.DataTable();
    
    data.addColumn('string', 'Ticker');
    data.addColumn('string', 'Nombre');
    data.addColumn('string', 'País');
    data.addColumn('string', 'Dirección');
    data.addColumn('string', 'Empresas');


    let rows = []

    const exchanges = Object.keys(exchangesDict);

    exchanges.forEach((exchange) => {
        let row = []
        row.push(exchange)
        row.push(exchangesDict[exchange][0]) 
        row.push(exchangesDict[exchange][1]) 
        row.push(exchangesDict[exchange][2]) 
        row.push(exchangesDict[exchange][3]) 
        rows.push(row)
    })

    data.addRows(rows);

    const chart = new GoogleCharts.api.visualization.Table(
        document.getElementById('ex_info_table_div'),
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
        title: 'Exchanges Information',
        cssClassNames,
    };

    chart.draw(data, options);

}