// const data =  [
//       {
//         "break_even_price": 13.45,
//         "day": {

import { useState } from "react";
import useTickerStore from "../store/tickerStore";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

//         },
//         "details": {
//           "contract_type": "call",
//           "exercise_style": "american",
//           "expiration_date": "2025-01-17",
//           "shares_per_contract": 100,
//           "strike_price": 5,
//           "ticker": "O:EVRI250117C00005000"
//         },
//         "greeks": {

//         },
//         "last_quote": {
//           "ask": 10.5,
//           "ask_size": 1,
//           "ask_exchange": 325,
//           "bid": 6.4,
//           "bid_size": 10,
//           "bid_exchange": 323,
//           "last_updated": 1.7355845248941184e+18,
//           "midpoint": 8.45,
//           "timeframe": "REAL-TIME"
//         },
//         "last_trade": {

//         },
//         "open_interest": 0,
//         "underlying_asset": {
//           "change_to_break_even": -0.03,
//           "last_updated": 1.7356032000032904e+18,
//           "price": 13.48,
//           "ticker": "EVRI",
//           "timeframe": "REAL-TIME"
//         }
//       },
//       {
//         "break_even_price": 13.1,
//         "day": {

//         },
//         "details": {
//           "contract_type": "call",
//           "exercise_style": "american",
//           "expiration_date": "2025-01-17",
//           "shares_per_contract": 100,
//           "strike_price": 6,
//           "ticker": "O:EVRI250117C00006000"
//         },
//         "greeks": {

//         },
//         "last_quote": {
//           "ask": 8.6,
//           "ask_size": 10,
//           "ask_exchange": 318,
//           "bid": 5.6,
//           "bid_size": 10,
//           "bid_exchange": 318,
//           "last_updated": 1.7355923293675236e+18,
//           "midpoint": 7.1,
//           "timeframe": "REAL-TIME"
//         },
//         "last_trade": {

//         },
//         "open_interest": 0,
//         "underlying_asset": {
//           "change_to_break_even": -0.38,
//           "last_updated": 1.7356032000032904e+18,
//           "price": 13.48,
//           "ticker": "EVRI",
//           "timeframe": "REAL-TIME"
//         }
//       },
//       {
//         "break_even_price": 13.6,
//         "day": {

//         },
//         "details": {
//           "contract_type": "call",
//           "exercise_style": "american",
//           "expiration_date": "2025-01-17",
//           "shares_per_contract": 100,
//           "strike_price": 7,
//           "ticker": "O:EVRI250117C00007000"
//         },
//         "greeks": {
//           "delta": 0.961905314116602,
//           "gamma": 0.0145651966791445,
//           "theta": -0.0143430004328131,
//           "vega": 0.00211747347494954
//         },
//         "implied_volatility": 1.93003522654928,
//         "last_quote": {
//           "ask": 8.7,
//           "ask_size": 10,
//           "ask_exchange": 318,
//           "bid": 4.5,
//           "bid_size": 10,
//           "bid_exchange": 318,
//           "last_updated": 1.7355923900402793e+18,
//           "midpoint": 6.6,
//           "timeframe": "REAL-TIME"
//         },
//         "last_trade": {

//         },
//         "open_interest": 0,
//         "underlying_asset": {
//           "change_to_break_even": 0.12,
//           "last_updated": 1.7356032000032904e+18,
//           "price": 13.48,
//           "ticker": "EVRI",
//           "timeframe": "REAL-TIME"
//         }
//       },
//       {
//         "break_even_price": 13.65,
//         "day": {

//         },
//         "details": {
//           "contract_type": "call",
//           "exercise_style": "american",
//           "expiration_date": "2025-01-17",
//           "shares_per_contract": 100,
//           "strike_price": 8,
//           "ticker": "O:EVRI250117C00008000"
//         },
//         "greeks": {
//           "delta": 0.941957873208885,
//           "gamma": 0.0226456850680087,
//           "theta": -0.0178485879020459,
//           "vega": 0.00392773565780022
//         },
//         "implied_volatility": 1.73282301535536,
//         "last_quote": {
//           "ask": 7.7,
//           "ask_size": 11,
//           "ask_exchange": 312,
//           "bid": 3.6,
//           "bid_size": 1,
//           "bid_exchange": 325,
//           "last_updated": 1.735591800937541e+18,
//           "midpoint": 5.65,
//           "timeframe": "REAL-TIME"
//         },
//         "last_trade": {

//         },
//         "open_interest": 0,
//         "underlying_asset": {
//           "change_to_break_even": 0.17,
//           "last_updated": 1.7356032000032904e+18,
//           "price": 13.48,
//           "ticker": "EVRI",
//           "timeframe": "REAL-TIME"
//         }
//       },
//       {
//         "break_even_price": 13.95,
//         "day": {

//         },
//         "details": {
//           "contract_type": "call",
//           "exercise_style": "american",
//           "expiration_date": "2025-01-17",
//           "shares_per_contract": 100,
//           "strike_price": 9,
//           "ticker": "O:EVRI250117C00009000"
//         },
//         "greeks": {
//           "delta": 0.875621681205429,
//           "gamma": 0.0351791753375249,
//           "theta": -0.0349995976302264,
//           "vega": 0.00623336785947832
//         },
//         "implied_volatility": 1.97116053654364,
//         "last_quote": {
//           "ask": 5.7,
//           "ask_size": 10,
//           "ask_exchange": 318,
//           "bid": 4.2,
//           "bid_size": 201,
//           "bid_exchange": 301,
//           "last_updated": 1.735584507390843e+18,
//           "midpoint": 4.95,
//           "timeframe": "REAL-TIME"
//         },
//         "last_trade": {

//         },
//         "open_interest": 0,
//         "underlying_asset": {
//           "change_to_break_even": 0.47,
//           "last_updated": 1.7356032000032904e+18,
//           "price": 13.48,
//           "ticker": "EVRI",
//           "timeframe": "REAL-TIME"
//         }
//       },
//       {
//         "break_even_price": 13.9,
//         "day": {
//           "change": 0,
//           "change_percent": 0,
//           "close": 4.08,
//           "high": 4.08,
//           "last_updated": 1.7344692e+18,
//           "low": 3.57,
//           "open": 3.57,
//           "previous_close": 4.08,
//           "volume": 8,
//           "vwap": 3.825
//         },
//         "details": {
//           "contract_type": "call",
//           "exercise_style": "american",
//           "expiration_date": "2025-01-17",
//           "shares_per_contract": 100,
//           "strike_price": 10,
//           "ticker": "O:EVRI250117C00010000"
//         },
//         "greeks": {
//           "delta": 0.856123208122506,
//           "gamma": 0.0503174684919215,
//           "theta": -0.0301943312236778,
//           "vega": 0.00662762371618827
//         },
//         "implied_volatility": 1.52640008267088,
//         "last_quote": {
//           "ask": 4.6,
//           "ask_size": 10,
//           "ask_exchange": 318,
//           "bid": 3.2,
//           "bid_size": 202,
//           "bid_exchange": 301,
//           "last_updated": 1.7355845240693435e+18,
//           "midpoint": 3.9,
//           "timeframe": "REAL-TIME"
//         },
//         "last_trade": {
//           "sip_timestamp": 1.734465192919e+18,
//           "conditions": [232],
//           "price": 4.08,
//           "size": 4,
//           "exchange": 312,
//           "timeframe": "REAL-TIME"
//         },
//         "open_interest": 12,
//         "underlying_asset": {
//           "change_to_break_even": 0.42,
//           "last_updated": 1.7356032000032904e+18,
//           "price": 13.48,
//           "ticker": "EVRI",
//           "timeframe": "REAL-TIME"
//         }
//       },
//       {
//         "break_even_price": 13.25,
//         "day": {

//         },
//         "details": {
//           "contract_type": "call",
//           "exercise_style": "american",
//           "expiration_date": "2025-01-17",
//           "shares_per_contract": 100,
//           "strike_price": 11,
//           "ticker": "O:EVRI250117C00011000"
//         },
//         "greeks": {

//         },
//         "last_quote": {
//           "ask": 3.3,
//           "ask_size": 10,
//           "ask_exchange": 318,
//           "bid": 1.2,
//           "bid_size": 10,
//           "bid_exchange": 318,
//           "last_updated": 1.735589857482834e+18,
//           "midpoint": 2.25,
//           "timeframe": "REAL-TIME"
//         },
//         "last_trade": {

//         },
//         "open_interest": 0,
//         "underlying_asset": {
//           "change_to_break_even": -0.23,
//           "last_updated": 1.7356032000032904e+18,
//           "price": 13.48,
//           "ticker": "EVRI",
//           "timeframe": "REAL-TIME"
//         }
//       },
//       {
//         "break_even_price": 14.275,
//         "day": {

//         },
//         "details": {
//           "contract_type": "call",
//           "exercise_style": "american",
//           "expiration_date": "2025-01-17",
//           "shares_per_contract": 100,
//           "strike_price": 12,
//           "ticker": "O:EVRI250117C00012000"
//         },
//         "greeks": {
//           "delta": 0.715345068108025,
//           "gamma": 0.0926847209777008,
//           "theta": -0.0371541961400968,
//           "vega": 0.00956416498739118
//         },
//         "implied_volatility": 1.25238801037566,
//         "last_quote": {
//           "ask": 3.7,
//           "ask_size": 10,
//           "ask_exchange": 323,
//           "bid": 0.85,
//           "bid_size": 1,
//           "bid_exchange": 325,
//           "last_updated": 1.7355845248942088e+18,
//           "midpoint": 2.275,
//           "timeframe": "REAL-TIME"
//         },
//         "last_trade": {

//         },
//         "open_interest": 0,
//         "underlying_asset": {
//           "change_to_break_even": 0.795,
//           "last_updated": 1.7356032000032904e+18,
//           "price": 13.48,
//           "ticker": "EVRI",
//           "timeframe": "REAL-TIME"
//         }
//       },
//       {
//         "break_even_price": 13.675,
//         "day": {
//           "change": 0,
//           "change_percent": 0,
//           "close": 1.32,
//           "high": 1.32,
//           "last_updated": 1.7344692e+18,
//           "low": 0.77,
//           "open": 0.77,
//           "previous_close": 1.32,
//           "volume": 8,
//           "vwap": 1.045
//         },
//         "details": {
//           "contract_type": "call",
//           "exercise_style": "american",
//           "expiration_date": "2025-01-17",
//           "shares_per_contract": 100,
//           "strike_price": 13,
//           "ticker": "O:EVRI250117C00013000"
//         },
//         "greeks": {
//           "delta": 0.722798675610141,
//           "gamma": 0.363885243191361,
//           "theta": -0.0099734955403019,
//           "vega": 0.00990655642077271
//         },
//         "implied_volatility": 0.312534474085815,
//         "last_quote": {
//           "ask": 1,
//           "ask_size": 10,
//           "ask_exchange": 318,
//           "bid": 0.35,
//           "bid_size": 202,
//           "bid_exchange": 301,
//           "last_updated": 1.7355922297404073e+18,
//           "midpoint": 0.675,
//           "timeframe": "REAL-TIME"
//         },
//         "last_trade": {
//           "sip_timestamp": 1.734465192919e+18,
//           "conditions": [232],
//           "price": 1.32,
//           "size": 4,
//           "exchange": 312,
//           "timeframe": "REAL-TIME"
//         },
//         "open_interest": 12,
//         "underlying_asset": {
//           "change_to_break_even": 0.195,
//           "last_updated": 1.7356032000032904e+18,
//           "price": 13.48,
//           "ticker": "EVRI",
//           "timeframe": "REAL-TIME"
//         }
//       },
//       {
//         "break_even_price": 19,
//         "day": {

//         },
//         "details": {
//           "contract_type": "call",
//           "exercise_style": "american",
//           "expiration_date": "2025-01-17",
//           "shares_per_contract": 100,
//           "strike_price": 14,
//           "ticker": "O:EVRI250117C00014000"
//         },
//         "greeks": {

//         },
//         "last_quote": {
//           "ask": 10,
//           "ask_size": 1,
//           "ask_exchange": 320,
//           "bid": 0,
//           "bid_size": 0,
//           "bid_exchange": 320,
//           "last_updated": 1.7355690015629548e+18,
//           "midpoint": 5,
//           "timeframe": "REAL-TIME"
//         },
//         "last_trade": {

//         },
//         "open_interest": 0,
//         "underlying_asset": {
//           "change_to_break_even": 5.52,
//           "last_updated": 1.7356032000032904e+18,
//           "price": 13.48,
//           "ticker": "EVRI",
//           "timeframe": "REAL-TIME"
//         }
//       }
//     ];

const currentPrice = 13;

const OptionChain = ({ data }) => {
  const {
    belowCurrentPriceCall,
    aboveCurrentPriceCall,
    belowCurrentPricePut,
    aboveCurrentPricePut,
    currentPriceCall,
  } = data;
  const navigate = useNavigate()

  const [calls, setCalls] = useState([]);
  const [puts, setPuts] = useState([]);
  const [monitorLoading, setMonitorLoading] = useState(false);
  const [monitorError, setMonitorError] = useState(false);

  const { setTickers } = useTickerStore();

  const handleMonitor = () => {
    const length = calls.length + puts.length;
    if(length<2){
      setMonitorError('Select atleast two contracts to track');
      setTimeout(() => {
        setMonitorError(false);
      }, 2000);
      return
    }
    setMonitorLoading(true);
    setTickers([...calls, ...puts]);
    setTimeout(() => {
      setMonitorLoading(false);
      navigate('monitor');
    }, 3000);
  }

  console.log(calls, puts, "belowprice");

  const handleSelection = (type, row) => {
    if (type === "call") {
      if (calls.includes(row.details.ticker)) {
        setCalls(calls.filter((item) => item !== row.details.ticker)); // Update state with filtered array
      } else {
        setCalls([...calls, row.details.ticker]); // Add the row to the calls array
      }
    } else {
      if (puts.includes(row.details.ticker)) {
        setPuts(puts.filter((item) => item !== row.details.ticker)); // Update state with filtered array
      } else {
        setPuts([...puts, row.details.ticker]); // Add the row to the puts array
      }
    }
  };

  return (
    <div className="overflow-hidden flex flex-col w-[100%]">
      <div onClick={handleMonitor} className=" cursor-pointer flex justify-end items-center  text-sm mb-5 ">
        <div className="rounded-full w-fit py-2 px-4 font-medium bg-gray-800 flex flex-row items-center justify-center gap-5">

          <div className="text-white">Monitor</div>
          {monitorLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
            </div>
          ) : (
            <ArrowUpRight color="white" size={20} />
          )}
        </div>
      </div>
      {monitorError && (
            <div className="text-red-500 text-sm  font-medium  text-right w-full mb-3 -mt-2">
            {monitorError}
            </div>
          )}
      <div className=" border rounded-2xl overflow-hidden stock-td">
        <div className="p-3 bg-gray-100 text-center font-bold text-gray-800 flex flex-row justify-between">
          <div className="w-[45%]">Call</div>
          <div className="w-[45%]">Put</div>
        </div>
        <div className="flex">
          {/* Left section */}
          <div className="w-[45%] overflow-x-auto no-scrollbar">
            {/* <div className="p-3 bg-gray-100 text-center font-bold text-gray-800">Call</div> */}
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="bg-gray-50 border-b-[2px] border-solid border-gray-600">
                  <th className="p-3 text-center font-semibold text-nowrap text-gray-600 border-b">
                    Vega
                  </th>
                  <th className="p-3 text-center font-semibold text-nowrap text-gray-600 border-b">
                    Theta
                  </th>
                  <th className="p-3 text-center font-semibold text-nowrap text-gray-600 border-b">
                    IV%
                  </th>
                  <th className="p-3 text-center font-semibold text-nowrap text-gray-600 border-b">
                    Vol
                  </th>
                  <th className="p-3 text-center font-semibold text-nowrap text-gray-600 border-b">
                    OI
                  </th>
                  <th className="p-3 text-center font-semibold text-nowrap text-gray-600 border-b">
                    Spread
                  </th>
                  <th className="p-3 text-center font-semibold text-nowrap text-gray-600 border-b">
                    Ask Size
                  </th>
                  <th className="p-3 text-center font-semibold text-nowrap text-gray-600 border-b">
                    Ask $
                  </th>
                  <th className="p-3 text-center font-semibold text-nowrap text-gray-600 border-b">
                    Bid Size
                  </th>
                  <th className="p-3 text-center font-semibold text-nowrap text-gray-600 border-b">
                    Bid $
                  </th>
                  {/* <th className="p-3 text-center font-semibold text-nowrap text-gray-600 border-b">
                  DFM
                </th> */}
                  <th className="p-3 text-center font-semibold text-gray-600 border-b">
                    Select
                  </th>
                </tr>
              </thead>
              <tbody>
                {belowCurrentPriceCall?.map((row, index) => (
                  <tr
                    key={`left-above-${index}`}
                    className={`${index % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                      } hover:bg-blue-50/50 transition-colors border-b-[2px] border-solid border-gray-600`}
                  >
                    <td className="p-3 border-b text-center border-gray-100">
                      {/* {
                        row?.greeks?.vega !== undefined &&
                          row?.last_quote?.ask > 0 &&
                          row?.last_quote?.bid !== undefined
                          ? (
                            ((row.greeks?.vega / row.last_quote.ask) +
                              row.last_quote.bid / 2) *
                            100
                          ).toFixed(2) + "%"
                          : "N/A"
                      } */}

                      {
                        row?.greeks?.vega !== undefined &&
                          row?.last_quote?.ask > 0 &&
                          row?.last_quote?.bid !== undefined
                          ? (
                            (row?.greeks?.vega / ((row.last_quote.bid + row.last_quote.ask) / 2)) *
                            100
                          ).toFixed(2) + "%"
                          : "N/A"
                      }
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">

                      {
                        row?.greeks?.theta !== undefined &&
                          row?.last_quote?.ask > 0 &&
                          row?.last_quote?.bid !== undefined
                          ? (
                            (row?.greeks?.theta / ((row.last_quote.bid + row.last_quote.ask) / 2)) *
                            100
                          ).toFixed(2) + "%"
                          : "N/A"
                      }
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {(row.implied_volatility
                        ? (row.implied_volatility * 100).toFixed(2)
                        : "N/A") + "%"}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {row.day.volume.toLocaleString("en-US") || "N/A"}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {row.open_interest.toLocaleString("en-US") || "N/A"}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {(
                        ((row.last_quote.ask - row.last_quote.bid) /
                          ((row.last_quote.ask + row.last_quote.bid) / 2)) *
                        100 || 0
                      ).toFixed(2) + "%"}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {row.last_quote.ask_size}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      ${row.last_quote.ask}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {row.last_quote.bid_size}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      ${row.last_quote.bid}
                    </td>
                    {/* <td className="p-3 border-b text-center border-gray-100">
                    {(
                      ((row.details.strike_price - currentPriceCall) /
                        row.details.strike_price) *
                      100
                    ).toFixed(2)}
                    %
                  </td> */}
                    <td className="p-3 border-b text-center border-gray-100">
                      <input
                        type="checkbox"
                        checked={calls.includes(row.details.ticker)}
                        onChange={() => handleSelection("call", row)}
                      />
                    </td>
                  </tr>
                ))}
                <tr className="bg-blue-100 border-b-[2px] border-solid border-gray-600">
                  <td
                    className="p-3 text-center font-bold text-blue-800"
                    colSpan={12}
                  >
                    <>&nbsp;</>
                  </td>
                </tr>
                {aboveCurrentPriceCall?.map((row, index) => (
                  <tr
                    key={`left-below-${index}`}
                    className={`${index % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                      } hover:bg-blue-50/50 transition-colors border-b-[2px] border-solid border-gray-600`}
                  >
                    <td className="p-3 border-b text-center border-gray-100">
                      {
                        row?.greeks?.vega !== undefined &&
                          row?.last_quote?.ask > 0 &&
                          row?.last_quote?.bid !== undefined
                          ? (
                            (row?.greeks?.vega / ((row.last_quote.bid + row.last_quote.ask) / 2)) *
                            100
                          ).toFixed(2) + "%"
                          : "N/A"
                      }
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {
                        row?.greeks?.theta !== undefined &&
                          row?.last_quote?.ask > 0 &&
                          row?.last_quote?.bid !== undefined
                          ? (
                            (row?.greeks?.theta / ((row.last_quote.bid + row.last_quote.ask) / 2)) *
                            100
                          ).toFixed(2) + "%"
                          : "N/A"
                      }

                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {(row.implied_volatility
                        ? (row.implied_volatility * 100).toFixed(2)
                        : "N/A") + "%"}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {row.day.volume.toLocaleString("en-US") || "N/A"}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {row.open_interest.toLocaleString("en-US") || "N/A"}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {(
                        ((row.last_quote.ask - row.last_quote.bid) /
                          ((row.last_quote.ask + row.last_quote.bid) / 2)) *
                        100 || 0
                      ).toFixed(2) + "%"}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {row.last_quote.ask_size}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      ${row.last_quote.ask}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {row.last_quote.bid_size}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      ${row.last_quote.bid}
                    </td>
                    {/* <td className="p-3 border-b text-center border-gray-100">
                    {(
                      ((row.details.strike_price - currentPriceCall) /
                        row.details.strike_price) *
                      100
                    ).toFixed(2)}
                    %
                  </td> */}
                    <td className="p-3 border-b text-center border-gray-100">
                      <input
                        type="checkbox"
                        checked={calls.includes(row.details.ticker)}
                        onChange={() => handleSelection("call", row)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fixed middle section */}
          <div className="w-[10%] bg-gray-100">
            {/* <div className="p-3 bg-gray-100 text-center font-bold text-gray-800"><>&nbsp;</></div> */}
            <table className="w-full  text-[11px] bg-blue-50">
              <thead>
                <tr className="border-b-[2px] border-solid border-gray-600">
                  <th className="p-3 text-center  font-bold text-gray-800 border-b">
                    Strike
                  </th>
                  <th className="p-3 text-center font-bold text-nowrap text-gray-600 border-b">
                    DFM
                  </th>
                </tr>
              </thead>
              <tbody>
                {belowCurrentPriceCall?.map((row, index) => (
                  <tr
                    key={`strike-above-${index}`}
                    className="hover:bg-blue-50/50 transition-colors border-b-[2px] border-solid border-gray-600"
                  >
                    <td className="p-3  border-gray-100 text-center font-medium">
                      {row.details.strike_price}
                    </td>
                    <td className="p-3  text-center font-medium border-gray-100">
                      {(
                        ((row.details.strike_price - currentPriceCall) /
                          row.details.strike_price) *
                        100
                      ).toFixed(2)}
                      %
                    </td>
                  </tr>
                ))}

                <tr className="bg-blue-100 border-b-[2px] border-solid border-gray-600">
                  <td
                    className="p-3 text-center text-[15px] font-bold text-blue-800"
                    colSpan={2}
                  >
                    {currentPriceCall}
                  </td>
                </tr>

                {aboveCurrentPriceCall?.map((row, index) => (
                  <tr
                    key={`strike-below-${index}`}
                    className="hover:bg-blue-50/50 transition-colors border-b-[2px] border-solid border-gray-600"
                  >
                    <td className="p-3  border-gray-100 text-center font-medium">
                      {row.details.strike_price}
                    </td>

                    <td className="p-3  text-center border-gray-100">
                      {(
                        ((row.details.strike_price - currentPriceCall) /
                          row.details.strike_price) *
                        100
                      ).toFixed(2)}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right section */}
          <div className="w-[45%] overflow-x-auto no-scrollbar">
            {/* <div className="p-3 bg-gray-100 text-center  font-bold text-gray-800">Put</div> */}
            <table className="w-full border-collapse   text-[11px] ">
              <thead>
                <tr className="bg-gray-50 border-b-[2px] border-solid border-gray-600">
                  <th className="p-3 text-center font-semibold text-gray-600 border-b">
                    Select
                  </th>

                  <th className="p-3 text-center font-semibold text-nowrap text-gray-600 border-b">
                    Bid $
                  </th>
                  <th className="p-3 text-center font-semibold text-nowrap text-gray-600 border-b">
                    Bid Size
                  </th>
                  <th className="p-3 text-center font-semibold text-nowrap text-gray-600 border-b">
                    Ask $
                  </th>
                  <th className="p-3 text-center font-semibold text-nowrap text-gray-600 border-b">
                    Ask Size
                  </th>
                  <th className="p-3 text-center font-semibold text-nowrap text-gray-600 border-b">
                    Spread
                  </th>
                  <th className="p-3 text-center font-semibold text-nowrap text-gray-600 border-b">
                    OI
                  </th>
                  <th className="p-3 text-center font-semibold text-nowrap text-gray-600 border-b">
                    Vol
                  </th>
                  <th className="p-3 text-center font-semibold text-nowrap text-gray-600 border-b">
                    IV%
                  </th>
                  <th className="p-3 text-center font-semibold text-nowrap text-gray-600 border-b">
                    Theta
                  </th>
                  <th className="p-3 text-center font-semibold text-nowrap text-gray-600 border-b">
                    Vega
                  </th>
                </tr>
              </thead>
              <tbody>
                {belowCurrentPricePut?.map((row, index) => (
                  <tr
                    key={`right-above-${index}`}
                    className={`${index % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                      } hover:bg-blue-50/50 transition-colors border-b-[2px] border-solid border-gray-600`}
                  >
                    <td className="p-3 border-b text-center border-gray-100">
                      <input
                        type="checkbox"
                        checked={puts.includes(row.details.ticker)}
                        onChange={() => handleSelection("put", row)}
                      />
                    </td>

                    <td className="p-3 border-b text-center border-gray-100">
                      ${row.last_quote.bid}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {row.last_quote.bid_size}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      ${row.last_quote.ask}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {row.last_quote.ask_size}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {(
                        ((row.last_quote.ask - row.last_quote.bid) /
                          ((row.last_quote.ask + row.last_quote.bid) / 2)) *
                        100 || 0
                      ).toFixed(2) + "%"}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {row.open_interest.toLocaleString("en-US") || "N/A"}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {row.day.volume.toLocaleString("en-US") || "N/A"}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {(row.implied_volatility
                        ? (row.implied_volatility * 100).toFixed(2)
                        : "N/A") + "%"}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {
                        row?.greeks?.theta !== undefined &&
                          row?.last_quote?.ask > 0 &&
                          row?.last_quote?.bid !== undefined
                          ? (
                            (row?.greeks?.theta / ((row.last_quote.bid + row.last_quote.ask) / 2)) *
                            100
                          ).toFixed(2) + "%"
                          : "N/A"
                      }

                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {
                        row?.greeks?.vega !== undefined &&
                          row?.last_quote?.ask > 0 &&
                          row?.last_quote?.bid !== undefined
                          ? (
                            (row?.greeks?.vega / ((row.last_quote.bid + row.last_quote.ask) / 2)) *
                            100
                          ).toFixed(2) + "%"
                          : "N/A"
                      }
                    </td>
                  </tr>
                ))}
                <tr className="bg-blue-100 border-b-[2px] border-solid border-gray-600">
                  <td
                    className="p-3 text-center font-bold text-blue-800"
                    colSpan={12}
                  >
                    <>&nbsp;</>
                  </td>
                </tr>
                {aboveCurrentPricePut?.map((row, index) => (
                  <tr
                    key={`right-below-${index}`}
                    className={`${index % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                      } hover:bg-blue-50/50 transition-colors border-b-[2px] border-solid border-gray-600`}
                  >
                    <td className="p-3 border-b text-center border-gray-100">
                      <input
                        type="checkbox"
                        checked={puts.includes(row.details.ticker)}
                        onChange={() => handleSelection("put", row)}
                      />
                    </td>
                    {/* <td className="p-3 border-b text-center border-gray-100">
                    {(
                      ((row.details.strike_price - currentPriceCall) /
                        row.details.strike_price) *
                      100
                    ).toFixed(2)}
                    %
                  </td> */}
                    <td className="p-3 border-b text-center border-gray-100">
                      ${row.last_quote.bid}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {row.last_quote.bid_size}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      ${row.last_quote.ask}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {row.last_quote.ask_size}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {(
                        ((row.last_quote.ask - row.last_quote.bid) /
                          ((row.last_quote.ask + row.last_quote.bid) / 2)) *
                        100 || 0
                      ).toFixed(2) + "%"}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {row.open_interest.toLocaleString("en-US") || "N/A"}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {row.day.volume.toLocaleString("en-US") || "N/A"}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {(row.implied_volatility
                        ? (row.implied_volatility * 100).toFixed(2)
                        : "N/A") + "%"}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {
                        row?.greeks?.theta !== undefined &&
                          row?.last_quote?.ask > 0 &&
                          row?.last_quote?.bid !== undefined
                          ? (
                            (row?.greeks?.theta / ((row.last_quote.bid + row.last_quote.ask) / 2)) *
                            100
                          ).toFixed(2) + "%"
                          : "N/A"
                      }

                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {
                        row?.greeks?.vega !== undefined &&
                          row?.last_quote?.ask > 0 &&
                          row?.last_quote?.bid !== undefined
                          ? (
                            (row?.greeks?.vega / ((row.last_quote.bid + row.last_quote.ask) / 2)) *
                            100
                          ).toFixed(2) + "%"
                          : "N/A"
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionChain;
