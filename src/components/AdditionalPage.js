import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/AdditionalPage.css";
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';


const AdditionalPage = () => {
     const BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const [activeInterface, setActiveInterface] = useState("add");
    const [popupMessage, setPopupMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [data, setData] = useState([]);
    const [client, setClient] = useState("");
    const [product, setProduct] = useState("");
    const [vendor, setVendor] = useState("");
    const [channel, setChannel] = useState("");
    const [sender, setSender] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [filteredChannels, setFilteredChannels] = useState([]);
    const [filteredSenders, setFilteredSenders] = useState([]);
    const [isSuccess, setIsSuccess] = useState(false);


    const [formData, setFormData] = useState({
        transactionId: "",
        source: "",
        base: "",
        date: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    useEffect(() => {
        axios.get(`${BASE_URL}/sms/api/product_sms`)
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

            const uniqueFilteredProducts = Array.from(new Set(filtered.map((p) => p.product)))
                .map((name) => filtered.find((p) => p.product === name));
            setFilteredProducts(uniqueFilteredProducts);

            const uniqueSenders = Array.from(new Set(filtered.map((p) => p.sender)));
            setFilteredSenders(uniqueSenders);

            setVendor("");
        } else {
            setFilteredProducts([]);
            setFilteredSenders([]);
            setFilteredChannels([]);
            setVendor("");
        }
    }, [client, data]);

    useEffect(() => {
        if (client && product) {
            const filtered = data.filter((p) => p.product === product && p.client === client);
            const newChannels = [...new Set(filtered.map((p) => p.channel))];

            setFilteredChannels(newChannels);
            if (newChannels.length === 1) {
                setChannel(newChannels[0]);
            } else {
                setChannel("");
            }
        } else {
            setFilteredChannels([]);
            setChannel("");
        }
    }, [client, product, data]);

    const handleClick = async () => {
        const { transactionId, source, base, date } = formData;

        if (transactionId && source && base && date && client && product && vendor && channel) {
            try {
                const response = await axios.post(`${BASE_URL}/sms/api/additional_data`, {
                    transactionId,
                    source,
                    base,
                    date,
                    client,
                    product,
                    vendor,
                    channel,
                    sender
                });

                console.log("Response from backend:", response);
                setPopupMessage(response.data.message || "All set! Data added successfully.");
                setIsSuccess(true);
                setFormData({ transactionId: "", source: "", base: "", date: "" });
                setClient("");
                setProduct("");
                setVendor("");
                setChannel("");
            } catch (error) {
                console.error("Error in Axios request:", error);
                console.error("Error response:", error.response);
                setPopupMessage(error.response?.data?.message || "Something went wrong.");
                setIsSuccess(false);
            }
        } else {
            setPopupMessage("Please fill in all fields.");
            setIsSuccess(false);
        }

        setShowPopup(true);
    };

    return (
        <div className="sms-container">
            <div className="button-container">
                <button
                    className={`view-button-1 ${activeInterface === "add" ? "active-btn" : ""}`}
                    onClick={() => setActiveInterface("add")}
                >
                    Add Data
                </button>
            </div>

            <div className="divider-2"></div>

            {activeInterface === "add" && (
                <div className='view-container'>
                    <div className="upload-container">
                        <label>Transaction ID:</label>
                        <input
                            type="text"
                            name="transactionId"
                            value={formData.transactionId}
                            onChange={handleChange}
                        />

                        <label>Source:</label>
                        <input
                            type="text"
                            name="source"
                            value={formData.source}
                            onChange={handleChange}
                        />

                        <label>Base:</label>
                        <div style={{ position: "relative", display: "inline-block" }}>
                            <input
                                type="text"
                                name="base"
                                value={formData.base}
                                onChange={handleChange}
                                maxLength={50}
                                style={{ paddingRight: "30px" }}
                            />
                            <span style={{
                                position: "absolute",
                                right: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                fontSize: "12px",
                                color: "gray"
                            }}>
                                {50 - (formData.base?.length || 0)}
                            </span>
                        </div>

                        <label>Date:</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            max={new Date(Date.now() - 86400000).toISOString().split("T")[0]}
                        />


                        <label>Client :</label>
                        <select
                            value={client}
                            onChange={(e) => setClient(e.target.value)}
                            className="client-select"
                        >
                            <option value="">Select Client</option>
                            {Array.from(new Set(data.map((p) => p.client))).map((clientName, index) => (
                                <option key={index} value={clientName}>{clientName}</option>
                            ))}
                        </select>

                        <label>Product :</label>
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

                        <label>Sender :</label>
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


                        <label>Vendor :</label>
                        <select
                            value={vendor}
                            onChange={(e) => setVendor(e.target.value)}
                            className="custom-select"
                        >
                            <option value="">Select Vendor</option>
                            <option value="Setup 8">Setup 8</option>
                            {/*<option value="Profuse">Profuse</option>
                            <option value="JIO">JIO</option>
                            <option value="VI">VI</option>*/}
                        </select>

                        <label>Channel :</label>
                        <select
                            value={channel}
                            onChange={(e) => setChannel(e.target.value)}
                            className="custom-select"
                        >
                            <option value="">Select Channel</option>
                            {filteredChannels.map((ch, index) => (
                                <option key={index} value={ch}>{ch}</option>
                            ))}
                        </select>

                        <button className="upload-btn" onClick={handleClick}>
                            Add
                        </button>
                    </div>

                    {showPopup && (
                        <div style={{
                            position: "fixed",
                            top: "0",
                            left: "0",
                            width: "100%",
                            height: "100%",
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 9999
                        }}>

                            <div style={{
                                backgroundColor: "#fff",
                                padding: "20px",
                                borderRadius: "8px",
                                maxWidth: "400px",
                                width: "90%",
                                boxShadow: "0 0 15px rgba(0, 0, 0, 0.3)",
                                textAlign: "center",
                                position: "relative"
                            }}>
                                <p style={{ fontSize: "18px", margin: "10px 0" }}>
                                    <span className="emoji-popper">
                                        {isSuccess ? "🎉" : "❌"}
                                    </span>
                                    {popupMessage}
                                    <span className="emoji-popper">
                                        {isSuccess ? "🎉" : "❌"}
                                    </span>
                                </p>
                                <button
                                    onClick={() => setShowPopup(false)}
                                    style={{
                                        marginTop: "10px",
                                        padding: "8px 16px",
                                        backgroundColor: "#0a4576",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "5px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
};

export default AdditionalPage;
