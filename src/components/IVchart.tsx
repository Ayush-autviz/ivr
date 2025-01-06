import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from "recharts";
import useTickerStore from "../store/tickerStore";
import { X, Minimize2, Maximize2 } from "lucide-react";
import SingleChart from "./SingleChart";
const OptionsIVChart = () => {
  const { stocks, error, setError, removeStock } = useTickerStore();
  const [minimizedCards, setMinimizedCards] = useState({});
  const [sma, setSma] = useState("None");
  const [lma, setLma] = useState("None");

  const smaOptions = ["None", "5", "10", "20", "30", "40"];
  const lmaOptions = ["None", "50", "60", "75", "90", "120", "150"];

  useEffect(() => {
    if (stocks.length < 1) {
      setError("Add at least one stock to track");
    }
  }, [stocks]);

  const toggleMinimize = (symbol) => {
    setMinimizedCards((prev) => ({
      ...prev,
      [symbol]: !prev[symbol],
    }));
  };

  return (
    <div className="flex flex-col w-full mx-10 gap-10">
      {error && (
        <div className="p-4 text-red-500 bg-red-50 rounded-lg border border-red-100">
          {error}
        </div>
      )}
      {stocks.map((stock) => (
        <SingleChart
          stock={stock}
          sma={sma}
          setSma={setSma}
          smaOptions={smaOptions}
          lma={lma}
          setLma={setLma}
          lmaOptions={lmaOptions}
          toggleMinimize={toggleMinimize}
          minimizedCards={minimizedCards}
          setMinimizedCards={setMinimizedCards}
        />
      ))}
    </div>
  );
};

export default OptionsIVChart;
