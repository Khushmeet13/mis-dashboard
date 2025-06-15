import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { FaRocket, FaUserCog, FaTachometerAlt, FaPlusSquare, FaCloudUploadAlt, FaEnvelope, FaAngleDoubleRight, FaRegShareSquare } from "react-icons/fa";
import { MdDashboardCustomize, MdUploadFile } from "react-icons/md"; 
import { HiOutlineTemplate } from 'react-icons/hi'; 
import "./App.css";
import ClientReportSidebar from "./components/ClientReportSidebar";
import SmsReports from "./components/SmsReports";
import DatabasePage from "./components/DatabasePage";
import PromoMsgs from "./components/PromoMsgs";
import AdditionalPage from "./components/AdditionalPage";
import DashboardPage from "./components/DashboardPage";
import ProductPage from "./components/ProductPage";
import TemplateUpload from "./components/TemplateUpload";

const App = () => {
  const [isDropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <Router>
      <div className="app">
        <div className="sidebar">
          <div className="sidebar-header">
            <h3>VNS Service</h3>
          </div>
          <div className="list-components" >
            <NavLink to="/" className="dashboard">
              <MdDashboardCustomize size={20} style={{ marginRight: "9px" }} />
               Dashboard
            </NavLink>
            <p className="sms-reports" onClick={() => setDropdownOpen(!isDropdownOpen)}>
              <FaRocket  style={{ marginRight: "8px" }} /> Promotional Reports
              <span className="sms-dropdown-toggle">{isDropdownOpen ? "▲" : "▼"}</span>
            </p>
            {isDropdownOpen && (
              <div className="sms-dropdown-menu">
                {/*<Link to="/analyse-reports" className="link">
                📊 Analyse Reports
              </Link>*/}
                <NavLink to="/sms-reports" className={({ isActive }) => isActive ? "link active-link" : "link"}>
                  <FaAngleDoubleRight style={{ marginRight: "5px", fontSize: "12px" }} /> <FaCloudUploadAlt /> DLR Uploads
                </NavLink>
                <NavLink to="/promo-msgs" className={({ isActive }) => isActive ? "link active-link" : "link"}>
                  <FaAngleDoubleRight style={{ marginRight: "5px", fontSize: "12px" }} /> <FaEnvelope /> Promo Msgs
                </NavLink>
                <NavLink to="/database" className={({ isActive }) => isActive ? "link active-link" : "link"}>
                  <FaAngleDoubleRight style={{ marginRight: "5px", fontSize: "12px" }} /> <FaPlusSquare /> Products
                </NavLink>
                <NavLink to="/additional" className={({ isActive }) => isActive ? "link active-link" : "link"}>
                  <FaAngleDoubleRight style={{ marginRight: "5px", fontSize: "12px" }} /> <FaRegShareSquare /> Additional
                </NavLink>

              </div>
            )}
            <ClientReportSidebar />
            <NavLink to="/template-upload" className="template">
              <MdUploadFile  size={20} style={{ marginRight: "9px" }} />
               Template Upload
            </NavLink>
          </div>
        </div>
        <div className="dashboard-container">
          <h2><FaTachometerAlt className="icon" /> PM Dashboard</h2>

          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/sms-reports" element={<SmsReports />} />
            <Route path="/database" element={<DatabasePage />} />
            <Route path="/promo-msgs" element={<PromoMsgs />} />
            <Route path="/additional" element={<AdditionalPage />} />
            <Route path="/client-reports/:productName" element={<ProductPage />} />
            <Route path="/template-upload" element={<TemplateUpload />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
