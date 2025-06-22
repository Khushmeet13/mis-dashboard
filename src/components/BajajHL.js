import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
//import { BASE_URL } from "../services/api";
import { FaSearch, FaCaretDown, FaEye } from "react-icons/fa";
import "../styles/BajajHL.css";

const BajajHL = () => {
   const BASE_URL = process.env.BASE_URL;
  const [countData, setCountData] = useState([]);
  const [filesData, setFilesData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [month, setMonth] = useState("");
  const [showCounts, setShowCounts] = useState(true);
  const [campaignTypeFilter, setCampaignTypeFilter] = useState("");
  const [campaignDropdownOpen, setCampaignDropdownOpen] = useState(false);
  const campaignDropdownRef = useRef(null);
  const [selectorActiveInterface, setSelectorActiveInterface] = useState("search");
  const [activeInterface, setActiveInterface] = useState("counts");
  const [innerActiveInterface, setInnerActiveInterface] = useState("lead");

  const fetchData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/client/bajaj-hl`, {
        params: { fromDate, toDate, month, campaignTypeFilter }
      });

      setCountData(response.data.leadsCount);
      setTableData(response.data.tableData);
      console.log(response.data);

    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  const fetchFilesData = async () => {

    try {
      const response = await axios.get(`${BASE_URL}/client/bajaj-hl/files-data`, {
        params: { month }

      });

      console.log(response.data);
      setFilesData(response.data);

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        campaignDropdownRef.current &&
        !campaignDropdownRef.current.contains(event.target)
      ) {
        setCampaignDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (campaignTypeFilter) {
      fetchData();
    }
  }, [campaignTypeFilter]);

  return (
    <div className="bajaj-container">
      <div className="selector-card">
        <div className="selector-header">
          <p className={`${innerActiveInterface === "lead" ? "active" : ""}`}
            onClick={() => {
              setSelectorActiveInterface("search");
              setInnerActiveInterface("lead");
            }}><FaSearch /> Search Uploaded Files</p>
          <div className="ver-divider"></div>
          <p className={`${innerActiveInterface === "view" ? "active" : ""}`}
            onClick={() => {
              setSelectorActiveInterface("view");
              setInnerActiveInterface("view");
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
                  className="date-picker"
                />


                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="date-picker"
                />

                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="client-date-picker"
                />


                <button className="search-btn" onClick={fetchData}>
                  Search
                </button>


                <div className="divider"></div>

                <div>
                  <button onClick={() => setActiveInterface(activeInterface === "counts" ? "table" : "counts")}
                    className="selector-toggle-btn"
                  >
                    {activeInterface === "counts" ? "View Table" : "Counts"}
                  </button>
                </div>


                <div className="divider-2"></div>

                <div className="button-container">
                  <button className={`bajaj-button ${innerActiveInterface === "lead" ? "bajaj-active-btn" : ""}`}
                    onClick={() => setInnerActiveInterface("lead")}
                  >Lead</button>
                  <button className={`bajaj-button ${innerActiveInterface === "login" ? "bajaj-active-btn" : ""}`}
                    onClick={() => setInnerActiveInterface("login")}
                  >Login</button>
                  <button className={`bajaj-button ${innerActiveInterface === "approval" ? "bajaj-active-btn" : ""}`}
                    onClick={() => setInnerActiveInterface("approval")}
                  >Approval</button>
                  <button className={`bajaj-button ${innerActiveInterface === "disb" ? "bajaj-active-btn" : ""}`}
                    onClick={() => setInnerActiveInterface("disb")}
                  >Disb</button>
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

      {innerActiveInterface === "view" && (
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
        <>

          {innerActiveInterface === "lead" && (
            <div className="counts-container">
              <table className="counts-table">
                <thead>
                  <tr>
                    <th>Utm Campaign</th>
                    <th>Type{" "}
                      <span className="filter-container" onClick={() => setCampaignDropdownOpen(!campaignDropdownOpen)} ref={campaignDropdownRef}>
                        <FaCaretDown />
                        {campaignDropdownOpen && (
                          <div className="dropdown">
                            <div onClick={() => setCampaignTypeFilter("All")}>All</div>
                            <div onClick={() => setCampaignTypeFilter("SMS")}>SMS</div>
                            <div onClick={() => setCampaignTypeFilter("RCS")}>RCS</div>
                            <div onClick={() => setCampaignTypeFilter("JIO")}>JIO</div>
                          </div>
                        )}
                      </span>
                    </th>
                    <th>Lead</th>
                    <th>Lead BT</th>
                    <th>Lead Fresh</th>
                  </tr>
                </thead>
                <tbody>
                  {countData.length > 0 ? (
                    countData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.utm_campaign}</td>
                        <td>{item.campaign_type}</td>
                        <td>{item.lead_count}</td>
                        <td>{item.lead_bt_count}</td>
                        <td>{item.lead_fresh_count}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {innerActiveInterface === "login" && (
            <div className="counts-container">
              <table className="counts-table">
                <thead>
                  <tr>
                    <th>Utm Campaign</th>
                    <th>Type{" "}
                      <span className="filter-container" onClick={() => setCampaignDropdownOpen(!campaignDropdownOpen)} ref={campaignDropdownRef}>
                        <FaCaretDown />
                        {campaignDropdownOpen && (
                          <div className="dropdown">
                            <div onClick={() => setCampaignTypeFilter("All")}>All</div>
                            <div onClick={() => setCampaignTypeFilter("SMS")}>SMS</div>
                            <div onClick={() => setCampaignTypeFilter("RCS")}>RCS</div>
                            <div onClick={() => setCampaignTypeFilter("JIO")}>JIO</div>
                          </div>
                        )}
                      </span>
                    </th>
                    <th>Login</th>
                    <th>Login BT</th>
                    <th>Login Fresh</th>
                  </tr>
                </thead>
                <tbody>
                  {countData.length > 0 ? (
                    countData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.utm_campaign}</td>
                        <td>{item.campaign_type}</td>
                        <td>{item.login_count}</td>
                        <td>{item.login_bt_count}</td>
                        <td>{item.login_fresh_count}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {innerActiveInterface === "approval" && (
            <div className="counts-container">
              <table className="counts-table">
                <thead>
                  <tr>
                    <th>Utm Campaign</th>
                    <th>Type{" "}
                      <span className="filter-container" onClick={() => setCampaignDropdownOpen(!campaignDropdownOpen)} ref={campaignDropdownRef}>
                        <FaCaretDown />
                        {campaignDropdownOpen && (
                          <div className="dropdown">
                            <div onClick={() => setCampaignTypeFilter("All")}>All</div>
                            <div onClick={() => setCampaignTypeFilter("SMS")}>SMS</div>
                            <div onClick={() => setCampaignTypeFilter("RCS")}>RCS</div>
                            <div onClick={() => setCampaignTypeFilter("JIO")}>JIO</div>
                          </div>
                        )}
                      </span>
                    </th>
                    <th>Approval</th>
                    <th>Approval BT</th>
                    <th>Approval Fresh</th>
                  </tr>
                </thead>
                <tbody>
                  {countData.length > 0 ? (
                    countData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.utm_campaign}</td>
                        <td>{item.campaign_type}</td>
                        <td>{item.approval_count}</td>
                        <td>{item.approval_bt_count}</td>
                        <td>{item.approval_fresh_count}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {innerActiveInterface === "disb" && (
            <div className="counts-container">
              <table className="counts-table">
                <thead>
                  <tr>
                    <th>Utm Campaign</th>
                    <th>Type{" "}
                      <span className="filter-container" onClick={() => setCampaignDropdownOpen(!campaignDropdownOpen)} ref={campaignDropdownRef}>
                        <FaCaretDown />
                        {campaignDropdownOpen && (
                          <div className="dropdown">
                            <div onClick={() => setCampaignTypeFilter("All")}>All</div>
                            <div onClick={() => setCampaignTypeFilter("SMS")}>SMS</div>
                            <div onClick={() => setCampaignTypeFilter("RCS")}>RCS</div>
                            <div onClick={() => setCampaignTypeFilter("JIO")}>JIO</div>
                          </div>
                        )}
                      </span>
                    </th>
                    <th>Disb</th>
                    <th>Disb BT</th>
                    <th>Disb Fresh</th>
                  </tr>
                </thead>
                <tbody>
                  {countData.length > 0 ? (
                    countData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.utm_campaign}</td>
                        <td>{item.campaign_type}</td>
                        <td>{item.disb_count}</td>
                        <td>{item.disb_bt_count}</td>
                        <td>{item.disb_fresh_count}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeInterface === "table" && (
        <>

          {innerActiveInterface === "lead" && (
            <div className="lead-table">
              <table>
                <thead>
                  <tr>
                    <th>Offer Id</th>
                    <th>Offer Name</th>
                    <th>offer_product</th>
                    <th>business_vertical</th>
                    <th>bv</th>
                    <th>utm_source</th>
                    <th>utm_medium</th>
                    <th>utm_campaign</th>
                    <th>bt_f</th>
                    <th>utm_content</th>
                    <th>sourcing_branch</th>
                    <th>warm</th>
                    <th>channel</th>
                    <th>city</th>
                    <th>campaign_date</th>
                    <th>month</th>
                    <th>demart_status</th>
                    <th>vouchers</th>
                    <th>utm_product</th>
                    <th>turnover</th>
                    <th>total_experience</th>
                    <th>tele_followup</th>
                    <th>telecaller_remarks</th>
                    <th>telecaller_action</th>
                    <th>tele_userid</th>
                    <th>tele_disposition_1</th>
                    <th>tele_disposition_2</th>
                    <th>tele_disposition_3</th>
                    <th>telecaller_dispositiontype</th>
                    <th>sale_status</th>
                    <th>responsed_date</th>
                    <th>required_loan_amount</th>
                    <th>property_location</th>
                    <th>property_identified</th>
                    <th>propensity</th>
                    <th>pan_no</th>
                    <th>owner_id</th>
                    <th>owner_name</th>
                    <th>offer_amount</th>
                    <th>not_salary</th>
                    <th>ndeureofbusiness</th>
                    <th>nameof_degree</th>
                    <th>degree_type</th>
                    <th>loan_type</th>
                    <th>lead_id</th>
                    <th>idest_cibil_mobile</th>
                    <th>isbt</th>
                    <th>hostleadid</th>
                    <th>gross_receipt</th>
                    <th>field_followup_date</th>
                    <th>field_userid</th>
                    <th>field_remarks</th>
                    <th>field_disposition_3</th>
                    <th>field_disposition_2</th>
                    <th>field_disposition_1</th>
                    <th>sales_dispositiontype</th>
                    <th>field_action</th>
                    <th>enquiry_city</th>
                    <th>enquiry_product</th>
                    <th>employment_type</th>
                    <th>email_id</th>
                    <th>dnc_flag</th>
                    <th>customer_name</th>
                    <th>cibil_notes</th>
                    <th>camp_type</th>
                    <th>camp_name</th>
                    <th>mobile_no</th>
                    <th>alt_mobile_no</th>
                    <th>agreement_no</th>
                    <th>curr_experience</th>
                    <th>enquiry_datetime</th>
                    <th>requiredloan_amount</th>
                    <th>current_bank_name</th>
                    <th>sanctioned_loan_amount</th>
                    <th>rate_of_interest</th>
                    <th>interested_in</th>
                    <th>field_last3years</th>
                    <th>property_type</th>
                    <th>down_payment</th>
                    <th>processing_branch</th>
                    <th>zip_code</th>
                    <th>hold_date</th>
                    <th>hold_reason</th>
                    <th>date_of_birth</th>
                    <th>login_date</th>
                    <th>tele_disposition_date</th>
                    <th>disp_camp_date</th>
                    <th>log_camp_tde</th>
                    <th>rechurn_bv</th>
                    <th>rechurn_date</th>
                    <th>ok_tag</th>
                    <th>exclusion_reason</th>
                    <th>allocated_ownerid</th>
                    <th>fcc</th>
                    <th>present_ownerid</th>
                    <th>priority</th>
                    <th>bhfl_bfl</th>
                    <th>field</th>
                    <th>flag</th>
                    <th>rechurn_flag</th>
                    <th>p2_flag_field</th>
                    <th>rechurn_field</th>
                    <th>ticket_size</th>
                  </tr>
                </thead>
                <tbody>
                  {(tableData["bajaj_hl_leads_table"] || []).map((row, index) => (
                    <tr key={index}>
                      <td>{row.offer_id}</td>
                      <td>{row.offer_name}</td>
                      <td>{row.offer_product}</td>
                      <td>{row.business_vertical}</td>
                      <td>{row.bv}</td>
                      <td>{row.utm_source}</td>
                      <td>{row.utm_medium}</td>
                      <td>{row.utm_campaign}</td>
                      <td>{row.bt_f}</td>
                      <td>{row.utm_content}</td>
                      <td>{row.sourcing_branch}</td>
                      <td>{row.warm}</td>
                      <td>{row.channel}</td>
                      <td>{row.city}</td>
                      <td>{row.campaign_date}</td>
                      <td>{row.month}</td>
                      <td>{row.demart_status}</td>
                      <td>{row.vouchers}</td>
                      <td>{row.utm_product}</td>
                      <td>{row.turnover}</td>
                      <td>{row.total_experience}</td>
                      <td>{row.tele_followup}</td>
                      <td>{row.telecaller_remarks}</td>
                      <td>{row.telecaller_action}</td>
                      <td>{row.tele_userid}</td>
                      <td>{row.tele_disposition_1}</td>
                      <td>{row.tele_disposition_2}</td>
                      <td>{row.tele_disposition_3}</td>
                      <td>{row.telecaller_dispositiontype}</td>
                      <td>{row.sale_status}</td>
                      <td>{row.responsed_date}</td>
                      <td>{row.required_loan_amount}</td>
                      <td>{row.property_location}</td>
                      <td>{row.property_identified}</td>
                      <td>{row.propensity}</td>
                      <td>{row.pan_no}</td>
                      <td>{row.owner_id}</td>
                      <td>{row.owner_name}</td>
                      <td>{row.offer_amount}</td>
                      <td>{row.not_salary}</td>
                      <td>{row.ndeureofbusiness}</td>
                      <td>{row.nameof_degree}</td>
                      <td>{row.degree_type}</td>
                      <td>{row.loan_type}</td>
                      <td>{row.lead_id}</td>
                      <td>{row.idest_cibil_mobile}</td>
                      <td>{row.isbt}</td>
                      <td>{row.hostleadid}</td>
                      <td>{row.gross_receipt}</td>
                      <td>{row.field_followup_date}</td>
                      <td>{row.field_userid}</td>
                      <td>{row.field_remarks}</td>
                      <td>{row.field_disposition_3}</td>
                      <td>{row.field_disposition_2}</td>
                      <td>{row.field_disposition_1}</td>
                      <td>{row.sales_dispositiontype}</td>
                      <td>{row.field_action}</td>
                      <td>{row.enquiry_city}</td>
                      <td>{row.enquiry_product}</td>
                      <td>{row.employment_type}</td>
                      <td>{row.email_id}</td>
                      <td>{row.dnc_flag}</td>
                      <td>{row.customer_name}</td>
                      <td>{row.cibil_notes}</td>
                      <td>{row.camp_type}</td>
                      <td>{row.camp_name}</td>
                      <td>{row.mobile_no}</td>
                      <td>{row.alt_mobile_no}</td>
                      <td>{row.agreement_no}</td>
                      <td>{row.curr_experience}</td>
                      <td>{row.enquiry_datetime}</td>
                      <td>{row.requiredloan_amount}</td>
                      <td>{row.current_bank_name}</td>
                      <td>{row.sanctioned_loan_amount}</td>
                      <td>{row.rate_of_interest}</td>
                      <td>{row.interested_in}</td>
                      <td>{row.field_last3years}</td>
                      <td>{row.property_type}</td>
                      <td>{row.down_payment}</td>
                      <td>{row.processing_branch}</td>
                      <td>{row.zip_code}</td>
                      <td>{row.hold_date}</td>
                      <td>{row.hold_reason}</td>
                      <td>{row.date_of_birth}</td>
                      <td>{row.login_date}</td>
                      <td>{row.tele_disposition_date}</td>
                      <td>{row.disp_camp_date}</td>
                      <td>{row.log_camp_tde}</td>
                      <td>{row.rechurn_bv}</td>
                      <td>{row.rechurn_date}</td>
                      <td>{row.ok_tag}</td>
                      <td>{row.exclusion_reason}</td>
                      <td>{row.allocated_ownerid}</td>
                      <td>{row.fcc}</td>
                      <td>{row.present_ownerid}</td>
                      <td>{row.priority}</td>
                      <td>{row.bhfl_bfl}</td>
                      <td>{row.field}</td>
                      <td>{row.flag}</td>
                      <td>{row.rechurn_flag}</td>
                      <td>{row.p2_flag_field}</td>
                      <td>{row.rechurn_field}</td>
                      <td>{row.ticket_size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(innerActiveInterface === "login" || innerActiveInterface === "approval" || innerActiveInterface === "disb") && (
            <div className="counts-container">
              <table className="counts-table">
                <thead>
                  <tr>
                    <th>login_agreementno</th>
                    <th>bussiness_vertical</th>
                    <th>bv</th>
                    <th>customer_id</th>
                    <th>login_date</th>
                    <th>month</th>
                    <th>initiate_login_date</th>
                    <th>approval_date</th>
                    <th>colletral_date</th>
                    <th>sourchannel_category</th>
                    <th>loan_login_status</th>
                    <th>revised_stage</th>
                    <th>wip</th>
                    <th>lead_pan</th>
                    <th>lead_mobile_no</th>
                    <th>lead_altmobile_no</th>
                    <th>phn_no</th>
                    <th>datamart_altmobile_no</th>
                    <th>co_applicant1_phn</th>
                    <th>co_applicant2_phn</th>
                    <th>co_applicant3_phn</th>
                    <th>pan_c</th>
                    <th>co_applicant1_pancard</th>
                    <th>co_applicant2_pancard</th>
                    <th>co_applicant3_pancard</th>
                    <th>login_status</th>
                    <th>approved_loan_amount</th>
                    <th>total_loan_amount</th>
                    <th>loan_category</th>
                    <th>product_code</th>
                    <th>lead_source</th>
                    <th>cust_cif</th>
                    <th>disbursement_date</th>
                    <th>branch_id</th>
                    <th>city_name</th>
                    <th>lead_id</th>
                    <th>offer_id</th>
                    <th>camp_type</th>
                    <th>camp_name</th>
                    <th>camp_date</th>
                    <th>utm_source</th>
                    <th>utm_medium</th>
                    <th>utm_campaign</th>
                    <th>utm_content</th>
                    <th>utm_product</th>
                    <th>offer_date</th>
                    <th>offer_name</th>
                    <th>offer_product</th>
                    <th>product_offering_name</th>
                    <th>owner_id</th>
                    <th>datamart_status</th>
                    <th>offer_amount</th>
                    <th>po_business_vertical</th>
                    <th>bt</th>
                    <th>camp_tat</th>
                    <th>vouchers</th>
                    <th>response_type</th>
                    <th>channel</th>
                    <th>dispositionvl1_sales</th>
                    <th>dispositionvl2_sales</th>
                    <th>dispositionvl3_sales</th>
                    <th>sales_status</th>
                    <th>dispositionvl1_telecaller</th>
                    <th>dispositionvl2_telecaller</th>
                    <th>dispositionvl3_telecaller</th>
                    <th>telecaller_dispositiontype</th>
                    <th>tat</th>
                    <th>flag</th>
                    <th>initiate_login_tat</th>
                    <th>initiate_login_flag</th>
                    <th>lead_reference</th>
                    <th>match_flag</th>
                    <th>business_vertical_flag</th>
                    <th>initiate_login_calc_tat</th>
                    <th>calc_tat</th>
                    <th>score</th>
                    <th>cnt</th>
                    <th>fcc</th>
                  </tr>
                </thead>
                <tbody>
                  {(innerActiveInterface === "login" && tableData["bajaj_hl_login_table"] ||
                    innerActiveInterface === "approval" && tableData["bajaj_hl_approval_table"] ||
                    innerActiveInterface === "disb" && tableData["bajaj_hl_disb_table"] || []).length > 0 ? (
                    (innerActiveInterface === "login" && tableData["bajaj_hl_login_table"] ||
                      innerActiveInterface === "approval" && tableData["bajaj_hl_approval_table"] ||
                      innerActiveInterface === "disb" && tableData["bajaj_hl_disb_table"] || []).map((row, index) => (
                        <tr key={index}>
                          <td>{row.login_agreementno}</td>
                          <td>{row.bussiness_vertical}</td>
                          <td>{row.bv}</td>
                          <td>{row.customer_id}</td>
                          <td>{row.login_date}</td>
                          <td>{row.month}</td>
                          <td>{row.initiate_login_date}</td>
                          <td>{row.approval_date}</td>
                          <td>{row.colletral_date}</td>
                          <td>{row.sourchannel_category}</td>
                          <td>{row.loan_login_status}</td>
                          <td>{row.revised_stage}</td>
                          <td>{row.wip}</td>
                          <td>{row.lead_pan}</td>
                          <td>{row.lead_mobile_no}</td>
                          <td>{row.lead_altmobile_no}</td>
                          <td>{row.phn_no}</td>
                          <td>{row.datamart_altmobile_no}</td>
                          <td>{row.co_applicant1_phn}</td>
                          <td>{row.co_applicant2_phn}</td>
                          <td>{row.co_applicant3_phn}</td>
                          <td>{row.pan_c}</td>
                          <td>{row.co_applicant1_pancard}</td>
                          <td>{row.co_applicant2_pancard}</td>
                          <td>{row.co_applicant3_pancard}</td>
                          <td>{row.login_status}</td>
                          <td>{row.approved_loan_amount}</td>
                          <td>{row.total_loan_amount}</td>
                          <td>{row.loan_category}</td>
                          <td>{row.product_code}</td>
                          <td>{row.lead_source}</td>
                          <td>{row.cust_cif}</td>
                          <td>{row.disbursement_date}</td>
                          <td>{row.branch_id}</td>
                          <td>{row.city_name}</td>
                          <td>{row.lead_id}</td>
                          <td>{row.offer_id}</td>
                          <td>{row.camp_type}</td>
                          <td>{row.camp_name}</td>
                          <td>{row.camp_date}</td>
                          <td>{row.utm_source}</td>
                          <td>{row.utm_medium}</td>
                          <td>{row.utm_campaign}</td>
                          <td>{row.utm_content}</td>
                          <td>{row.utm_product}</td>
                          <td>{row.offer_date}</td>
                          <td>{row.offer_name}</td>
                          <td>{row.offer_product}</td>
                          <td>{row.product_offering_name}</td>
                          <td>{row.owner_id}</td>
                          <td>{row.datamart_status}</td>
                          <td>{row.offer_amount}</td>
                          <td>{row.po_business_vertical}</td>
                          <td>{row.bt}</td>
                          <td>{row.camp_tat}</td>
                          <td>{row.vouchers}</td>
                          <td>{row.response_type}</td>
                          <td>{row.channel}</td>
                          <td>{row.dispositionvl1_sales}</td>
                          <td>{row.dispositionvl2_sales}</td>
                          <td>{row.dispositionvl3_sales}</td>
                          <td>{row.sales_status}</td>
                          <td>{row.dispositionvl1_telecaller}</td>
                          <td>{row.dispositionvl2_telecaller}</td>
                          <td>{row.dispositionvl3_telecaller}</td>
                          <td>{row.telecaller_dispositiontype}</td>
                          <td>{row.tat}</td>
                          <td>{row.flag}</td>
                          <td>{row.initiate_login_tat}</td>
                          <td>{row.initiate_login_flag}</td>
                          <td>{row.lead_reference}</td>
                          <td>{row.match_flag}</td>
                          <td>{row.business_vertical_flag}</td>
                          <td>{row.initiate_login_calc_tat}</td>
                          <td>{row.calc_tat}</td>
                          <td>{row.score}</td>
                          <td>{row.cnt}</td>
                          <td>{row.fcc}</td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={75}>No data available</td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          )}

        </>
      )}


    </div>
  );
};

export default BajajHL;
