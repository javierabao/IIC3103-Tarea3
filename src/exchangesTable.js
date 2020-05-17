import { GoogleCharts } from 'google-charts';

export function drawExchangesTable(exchangesDict, dictVolCom, dictVolVen, dictVolTotEx, dictNumAcc, dictPart) {
    const data = new GoogleCharts.api.visualization.DataTable();
    
    data.addColumn('string', 'Exchange');
    data.addColumn('number', 'Vol. Compra');
    data.addColumn('number', 'Vol. Venta');
    data.addColumn('number', 'Vol. Total');
    data.addColumn('number', 'Num acciones');
    data.addColumn('number', '% Participacion');


    let rows = []

    const exchanges = Object.keys(exchangesDict);

    exchanges.forEach((exchange) => {
        let row = []
        row.push(exchange)
        row.push(dictVolCom[exchange] ? dictVolCom[exchange] : null) 
        row.push(dictVolVen[exchange] ? dictVolVen[exchange] : null) 
        row.push(dictVolTotEx[exchange] ? dictVolTotEx[exchange] : null) 
        row.push(dictNumAcc[exchange] ? dictNumAcc[exchange] : null) 
        row.push(dictPart[exchange] ? dictPart[exchange] : null) 
        rows.push(row)
    })

    data.addRows(rows);

    const chart = new GoogleCharts.api.visualization.Table(
        document.getElementById('exchanges_table_div'),
    );

    const options = {
        title: 'Exchanges y sus parámetros',
    };

    chart.draw(data, options);

}