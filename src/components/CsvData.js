import React, { useState, useEffect } from "react";
import axios from "axios";
import { DatePicker } from "antd";
//import { BASE_URL } from "../services/api";
import { FaSpinner, FaClock, FaHourglassHalf } from "react-icons/fa";

const CsvData = () => {
     const BASE_URL = process.env.BASE_URL;
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState("");
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [firstPageCursor, setFirstPageCursor] = useState(null);
    const [lastPageCursor, setLastPageCursor] = useState(null);
    const [previousCursor, setPreviousCursor] = useState(null);
    const [nextCursor, setNextCursor] = useState(null);
    const [currentCursor, setCurrentCursor] = useState(null);
    const [currentPage, setCurrentPage] = useState(null);
    const itemsPerPage = 10;
    const [uptime, setUptime] = useState(null);
    const [downtime, setDowntime] = useState(null);
    const [duration, setDuration] = useState(null);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        if (!fromDate || !toDate) return;

        axios.get(`${BASE_URL}/sms/api/clients`, { params: { fromDate, toDate } })
            .then((response) => {
                setClients(response.data);
                console.log("Clients:", response.data);
            })
            .catch((error) => {
                console.error("Error fetching clients:", error);
            });
    }, [fromDate, toDate]);


    const fetchData = async (cursor = null, direction = "next") => {
        setShowResults(true);
        setIsFetchingData(true);
        const startTime = new Date(); // Uptime
        setUptime(startTime.toLocaleTimeString());
        try {
            const response = await axios.get(`${BASE_URL}/sms/api/client-data`, {
                params: {
                    fromDate: fromDate,
                    toDate: toDate,
                    client: selectedClient,
                    limit: itemsPerPage,
                    cursor,
                    direction
                }
            });
            console.log("Table Data Response:", response.data);


            if (Array.isArray(response.data.data)) {
                setTableData(response.data.data);
                setTotalRecords(response.data.totalRecords);
                setTotalPages(response.data.totalPages);
                setFirstPageCursor(response.data.firstPageCursor);
                setLastPageCursor(response.data.lastPageCursor);
                setPreviousCursor(response.data.previousCursor);
                setNextCursor(response.data.nextCursor);
                setCurrentPage(response.data.currentPage);
                setCurrentCursor(cursor);
            } else {
                setTableData([]);
                setTotalRecords(0);
                setTotalPages(0);
                console.error("Error: Expected data array, got:", response.data.data);
            }

            const endTime = new Date();
            setDowntime(endTime.toLocaleTimeString());

            const diffSeconds = Math.floor((endTime - startTime) / 1000);
            setDuration(`${diffSeconds} secs`);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsFetchingData(false);
        }
    };

    const handleFromDateChange = (date, dateString) => {
        setFromDate(dateString);
    };

    const handleToDateChange = (date, dateString) => {
        setToDate(dateString);

    };

    /*useEffect(() => {
        if (selectedClient && fromDate && toDate) {
            fetchData();
        }
    }, [selectedClient, fromDate, toDate]);*/

    return (
        <>
            {isFetchingData && (
                <div className="loading-overlay">
                    <FaSpinner className="loading-spinner" />
                </div>
            )}


            <div style={{ overflowX: "scroll", maxWidth: "1200px" }}>
                <div className={`date-picker-container`}>
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

                    <button className="search-btn" onClick={fetchData}>
                        Search
                    </button>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: "20px",
                            gap: "6px", 
                            flexWrap: "nowrap", 
                        }}
                    >
                        <div
                            style={{
                                background: "#e8f5e9",
                                padding: "4px 8px", 
                                borderRadius: "8px",
                                fontWeight: "bold",
                                color: "#2e7d32",
                                fontSize: "11px",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                whiteSpace: "nowrap",
                            }}
                        >
                            <FaClock />
                            {showResults ? uptime : <>Uptime: --</>}
                        </div>

                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <div
                                style={{
                                    width: "60px",
                                    height: "2px",
                                    background: "#999",
                                    position: "relative",
                                }}
                            ></div>
                            <div
                                style={{
                                    position: "absolute",
                                    top: "-22px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    background: "#fff",
                                    padding: "2px 5px",
                                    fontSize: "10px",
                                    color: "#333",
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                    textAlign: "center",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {showResults ? duration : "Duration: --"}
                            </div>
                        </div>

                        <div
                            style={{
                                background: "#ffebee",
                                padding: "4px 8px",
                                borderRadius: "8px",
                                fontWeight: "bold",
                                color: "#c62828",
                                fontSize: "11px",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                whiteSpace: "nowrap",
                            }}
                        >
                            <FaHourglassHalf />
                            {showResults ? downtime : <>Downtime: --</>}
                        </div>
                    </div>

                </div>

                <table border="1" style={{ width: "100%", borderCollapse: "collapse", minWidth: "400px", overflowX: "scroll" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f2f2f2", textAlign: "left" }}>
                            <th style={{ padding: "10px", minWidth: "100px" }}>Date</th>
                            <th style={{ padding: "10px" }}>Count</th>
                            <th style={{ padding: "10px" }}>Vendor</th>
                            <th style={{ padding: "10px" }}>Product</th>
                            <th style={{ padding: "10px" }}>Source</th>
                            <th style={{ padding: "10px" }}>Channel</th>
                            <th style={{ padding: "10px", minWidth: "130px" }}>Client</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((row, index) => (
                            <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                                <td style={{ padding: "8px" }}>{row.date}</td>
                                <td style={{ padding: "8px", textAlign: "center" }}>{row.mobile_count}</td>
                                <td style={{ padding: "8px" }}>{row.vendor}</td>
                                <td style={{ padding: "8px" }}>{row.product}</td>
                                <td style={{ padding: "8px" }}>{row.source}</td>
                                <td style={{ padding: "8px" }}>{row.channel}</td>
                                <td style={{ padding: "8px" }}>{row.client}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>


                <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <button onClick={() => fetchData(firstPageCursor, "next")} disabled={!firstPageCursor || currentCursor === firstPageCursor}>First</button>
                    <button onClick={() => fetchData(previousCursor, "prev")} disabled={!previousCursor}>Previous</button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button onClick={() => fetchData(nextCursor, "next")} disabled={!nextCursor}>Next</button>
                    <button onClick={() => fetchData(lastPageCursor, "prev")} disabled={!lastPageCursor || currentCursor === lastPageCursor}>Last</button>
                </div>

            </div>
        </>
    );
};

export default CsvData;
