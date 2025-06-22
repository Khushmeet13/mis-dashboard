import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/TxtUpload.css";
//import { BASE_URL } from "../services/api";
import { FaSpinner, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const TxtUpload = ({ onFileUpload }) => {
    const BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [product, setProduct] = useState("");
    const [dateTime, setDateTime] = useState("");
    const [vendor, setVendor] = useState("");
    const [channel, setChannel] = useState("");
    const [client, setClient] = useState("");
    const [base, setBase] = useState("");
    const [sender, setSender] = useState("");
    const [data, setData] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [filteredChannels, setFilteredChannels] = useState([]);
    const [filteredSenders, setFilteredSenders] = useState([]);
    const fileInputRef = useRef(null);
    const inputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        axios.get(`${BASE_URL}/sms/api/product_rcs`)
            .then((response) => {
                setData(response.data);
                console.log("products:", response.data);
            })
            .catch((error) => {
                console.error("Error fetching products:", error);
            });
    }, []);

    useEffect(() => {
        if (client) {
            const filtered = data.filter((p) => p.client === client);


            const uniqueFiltered = Array.from(
                new Set(filtered.map((p) => p.product))
            ).map((name) => filtered.find((p) => p.product === name));

            setFilteredProducts(uniqueFiltered);
            //setFilteredChannels([...new Set(filtered.map((p) => p.channel))]);
            setDateTime("");
            setVendor("");
        } else {
            setFilteredProducts([]);
            //setFilteredChannels([]);
        }
    }, [client, data]);

    useEffect(() => {
        if (client && product) {
            const filtered = data.filter((p) => p.product === product && p.client === client);
            const newChannels = [...new Set(filtered.map((p) => p.channel))];

            //setFilteredChannels(newChannels);
            setFilteredChannels(newChannels.length === 0 ? [newChannels[1]] : [newChannels[0]]);
            console.log("new channels:", newChannels);

            if (newChannels.length === 1) {
                setChannel(newChannels[0]);
                console.log("Setting default channel:", newChannels[0]);
            } else {
                setChannel("");
                console.log("Resetting channel");
            }

        } else {
            setFilteredChannels([]);
            setChannel("");
            setDateTime("");
        }
    }, [client, product, data]);


    useEffect(() => {
        if (channel) {
            let filtered = [];

            if (channel === "rcs") {
                filtered = data.filter((p) => p.channel === "rcs").map(() => "template");
            } else if (channel === "sms") {
                filtered = data
                    .filter((p) => p.channel === "sms" && p.client === client && p.product === product)
                    .map((p) => p.sender);
            }

            setFilteredSenders([...new Set(filtered)]);
            setSender("");
            console.log("filtered sender:", filteredSenders);
        } else {
            setFilteredSenders([]);
            setSender("");
        }
    }, [channel, client, product, data]);



    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === "text/plain") {
            setFile(selectedFile);
        } else {
            alert("Please select a valid .txt file");
            setFile(null);
        }
    };


    const handleUpload = async () => {
        if (!file || !client || !product || !channel || !dateTime || !vendor || !base || !sender) {
            alert("Please fill all fields before uploading!");
            return;
        }

        setIsUploading(true);
        setProgress(0);

        const date = dateTime.replace("T", " ");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("client", client);
        formData.append("product", product);
        formData.append("channel", channel);
        formData.append("date", date);
        formData.append("vendor", vendor);
        formData.append("base", base);
        formData.append("sender", sender);

        console.log("Uploading Form Data:");
        for (let pair of formData.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`);
        }


        try {
            const response = await axios.post(`${BASE_URL}/sms/upload/txt`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);

                    let startProgress = 0;
                    let interval = setInterval(() => {
                        startProgress += 5;
                        setProgress(startProgress);
                        if (startProgress >= percentCompleted) {
                            clearInterval(interval);
                        }
                    }, 50);
                },
            })

            console.log(response.data);

            setIsError(false);
            //setMessage(response.data.message);
            setMessage(`${response.data.message}\n:\n${response.data.uploadedFiles.join(", ")}`);
            setShowMessage(true);
            setTimeout(() => setIsError(false), 100);

            setFile([]);
            setClient("");
            setProduct("");
            setVendor("");
            setChannel("");
            setBase("");
            setDateTime("");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            onFileUpload();
        } catch (error) {
            setIsError(true);
            setFile([]);
            setClient("");
            setProduct("");
            setVendor("");
            setChannel("");
            setBase("");
            setDateTime("");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            if (error.response) {
                const errorMessage = error.response.data?.message || JSON.stringify(error.response.data);
                setMessage(errorMessage);

                if (error.response.data.duplicateFiles) {
                    console.log("Duplicate Files:", error.response.data.duplicateFiles);
                    setMessage(`Duplicate file detected: ${error.response.data.duplicateFiles.join(", ")}`);
                }

                return;
            }
            setShowMessage(true);
            console.error("Error uploading file:", error);

        } finally {
            setIsUploading(false);
            setProgress(0);

        }
    };

    /*useEffect(() => {
        if (message) {
            console.log("Message State Updated:", message);
            console.log("isError State Updated:", isError);
            const timer = setTimeout(() => setMessage(""), 5000);
            return () => clearTimeout(timer);
        }
    }, [message, isError]);*/

    useEffect(() => {
        if (message) {
            setShowMessage(true);
            //setTimeout(() => setShowMessage(false), 5000);
        }
    }, [message]);


    return (
        <>
            {isUploading && (
                <div className="loading-overlay">
                    <FaSpinner className="loading-spinner" />
                </div>
            )}
            <div className="txt-upload-container">

                <label>Client:</label>
                <select
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="custom-select"
                >
                    <option value="">Select Client</option>
                    {Array.from(new Set(data.map((p) => p.client))).map((clientName, index) => (
                        <option key={index} value={clientName}>{clientName}</option>
                    ))}
                </select>

                <label>Product:</label>
                <select
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    className="custom-select"
                >
                    <option value="">Select Product</option>
                    {filteredProducts.map((p, index) => (
                        <option key={index} value={p.product}>{p.product}</option>
                    ))}

                </select>

                <label>Channel:</label>
                <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="custom-select"
                >
                    <option value="">Select Channel</option>
                    {filteredChannels.map((channel, index) => (
                        <option key={index} value={channel}>{channel}</option>
                    ))}
                </select>

                <label>Date & Time:</label>
                <input
                    type="datetime-local"
                    placeholder="Enter or pick date & time"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    style={{
                        outline: "none",
                        border: "1px solid #ccc",
                    }}
                />


                <label>Vendor:</label>
                <select
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="custom-select"
                >
                    <option value="">Select Vendor</option>
                    <option value="Profuse">Profuse</option>
                    <option value="JIO">JIO</option>
                    <option value="VI">VI</option>
                </select>

                <label>Base:</label>
                <div style={{ position: "relative", display: "inline-block" }}>
                    <input
                        type="text"
                        value={base}
                        onChange={(e) => setBase(e.target.value)}
                        maxLength={50}
                        style={{ paddingRight: "30px" }}
                    />
                    <span
                        style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: "12px",
                            color: "gray"
                        }}
                    >
                        {50 - (base?.length || 0)}
                    </span>
                </div>

                <label>Sender:</label>
                <select
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    className="custom-select"
                >
                    <option value="">Select Sender</option>
                    {filteredSenders.map((sender, index) => (
                        <option key={index} value={sender}>{sender}</option>
                    ))}
                </select>


                <input type="file" accept=".txt" onChange={handleFileChange} ref={fileInputRef} />

                <button onClick={handleUpload} className="upload-btn" disabled={isUploading}>
                    {isUploading ? (
                        <>
                            <div className="loader-bar" style={{ width: `${progress}%` }}></div>
                            <span className="progress-text">{progress}%</span>
                        </>
                    ) : (
                        "Upload"
                    )}
                </button>

                {showMessage && (
                    <div className="loading-overlay">
                        <div className="icon-container">
                            {isError ? (
                                <FaExclamationCircle className="icon error-icon" />
                            ) : (
                                <FaCheckCircle className="icon success-icon" />
                            )}
                        </div>
                        <div className={`popup-message ${isError ? "error" : "success"} ${showMessage ? "" : "hide"}`}>

                            <span>{message}</span>
                            <button className="close-btn" onClick={() => setShowMessage(false)}>×</button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default TxtUpload;
