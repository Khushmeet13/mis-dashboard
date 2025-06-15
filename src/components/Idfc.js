import React, { useState, useEffect } from "react";

const Idfc = () => {
    const [selectedDate, setSelectedDate] = useState("");
    const [showCounts, setShowCounts] = useState(true);
  
    return (
      <div className="idfc-container">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-picker"
        />
  
        <button onClick={() => setShowCounts(!showCounts)} className="toggle-btn">
          {showCounts ? "View Table" : "Counts"}
        </button>
  
      </div>
    )
}

export default Idfc
