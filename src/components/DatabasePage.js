import React, { useState, useEffect } from 'react';
//import { BASE_URL } from "../services/api";
import axios from "axios";
import { FaEdit, FaCaretDown } from "react-icons/fa";
import '../styles/DatabasePage.css';

const DatabasePage = () => {
    const BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const [activeInterface, setActiveInterface] = useState("view-1");
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState("");
    const [clientData, setClientData] = useState([]);
    const [popupMessage, setPopupMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [isRcsManuallyEdited, setIsRcsManuallyEdited] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);



    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/sms/api/database_client`);
                setClients(response.data);
            } catch (error) {
                console.error("Error fetching clients:", error);
            }
        };

        fetchClients();
    }, []);

    const fetchClientData = async () => {
        if (selectedClient) {
            try {
                const response = await axios.get(`${BASE_URL}/sms/api/database_mapping_data`, {
                    params: { client: selectedClient }
                });
                setClientData(response.data);
                console.log("Fetched Client Data:", response.data);
            } catch (error) {
                console.error("Error fetching client data:", error);
            }
        }
    };

    useEffect(() => {
        fetchClientData();
    }, [selectedClient]);

    const [formData, setFormData] = useState({
        sender: "",
        client: "",
        product: "",
        channel: "",
        sms_mapping: "",
        rcs_mapping: "",
        log_mapping: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "sms_mapping") {
            setFormData((prev) => ({
                ...prev,
                sms_mapping: value,
                rcs_mapping: isRcsManuallyEdited ? prev.rcs_mapping : value
            }));
        } else if (name === "rcs_mapping") {
            setFormData((prev) => ({
                ...prev,
                rcs_mapping: value
            }));
            setIsRcsManuallyEdited(true);
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

    };

    const handleResetSync = () => {
        setFormData((prev) => ({
            ...prev,
            rcs_mapping: prev.sms_mapping
        }));
        setIsRcsManuallyEdited(false);
    };



    const handleEdit = (item) => {
        setFormData({
            sender: item.sender || "",
            client: item.client || "",
            product: item.product || "",
            channel: item.channel || "",
            sms_mapping: item.mapping || "",
            rcs_mapping: item.mapping || "",
            log_mapping: item.log_mapping || ""
        });
        setEditingId(item.id || item._id);
        setIsEditing(true);
        setActiveInterface("update-1");
    };


    const handleClick = async () => {
        const cleanedFormData = Object.fromEntries(
            Object.entries(formData).map(([key, value]) => [key, value.trim()])
        );

        const requiredFields = ['sender', 'client', 'product', 'channel', 'sms_mapping', 'rcs_mapping', 'log_mapping'];
        const emptyField = requiredFields.find(key => !cleanedFormData[key]);

        if (emptyField) {
            setPopupMessage(`Please fill in the "${emptyField}" field.`);
            setShowPopup(true);
            return;
        }

        try {
            const response = await fetch(
                `${BASE_URL}/sms/api/database_data${isEditing ? '/update' : ''}`,
                {
                    method: isEditing ? 'PUT' : 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        ...cleanedFormData,
                        ...(isEditing && { id: editingId })
                    })
                }
            );

            const result = await response.json();

            if (response.ok) {
                setPopupMessage(result.message || (isEditing ? "Updated successfully!" : "Added successfully!"));
                setShowPopup(true);

                setFormData({
                    sender: "",
                    client: "",
                    product: "",
                    channel: "",
                    sms_mapping: "",
                    rcs_mapping: "",
                    log_mapping: ""
                });

                //setIsEditing(false);
                if (isEditing) {
                    setSelectedClient(cleanedFormData.client);
                    //setActiveInterface("view-1");  
                }
                fetchClientData();
            } else {
                setPopupMessage("Failed: " + result.message);
                setShowPopup(true);
            }
        } catch (error) {
            console.error("Error saving data:", error);
            setPopupMessage("Error: Something went wrong.");
            setShowPopup(true);
        }
    };

    const handleMouseEnter = () => {
        setShowDropdown(true);
        console.log("Hovered over Add Product button");
    };


    const handleMouseLeave = () => {
        setShowDropdown(false);
        console.log("Mouse left Add Product button");
    };

    const handleAddClick = () => {
        setShowDropdown(true);
        setActiveInterface("update-1");

    };



    return (
        <div className="sms-container">

            <div className="button-container">
                <button
                    className={`view-button-1 ${activeInterface === "view-1" ? "active-btn" : ""}`}
                    onClick={() => setActiveInterface("view-1")}
                >
                    View Product
                </button>
                <div className={`dropdown-wrapper ${showDropdown ? "show-dropdown" : ""}`} onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}>
                    <button
                        className={`update-button ${activeInterface === "update-1" || activeInterface === "update-2" ? "active-btn" : ""
                            }`}

                        onClick={handleAddClick}
                    >
                        Add Product <FaCaretDown style={{ fontSize: "1em", marginLeft: "5px" }} />
                    </button>
                    {showDropdown && (
                        <div className="dropdown-menu-product">
                            <div
                                className="dropdown-item"
                                onClick={() => {
                                    setActiveInterface("update-1");
                                    setShowDropdown(false);
                                }}
                            >
                                SMS
                            </div>
                            <div
                                className="dropdown-item"
                                onClick={() => {
                                    setActiveInterface("update-2");
                                    setShowDropdown(false);
                                }}
                            >
                                RCS
                            </div>
                        </div>
                    )}
                </div>
            </div>


            <div className="divider-2"></div>


            {activeInterface === "update-1" && (
                <div className='view-container'>
                    <div className="upload-container">
                        <div className="heading-div">
                            <p className="section-heading">SMS</p>
                        </div>
                        <label>Sender:</label>
                        <input
                            type="text"
                            name="sender"
                            value={formData.sender}
                            onChange={handleChange}
                            placeholder="Enter sender name EX: CLBMHN"
                        />

                        <label>Client:</label>
                        <input
                            type="text"
                            name="client"
                            value={formData.client}
                            onChange={handleChange}
                            placeholder="Enter client name EX: Dentsu"
                        />

                        <label>Product:</label>
                        <input
                            type="text"
                            name="product"
                            value={formData.product}
                            onChange={handleChange}
                            placeholder="Enter product name EX: Holiday"
                        />

                        <label>Channel:</label>
                        <input
                            type="text"
                            name="channel"
                            value={formData.channel}
                            onChange={handleChange}
                            placeholder="Enter channel name EX: rcs OR sms"
                        />

                        <label>SMS DLR Table:</label>
                        <input
                            type="text"
                            name="sms_mapping"
                            value={formData.sms_mapping}
                            onChange={handleChange}
                            placeholder="Enter SMS DLR Table EX: ClubM"
                        />

                        <label>RCS DLR Table:</label>
                        <input
                            type="text"
                            name="rcs_mapping"
                            value={formData.rcs_mapping}
                            onChange={handleChange}
                            placeholder="Enter RCS DLR Table EX: ClubM"
                        />

                        <label>Product Table:</label>
                        <input
                            type="text"
                            name="log_mapping"
                            value={formData.log_mapping}
                            onChange={handleChange}
                            placeholder="Enter Product Table EX: IDFC_CC Bajaj_HL"
                        />


                        <button className="upload-btn" onClick={handleClick}>
                            {isEditing ? "Update" : "Add"}
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
                                textAlign: "center"
                            }}>
                                <p>{popupMessage}</p>
                                <button
                                    onClick={() => {
                                        setShowPopup(false);
                                        if (isEditing) {
                                            setActiveInterface("view-1");
                                            setIsEditing(false);
                                        }
                                    }}
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

            {activeInterface === "view-1" && (
                <div className='view-container'>
                    <select
                        value={selectedClient}
                        onChange={(e) => setSelectedClient(e.target.value)}
                        style={{
                            padding: "8px",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                            fontSize: "16px",
                            cursor: "pointer",
                            outline: "none"
                        }}
                    >
                        <option value="">-- Select Client --</option>
                        {clients.map((client, index) => (
                            <option key={index} value={client.client}>
                                {client.client}
                            </option>
                        ))}
                    </select>

                    {clientData.length > 0 && (
                        <div className="client-data-table">
                            <table
                                style={{
                                    borderCollapse: "collapse",
                                    width: "100%",
                                    marginTop: "20px",
                                    fontSize: "14px"
                                }}
                            >
                                <thead>
                                    <tr>
                                        {Object.keys(clientData[0]).filter((key) => key !== "id").map((key) => (
                                            <th
                                                key={key}
                                                style={{
                                                    border: "1px solid #ccc",
                                                    padding: "8px",
                                                    backgroundColor: "rgb(10, 69, 118)",
                                                    fontWeight: "bold"
                                                }}
                                            >
                                                {key === 'edit' ? 'Edit' : key.toUpperCase()}
                                            </th>
                                        ))}
                                        <th
                                            style={{
                                                border: "1px solid #ccc",
                                                padding: "8px",
                                                backgroundColor: "rgb(10, 69, 118)",
                                                fontWeight: "bold"
                                            }}
                                        >
                                            Edit
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clientData.map((item, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {Object.entries(item)
                                                .filter(([key]) => key !== "id")
                                                .map(([key, value], colIndex) => (
                                                    <td
                                                        key={colIndex}
                                                        style={{
                                                            border: "1px solid #ccc",
                                                            padding: "8px",
                                                            textAlign: "left"
                                                        }}
                                                    >
                                                        {value}
                                                    </td>
                                                ))}

                                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    style={{
                                                        background: "none",
                                                        padding: "0",
                                                        color: "#0a4576",
                                                        border: "none",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <FaEdit size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>
                    )}


                </div>
            )}

            {activeInterface === "update-2" && (
                <div className='view-container'>
                    <div className="upload-container">
                        <div className="heading-div">
                            <p className="section-heading">RCS</p>
                        </div>
                        <label>Sender:</label>
                        <input
                            type="text"
                            name="sender"
                            value={formData.sender}
                            onChange={handleChange}
                            placeholder="Enter sender name EX: Template"
                        />

                        <label>Client:</label>
                        <input
                            type="text"
                            name="client"
                            value={formData.client}
                            onChange={handleChange}
                            placeholder="Enter client name EX: IDFC"
                        />

                        <label>Product:</label>
                        <input
                            type="text"
                            name="product"
                            value={formData.product}
                            onChange={handleChange}
                            placeholder="Enter product name EX: credit Card"
                        />

                        <label>Channel:</label>
                        <input
                            type="text"
                            name="channel"
                            value={formData.channel}
                            onChange={handleChange}
                            placeholder="Enter channel name EX: rcs"
                        />

                        {/*<label>SMS DLR Table:</label>
                        <input
                            type="text"
                            name="sms_mapping"
                            value={formData.sms_mapping}
                            onChange={handleChange}
                            placeholder="Enter SMS DLR Table EX: IDFC_CC"
                        />*/}

                        <label>RCS DLR Table:</label>
                        <input
                            type="text"
                            name="rcs_mapping"
                            value={formData.rcs_mapping}
                            onChange={handleChange}
                            placeholder="Enter RCS DLR Table EX: IDFC_CC"
                        />

                        <label>Product Table:</label>
                        <input
                            type="text"
                            name="log_mapping"
                            value={formData.log_mapping}
                            onChange={handleChange}
                            placeholder="Enter Product Table EX: IDFC_CC Bajaj_HL"
                        />


                        <button className="upload-btn">
                            {isEditing ? "Update" : "Add"}
                        </button>



                    </div>
                </div>
            )}
        </div>
    );
};

export default DatabasePage;
