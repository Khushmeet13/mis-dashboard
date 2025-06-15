import React, { useState, useEffect } from 'react';
import '../styles/SmsReports.css';
import CsvReport from './CsvReport';
import CsvUpload from "./CsvUpload";
import TxtUpload from './TxtUpload';
import TxtReport from './TxtReport';
import CsvData from './CsvData';
import BaseCheckPage from './BaseCheckPage';


const SmsReports = () => {
  const [activeInterface, setActiveInterface] = useState("csv");
  const [refresh, setRefresh] = useState(false)
  const [showReport, setShowReport] = useState(false);
  const [isFetchingReport, setIsFetchingReport] = useState(false);
  const [showUploadSection, setShowUploadSection] = useState(true);

  const handleFileUpload = () => {
    setShowReport(true);
  };

  return (

    <div className="sms-container">

      <div className="button-container">
        <button
          className={`csv-button ${activeInterface === "csv" ? "active-btn" : ""}`}
          onClick={() => setActiveInterface("csv")}
        >
          CSV SMS Upload
        </button>
        <button
          className={`txt-button ${activeInterface === "txt" ? "active-btn" : ""}`}
          onClick={() => setActiveInterface("txt")}
        >
          TXT RCS Upload
        </button>

        <button
          className={`view-button-1 ${activeInterface === "view-1" ? "active-btn" : ""}`}
          onClick={() => setActiveInterface("view-1")}
        >
          View SMS Uploads
        </button>

        <button
          className={`view-button-2 ${activeInterface === "view-2" ? "active-btn" : ""}`}
          onClick={() => setActiveInterface("view-2")}
        >
          View All Uploads
        </button>

        <button
          className={`view-button-3 ${activeInterface === "view-3" ? "active-btn" : ""}`}
          onClick={() => setActiveInterface("view-3")}
        >
          Check Base
        </button>
      </div>

      <div className="divider-2"></div>

      {activeInterface === "csv" && (
        <div className="csv-container">
          <div className="csv-upload">
            <CsvUpload setRefresh={setRefresh} />
          </div>

          <div className="csv-report">
            {/*<CsvReport setIsFetchingReport={setIsFetchingReport} setShowUploadSection={setShowUploadSection}/>
            <CsvData />*/}
          </div>
        </div>
      )}


      {activeInterface === "txt" && (
        <div className='txt-container'>
          <div className="txt-upload">
            <TxtUpload />
          </div>
          <div className="txt-report">
            {/*<TxtReport />*/}
          </div>
        </div>
      )}

      {activeInterface === "view-1" && (
        <div className='view-container'>
          <CsvReport />
        </div>
      )}

      {activeInterface === "view-2" && (
        <div className='view-container'>
          <CsvData />
        </div>
      )}

      {activeInterface === "view-3" && (
        <div className='view-container'>
          <BaseCheckPage />
        </div>
      )}
    </div>
  )
}

export default SmsReports


