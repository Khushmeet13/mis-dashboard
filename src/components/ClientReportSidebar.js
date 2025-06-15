import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/ClientReportSidebar.css";
import {
  FaCar,        // Cars24, Acko-car
  FaUniversity, // IDFC
  FaHotel,      // Club Mahindra
  FaHome,       // HIRAPK
  FaBriefcase,  // Bajaj HL
  FaUserTie,    // Profuse
  FaBuilding,   // Dentsu
  FaIndustry,   // Bajaj
  FaCity,       // Hiranandani
  FaFileAlt
} from "react-icons/fa";
import { PiUserCirclePlusFill } from "react-icons/pi";

const ClientReportSidebar = () => {
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [expandedClient, setExpandedClient] = useState(null);
  const [hoveredClient, setHoveredClient] = useState(null);


  const clients = {
    Profuse: ["Cars24", "Acko-car", "IDFC"],
    Dentsu: ["Club Mahindra"],
    Bajaj: ["Bajaj HL"],
    Hiranandani: ["HIRAPK"],
  };

  const toggleClientDropdown = (client) => {
    setExpandedClient(expandedClient === client ? null : client);
  };

  const getClientIcon = (client) => {
    switch (client) {
      case "Profuse":
        return <FaUserTie />;
      case "Dentsu":
        return <FaBuilding />;
      case "Bajaj":
        return <FaIndustry />;
      case "Hiranandani":
        return <FaCity />;
      default:
        return <FaBriefcase />;
    }
  };

  const getProductIcon = (product) => {
    if (product.includes("Car")) return <FaCar />;
    if (product.includes("IDFC")) return <FaUniversity />;
    if (product.includes("Mahindra")) return <FaHotel />;
    if (product.includes("HL")) return <FaBriefcase />;
    if (product.includes("HIRAPK")) return <FaHome />;
    return <FaFileAlt />;
  };



  return (
    <div className="client-container">
      <p className="client-reports" onClick={() => setShowClientDropdown(!showClientDropdown)}>
        <PiUserCirclePlusFill size={20} style={{ marginRight: "7px" }} /> Client Reports {showClientDropdown ? "▴" : "▾"}
      </p>
      {showClientDropdown && (
        <div className={`dropdown-menu ${showClientDropdown ? "open" : ""}`}>
          {Object.keys(clients).map((client) => (
            <div key={client} >
              <p className="products" onClick={() => toggleClientDropdown(client)}>
                {getClientIcon(client)} {client} {expandedClient === client ? "▴" : "▾"}
              </p>
              {expandedClient === client && (
                <div className={`dropdown-submenu ${expandedClient === client ? "open" : ""}`}>
                  {clients[client].map((product) => (
                    <Link to={`/client-reports/${product}`} key={product} className="product-link">
                      <p>{getProductIcon(product)} {product}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientReportSidebar;
