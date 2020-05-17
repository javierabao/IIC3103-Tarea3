import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import { GoogleCharts } from 'google-charts';
import { drawLineChart } from "./lineChart"
import { drawTable} from "./stocksTable"

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
        });
      });
      socket.on("BUY", (data) => {
        dictVolTot[data["ticker"]] = (dictVolTot[data["ticker"]] || 0) + data["volume"];
        if(tableTickers.indexOf(data["ticker"]) === -1) {
          tableTickers.push(data["ticker"]);
        }
        GoogleCharts.load(() => {
          drawLineChart(tickers, stocksTimeline)
          drawTable(tableTickers, dictVolTot, dictAltHis, dictBajHis, dictLastPrice, dictPorc)
        });
      });
      socket.on("SELL", (data) => {
        dictVolTot[data["ticker"]] = (dictVolTot[data["ticker"]] || 0) + data["volume"];
        if(tableTickers.indexOf(data["ticker"]) === -1) {
          tableTickers.push(data["ticker"]);
        }
        GoogleCharts.load(() => {
          drawLineChart(tickers, stocksTimeline)
          drawTable(tableTickers, dictVolTot, dictAltHis, dictBajHis, dictLastPrice, dictPorc)
        });
      });

    } else {
      socket.close();
      onSetStatus('Disconnected');
      onSetStatusButton('Connect');
    }
  }

  useEffect(() => {
    onSetStatus('Disconnected');
    onSetStatusButton('Connect');
  }, [])



  return (
    <div>
      <div style={{ textAlign: "center" }}>
        <button onClick={() => send() }>{statusButton}</button>
        <p> {status} </p>
      </div>
      <div style={{ textAlign: "center" }}>
        <div id="line_chart_div"> </div>
        <div id="stocks_table_div"> </div>
      </div>
    </div>
  );
}


export default App;