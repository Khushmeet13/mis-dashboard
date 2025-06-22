import React, { useState, useEffect } from 'react';
//import { BASE_URL } from "../services/api";
import axios from "axios";
import { DatePicker } from "antd";
import { FaSpinner } from "react-icons/fa";

const BaseCheckPage = () => {
     const BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState("");
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [results, setResults] = useState([]);
    const [dateCircleResults, setDateCircleResults] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/sms/api/database_client`);
                setClients(response.data);
            } catch (error) {
                console.error("Error fetching clients:", error);
                setErrorMessage("Failed to fetch clients.");
            }
        };

        fetchClients();
    }, []);

    const handleFromDateChange = (date, dateString) => {
        setFromDate(dateString);
    };

    const handleToDateChange = (date, dateString) => {
        setToDate(dateString);
    };

    const handleSearch = async () => {
        if (!selectedClient || !fromDate || !toDate) {
            setErrorMessage("Please select client and both dates.");
            return;
        }

        try {
            setIsFetchingData(true);
            const response = await axios.get(`${BASE_URL}/sms/api/base_check`, {
                params: {
                    client: selectedClient,
                    fromDate: fromDate,
                    toDate: toDate
                }
            });
            setResults(response.data.results);
            setDateCircleResults(response.data.dateCircleResults);
            setErrorMessage("");
            setPopupMessage("");
            setShowPopup(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            const message = error.response?.data?.error || "Failed to fetch data.";
            setErrorMessage(message);
            setPopupMessage(message);
            setShowPopup(true);
        } finally {
            setIsFetchingData(false);
        }
    };

    const totalRow = dateCircleResults.length > 0
        ? Object.keys(dateCircleResults[0]).reduce((acc, key) => {
            if (typeof dateCircleResults[0][key] === "number") {
                acc[key] = dateCircleResults.reduce((sum, item) => sum + (item[key] || 0), 0);
            } else {
                acc[key] = key === "date" ? "Total" : ""; 
            }
            return acc;
        }, {})
        : {};

    return (
        <div className='view-container'>
            {isFetchingData && (
                <div className="loading-overlay">
                    <FaSpinner className="loading-spinner" />
                </div>
            )}
            <div className="date-picker-container">
                <DatePicker onChange={handleFromDateChange} placeholder={["From DD/MM/YYYY"]} className="custom-datepicker" />
                <DatePicker onChange={handleToDateChange} placeholder={["To DD/MM/YYYY"]} className="custom-datepicker" />
                <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    style={{
                        padding: "8px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                        fontSize: "16px",
                        cursor: "pointer",
                        outline: "none"
                    }}
                >
                    <option value="">-- Select Client --</option>
                    {clients.map((client, index) => (
                        <option key={index} value={client.client}>
                            {client.client}
                        </option>
                    ))}
                </select>
                <button className="search-btn" onClick={handleSearch}>
                    Search
                </button>
            </div>

            {showPopup && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 9998
                }} />
            )}

            {showPopup && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '60%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    zIndex: 9999,
                    maxWidth: '80%',
                    textAlign: 'center'
                }}>
                    <p style={{ color: 'red' }}>{popupMessage}</p>
                    <button
                        onClick={() => setShowPopup(false)}
                        style={{
                            marginTop: '10px',
                            padding: '8px 16px',
                            backgroundColor: '#f44336',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>
                </div>
            )}

            {results.length > 0 && (
                <div className="client-data-table">
                    <table
                        style={{
                            borderCollapse: "collapse",
                            width: "100%",
                            marginTop: "20px",
                            fontSize: "14px",
                            overflowX: "scroll"
                        }}
                    >
                        <thead>
                            <tr>
                                {Object.keys(results[0]).map((key) => (
                                    <th
                                        key={key}
                                        style={{
                                            border: "1px solid #ccc",
                                            padding: "8px",
                                            backgroundColor: "rgb(10, 69, 118)",
                                            fontWeight: "bold",
                                            width: key === "date" ? "100px" : "auto",
                                            color: "#fff"
                                        }}
                                    >
                                        {key.toUpperCase()}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((item, rowIndex) => (
                                <tr key={rowIndex}>
                                    {Object.values(item).map((value, colIndex) => (
                                        <td
                                            key={colIndex}
                                            style={{
                                                border: "1px solid #ccc",
                                                padding: "8px",
                                                textAlign: "left"
                                            }}
                                        >
                                            {value}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {dateCircleResults.length > 0 && (
                <div className="client-data-table">
                    <table
                        style={{
                            borderCollapse: "collapse",
                            width: "100%",
                            marginTop: "20px",
                            fontSize: "14px",
                            overflowX: "scroll"
                        }}
                    >
                        <thead>
                            <tr>
                                {Object.keys(dateCircleResults[0]).map((key) => (
                                    <th
                                        key={key}
                                        style={{
                                            border: "1px solid #ccc",
                                            padding: "8px",
                                            backgroundColor: "rgb(10, 69, 118)",
                                            fontWeight: "bold",
                                            width: key === "date" ? "100px" : "auto",
                                            color: "#fff"
                                        }}
                                    >
                                        {key.toUpperCase()}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {dateCircleResults.map((item, rowIndex) => (
                                <tr key={rowIndex}>
                                    {Object.values(item).map((value, colIndex) => (
                                        <td
                                            key={colIndex}
                                            style={{
                                                border: "1px solid #ccc",
                                                padding: "8px",
                                                textAlign: "left"
                                            }}
                                        >
                                            {value}
                                        </td>
                                    ))}
                                </tr>
                            ))}

                            {/* 🔽 Total Row */}
                            <tr style={{ backgroundColor: "#f0f0f0", fontWeight: "bold" }}>
                                {Object.values(totalRow).map((value, index) => (
                                    <td
                                        key={index}
                                        style={{
                                            border: "1px solid #ccc",
                                            padding: "8px",
                                            textAlign: "left"
                                        }}
                                    >
                                        {value}
                                    </td>
                                ))}
                            </tr>
                        </tbody>

                    </table>
                </div>
            )}
        </div>
    );
};

export default BaseCheckPage;
