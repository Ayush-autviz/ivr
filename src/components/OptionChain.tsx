
import { useState } from "react";
import useTickerStore from "../store/tickerStore";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAnalysisStore from "../store/OptionStore";


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
  const [callsRow,setCallsRow] = useState([]);
  const [putsRow,setPutsRow] = useState([]);
  const [monitorLoading, setMonitorLoading] = useState(false);
  const [monitorError, setMonitorError] = useState(false);

  const { setTickers,setTicker,addStock } = useTickerStore();
  const {ticker} = useAnalysisStore();
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
    setTicker(ticker);

    const allData = [...callsRow,...putsRow]

    const tickers = allData.map((item) => item.details.ticker).join(',');

    // Generate the tracking string
    const tracking = allData
      .map((item) => `${item.details.strike_price} ${item.details.contract_type}`)
      .join(', ');

    console.log({
      symbol:ticker,
      tickers:tickers,
      tracking: tracking
    })

    addStock({
      symbol:ticker,
      tickers:tickers,
      tracking: tracking
    })
   // setTickers([...callsRow, ...putsRow]);
    setTimeout(() => {
      setMonitorLoading(false);
      navigate('monitor');
    }, 3000);
  }


  console.log(callsRow, putsRow, "belowprice");

  const handleSelection = (type, row) => {
    if (type === "call") {
      if (calls.includes(row.details.ticker)) {
        setCalls(calls.filter((item) => item !== row.details.ticker)); // Update state with filtered array
        setCallsRow(callsRow.filter((item)=>item.details.ticker !== row.details.ticker))
      } else {
        setCalls([...calls, row.details.ticker]); // Add the row to the calls array
        setCallsRow([...callsRow, row]);
      }
    } else {
      if (puts.includes(row.details.ticker)) {
        setPuts(puts.filter((item) => item !== row.details.ticker)); // Update state with filtered array
        setPutsRow(putsRow.filter((item)=>item.details.ticker !== row.details.ticker))
      } else {
        setPuts([...puts, row.details.ticker]); // Add the row to the puts array
        setPutsRow([...putsRow, row]);
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
                    <td className="p-3 border-b text-center font-semibold border-gray-100">
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
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.last_quote.ask)}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {row.last_quote.bid_size}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.last_quote.bid)}
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
                    <td className="p-3 border-b text-center font-semibold border-gray-100">
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
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.last_quote.ask)}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {row.last_quote.bid_size}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.last_quote.bid)}
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
                  <th className="p-3 text-center font-bold text-nowrap text-gray-800 border-b">
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
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.last_quote.bid)}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {row.last_quote.bid_size}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.last_quote.ask)}
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
                    <td className="p-3 border-b text-center font-semibold border-gray-100">
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
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.last_quote.bid)}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                      {row.last_quote.bid_size}
                    </td>
                    <td className="p-3 border-b text-center border-gray-100">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.last_quote.ask)}
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
                    <td className="p-3 border-b text-center font-semibold border-gray-100">
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
