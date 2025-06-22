import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
//import { BASE_URL } from "../services/api";
import "../styles/CsvUpload.css";
import { FaSpinner, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const CsvUpload = ({ setRefresh, isFetchingReport, }) => {
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const fileInputRef = useRef(null)
  const [client, setClient] = useState("");
  const [vendor, setVendor] = useState("");
  const [channel, setChannel] = useState("");
  const [base, setBase] = useState("");
  const [product, setProduct] = useState("");
  const [data, setData] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filteredChannels, setFilteredChannels] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);


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


  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const validFiles = [];
    let hasInvalidFile = false;

    selectedFiles.forEach((file) => {
      if (file.size < 1024) {
        hasInvalidFile = true;
      } else {
        validFiles.push(file);
      }
    });

    if (hasInvalidFile) {
      setMessage("Error: File size must be greater than 1KB!");
      setIsError(true);
      setShowMessage(true);
      event.target.value = "";
    } else {
      setFiles(validFiles);
    }
  };

  useEffect(() => {
    if (client) {
      const filtered = data.filter((p) => p.client === client);


      const uniqueFiltered = Array.from(
        new Set(filtered.map((p) => p.product))
      ).map((name) => filtered.find((p) => p.product === name));

      setFilteredProducts(uniqueFiltered);
      //setFilteredChannels([...new Set(filtered.map((p) => p.channel))]);
      setVendor("");
    } else {
      setFilteredProducts([]);
      setFilteredChannels([]);
      setVendor("");
    }
  }, [client, data]);

  useEffect(() => {
    if (client && product) {
      const filtered = data.filter((p) => p.product === product && p.client === client);
      const newChannels = [...new Set(filtered.map((p) => p.channel))];

      setFilteredChannels(newChannels.length > 0 ? [newChannels[0]] : []);
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
    }
  }, [client, product, data]);


  const handleUpload = async () => {
    if (!files || !client || !channel || !vendor || !base || !product) {
      alert("Please fill all fields before uploading!");
      return;
    }

    const invalidFiles = Array.from(files).filter(file => /\s/.test(file.name));
    if (invalidFiles.length > 0) {
      alert(`Invalid file name(s) detected with space: ${invalidFiles.map(f => f.name).join(", ")}`);
      return;
    }

    setIsUploading(true);
    setProgress(0);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    formData.append("client", client);
    formData.append("channel", channel);
    formData.append("vendor", vendor);
    formData.append("base", base);
    formData.append("product", product);

    console.log("Sending Files:", files);

    try {
      const response = await axios.post(`${BASE_URL}/sms/upload/csv`, formData, {
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
      });

      console.log(response.data);
      //setMessage(response.data.message);
      setMessage(`${response.data.message}\nUploaded Files:\n${response.data.uploadedFiles.join(", ")}`);
      setShowMessage(true);
      setRefresh((prev) => !prev);

      setFiles([]);
      setClient("");
      setProduct("");
      setVendor("");
      setChannel("");
      setBase("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (error) {
      setIsError(true);
      setFiles([]);
      setClient("");
      setProduct("");
      setVendor("");
      setChannel("");
      setBase("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (error.response) {
        if (error.response.data.duplicateFiles) {
          setMessage(`Duplicate files detected: ${error.response.data.duplicateFiles.join(", ")}`);
        } else if (error.response.data.invalidFiles) {
          const invalidFileNames = [...new Set(error.response.data.invalidFiles)];
          setMessage(`Invalid files detected: ${invalidFileNames.join(", ")}`);
        } else {
          setMessage("File upload failed.");
          console.error("Error uploading files:", error);
        }
      }
      setShowMessage(true);

    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 500);
    }
  };


  useEffect(() => {
    if (message) {
      setShowMessage(true);
      //setTimeout(() => setShowMessage(false), 5000);
    }
  }, [message]);

  useEffect(() => {
    if (showMessage && !isError) {
      createConfetti();
    }
  }, [showMessage, isError]);

  const createConfetti = () => {
    const confettiContainer = document.createElement("div");
    confettiContainer.classList.add("confetti-container");
    document.body.appendChild(confettiContainer);

    for (let i = 0; i < 200; i++) {
      let confetti = document.createElement("div");
      confetti.classList.add("confetti");
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.bottom = "0";
      confetti.style.backgroundColor = getRandomColor();

      let angle = Math.random() * 360;
      let distance = Math.random() * window.innerHeight;

      confetti.style.setProperty("--angle", `${angle}deg`);
      confetti.style.setProperty("--distance", `${distance}px`);

      confettiContainer.appendChild(confetti);
    }

    setTimeout(() => {
      confettiContainer.remove();
    }, 10000);
  };

  const getRandomColor = () => {
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#FFD700", "#8A2BE2", "#FF4500", "#1E90FF"];
    return colors[Math.floor(Math.random() * colors.length)];
  };


  return (
    !isFetchingReport && (
      <>
        {isUploading && (
          <div className="loading-overlay">
            <FaSpinner className="loading-spinner" />
          </div>
        )}

        <div className="upload-container">

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
            {filteredChannels.map((channel, index) => (
              <option key={index} value={channel}>{channel}</option>
            ))}
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


          <input type="file" accept=".csv" multiple onChange={handleFileChange} className="file-input" ref={fileInputRef} />
          <button onClick={handleUpload} className="csv-upload-btn" disabled={isUploading}>
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
                <button className="close-btn" onClick={() => setShowMessage(false)}>x</button>
              </div>
            </div>
          )}

        </div>
      </>
    )
  );
};

export default CsvUpload;
