import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
//import { BASE_URL } from "../services/api";
import { FaSearch, FaCaretDown, FaEye } from "react-icons/fa";
import "../styles/ClubMahindra.css";

const ClubMahindra = () => {
    const BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const [countData, setCountData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [cpqlData1, setCpqlData1] = useState([]);
    const [cpqlData2, setCpqlData2] = useState([]);
    const [cpqlTotal, setCpqlTotal] = useState([]);
    const [filesData, setFilesData] = useState([]);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [month, setMonth] = useState("");
    const [campType, setCampType] = useState("");
    const [campaignTypeFilter, setCampaignTypeFilter] = useState("");
    const [refferIdFilter, setRefferIdFilter] = useState("");
    const [campaignDropdownOpen, setCampaignDropdownOpen] = useState(false);
    const [refferDropdownOpen, setRefferDropdownOpen] = useState(false);
    const campaignDropdownRef = useRef(null);
    const refferDropdownRef = useRef(null);
    const [activeInterface, setActiveInterface] = useState("counts");
    const [selectorActiveInterface, setSelectorActiveInterface] = useState("search");


    const fetchData = async () => {
        console.log("camp type:", campType);
        console.log("campaign type filter:", campaignTypeFilter);
        console.log("reffer id filter:", refferIdFilter);
        try {
            const response = await axios.get(`${BASE_URL}/client/club-mahindra`, {
                params: { fromDate, toDate, campType, campaignTypeFilter, refferIdFilter }
            });

            setCountData(response.data.leadsCount);
            setTableData(response.data.datewiseLeads);
            setCpqlData1(response.data.cpql1);
            setCpqlData2(response.data.cpql2);
            setCpqlTotal(response.data.total);
            console.log(response.data);

            setCampType("");


        } catch (error) {
            console.error("Error fetching leads:", error);
        }
    };

    const fetchFilesData = async () => {

        try {
            const response = await axios.get(`${BASE_URL}/client/club-mahindra/files-data`, {
                params: { month }
            });

            console.log(response.data);
            setFilesData(response.data);

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const toggleCampaignDropdown = () => {
        setCampaignDropdownOpen(!campaignDropdownOpen);
        setRefferDropdownOpen(false);
    };

    const toggleRefferDropdown = () => {
        console.log("Function Triggered!");
        console.log("campType:", campType);
        console.log("campaignTypeFilter:", campaignTypeFilter);

        if (campType?.trim() === "Other Cities" || campaignTypeFilter?.trim() === "Other Cities") {
            console.log("prev state:", refferDropdownOpen);
            setRefferDropdownOpen(prevState => {
                console.log("Updated state:", !prevState);
                return !prevState;
            });
        }
    };


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                campaignDropdownRef.current &&
                !campaignDropdownRef.current.contains(event.target) &&
                refferDropdownRef.current &&
                !refferDropdownRef.current.contains(event.target)
            ) {
                setCampaignDropdownOpen(false);
                setRefferDropdownOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (campaignTypeFilter) {
            setCampType("");
        }
    }, [campaignTypeFilter]);

    useEffect(() => {
        if (campaignTypeFilter || refferIdFilter) {
            setCampType("");
            fetchData();
        }
    }, [campaignTypeFilter, refferIdFilter]);


    return (
        <div className="club-container">
            <div className="selector-card">
                <div className="selector-header">
                    <p className={`${activeInterface === "counts" ? "active" : ""}`}
                    onClick={() => {
                        setSelectorActiveInterface("search");
                        setActiveInterface("counts");
                    }}><FaSearch /> Search Uploaded Files</p>
                    <div className="ver-divider"></div>
                    <p className={`${activeInterface === "view" ? "active" : ""}`}
                    onClick={() => {
                        setSelectorActiveInterface("view");
                        setActiveInterface("view");
                    }}><FaEye /> View Uploaded Files</p>
                </div>

                <div className="selector-container">
                    <div className="selector-div">
                        {selectorActiveInterface === "search" && (
                            <>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="client-date-picker"
                                />


                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="client-date-picker"
                                />


                                <select
                                    value={campType}
                                    onChange={(e) => setCampType(e.target.value)}
                                    className="custom-select"
                                >
                                    <option value="">Select Campaign Type</option>
                                    <option value="SMS">SMS</option>
                                    <option value="RCS">RCS</option>
                                    <option value="Other Cities">Other Cities</option>
                                </select>


                                <button className="search-btn" onClick={fetchData}>
                                    Search
                                </button>


                                <div className="divider"></div>

                                <div className="club-btn">
                                    <button onClick={() => setActiveInterface(activeInterface === "counts" ? "table" : "counts")}
                                        className="selector-toggle-btn"
                                    >
                                        {activeInterface === "counts" ? "View Table" : "Counts"}
                                    </button>
                                    <button className="cpql-btn" onClick={() => setActiveInterface("cpql")}>
                                        CPQL
                                    </button>
                                </div>
                            </>
                        )}

                        {selectorActiveInterface === "view" && (
                            <>
                                <input
                                    type="month"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="client-date-picker"
                                />

                                <button className="search-btn" onClick={fetchFilesData}>
                                    Search
                                </button>

                            </>
                        )}
                    </div>

                </div>
            </div>

            {activeInterface === "view" && (
                <>
                    <table className="counts-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>File Name</th>
                                <th>Download</th>
                                <th>Uploaded Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filesData.length > 0 ? (
                                filesData.map((file, index) => (
                                    <tr key={index}>
                                        <td>{file.date}</td>
                                        <td>{file.filename.replace(/\.xlsx$/, "")}</td>
                                        <td>
                                            <a
                                                href={`${BASE_URL}${encodeURI(file.filepath)}`}
                                                download
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Download File
                                            </a>
                                        </td>
                                        <td>{new Date(file.uploaded_at).toLocaleString('en-GB')}</td>

                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4">No data available</td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </>
            )}


            {activeInterface === "counts" && (
                <div className="counts-container">
                    <table className="counts-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>
                                    Campaign Type{" "}
                                    <span className="filter-container" onClick={toggleCampaignDropdown} ref={campaignDropdownRef}>
                                        <FaCaretDown />
                                        {campaignDropdownOpen && (
                                            <div className="dropdown">
                                                <div onClick={() => setCampaignTypeFilter("")}>All</div>
                                                <div onClick={() => setCampaignTypeFilter("SMS")}>SMS</div>
                                                <div onClick={() => setCampaignTypeFilter("RCS")}>RCS</div>
                                                <div onClick={() => setCampaignTypeFilter("Other Cities")}>Other Cities</div>
                                            </div>
                                        )}
                                    </span>
                                </th>

                                <th>
                                    Reffer ID{" "}
                                    <span className="filter-container" onClick={toggleRefferDropdown} ref={refferDropdownRef}>
                                        <FaCaretDown />
                                        {(campType === "Other Cities" || campaignTypeFilter === "Other Cities") && refferDropdownOpen && (
                                            <div className="dropdown">
                                                <div onClick={() => setRefferIdFilter("All")}>All</div>
                                                <div onClick={() => setRefferIdFilter("SMS-T100")}>SMS-T100</div>
                                                <div onClick={() => setRefferIdFilter("SMS-T343")}>SMS-T343</div>
                                            </div>
                                        )}
                                    </span>
                                </th>
                                <th>Total Leads</th>
                                <th>NQL</th>
                                <th>QL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {countData.length > 0 ? (
                                <>
                                    {countData.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.lead_date || "N/A"}</td>
                                            <td>{item.camp_type || "N/A"}</td>
                                            <td>{item.reffer_id_source || "N/A"}</td>
                                            <td>{item.total_leads || "0"}</td>
                                            <td>{item.NQL || "0"}</td>
                                            <td>{item.QL || "0"}</td>
                                        </tr>
                                    ))}
                                    <tr style={{ fontWeight: "bold" }}>
                                        <td colSpan="3">Total</td>
                                        <td>
                                            {countData.reduce((sum, item) => sum + (item.total_leads || 0), 0)}
                                        </td>
                                        <td>
                                            {countData.reduce((sum, item) => sum + Number(item.NQL || 0), 0)}
                                        </td>
                                        <td>
                                            {countData.reduce((sum, item) => sum + Number(item.QL || 0), 0)}
                                        </td>
                                    </tr>
                                </>
                            ) : (
                                <tr>
                                    <td colSpan="4">No data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeInterface === "table" && (
                <div className="lead-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Lead Date</th>
                                <th>Data Source</th>
                                <th>Reffer ID Source</th>
                                <th>Campaign Type</th>
                                <th>Owner User ID</th>
                                <th>Lead ID</th>
                                <th>Lead Status</th>
                                <th>Lead Category</th>
                                <th>Campaign Name</th>
                                <th>Call Status</th>
                                <th>City</th>
                                <th>TG</th>
                                <th>State</th>
                                <th>Branch</th>
                                <th>Car Model</th>
                                <th>Car Make</th>
                                <th>Callback date</th>
                                <th>Lead Position</th>
                                <th>Total Call Attempts</th>
                                <th>Fresh Lead</th>
                                <th>First Called Date</th>
                                <th>Last Called Date</th>
                                <th>Verified Flag</th>
                                <th>Verified By</th>
                                <th>Verified Date</th>
                                <th>Active Flag</th>
                                <th>Last Updated Date</th>
                                <th>Remarks</th>
                                <th>Created By</th>
                                <th>Not Interested</th>
                                <th>No of Call Attempts</th>
                                <th>Pincode</th>
                                <th>Follow Up</th>
                                <th>Not Qualified</th>
                                <th>Rejection</th>
                                <th>Lead Type</th>
                                <th>Control Location</th>
                                <th>Age Group</th>
                                <th>Keyword</th>
                                <th>CMP</th>
                                <th>Placement</th>
                                <th>Event String</th>
                                <th>Gclid</th>
                                <th>Gaid</th>
                                <th>Web Page URl</th>
                                <th>Whatsapp Consent</th>
                                <th>Consent Date</th>
                                <th>Concat String</th>
                                <th>Utm Term</th>
                                <th>Family Size</th>
                                <th>Lead Score</th>
                                <th>Lead Stage</th>
                                <th>Nvuid</th>
                                <th>Browser Name</th>
                                <th>Browser Platform</th>
                                <th>Browser Version</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.length > 0 ? (
                                tableData.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.lead_date || "N/A"}</td>
                                        <td>{item.data_source || "N/A"}</td>
                                        <td>{item.reffer_id_source || "N/A"}</td>
                                        <td>{item.camp_type || "N/A"}</td>
                                        <td>{item.owner_user_id || "N/A"}</td>
                                        <td>{item.lead_id || "N/A"}</td>
                                        <td>{item.lead_status || "N/A"}</td>
                                        <td>{item.lead_category || "N/A"}</td>
                                        <td>{item.camp_name || "N/A"}</td>
                                        <td>{item.call_status || "N/A"}</td>
                                        <td>{item.city || "N/A"}</td>
                                        <td>{item.tg || "N/A"}</td>
                                        <td>{item.state || "N/A"}</td>
                                        <td>{item.branch || "N/A"}</td>
                                        <td>{item.car_model || "N/A"}</td>
                                        <td>{item.car_make || "N/A"}</td>
                                        <td>{item.callback_date || "N/A"}</td>
                                        <td>{item.lead_position || "N/A"}</td>
                                        <td>{item.call_attempts || "N/A"}</td>
                                        <td>{item.fresh_lead || "N/A"}</td>
                                        <td>{item.first_date || "N/A"}</td>
                                        <td>{item.last_date || "N/A"}</td>
                                        <td>{item.verified_flag || "N/A"}</td>
                                        <td>{item.verified_by || "N/A"}</td>
                                        <td>{item.verified_date || "N/A"}</td>
                                        <td>{item.active_flag || "N/A"}</td>
                                        <td>{item.last_updated_date || "N/A"}</td>
                                        <td>{item.remarks || "N/A"}</td>
                                        <td>{item.created_by || "N/A"}</td>
                                        <td>{item.not_interested || "N/A"}</td>
                                        <td>{item.total_call_attempts || "N/A"}</td>
                                        <td>{item.pincode || "N/A"}</td>
                                        <td>{item.follow_up || "N/A"}</td>
                                        <td>{item.not_qualified || "N/A"}</td>
                                        <td>{item.rejection || "N/A"}</td>
                                        <td>{item.lead_type || "N/A"}</td>
                                        <td>{item.control_location || "N/A"}</td>
                                        <td>{item.age_group || "N/A"}</td>
                                        <td>{item.keyword || "N/A"}</td>
                                        <td>{item.cmp || "N/A"}</td>
                                        <td>{item.placement || "N/A"}</td>
                                        <td>{item.event_string || "N/A"}</td>
                                        <td>{item.gclid || "N/A"}</td>
                                        <td>{item.gaid || "N/A"}</td>
                                        <td>{item.web_url || "N/A"}</td>
                                        <td>{item.whatsapp_consent || "N/A"}</td>
                                        <td>{item.consent_date || "N/A"}</td>
                                        <td>{item.concat_string || "N/A"}</td>
                                        <td>{item.utm_term || "N/A"}</td>
                                        <td>{item.family_size || "N/A"}</td>
                                        <td>{item.lead_score || "N/A"}</td>
                                        <td>{item.lead_stage || "N/A"}</td>
                                        <td>{item.nvuid || "N/A"}</td>
                                        <td>{item.browser_name || "N/A"}</td>
                                        <td>{item.browser_platform || "N/A"}</td>
                                        <td>{item.browser_version || "N/A"}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="55">No Data Available</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeInterface === "cpql" && (
                <div className="cpql-container">
                    <div className="table-wrapper">
                        <div className="table-header">
                            <p><strong>Campaign Type:</strong> Zesin Other Cities CMH</p>
                            <p><strong>TG:</strong> Yes</p>
                            <p><strong>Lead Status:</strong> (Appointment%, Callback, Follow Up, Busy, Ringing No Response)</p>
                            <p><strong>No of Call Attempts:</strong> (All)/(1,2,3)</p>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Lead Date</th>
                                    <th>CPQL Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cpqlData1.length > 0 ? (
                                    <>
                                        {cpqlData1.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.lead_date || "N/A"}</td>
                                                <td>{item.count_of_lead_category || "N/A"}</td>
                                            </tr>
                                        ))}

                                        <tr style={{ fontWeight: "bold" }}>
                                            <td>Total</td>
                                            <td>
                                                {cpqlData1.reduce((sum, item) => sum + (item.count_of_lead_category || 0), 0)}
                                            </td>
                                        </tr>
                                    </>
                                ) : (
                                    <tr>
                                        <td colSpan="4">No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ClubMahindra;
