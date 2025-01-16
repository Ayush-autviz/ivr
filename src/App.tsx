import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./screens/Home";
import NotFound from "./screens/NotFound";
import NavBar from "./components/NavBar";
import "../src/sockets/index";
function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        {/* Define the route for the dashboard */}
        <Route path="/" element={<Home />} />

        {/* Define a fallback route for unmatched paths*/}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
