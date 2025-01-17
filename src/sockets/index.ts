// const socket = io("https://k9fs42gk-3000.inc1.devtunnels.ms/");

import io from "socket.io-client";
import usePersistStore from "../store/persistStore";
import { BASE_URL } from "../constants";
console.log("running");

// console.log(stocks, "ss");
const socket = io(BASE_URL, {
  //   path: "/socket.io/",
  transports: ["websocket", "polling"],
  secure: true,
}); // Or your server URL

socket.on("connect", () => {
  console.log("Connected to server");
  // Subscribe to specific symbols
  //   socket.emit("subscribe", "AAPL");
});

socket.on("stockUpdate", ({ symbol, data }) => {
  console.log(`Received update for ${symbol}:`, data);

  usePersistStore.setState((state) => {
    // Find the stock by symbol and update it
    const updatedStocks = state?.stocks?.map((stock) => {
      if (stock.symbol === symbol) {
        // Append the new data point to the stock's `ivData` array
        if ( 
          stock.ivData[stock.ivData.length - 1].timestamp <
          data.lastDataPoint.timestamp 
        ) {
          return {
            ...stock,
            ivData: [...(stock.ivData || []), data.lastDataPoint],
          };
        }
      }
      return stock; // Return the stock unchanged if it's not the one being updated
    });

    return { stocks: updatedStocks }; // Return the updated state
  });
});
socket.on("connect_error", (error) => {
  console.log("Connection Error:", error);
});
// Handle disconnection
socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
