import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { FaChartLine, FaMinus, FaCloudUploadAlt, FaPlus } from "react-icons/fa";
import ClientUpload from "./ClientUpload";
import AckoCar from "./AckoCar";
import CarsProfuse from "./CarsProfuse";
import Idfc from "./Idfc";
import ClubMahindra from "./ClubMahindra";
import BajajHL from "./BajajHL";
import HiranandaniReport from "./HiranandaniReport";
import "../styles/ProductPage.css";

const productData = {
    "Cars24": {
        title: "Car24 Reporting",
        component: CarsProfuse, 
    },
    "Acko-car": {
        title: "Acko-car Reporting",
        component: AckoCar,
    },
    "IDFC": {
        title: "IDFC Reporting",
        component: Idfc,
    },
    "Club Mahindra": {
        title: "Club Mahindra Reporting",
        component: ClubMahindra,
    },
    "Bajaj HL": {
        title: "Bajaj HL Reporting",
        component: BajajHL,
    },
    "HIRAPK": {
        title: "HIRAPK Reporting",
        component: HiranandaniReport,
    },
};

const ProductPage = () => {
    const { productName } = useParams();
    const product = productData[productName];
    const [isUploadVisible, setUploadVisible] = useState(true);

    if (!product) {
        return <h2>Product not found!</h2>;
    }

    return (
        <div className="product-container">
            <div className="product-heading-container">
                <h3 className="product-heading">
                    {product.title} <FaChartLine className="reporting-icon" />
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
                    <ClientUpload productName={productName} />
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

            {React.createElement(product.component)}
        </div>
    );
};

export default ProductPage;
