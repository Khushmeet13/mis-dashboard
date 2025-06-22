import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FaCheckCircle } from "react-icons/fa";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "@react-hook/window-size";
//import { BASE_URL } from "../services/api";
import "../styles/ClientUpload.css";


const ClientUpload = ({ productName: initialProductName, setRefresh }) => {
   const BASE_URL = process.env.BASE_URL;
  let productName = initialProductName;
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const fileInputRef = useRef(null);
  const [width, height] = useWindowSize();


  const handleFileChange = (event) => {
    if (!event.target.files.length) return;
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ text: "Please select a file.", type: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("productName", productName);
    formData.append("fileName", file.name);

    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    try {
      const response = await axios.post(`${BASE_URL}/client/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Upload Response:", response);
      console.log("Response Data:", response.data);
      if (response.status === 200) {
        setMessage({ text: response.data.message || "File uploaded successfully!", type: "success" });
      } else {
        setMessage({ text: "Unexpected response from server.", type: "error" });
      }
      setRefresh((prev) => !prev);

    } catch (error) {
      if (error.response?.status === 400) {
        setMessage({ text: error.response?.data?.message || "Oops! Something went wrong while uploading the file.", type: "error" });
      }
    }
  };

  /*useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    console.log("Updated Message:", message);
  }, [message]);*/

  return (
    <div className="upload-client">
      <input type="file" accept=".xlsx" onChange={handleFileChange} className="file-input" ref={fileInputRef} />
      <button onClick={handleUpload} className="upload-button">Upload</button>
      {message.text && (
        <div className={`upload-overlay ${message.type}`}>
          <div className="overlay-box">
            {message.type === "success" && (
              <>
                <FaCheckCircle className="success-icon" />
                <ReactConfetti width={width} height={height} recycle={false} numberOfPieces={250} />
              </>
            )}
            <div className="overlay-content">
              <button className="close-btn" onClick={() => setMessage({ text: "", type: "" })}>×</button>
              <p>{message.text}</p>
              {message.type === "success" && <p>All Set!</p>}
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default ClientUpload;
