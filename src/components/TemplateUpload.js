import React, { useState, useRef } from 'react';
import axios from 'axios';
//import { BASE_URL } from "../services/api";
import { FaCheckCircle, FaMinus, FaCloudUploadAlt, FaPlus } from "react-icons/fa";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "@react-hook/window-size";
import '../styles/TemplateUpload.css';

function TemplateUpload() {
     const BASE_URL = process.env.BASE_URL;
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState({ text: "", type: "" });
    const fileInputRef = useRef(null);
    const [width, height] = useWindowSize();
    const [isUploadVisible, setUploadVisible] = useState(true);

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage({ text: "Please select a file before uploading.", type: "error" });
            return;
        }

        const formData = new FormData();
        formData.append('csvFile', file);

        try {
            const res = await axios.post(`${BASE_URL}/template/upload`, formData);
            setMessage({ text: res.data.message, type: "success" });

            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = null;
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setMessage({ text: error.response.data.message, type: "error" });
            } else {
                setMessage({ text: error.message, type: "error" });
            }
        }

    };

    return (
        <div className="sms-container">

            <div className="product-heading-container">
                <h3 className="product-heading">
                    Template
                </h3>
            </div>

            <div className="divider-2"></div>

            {isUploadVisible ? (
                <div className="product-upload-container">
                    <div className="upload-header" >
                        <div className="upload-heading">
                            <p><FaCloudUploadAlt className="upload-icon" /> Upload Files</p>
                        </div>

                        <div className="action-buttons">
                            <button className="icon-button" onClick={() => setUploadVisible(false)}>
                                <FaMinus />
                            </button>
                        </div>
                    </div>
                    <div className="upload-client">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="file-input"
                            ref={fileInputRef}
                        />
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
                </div>
            ) : (
                <div className="upload-header" >
                    <div className="upload-heading">
                        <p><FaCloudUploadAlt className="upload-icon" /> Upload Files</p>
                    </div>
                    <button className="icon-button show-button" onClick={() => setUploadVisible(true)}>
                        <FaPlus />
                    </button>
                </div>
            )}

        </div>
    );
}

export default TemplateUpload;
