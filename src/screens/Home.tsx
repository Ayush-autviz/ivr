import { CalendarPlusIcon, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { fetchOptionExpiryDates, searchStocks } from '../services/polygon';
import { motion } from "framer-motion"
import Loading from '../components/Loading';

const Home = () => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [ticker,setTicker] = useState('');
  const [expiry,setExpiry] = useState([]);
  const [strikeRate, setStrikeRate] = useState(12) // Default to middle of new range
  const [loading,setLoading] = useState(false);

  const handleChangeStrike = (event) => {
    setStrikeRate(event.target.value);
  };



 
  console.log(results,'result');

  const handleChange = async (e) => {
    const query = e.target.value;
    setSearch(query);

    console.log(query.trim().length)
    if (query.trim().length) {
      try {
        setLoading(true);
        const data = await searchStocks(query); // Assuming searchStocks returns a promise
        setResults(data); // `data` should be an array of stock objects
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stocks:', error);
        setLoading(false);
        setResults([]);
      }
    } else {
      setResults([]); // Clear results if input is empty
    }
  };

  const handleClick = async (stock) => {
    setSearch(stock.name);
    setResults([]);
    setTicker(stock.ticker);
  
    try {
      const res = await fetchOptionExpiryDates(stock.symbol);
      setExpiry(res);
    } catch (error) {
      console.error("Error fetching option expiry dates:", error);
    }
  };

  return (
    <div className="pt-[80px] flex flex-col  md:flex-row gap-5 mx-8 mt-5">
      <div className="bg-white flex-1 rounded-2xl shadow-lg p-4 sm:p-6 h-[450px] md:w-[33%]">
        <div className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Step 1</div>
        <div className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Choose Stock</div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={handleChange}
            placeholder="Search for a stock..."
            className="w-full pl-10 pr-4 py-1 sm:py-3 border-2 border-gray-800 rounded-full transition-all duration-300 text-sm sm:text-base"
          />
        </div>

        {/* Search Results */}
        {loading ? (
          <div className='w-full h-[60%] flex flex-1   justify-center items-center'>
          <Loading loading={true}/>
          </div>) : (
            <>
            {results.length > 0 ? (
              <ul className="mt-4  ">
                {results.map((stock) => (
                  <li
                    key={stock.ticker}
                    className="py-2 px-4 hover:bg-gray-100 mt-2   cursor-pointer rounded-full shadow-md"
                    onClick={() => handleClick(stock)}
                  >
                    <span className="font-medium text-gray-800  truncate overflow-hidden whitespace-nowrap block">{stock.name}</span>
                   
                  </li>
                ))}
              </ul>
            ):(<div className='w-full h-[60%] flex flex-1   justify-center items-center'>
            <img className='h-24 w-24' src='../../src/assets/chart.png'/>
            </div>)}
             </>
          )
        }
       
 
      </div>

      <div className="bg-white flex-1 rounded-2xl shadow-lg p-4 h-[450px] md:w-[33%] sm:p-6 ">
      <div className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Step 2</div>
      <div className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Choose Expiry</div>

      <div className='rounded-full border-2 h-12 border-gray-800 flex flex-row gap-4 items-center p-4  '>
          <CalendarPlusIcon size={20} />
          <div>Select the expiry date</div>


      </div>

      {expiry.length > 0 && (
  <ul className="mt-4">
    {expiry.map((date, index) => (
      <li
        key={index}
        className="py-2 px-4 hover:bg-gray-100 mt-2 cursor-pointer rounded-full shadow-md"
        onClick={() => {
          // Handle click logic here
        }}
      >
        <span className="font-medium text-gray-800 truncate overflow-hidden whitespace-nowrap block">
          {new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </li>
    ))}
  </ul>
)}



      </div>

      <div className="bg-white flex-1 rounded-2xl shadow-lg p-4 h-[450px] md:w-[33%] sm:p-6 ">
      <div className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Step 3</div>
      <div className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Choose Strike</div>
     <div className='flex justify-center items-center mt-4'>
      <div className='rounded-full p-5 bg-gray-100 w-10 h-10 justify-center items-center flex '>
                  {strikeRate}
      </div>
      </div>

      <input
        id="default-range"
        type="range"
        value={strikeRate}
        min="4"
        max="20"
        onChange={handleChangeStrike}
        className="w-full h-2 bg-gray-200 mt-5 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
      />


      </div>



      </div>
      
    
  );
};

export default Home;

