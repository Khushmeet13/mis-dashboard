import React, { useState, useEffect } from 'react';
//import { BASE_URL } from "../services/api";
import { FaSpinner } from "react-icons/fa";
import axios from "axios";

const PromoMsgs = () => {
     const BASE_URL = process.env.BASE_URL;
    const [activeInterface, setActiveInterface] = useState("view-1");
    const [selectedClient, setSelectedClient] = useState("");
    const [clientData, setClientData] = useState([]);
    const [clients, setClients] = useState([]);
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState("");

    useEffect(() => {

        axios.get(`${BASE_URL}/sms/api/product_sms`)
            .then((response) => {
                const allClients = response.data;
                const uniqueClients = Array.from(
                    new Map(allClients.map(item => [item.client, item])).values()
                );
                setClients(uniqueClients);
                console.log("Unique Clients:", uniqueClients);
            })
            .catch((error) => {
                console.error("Error fetching clients:", error);
            });
    }, []);

    const fetchData = () => {

        if (selectedClient && selectedMonth) {
            setIsFetchingData(true);
            axios.get(`${BASE_URL}/sms/api/promo_msg_client`, {
                params: { client: selectedClient, month: selectedMonth }
            })
                .then((response) => {

                    const uniqueData = Array.from(
                        new Map(response.data.map(item => {
                            const key = `${item.date}|${item.source}|${item.text}|${item.product}`;
                            return [key, item];
                        })).values()
                    );
                    setClientData(uniqueData);
                    console.log("Unique Client Data:", uniqueData);
                })
                .catch((error) => {
                    console.error("Error fetching client data:", error);
                })
                .finally(() => {
                    setIsFetchingData(false);
                });
        } else {
            setClientData([]);
            setIsFetchingData(false);
        }
    };

    const handleMonthChange = (e) => {
        const selected = e.target.value;
        const [year, month] = selected.split("-").map(Number);
    
     
        if (year === 2025 && month < 5) {
            alert("Please select a month from May 2025 onwards.");
            return;
        }
    
        setSelectedMonth(selected);
    };
    
    return (
        <div className="sms-container">
            {isFetchingData && (
                <div className="loading-overlay">
                    <FaSpinner className="loading-spinner" />
                </div>
            )}

            <div className="button-container">
                <button
                    className={`view-button-1 ${activeInterface === "view-1" ? "active-btn" : ""}`}
                    onClick={() => setActiveInterface("view-1")}
                >
                    SMS
                </button>
            </div>

            <div className="divider-2"></div>

            {activeInterface === "view-1" && (
                <div className='view-container'>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            min="2025-05"
                          
                            style={{
                                padding: "8px",
                                borderRadius: "5px",
                                border: "1px solid #ccc",
                                fontSize: "16px",
                                cursor: "pointer",
                                outline: "none",
                                marginLeft: "10px"
                            }}
                        />
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

                        <button className="search-btn" onClick={fetchData}>
                            Search
                        </button>
                    </div>


                    <div className="client-data-table">
                        {clientData.length > 0 && (
                            <table
                                style={{
                                    borderCollapse: "collapse",
                                    width: "100%",
                                    marginTop: "20px",
                                    fontSize: "14px"
                                }}
                            >
                                <thead>
                                    <tr>
                                        {Object.keys(clientData[0]).map((key) => (
                                            <th
                                                key={key}
                                                style={{
                                                    border: "1px solid #ccc",
                                                    padding: "8px",
                                                    backgroundColor: "rgb(10, 69, 118)",
                                                    fontWeight: "bold",
                                                    width: key === "date" ? "100px" : "auto"
                                                }}
                                            >
                                                {key.toUpperCase()}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {clientData.map((item, rowIndex) => (
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
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromoMsgs;
