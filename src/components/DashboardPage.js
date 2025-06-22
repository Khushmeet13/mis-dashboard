import React, { useEffect, useState } from "react";
import axios from "axios";
//import { BASE_URL } from "../services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer, LineChart, Line, Sector } from "recharts";
import { FaCloudUploadAlt, FaChartBar, FaChartLine, FaEnvelope } from "react-icons/fa";
import { MdPriorityHigh } from 'react-icons/md';
import { BsFillBookmarkStarFill } from 'react-icons/bs';
import { HiOutlineMailOpen } from 'react-icons/hi';
import "../styles/DashboardPage.css";
import { PieChart, Pie } from "recharts";
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import Papa from 'papaparse';



const DashboardPage = () => {
   const BASE_URL = process.env.BASE_URL;
  const [status, setStatus] = useState(null);
  const [time, setTime] = useState(new Date());
  const [selectedClient, setSelectedClient] = useState("Club Mahindra Dentsu");
  const [clients, setClients] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const [performanceClient, setPerformanceClient] = useState("Club Mahindra Dentsu");
  const [performanceData, setPerformanceData] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [dailyTrend, setDailyTrend] = useState([]);
  const [criticalClient, setCriticalClient] = useState("Club Mahindra Dentsu");
  const [criticalData, setCriticalData] = useState([]);
  const [active1, setActive1] = useState(null);
  const [active2, setActive2] = useState(null);
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [isMonthwise, setIsMonthwise] = useState(false);


  const toggleView = () => {
    setIsMonthwise(prev => !prev);
  };


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



  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/dashboard/today-logs-status`);
        setStatus(res.data);
        console.log(res.data);
      } catch (err) {
        console.error("Error fetching status:", err);
      }
    };
    fetchStatus();
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };



  useEffect(() => {
    const fetchStatistics = async (client = '') => {
      try {
        const res = await axios.get(`${BASE_URL}/dashboard/statistics`, {
          params: { client }
        });
        setStatistics(res.data);
        console.log("Statistics:", res.data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchStatistics(selectedClient);

    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [selectedClient]);

  const chartData = statistics
    ? [
      {
        name: "Count",
        submitted: statistics.total_submitted,
        delivered: statistics.total_delivered,
        failed: statistics.total_failed,
        notsent: statistics.total_notsent,
      },
    ]
    : [];

  const barColors = ["#4CAF50", "#2196F3", "#f44336", "#FFC107"];
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#1e293b",
            color: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold" }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: 0 }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const statisticsPieData = [
    { name: "Submitted", value: Number(statistics?.total_submitted || 0) },
    { name: "Delivered", value: Number(statistics?.total_delivered || 0) },
    { name: "Failed", value: Number(statistics?.total_failed || 0) },
    { name: "Not Sent", value: Number(statistics?.total_notsent || 0) },
  ];



  useEffect(() => {
    const fetchPerformanceData = async (client = '') => {
      try {
        const res = await axios.get(`${BASE_URL}/dashboard/performance-analytics`, {
          params: { client }
        });
        setPerformanceData(res.data.circleData);
        setMonthlyTrend(res.data.monthlyTrend);
        setDailyTrend(res.data.dailyTrend);
        console.log("performance", res.data.circleData);
        console.log("monthy data", res.data.monthlyTrend);
        console.log("Daily data", res.data.dailyTrend);
      } catch (error) {
        console.error("Error fetching performance data:", error);
      }
    };

    fetchPerformanceData(performanceClient);

    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [performanceClient]);

  const pieData = performanceData.map(item => ({
    name: item.circle,
    value: item.count
  }));

  const pieColors = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#00BCD4", "#F44336", "#3F51B5", "#8BC34A", "#FFC107", "#795548"];

  const states = [
    "Mumbai", "Karnataka", "Kerala", "Gujarat", "Andhra Pradesh", "UP (East)", "Punjab", "Tamilnadu", "Kolkata"
  ];
  const fetchCoordinates = async (stateName) => {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(stateName + ", India")}`, {
      headers: { 'User-Agent': 'frontend-app' }
    });
    const data = await res.json();
    if (data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    return null;
  };

  const buildCircleCoordinates = async (performanceData) => {
    const uniqueStates = [...new Set(performanceData.map(d => d.circle))];

    const coordinatePromises = uniqueStates.map(async (state) => {
      const coord = await fetchCoordinates(state);
      if (coord) {
        return { state, coord };
      }
      return null;
    });
    const results = await Promise.all(coordinatePromises);

    const coordinates = results.reduce((acc, result) => {
      if (result) {
        acc[result.state] = result.coord;
      }
      return acc;
    }, {});

    return coordinates;
  };

  const circleCoordinates = {
    "Mumbai": [19.0760, 72.8777],
    "Karnataka": [12.9716, 77.5946],
    "Kerala & Lakshadweep": [10.8505, 76.2711],
    "Gujarat": [22.2587, 71.1924],
    "Andhra Pradesh": [15.9129, 79.7400],
    "UP (East)": [26.8467, 80.9462],
    "Punjab": [31.1471, 75.3412],
  };

  const heatmapColors = [
    "#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#00BCD4",
    "#E91E63", "#FFC107", "#3F51B5", "#009688", "#F44336"
  ];
  /*const maxCount = Math.max(...performanceData.map(d => d.count));
  const heatmapPoints = performanceData
    .filter(d => circleCoordinates[d.circle])
    .map((d, index) => {
      const [lat, lng] = circleCoordinates[d.circle];
      return {
        lat,
        lng,
        intensity: +(d.count / maxCount).toFixed(2),
        color: heatmapColors[index % heatmapColors.length],
        name: d.circle
      };
    });*/

  useEffect(() => {
    const init = async () => {
      const circleCoordinates = await buildCircleCoordinates(performanceData);

      const maxCount = Math.max(...performanceData.map(d => d.count));

      const heatmapPoints = performanceData
        .filter(d => circleCoordinates[d.circle])
        .map((d, index) => {
          const [lat, lng] = circleCoordinates[d.circle];
          return {
            lat,
            lng,
            intensity: +(d.count / maxCount).toFixed(2),
            color: heatmapColors[index % heatmapColors.length],
            name: d.circle
          };
        });

      setHeatmapPoints(heatmapPoints);
      console.log("heatmap points:", heatmapPoints);
    };

    init();
  }, [performanceData]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedMonthlyData = monthlyTrend.map((item) => ({
    month: `${monthNames[item.month - 1]} ${item.year}`,
    delivered: item.total_delivered,
  }));

  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const formattedDailyData = dailyTrend.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', options),
    delivered: parseInt(item.delivered_count)
  }));


  const downloadCSV = (csv) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = 'performance_data.csv';
    link.click();
  };
  const handleExport = () => {
    const standardizedMonthlyTrend = monthlyTrend.map(item => ({
      name: item.month,
      score: item.average
    }));

    const standardizedDailyTrend = dailyTrend.map(item => ({
      name: item.day,
      score: item.total
    }));

    const csvData = performanceData
      .concat(standardizedMonthlyTrend)
      .concat(standardizedDailyTrend);

    const csv = Papa.unparse(csvData);
    downloadCSV(csv);
  };

  const totalSent = statistics?.total_submitted || 1000;
  const totalDelivered = statistics?.total_delivered || 850;
  const totalFailed = statistics?.total_failed || 150;

  const deliveryRate = Math.round((totalDelivered / totalSent) * 100);
  const bounceRate = Math.round((totalFailed / totalSent) * 100);

  useEffect(() => {
    const fetchCriticalData = async (client = '') => {
      try {
        const res = await axios.get(`${BASE_URL}/dashboard/critical-data`, {
          params: { client }
        });
        setCriticalData(res.data);
        console.log("sms critical data", res.data);
      } catch (error) {
        console.error("Error fetching performance data:", error);
      }
    };

    fetchCriticalData(criticalClient);

    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [criticalClient]);



  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-main-card-1">
        <div className="dashboard-title-container">
          <h1 className="dashboard-title">
            <FaCloudUploadAlt size={25} color="#22d3ee" style={{ marginRight: "10px" }} />
            Upload Dashboard
          </h1>
        </div>

        <div className="dashboard-card">
          <div className="grid-section">
            <div className="grid-item">
              <h3>📆 Current Date & Time</h3>
              <p>{time.toLocaleString()}</p>
            </div>

            <div className="grid-item">
              <h3>✅ Files Uploaded Today</h3>
              <p>{status?.uploadedToday ? "Yes" : "No"}</p>
            </div>

            <div className="grid-item">
              <h3>📁 Total Files</h3>
              <p>{status?.count || 0}</p>
            </div>

            <div className="grid-item">
              <h3>📦 Total Size</h3>
              <p>{formatBytes(status?.sizeInBytes)}</p>
            </div>

            <div className="grid-item">
              <h3>🚦 Live Upload Status</h3>
              <span className={status?.uploadedToday ? "green-dot" : "red-dot"}></span>
            </div>
          </div>

          <div className="drop-zone">
            <h3>📥 Drag & Drop File Upload (Demo)</h3>
            <div className="drop-area">Drop files here</div>
          </div>

          <div className="recent-uploads">
            <h3>🗂️ Recent Uploads</h3>
            <table className="recent-table">
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {status?.files?.length > 0 ? (
                  status.files.map((filename, index) => (
                    <tr key={index}>
                      <td>{filename}</td>
                      <td>✅</td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">No uploads found for today</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="dashboard-main-card-1">
        <div className="dashboard-title-container">
          <h1 className="dashboard-title">📊 Statistics</h1>
        </div>
        <div className="dashboard-card">
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
          <div className="chart-container">
            <div className="top-row">
              <div className="chart-card">
                {statistics && (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData} barCategoryGap="12%" margin={{ bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="submitted" name="Submitted" fill="#4CAF50" />
                      <Bar dataKey="delivered" name="Delivered" fill="#2196F3" />
                      <Bar dataKey="failed" name="Failed" fill="#f44336" />
                      <Bar dataKey="notsent" name="Not Sent" fill="#FFC107" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="chart-card">
                <div className="chart-content">

                  <div className="chart-left">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statisticsPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          innerRadius={90}
                          activeIndex={active1}
                          activeShape={(props) => (
                            <g>
                              <Sector
                                cx={props.cx}
                                cy={props.cy}
                                innerRadius={props.innerRadius}
                                outerRadius={props.outerRadius + 10}
                                startAngle={props.startAngle}
                                endAngle={props.endAngle}
                                fill={props.fill}
                                cursor="pointer"
                              />
                            </g>
                          )}
                          onMouseEnter={(_, index) => setActive1(index)}
                          onMouseLeave={() => setActive1(null)}

                        >
                          {statisticsPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>

                        <text
                          x="50%"
                          y="45%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize={25}
                          fontWeight="bold"
                        >
                          {active1 !== null ? statisticsPieData[active1]?.name : statisticsPieData[0]?.name || "--"}
                        </text>
                        <text
                          x="50%"
                          y="60%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize={18}
                        >
                          {active1 !== null
                            ? statisticsPieData[active1]?.value?.toLocaleString?.() || "0"
                            : statisticsPieData[0]?.value?.toLocaleString?.() || "0"}
                        </text>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>


                  <div className="chart-right">
                    <div className="chart-legend">
                      {statisticsPieData.map((item, index) => (
                        <div className="legend-item" key={index}>
                          <div
                            className="legend-dot"
                            style={{ backgroundColor: pieColors[index % pieColors.length] }}
                          />
                          <span className="legend-label">
                            {item.name}: {item.value.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-main-card-1">
        <div className="dashboard-title-container">
          <h1 className="dashboard-title"><FaEnvelope size={20} color="#facc15" style={{ marginRight: "10px" }} />
            SMS Performance Analytics
          </h1>
          <button
            onClick={handleExport}
            style={{
              padding: "5px 10px",
              borderRadius: "5px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              marginRight: "10px"
            }}
          >
            Export CSV
          </button>
        </div>

        <div className="dashboard-card">
          <select
            value={performanceClient}
            onChange={(e) => setPerformanceClient(e.target.value)}
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


          <div className="chart-container">

            <div className="top-row">
              <div className="chart-card pie-chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={140}
                      innerRadius={100}
                      activeIndex={active2}
                      activeShape={(props) => (
                        <g>
                          <Sector
                            cx={props.cx}
                            cy={props.cy}
                            innerRadius={props.innerRadius}
                            outerRadius={props.outerRadius + 10}
                            startAngle={props.startAngle}
                            endAngle={props.endAngle}
                            fill={props.fill}
                            cursor="pointer"
                          />
                        </g>
                      )}
                      onMouseEnter={(_, index) => setActive2(index)}
                      onMouseLeave={() => setActive2(null)}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>

                    <text
                      x="50%"
                      y="45%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={25}
                      fontWeight="bold"
                    >
                      {active2 !== null ? pieData[active2]?.name : pieData[0]?.name || "Circle"}
                    </text>
                    <text
                      x="50%"
                      y="60%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={18}
                    >
                      {active2 !== null
                        ? pieData[active2]?.value?.toLocaleString?.() || "0"
                        : pieData[0]?.value?.toLocaleString?.() || "0"}
                    </text>


                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card heatmap-container">
                <MapContainer
                  center={[22.9734, 78.6569]}
                  zoom={5}
                  scrollWheelZoom
                  dragging
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {heatmapPoints.map((p, idx) => (
                    <CircleMarker
                      key={idx}
                      center={[p.lat, p.lng]}
                      radius={p.intensity * 25}
                      pathOptions={{
                        color: p.color,
                        fillColor: p.color,
                        fillOpacity: 0.6,
                      }}
                    >
                      <LeafletTooltip direction="top" offset={[0, -10]} opacity={1}>
                        <span>{p.name}</span>
                      </LeafletTooltip>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
            </div>



            <div className="bottom-row">
              <div className="chart-card linechart-container">
                <button className="toggle-button" onClick={toggleView}>
                  {isMonthwise ? 'Day' : 'Month'}
                </button>


                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={isMonthwise ? formattedMonthlyData : formattedDailyData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={isMonthwise ? "month" : "date"} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="delivered" stroke="#82ca9d" name="Delivered SMS" />
                  </LineChart>
                </ResponsiveContainer>
              </div>


              <div className="chart-card circular-indicators">
                <div className="circle-indicator">
                  <svg viewBox="0 0 36 36" className="circular-chart green">
                    <path
                      className="circle-bg"
                      d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="circle"
                      strokeDasharray={`${deliveryRate}, 100`}
                      d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <text x="18" y="20.35" className="percentage">
                      {deliveryRate}%
                    </text>
                  </svg>
                  <p className="label">Delivery Rate</p>
                  <p className="formula">Delivered / Sent</p>
                </div>

                <div className="circle-indicator">
                  <svg viewBox="0 0 36 36" className="circular-chart red">
                    <path
                      className="circle-bg"
                      d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="circle"
                      strokeDasharray={`${bounceRate}, 100`}
                      d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <text x="18" y="20.35" className="percentage">
                      {bounceRate}%
                    </text>
                  </svg>
                  <p className="label">Bounce Rate</p>
                  <p className="formula">Failed / Sent</p>
                </div>
              </div>
            </div>
            

          </div>
        </div>
      </div>


      <div className="dashboard-main-card-1">
        <div className="dashboard-title-container">
          <h1 className="dashboard-title"><BsFillBookmarkStarFill size={20} color="#fb923c" style={{ marginRight: "10px" }} />
            SMS Critical Updates
          </h1>
        </div>

        <div className="dashboard-card">
          <select
            value={performanceClient}
            onChange={(e) => setPerformanceClient(e.target.value)}
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

          <div className="chart-container">
            {criticalData.length > 0 && (
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
                      {Object.keys(criticalData[0]).map((key) => (
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
                    {criticalData.map((item, rowIndex) => (
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
