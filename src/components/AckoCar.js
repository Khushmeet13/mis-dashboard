import React, { useState, useEffect } from "react";
import '../styles/AckoCar.css';
//import { BASE_URL } from "../services/api";

const AckoCar = () => {
    const BASE_URL = process.env.BASE_URL;
    const [data, setData] = useState([]);
    const [countData, setCountData] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [showCounts, setShowCounts] = useState(true);

    const fetchCountData = async () => {
        try {
            const response = await fetch(`${BASE_URL}/client/acko-car-count`);
            if (!response.ok) throw new Error("Failed to fetch count data");
            const data = await response.json();
            console.log("Fetched Count Data:", data);
            setCountData(data);
        } catch (error) {
            console.error("Error fetching count data:", error);
        }
    };


    const fetchData = () => {
        if (!selectedDate) return;

        fetch(`${BASE_URL}/client/acko-car?selectedDate=${selectedDate}`)
            .then((response) => response.json())
            .then((data) => {
                console.log("Fetched Data:", data);
                /*const leads = data[0]?.total_leads || 0;
                const sales = data[0]?.total_sales || 0;
                console.log("leads:", leads);
                console.log("sales:", sales);
                setTotalLeads(leads);
                setTotalSales(sales);*/

                setData(data.detailedResults);
                //setCountData(data.countResults);

            })
            .catch((error) => console.error("Error fetching data:", error));
    };

    useEffect(() => {
        fetchCountData();
    }, []);

    useEffect(() => {
        if (selectedDate) fetchData();
    }, [selectedDate]);

    return (
        <div className="acko-container">
            {/*<div className="acko-heading-container">
                <h3 className="acko-heading">
                   Acko Reporting <FaChartLine className="reporting-icon" />
                </h3>
            </div>

            <div className="divider-2"></div>

            <ClientUpload />*/}
            <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="date-picker"
            />

            <button onClick={() => setShowCounts(!showCounts)} className="toggle-btn">
                {showCounts ? "View Table" : "Counts"}
            </button>


            {showCounts ? (
                <div className="counts-container">
                    <table className="counts-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Utm Medium</th>
                                <th>Leads</th>
                                <th>Sales</th>
                            </tr>
                        </thead>
                        <tbody>
                            {countData.map((row, index) => (
                                <tr key={index}>
                                    <td>{row.extracted_date}</td>
                                    <td>{row.all_mediums}</td>
                                    <td>{row.lead_count}</td>
                                    <td>{row.sale_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (

                <div className="lead-table">
                <table >
                    <thead>
                        <tr>
                            <th>Lead ID</th>
                            <th>Lead Date</th>
                            <th>Lead Phone</th>
                            <th>Lead Campaign</th>
                            <th>Lead Medium</th>
                            <th>Lead Source</th>
                            <th>Lead Term</th>
                            <th>Lead Product</th>
                            <th>Lead City</th>
                            <th>Lead Category</th>

                            <th>Sale ID</th>
                            <th>Sale Date</th>
                            <th>Sale Phone</th>
                            <th>Sale Campaign</th>
                            <th>Sale Medium</th>
                            <th>Sale Source</th>
                            <th>Sale Term</th>
                            <th>Sale Product</th>
                            <th>Sale Amount</th>
                            <th>Sale City</th>
                            <th>Sale Category</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index}>
                                <td>{row.lead_id}</td>
                                <td>{row.lead_report_date}</td>
                                <td>{row.lead_phone}</td>
                                <td>{row.lead_campaign}</td>
                                <td>{row.lead_medium}</td>
                                <td>{row.lead_source}</td>
                                <td>{row.lead_term}</td>
                                <td>{row.lead_product}</td>
                                <td>{row.lead_city}</td>
                                <td>{row.lead_city_category}</td>
                                <td>{row.sale_id}</td>
                                <td>{row.sale_report_date}</td>
                                <td>{row.sale_phone}</td>
                                <td>{row.sale_campaign}</td>
                                <td>{row.sale_medium}</td>
                                <td>{row.sale_source}</td>
                                <td>{row.sale_term}</td>
                                <td>{row.sale_product}</td>
                                <td>{row.amount}</td>
                                <td>{row.sale_city}</td>
                                <td>{row.sale_city_category}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            )}
        </div>
    );
};

export default AckoCar;
