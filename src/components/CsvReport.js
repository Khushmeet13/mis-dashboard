import React, { useState, useEffect } from 'react';
//import { BASE_URL } from "../services/api";
import "../styles/CsvReport.css";
import { DatePicker } from "antd";
import { FaSpinner, FaChartBar, FaClock, FaHourglassHalf } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, Cell, LabelList } from 'recharts';
import 'react-circular-progressbar/dist/styles.css';
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);



const CsvReport = ({ setShowUploadSection }) => {
   const BASE_URL = process.env.BASE_URL;
  const [files, setFiles] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [dndFiles, setDndFiles] = useState([]);
  const [failedData, setFailedData] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [failedDetails, setFailedDetails] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [senders, setSenders] = useState([]);
  const [totals, setTotals] = useState({ LB: {}, MX: {} });
  const [uptime, setUptime] = useState(null);
  const [downtime, setDowntime] = useState(null);
  const [duration, setDuration] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [totalCountData, setTotalCountData] = useState([]);


  useEffect(() => {
    const fetchSenderDetails = async () => {
      try {
        const response = await fetch(`${BASE_URL}/sms/api/sender_sms`);
        const data = await response.json();
        setSenders(data.map(sender => sender.sender));
      } catch (err) {
        console.error("Error fetching sender details:", err);
      }
    };

    fetchSenderDetails();
  }, []);


  const fetchData = async () => {
    setShowResults(true);
    setIsFetchingData(true);
  
    const startTime = new Date();
    setUptime(startTime.toLocaleTimeString());
    console.log("fetchData started at:", startTime.toLocaleTimeString());
  
    try {
      console.log("Preparing API URL...");
  
      let url = `${BASE_URL}/sms/files/csv`;
      console.log("BASE_URL:", BASE_URL);
      console.log("Full API URL (initial):", url);
  
      const params = new URLSearchParams();
  
      if (fromDate && toDate) {
        const formattedFromDate = dayjs(fromDate).format("YYYY-MM-DD");
        const formattedToDate = dayjs(toDate).format("YYYY-MM-DD");
        params.append("fromDate", formattedFromDate);
        params.append("toDate", formattedToDate);
        console.log("From Date:", formattedFromDate);
        console.log("To Date:", formattedToDate);
      }
  
      if (selectedProduct) {
        params.append("senderName", selectedProduct);
        console.log("Selected Product:", selectedProduct);
      }
  
      const finalURL = `${url}?${params.toString()}`;
      console.log("Final API URL:", finalURL);
  
      console.log("Sending request to backend...");
      const response = await axios.get(finalURL);
  
      console.log("4Response received ");
      console.log("Full response:", response);
  
      const data = response.data;
  
      setFiles(data.promotionalData || []);
      setDndFiles(data.dndData || []);
      setFailedData(data.failedData || []);
      setTotalCountData(data.totalData || []);
  
      console.log("Promotional Data:", data.promotionalData);
      console.log("DND Data:", data.dndData);
      console.log("Failed Data:", data.failedData);
      console.log("Total Count Data:", data.totalData);
  
      if (data.promotionalData && data.promotionalData.length === 0) {
        console.log(" No promotional data found.");
        setFilteredData([]);
      } else {
        console.log("Promotional data found.");
        setFilteredData(data.promotionalData);
      }
  
      /*
      const calculatedTotals = {
        LB: { submitted: 0, delivered: 0, notsent: 0, failed: 0 },
        LH: { submitted: 0, delivered: 0, notsent: 0, failed: 0 },
        MX: { submitted: 0, delivered: 0, notsent: 0, failed: 0 },
        HN: { submitted: 0, delivered: 0, notsent: 0, failed: 0 },
      };
      data.promotionalData.forEach(entry => {
        const key = entry.product_key;
        if (key && calculatedTotals[key]) {
          calculatedTotals[key].submitted += Number(entry.submitted_count || 0);
          calculatedTotals[key].delivered += Number(entry.delivered_count || 0);
          calculatedTotals[key].notsent += Number(entry.notsent_count || 0);
          calculatedTotals[key].failed += Number(entry.failed_count || 0);
        }
      });
      setTotals(calculatedTotals);
      */
  
      const endTime = new Date();
      setDowntime(endTime.toLocaleTimeString());
      console.log("Fetch completed at:", endTime.toLocaleTimeString());
  
      const diffSeconds = Math.floor((endTime - startTime) / 1000);
      setDuration(`${diffSeconds} secs`);
      console.log("Total duration:", `${diffSeconds} secs`);
  
    } catch (error) {
      console.error("Error fetching files:", error);
  
      if (error.response && error.response.data && error.response.data.message) {
        console.log("Backend error message:", error.response.data.message);
        setFilteredData([]);
        setFailedData([]);
        alert(error.response.data.message);
      } else {
        alert("Something went wrong while fetching data.");
      }
  
    } finally {
      console.log("Fetch process completed. Cleaning up...");
      setIsFetchingData(false);
    }
  };
  

  /*useEffect(() => {
    setFilteredData([]);
    if (selectedProduct && fromDate && toDate) {
      fetchData();
    }
  }, [selectedProduct, fromDate, toDate]);*/

  const handleFromDateChange = (date, dateString) => {
    setFromDate(dateString);
    /*filterData(dateString);

    if (toDate) {
      filterData(toDate, dateString);
    }*/
  };

  const handleToDateChange = (date, dateString) => {
    setToDate(dateString);

    /*if (fromDate) {
      filterData(fromDate, dateString);
    }*/

  };


  /*const filterData = (start, end) => {
    if (!start || !end) {
      setFilteredData(files);
      return;
    }

    const filtered = files.filter(file => {
      const isWithinDateRange = fromDate && toDate
        ? dayjs(file.submitted_date).isBetween(dayjs(fromDate), dayjs(toDate), null, "[]")
        : true;
      const matchesProduct = selectedProduct ? file.product_name === selectedProduct : true;
      return isWithinDateRange && matchesProduct;
    });

    setFilteredData(filtered);
    console.log("Filtered Data:", filtered);
  };*/

  const handleFailedClick = (source, event) => {
    setSelectedSource(source);
    const filteredFailures = dndFiles.filter(file => file.source === source);
    setFailedDetails(filteredFailures);
    setIsModalOpen(true);

    const rect = event.currentTarget.getBoundingClientRect();
    const modal = document.querySelector(".modal");

    if (modal) {
      modal.style.position = "absolute";
      modal.style.display = "block";

      const modalWidth = modal.offsetWidth;
      const availableSpaceRight = window.innerWidth - rect.right;

      if (availableSpaceRight >= modalWidth + 20) {
        modal.style.left = `${rect.right + 10 + window.scrollX}px`;
      } else {
        modal.style.left = `${rect.left - modalWidth - 10 + window.scrollX}px`;
      }
      modal.style.top = `${rect.bottom - 80 + window.scrollY}px`;
    }
  };

  const colorArray = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#8dd1e1', '#a4de6c', '#d0ed57'];
  const maxValue = Math.max(...failedData.map(item => item.total_failed));

  //const chunkSize = Math.ceil(failedData.length / 3);
  const chunkSize = 3;
  /*const columns = Array.from({ length: chunkSize }, () => []);
  
  for (let i = 0; i < failedData.length; i++) {
    columns[i % chunkSize].push(failedData[i]);
  }*/
  const columnHeight = 3; // number of rows per column
  const columns = [];

  for (let i = 0; i < failedData.length; i++) {
    const colIndex = Math.floor(i / columnHeight);

    if (!columns[colIndex]) {
      columns[colIndex] = [];
    }

    columns[colIndex].push(failedData[i]);
  }


  const chartData = failedData.map((item, index) => ({
    cause: item.cause,
    total: item.total_failed
  }));
  const barColors = ['#e0116f', '#1f77b4', '#2ca02c', '#ff851b', '#7fdbff', '#b10dc9', '#ffdc00'];
  const CustomTick = ({ x, y, payload }) => {
    const cleanedValue = payload.value.replace(/\s+,/g, ',');
    const words = cleanedValue.split(' ');
    const matchedItem = chartData.find(item => item.cause === payload.value);
    const total = matchedItem ? matchedItem.total : '';

    return (
      <g transform={`translate(${x},${y})`}>
        {words.map((word, index) => (
          <text
            key={index}
            x={0}
            y={(index * 18) + 10}
            textAnchor="middle"
            fill="rgb(10, 69, 118)"
            fontSize="15"
            fontWeight="bold"
            wordSpacing="5"
          >
            {word}
          </text>
        ))}
        {/*<text
          x={0}
          y={(words.length * 12) + 18}
          textAnchor="middle"
          fill="#000"
          fontSize="14"
        >
          {total}
        </text>*/}
      </g>
    );
  };


  return (
    <div className={`report-container ${setShowUploadSection ? "expanded" : ""}`}>
      {isFetchingData && (
        <div className="loading-overlay">
          <FaSpinner className="loading-spinner" />
        </div>
      )}
      <div className="sms-report">

        <div className={`date-picker-container ${setShowUploadSection ? "expanded" : ""}`}>
          <DatePicker onChange={handleFromDateChange} placeholder={["From DD/MM/YYYY"]} className="custom-datepicker" />
          <DatePicker onChange={handleToDateChange} placeholder={["To DD/MM/YYYY"]} className="custom-datepicker" />
          {/*<select
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="custom-select"
          >
            <option value="">Select Product</option>
            {[...new Set([...["BAJAJO", "CLUBMH", "HIRAPK", "CARTSE", "SPINPT"], ...files.map(file => file.product_name.toUpperCase())])].map((product, index) => (
              <option key={index} value={product}>{product}</option>
            ))}
          </select>*/}
          <select
            onChange={(e) => setSelectedProduct(e.target.value)}
            value={selectedProduct}
            className="custom-select"
          >
            <option value="">Select Product</option>
            {senders.map((sender, index) => (
              <option key={index} value={sender}>
                {sender.toUpperCase()}
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


        <table className={`csv-table ${setShowUploadSection ? "expanded" : ""}`}>
          <thead>
            <tr>
              <th >Date</th>
              <th >Product Name</th>
              <th >Source</th>
              <th >Circle</th>
              <th >Submitted Count</th>
              <th >Delivered Count</th>
              <th >Failed Count</th>
              <th >NotSent Count</th>
            </tr>
          </thead>
          <tbody>

            {filteredData.length > 0 ? (
              [...filteredData]
                .sort((a, b) => {
                  const dateA = a.submitted_date ? dayjs(a.submitted_date).valueOf() : 0;
                  const dateB = b.submitted_date ? dayjs(b.submitted_date).valueOf() : 0;
                  return dateA - dateB;
                })
                .map((file, index) => (
                  <tr key={index}>
                    <td>{file.date ? dayjs(file.date).format("DD/MM/YYYY HH:mm") : "N/A"}</td>
                    <td>{file.product_name}</td>
                    <td>{file.source}</td>
                    <td>{file.circle}</td>
                    <td>{file.submitted_count}</td>
                    <td>{file.delivered_count}</td>
                    <td className="clickable" onClick={(e) => handleFailedClick(file.source, e)}>{file.failed_count}</td>
                    <td>{file.notsent_count}</td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", fontWeight: "bold" }}>
                  No data found
                </td>
              </tr>
            )}

            {/*{Object.entries(totals).map(([productKey, stats]) => {
              const hasData = Object.values(stats).some(count => count > 0);
              return hasData ? (
                <tr key={productKey} style={{
                  fontWeight: "bold",
                  backgroundColor:
                    productKey === "LB" ? "#f0f8ff" :
                    productKey === "LH" ? "#f0f8ff" :
                      productKey === "MX" ? "#f0fff0" :
                        productKey === "HN" ? "#fff0f5" : "#ffffff"
                }}>
                  <td colSpan="4">Total for {productKey}</td>
                  <td>{stats.submitted}</td>
                  <td>{stats.delivered}</td>
                  <td>{stats.failed}</td>
                  <td>{stats.notsent}</td>
                </tr>
              ) : null;
            })}*/}

            {totalCountData && totalCountData.length > 0 &&
              totalCountData.map((total, index) => (
                <tr
                  key={`summary-${index}`}
                  style={{
                    fontWeight: "bold",
                    backgroundColor: index % 2 === 0 ? "#f0f8ff" : "#fffbe6",
                  }}
                >
                  <td colSpan="4">Total for {total.source_group}</td>
                  <td>{total.total_submitted}</td>
                  <td>{total.total_delivered}</td>
                  <td>{total.total_failed}</td>
                  <td>{total.total_notsent}</td>
                </tr>
              ))}
          </tbody>
        </table>

        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
              <h3 className='card-heading'>Failed Records for {selectedSource}</h3>
              <table>
                <thead>
                  <tr>
                    <th>Cause</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {failedDetails.map((file, index) => (
                    <tr key={index}>
                      <td>{file.cause}</td>
                      <td>{file.total_failed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      <div className="statistics-container">
        <div className="scroll-wrapper">
          <div className="heading-container">
            <h3><FaChartBar className="status-icon" /> Failed Count Statistics</h3>
          </div>

          <div className="status-wrapper">
            <div className="status-container-1">
              <ResponsiveContainer >
                <BarChart
                  width={1400}
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 90 }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="cause"
                    interval={0}
                    height={60}
                    tick={<CustomTick />}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'rgb(10, 69, 118)', fontSize: 14, fontWeight: 'bold' }}
                    label={{
                      angle: -90,
                      position: 'insideLeft',
                      offset: 10,
                      dx: -25,
                    }}
                  />


                  <Bar dataKey="total">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                    ))}
                    <LabelList
                      dataKey="total"
                      position="top"
                      style={{ fill: 'rgb(10, 69, 118)', fontSize: 14 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

            </div>

          </div>

        </div>
      </div>


    </div>
  )
}


export default CsvReport