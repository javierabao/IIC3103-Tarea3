import { GoogleCharts } from 'google-charts';

export function drawTable(stocks, dictVolTot, dictAltHis, dictBajHis, dictLastPrice, dictPorc) {
    const data = new GoogleCharts.api.visualization.DataTable();
    
    data.addColumn('string', 'Stock');
    data.addColumn('number', 'Vol. Total');
    data.addColumn('number', 'Alto historico');
    data.addColumn('number', 'Bajo historico');
    data.addColumn('number', 'Ult precio');
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

    const options = {
        title: 'Acciones y sus parámetros',
    };

    chart.draw(data, options);

}