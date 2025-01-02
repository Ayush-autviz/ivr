import OptionsIVChart from "../components/IVchart"


const NotFound = () => {
    return (
        <div className="mt-24 justify-center flex items-center w-full">
            <OptionsIVChart tickers={["O:TSLA250103C00390000","O:AAPL250103C00160000"]}/>
        </div>
    )
}

export default NotFound