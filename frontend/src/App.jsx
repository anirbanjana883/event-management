import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import EventDetails from "./pages/EventDetails";
import CreateEvent from "./pages/CreateEvent";
import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";
import ScannerPage from "./pages/organizer/ScannerPage";
import AnalyticsDashboard from "./pages/organizer/AnalyticsDashboard";

function App() {
  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-green-500 selection:text-black">
      {/* Popups */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#333",
            color: "#fff",
            border: "1px solid #22c55e",
          },
        }}
      />

      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/events" element={<Home />} />

          <Route path="/create-event" element={<CreateEvent />} />

          <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
          <Route path="/organizer/scan/:eventId" element={<ScannerPage />} />

          <Route
            path="/organizer/event/:eventId/analytics"
            element={<AnalyticsDashboard />}
          />
          
        </Routes>
      </div>
    </div>
  );
}

export default App;
