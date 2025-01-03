import {
  CalendarPlusIcon,
  Search,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { searchStocks } from "../services/polygon";
import Loading from "../components/Loading";
import OptionChain from "../components/OptionChain";
import useAnalysisStore from "../store/OptionStore";


const Home = () => {
  // Get states and actions from Zustand store
  const {
    ticker,
    selectedDate,
    date,
    optionData,
    analyseLoading,
    analyseError,
    strikeRate,
    setTicker,
    setSelectedDate,
    setDate,
    setStrikeRate,
    startAnalysis,
    stopPolling,
    fetchExpiryDates
  } = useAnalysisStore();

  // Local states
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [expiry, setExpiry] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expLoading, setExpLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  const handleChangeStrike = (event) => {
    setStrikeRate(Number(event.target.value));
  };

  const toggleDropdown = () => {
    if (!ticker) {
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 2000);
    } else {
      setError(false);
      setIsOpen(!isOpen);
    }
  };

  const handleChange = async (e) => {
    const query = e.target.value;
    setSearch(query);

    if (query.trim().length) {
      try {
        setLoading(true);
        const data = await searchStocks(query);
        setResults(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stocks:", error);
        setLoading(false);
        setResults([]);
      }
    } else {
      setResults([]);
    }
  };

  const handleClick = async (stock) => {
    setSearch(stock.symbol);
    setResults([]);
    setTicker(stock.symbol);
    setSelectedDate("");
    
    try {
      setExpLoading(true);
      const dates = await fetchExpiryDates(stock.symbol);
      setExpiry(dates);
      setExpLoading(false);
    } catch (error) {
      console.error("Error fetching option expiry dates:", error);
      setExpLoading(false);
    }
  };

  return (
    <>
      <div className="pt-[80px] flex flex-col md:flex-row gap-5 mx-8 mt-5">
        {/* Step 1: Choose Stock */}
        <div className="bg-white flex-1 rounded-2xl shadow-lg p-4 sm:p-6 h-[450px] md:w-[33%]">
          <div className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
            Step 1
          </div>
          <div className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
            Choose Stock
          </div>

          <div className="relative felx items-center">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
              size={20}
            />
            <input
              type="text"
              value={search}
              onChange={handleChange}
              placeholder="Search for a stock..."
              className="w-full pl-10 pr-4 py-1 h-12 sm:py-3 border-2 border-gray-800 rounded-full transition-all duration-300 text-sm sm:text-base placeholder:text-gray-800 placeholder:font-normal"
            />
          </div>

          {loading ? (
            <div className="w-full h-[60%] flex flex-1 justify-center items-center">
              <Loading loading={true} />
            </div>
          ) : (
            <>
              {results.length > 0 ? (
                <ul className="mt-4">
                  {results.map((stock) => (
                    <li
                      key={stock.ticker}
                      className="py-2 px-4 hover:bg-gray-100 mt-2 cursor-pointer rounded-full shadow-md"
                      onClick={() => handleClick(stock)}
                    >
                      <span className="font-medium text-gray-800 truncate overflow-hidden whitespace-nowrap block">
                        {`(${stock.symbol}) ${stock.name}`}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="w-full h-[60%] flex flex-1 justify-center items-center">
                  <img className="h-24 w-24" src="chart.png" alt="chart" />
                </div>
              )}
            </>
          )}
        </div>

        {/* Step 2: Choose Expiry */}
        <div className="bg-white flex-1 rounded-2xl shadow-lg p-4 h-[450px] md:w-[33%] sm:p-6">
          <div className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
            Step 2
          </div>
          <div className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
            Choose Expiry
          </div>

          <div
            onClick={toggleDropdown}
            className="rounded-full cursor-pointer border-2 h-12 border-gray-800 flex flex-row gap-4 items-center p-4"
          >
            <CalendarPlusIcon size={20} />

            <div className="flex-1">
              {!selectedDate ? "Select the expiry date" : selectedDate}
            </div>
            <button>
              {isOpen ? (
                <ChevronUpIcon className="w-5 h-5 text-gray-800" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 text-gray-800" />
              )}
            </button>
          </div>

          {error && (
            <div className="text-red-500 text-sm mt-2 ml-4">
              Please select a stock first.
            </div>
          )}

          {isOpen ? (
            <>
              {expLoading ? (
                <Loading loading={expLoading} />
              ) : (
                <>
                  {expiry.length > 0 && (
                    <ul className="mt-4">
                      {expiry.map((expDate, index) => (
                        <li
                          onClick={() => {
                            setSelectedDate(
                              new Date(expDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            );
                            setDate(expDate);
                            setIsOpen(false);
                          }}
                          key={index}
                          className="py-2 px-4 hover:bg-gray-100 mt-2 cursor-pointer rounded-full shadow-md"
                        >
                          <span className="font-medium text-gray-800 truncate overflow-hidden whitespace-nowrap block">
                            {new Date(expDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="w-full h-[60%] flex flex-1 justify-center items-center">
              <img className="h-24 w-24" src="calendar.png" alt="calendar" />
            </div>
          )}
        </div>

        {/* Step 3: Choose Strike */}
        <div className="bg-white flex-1 rounded-2xl shadow-lg p-4 h-[450px] md:w-[33%] mb-5 sm:p-6">
          <div className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
            Step 3
          </div>
          <div className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
            Choose Strike
          </div>
          <div className="flex flex-col justify-center items-center h-[70%]">
            <div className="flex justify-center items-center mt-4">
              <div className="rounded-full p-5 text-lg sm:text-xl bg-gray-100 w-10 h-10 justify-center items-center flex">
                {strikeRate}
              </div>
            </div>

            <input
              id="default-range"
              type="range"
              value={strikeRate}
              step="2"
              min="4"
              max="20"
              onChange={handleChangeStrike}
              className="w-full h-2 bg-gray-200 mt-5 rounded-lg range-input appearance-none cursor-pointer dark:bg-gray-700"
              style={{
                WebkitAppearance: "none",
                appearance: "none",
                background: "bg-gray-700",
              }}
            />
            <div className="flex w-full flex-row justify-between mt-2">
              <div className="text-lg sm:text-xl">4</div>
              <div className="ml-2 text-lg sm:text-xl">12</div>
              <div className="text-lg sm:text-xl">20</div>
            </div>

            <div
              onClick={startAnalysis}
              className={`w-full mx-4 cursor-pointer mt-10 text-sm font-medium flex justify-center items-center h-10 rounded-full ${
                loading ? "bg-gray-500 text-gray-300" : "bg-gray-800 text-white"
              }`}
            >
              {analyseLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                </div>
              ) : (
                "Analyse"
              )}
            </div>
            {analyseError && (
              <div className="text-red-500 text-sm mt-2 ml-4">{analyseError}</div>
            )}
          </div>
        </div>
      </div>

      {/* Option Chain Display */}
      <div className="flex justify-center items-center mx-8 mb-10">
        {optionData ? (
          <OptionChain data={optionData} />
        ) : (
          <div className="bg-white w-full flex justify-center items-center text-center rounded-2xl shadow-lg h-[300px]">
            <div className="text-4xl font-semibold">
              Analyse Stock to see option chain
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;