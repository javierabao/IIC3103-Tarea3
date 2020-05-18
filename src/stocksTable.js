import { GoogleCharts } from 'google-charts';
import './tables.css'

export function drawTable(stocks, dictVolTot, dictAltHis, dictBajHis, dictLastPrice, dictPorc) {
    const data = new GoogleCharts.api.visualization.DataTable();
    
    data.addColumn('string', 'Acción');
    data.addColumn('number', 'Vol. Total');
    data.addColumn('number', 'Alto Hist.');
    data.addColumn('number', 'Bajo Hist.');
    data.addColumn('number', 'Último valor');
    data.addColumn('number', 'Cambio %');


    let rows = []

    stocks.forEach((stock) => {
        let row = []
        row.push(stock)
        row.push(dictVolTot[stock] ? dictVolTot[stock] : null) 
        row.push(dictAltHis[stock] ? dictAltHis[stock] : null) 
        row.push(dictBajHis[stock] ? dictBajHis[stock] : null) 
        row.push(dictLastPrice[stock] ? dictLastPrice[stock] : null) 
        row.push(dictPorc[stock] ? dictPorc[stock] : null) 
        rows.push(row)
    })

    data.addRows(rows);

    const chart = new GoogleCharts.api.visualization.Table(
        document.getElementById('stocks_table_div'),
    );

    const cssClassNames = {
        headerRow: 'cssHeaderRow',
        tableRow: 'cssTableRow',
        oddTableRow: 'cssOddTableRow',
        selectedTableRow: 'cssSelectedTableRow',
        hoverTableRow: 'cssHoverTableRow',
        hoverHeaderRow: 'cssHoverHeaderRow',
        headerCell: 'cssHeaderCell',
        tableCell: 'cssTableCell',
    };

    const options = {
        title: 'Acciones y sus parámetros',
        cssClassNames,
    };

    chart.draw(data, options);

}