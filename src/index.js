import React from 'react';
import ReactDOM from 'react-dom/client';  // Import from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import LandingPage from './pages/LandingPage';
import LaptopDetailsPage from './pages/LaptopDetailsPage';
import NetworkEquipmentPage from './pages/NetworkEquipmentPage';
import AccessoriesPage from './pages/AccessoriesPage';
import IssueTrackerPage from './pages/IssueTrackerPage';
import TransferPage from './pages/TransferPage';
import HandoverPage from './pages/HandoverPage';
import SearchDevicePage from './pages/SearchDevicePage';
import DeviceRecordPage from './pages/DeviceRecordPage';

// Create a root element using createRoot
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<LandingPage />} />  {/* Default route */}
          <Route path="LandingPage" element={<LandingPage />} />
          <Route path="LaptopDetailsPage" element={<LaptopDetailsPage />} />
          <Route path="NetworkEquipmentPage" element={<NetworkEquipmentPage />} />
          <Route path="AccessoriesPage" element={<AccessoriesPage />} />
          <Route path="IssueTrackerPage" element={<IssueTrackerPage />} />
          <Route path="TransferPage" element={<TransferPage />} />
          <Route path="HandoverPage" element={<HandoverPage />} />
          <Route path="SearchDevicePage" element={<SearchDevicePage />} />
          <Route path="DeviceRecordPage" element={<DeviceRecordPage />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);
