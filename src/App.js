import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import { GoogleCharts } from 'google-charts';
import { drawLineChart } from "./lineChart"
import { drawTable} from "./stocksTable"
import { drawExchangesTable} from "./exchangesTable"
import { drawExInfoTable} from "./exInfoTable"
import { drawStInfoTable} from "./stInfoTable"
import './App.css';


var stocksTimeline = [];
var tickers = {};
var lastRow = [0];
var lastIndex = 1;

var tableTickers = []
var dictVolTot = {}
var dictAltHis = {}
var dictBajHis = {}
var dictLastPrice = {}
var dictPorc = {}

var exchangeByStock = {} // stock: exchange1, stock2: exchange2
var companies = {} // company_name: [ticker, country, quote_base]
var exchanges = {} // same info that server

var totalVol = 0;

var dictVolCom = {}
var dictVolVen = {}
var dictVolTotEx = {}
var dictNumAcc = {}
var dictPart = {}


function App() {
  const [status, setStatus] = useState("");
  const [statusButton, setStatusButton] = useState("");
  const [socket, setSocket] = useState("");

  const onSetStatus = (status) => {
    setStatus( status )
  }

  const onSetStatusButton = (statusButton) => {
    setStatusButton( statusButton )
  }

  const onSetSocket = (socket) => {
    setSocket( socket )
  }

  const send = () => {
    if (status === 'Disconnected') {
      const socket = socketIOClient('wss://le-18262636.bitzonte.com', {path: '/stocks', origins: '*:*', transports: ['websocket']});
      onSetSocket(socket);

      socket.on("connect", () => {
        onSetStatus('Connected');
        onSetStatusButton('Disconnect');
      });
    
      socket.emit("STOCKS")
      socket.on("STOCKS", (data) => {
        data.forEach((stock) => {
          companies[stock["company_name"]] = [stock["ticker"], stock["country"], stock["quote_base"]]
        })
      })

      socket.emit("EXCHANGES")
      socket.on("EXCHANGES", (data) => {
        Object.keys(data).forEach((exchange) => {
          let excCom = []
          exchanges[exchange] = [data[exchange]["name"], data[exchange]["country"], data[exchange]["address"]]
          data[exchange]["listed_companies"].forEach((company) => {
            exchangeByStock[companies[company][0]] = exchange;
            excCom.push(company)
          })
          dictNumAcc[exchange] = data[exchange]["listed_companies"].length;
          exchanges[exchange].push(excCom.join(", "))
        })
      })
      
      socket.on("UPDATE", (data) => {
        if (data["ticker"] in tickers) {
          let row = [].concat(lastRow);
          row[0] = new Date(data["time"])
          row[tickers[data["ticker"]]] = data["value"]
          stocksTimeline.push(row)
          lastRow = [].concat(row);
        } else {
          stocksTimeline.forEach((timeline) => {
            timeline.push(0)
          })
          tickers[data["ticker"]] = lastIndex
          lastIndex++;
          let row = [].concat(lastRow);
          row[0] = new Date(data["time"])
          row.push(data["value"])
          stocksTimeline.push(row)
          lastRow = [].concat(row);
        }
        dictAltHis[data["ticker"]] = dictAltHis[data["ticker"]] ? (data["value"] > dictAltHis[data["ticker"]] ? data["value"] : dictAltHis[data["ticker"]]) : data["value"];
        dictBajHis[data["ticker"]] = dictBajHis[data["ticker"]] ? (data["value"] < dictBajHis[data["ticker"]] ? data["value"] : dictBajHis[data["ticker"]]) : data["value"];
        dictPorc[data["ticker"]] = data["ticker"] in dictLastPrice ? ((data["value"] / dictLastPrice[data["ticker"]]) - 1) * 100 : 0;
        dictLastPrice[data["ticker"]] = data["value"]

        if(tableTickers.indexOf(data["ticker"]) === -1) {
          tableTickers.push(data["ticker"]);
        }
        GoogleCharts.load(() => {
          drawLineChart(tickers, stocksTimeline)
          drawTable(tableTickers, dictVolTot, dictAltHis, dictBajHis, dictLastPrice, dictPorc)
          drawExchangesTable(exchanges, dictVolCom, dictVolVen, dictVolTotEx, dictNumAcc, dictPart)
          drawStInfoTable(companies)
          drawExInfoTable(exchanges)
        });
      });
      socket.on("BUY", (data) => {
        // table 1
        dictVolTot[data["ticker"]] = (dictVolTot[data["ticker"]] || 0) + data["volume"];
        if(tableTickers.indexOf(data["ticker"]) === -1) {
          tableTickers.push(data["ticker"]);
        }

        // table 2
        let exc = exchangeByStock[data["ticker"]];
        dictVolCom[exc] = (dictVolCom[exc] || 0) + data["volume"];
        dictVolTotEx[exc] = (dictVolTotEx[exc] || 0) + data["volume"];
        totalVol += data["volume"];

        Object.keys(dictVolTotEx).forEach((excTot) => {
          dictPart[excTot] = dictVolTotEx[excTot] / totalVol;
        })

        // chart
        GoogleCharts.load(() => {
          drawLineChart(tickers, stocksTimeline)
          drawTable(tableTickers, dictVolTot, dictAltHis, dictBajHis, dictLastPrice, dictPorc)
          drawExchangesTable(exchanges, dictVolCom, dictVolVen, dictVolTotEx, dictNumAcc, dictPart)
          drawStInfoTable(companies)
          drawExInfoTable(exchanges)

        });
      });
      socket.on("SELL", (data) => {
        // table 1
        dictVolTot[data["ticker"]] = (dictVolTot[data["ticker"]] || 0) + data["volume"];
        if(tableTickers.indexOf(data["ticker"]) === -1) {
          tableTickers.push(data["ticker"]);
        }

        // table 2
        let exc = exchangeByStock[data["ticker"]];
        dictVolVen[exc] = (dictVolVen[exc] || 0) + data["volume"]
        dictVolTotEx[exc] = (dictVolTotEx[exc] || 0) + data["volume"];
        totalVol += data["volume"];

        Object.keys(dictVolTotEx).forEach((excTot) => {
          dictPart[excTot] = dictVolTotEx[excTot] / totalVol;
        })

        // chart
        GoogleCharts.load(() => {
          drawLineChart(tickers, stocksTimeline)
          drawTable(tableTickers, dictVolTot, dictAltHis, dictBajHis, dictLastPrice, dictPorc)
          drawExchangesTable(exchanges, dictVolCom, dictVolVen, dictVolTotEx, dictNumAcc, dictPart)
          drawStInfoTable(companies)
          drawExInfoTable(exchanges)
        });
      });
      

    } else {
      socket.close();
      onSetStatus('Disconnected');
      onSetStatusButton('Connect');
    }
  }

  useEffect(() => {
    const socket = socketIOClient('wss://le-18262636.bitzonte.com', {path: '/stocks', origins: '*:*', transports: ['websocket']});
      onSetSocket(socket);

      socket.on("connect", () => {
        onSetStatus('Connected');
        onSetStatusButton('Disconnect');
      });
    
      socket.emit("STOCKS")
      socket.on("STOCKS", (data) => {
        data.forEach((stock) => {
          companies[stock["company_name"]] = [stock["ticker"], stock["country"], stock["quote_base"]]
        })
      })

      socket.emit("EXCHANGES")
      socket.on("EXCHANGES", (data) => {
        Object.keys(data).forEach((exchange) => {
          let excCom = []
          exchanges[exchange] = [data[exchange]["name"], data[exchange]["country"], data[exchange]["address"]]
          data[exchange]["listed_companies"].forEach((company) => {
            exchangeByStock[companies[company][0]] = exchange;
            excCom.push(company)
          })
          dictNumAcc[exchange] = data[exchange]["listed_companies"].length;
          exchanges[exchange].push(excCom.join(", "))
        })
      })
      
      socket.on("UPDATE", (data) => {
        if (data["ticker"] in tickers) {
          let row = [].concat(lastRow);
          row[0] = new Date(data["time"])
          row[tickers[data["ticker"]]] = data["value"]
          stocksTimeline.push(row)
          lastRow = [].concat(row);
        } else {
          stocksTimeline.forEach((timeline) => {
            timeline.push(0)
          })
          tickers[data["ticker"]] = lastIndex
          lastIndex++;
          let row = [].concat(lastRow);
          row[0] = new Date(data["time"])
          row.push(data["value"])
          stocksTimeline.push(row)
          lastRow = [].concat(row);
        }
        dictAltHis[data["ticker"]] = dictAltHis[data["ticker"]] ? (data["value"] > dictAltHis[data["ticker"]] ? data["value"] : dictAltHis[data["ticker"]]) : data["value"];
        dictBajHis[data["ticker"]] = dictBajHis[data["ticker"]] ? (data["value"] < dictBajHis[data["ticker"]] ? data["value"] : dictBajHis[data["ticker"]]) : data["value"];
        dictPorc[data["ticker"]] = data["ticker"] in dictLastPrice ? ((data["value"] / dictLastPrice[data["ticker"]]) - 1) * 100 : 0;
        dictLastPrice[data["ticker"]] = data["value"]

        if(tableTickers.indexOf(data["ticker"]) === -1) {
          tableTickers.push(data["ticker"]);
        }
        GoogleCharts.load(() => {
          drawLineChart(tickers, stocksTimeline)
          drawTable(tableTickers, dictVolTot, dictAltHis, dictBajHis, dictLastPrice, dictPorc)
          drawExchangesTable(exchanges, dictVolCom, dictVolVen, dictVolTotEx, dictNumAcc, dictPart)
          drawStInfoTable(companies)
          drawExInfoTable(exchanges)
        });
      });
      socket.on("BUY", (data) => {
        // table 1
        dictVolTot[data["ticker"]] = (dictVolTot[data["ticker"]] || 0) + data["volume"];
        if(tableTickers.indexOf(data["ticker"]) === -1) {
          tableTickers.push(data["ticker"]);
        }

        // table 2
        let exc = exchangeByStock[data["ticker"]];
        dictVolCom[exc] = (dictVolCom[exc] || 0) + data["volume"];
        dictVolTotEx[exc] = (dictVolTotEx[exc] || 0) + data["volume"];
        totalVol += data["volume"];

        Object.keys(dictVolTotEx).forEach((excTot) => {
          dictPart[excTot] = dictVolTotEx[excTot] / totalVol;
        })

        // chart
        GoogleCharts.load(() => {
          drawLineChart(tickers, stocksTimeline)
          drawTable(tableTickers, dictVolTot, dictAltHis, dictBajHis, dictLastPrice, dictPorc)
          drawExchangesTable(exchanges, dictVolCom, dictVolVen, dictVolTotEx, dictNumAcc, dictPart)
          drawStInfoTable(companies)
          drawExInfoTable(exchanges)

        });
      });
      socket.on("SELL", (data) => {
        // table 1
        dictVolTot[data["ticker"]] = (dictVolTot[data["ticker"]] || 0) + data["volume"];
        if(tableTickers.indexOf(data["ticker"]) === -1) {
          tableTickers.push(data["ticker"]);
        }

        // table 2
        let exc = exchangeByStock[data["ticker"]];
        dictVolVen[exc] = (dictVolVen[exc] || 0) + data["volume"]
        dictVolTotEx[exc] = (dictVolTotEx[exc] || 0) + data["volume"];
        totalVol += data["volume"];

        Object.keys(dictVolTotEx).forEach((excTot) => {
          dictPart[excTot] = dictVolTotEx[excTot] / totalVol;
        })

        // chart
        GoogleCharts.load(() => {
          drawLineChart(tickers, stocksTimeline)
          drawTable(tableTickers, dictVolTot, dictAltHis, dictBajHis, dictLastPrice, dictPorc)
          drawExchangesTable(exchanges, dictVolCom, dictVolVen, dictVolTotEx, dictNumAcc, dictPart)
          drawStInfoTable(companies)
          drawExInfoTable(exchanges)
        });
      });
  }, [])



  return (
    <div>
      <div style={{textAlign: "center", justifyContent: "center"}}>
        <div style={{ textAlign: "center", fontFamily: "Raleway", fontSize: "40px", fontWeight: "bold" }}>Mercado Financiero</div>
        <button className="button" style={{verticalAlign: "middle"}} onClick={() => send() }>{statusButton}</button>
        <div style={{marginBottom: "2%"}}> {status} </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div id="line_chart_div" style={{backgroundColor: "#F0F1F2", borderRadius: "4px", marginLeft: "10%", marginRight: "10%", marginBottom: "2%", paddingTop: "20px", paddingBottom: "20px"}}> 
        </div>
      </div>
      <div style={{ textAlign: "center", alignItems: "center", justifyContent: "space-between", display: "flex", flexDirection: "row", marginLeft: "10%", marginRight: "10%", marginBottom: "2%"}}>
        <div style={{backgroundColor: "#F0F1F2", borderRadius: "4px", padding: "20px"}}> 
          <div style={{fontFamily: "Raleway", fontSize: "30px", fontWeight: "bold" }}>Cambios en acciones</div>
          <div id="stocks_table_div"></div>
        </div>
        <div style={{backgroundColor: "#F0F1F2", borderRadius: "4px", padding: "20px"}}>
          <div style={{fontFamily: "Raleway", fontSize: "30px", fontWeight: "bold" }}>Cambios en mercados</div> 
          <div id="exchanges_table_div"></div>
        </div>
      </div>
      <div style={{textAlign: "center", justifyContent: "center", backgroundColor: "#F0F1F2", padding: "20px", borderRadius: "4px", marginLeft: "10%", marginRight: "10%", marginBottom: "2%"}}>
        <div style={{fontFamily: "Raleway", fontSize: "30px", fontWeight: "bold" }}>Información de acciones</div> 
        <div id="st_info_table_div"> </div>
      </div>
      <div style={{textAlign: "center", justifyContent: "center", backgroundColor: "#F0F1F2", padding: "20px", borderRadius: "4px", marginLeft: "10%", marginRight: "10%", marginBottom: "2%"}}>
        <div style={{fontFamily: "Raleway", fontSize: "30px", fontWeight: "bold" }}>Información de mercados</div> 
        <div id="ex_info_table_div"> </div>
      </div>
    </div>
  );
}


export default App;