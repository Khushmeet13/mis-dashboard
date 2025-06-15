import React from 'react';
import "../styles/TxtReport.css";
import { BASE_URL } from "../services/api";

const TxtReport = () => {
  return (
    <div className="main-container">
      <table className="txt-table">
            <thead>
              <tr>
                <th >Date</th>
                <th >Product</th>
                <th >Source</th>
                <th >Count</th>
              </tr>
            </thead>
            <tbody>

            </tbody>

          </table>
    </div>
  )
}

export default TxtReport
