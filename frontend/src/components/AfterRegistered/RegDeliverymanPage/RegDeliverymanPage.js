import React, { useState, useEffect } from "react";
import axios from "axios";
import "./RegDeliverymanPage.css";
import NavbarRegistered from "../../NavbarRegistered/NavbarRegistered";
import FooterNew from "../../Footer/FooterNew";
import RegCategories from "../RegCatoegories/RegCategories";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faTruck,
  faInfoCircle,
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";
import TypeWriter from "../../AutoWritingText/TypeWriter";

function RegDeliverymanPage({ deliverymanId }) {
  const [sellerOrders, setSellerOrders] = useState([]);
  const [farmerOrders, setFarmerOrders] = useState([]);
  const [salary, setSalary] = useState(0);
  const [showSalary, setShowSalary] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch seller orders and filter only approved ones
        const sellerResponse = await axios.get("http://localhost:8070/sellerorder/");
        const approvedSellerOrders = (sellerResponse.data ?? []).filter(
          order => order.farmerApproved === true || order.status === "approved"
        );
        setSellerOrders(approvedSellerOrders);

        // Fetch farmer orders and filter only approved ones
        const farmerResponse = await axios.get("http://localhost:8070/farmerorder/");
        const approvedFarmerOrders = (farmerResponse.data ?? []).filter(
          order => order.farmerApproved === true || order.status === "approved"
        );
        setFarmerOrders(approvedFarmerOrders);

        // Fetch salary from backend
        if (deliverymanId) {
          const salaryResponse = await axios.get(`http://localhost:8070/salary/${deliverymanId}`);
          setSalary(salaryResponse.data.salary ?? 0);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setSalary(0);
        setSellerOrders([]);
        setFarmerOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [deliverymanId]);

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading...</p>;
  }

  return (
    <div>
      <NavbarRegistered />
      <div className="nothing"></div>

      <div className="crop-container">
        <img
          src="https://images.unsplash.com/photo-1581094288337-3346a1c19138"
          alt="delivery-banner"
          className="crop-image"
        />
      </div>

      <div className="type-writer-container">
        <TypeWriter
          text="Welcome Delivery Partners!"
          loop={false}
          className="writer"
          textStyle={{
            fontFamily: "Gill Sans",
            fontSize: "60px",
          }}
        />
      </div>

      <div className="categories-container">
        <div className="categories-div">
          <RegCategories />
        </div>
      </div>

      {/* Display current salary */}
      <div className="salary-section" style={{ margin: "20px", textAlign: "center" }}>
        <button className="view-salary-button" onClick={() => setShowSalary(true)}>
          <FontAwesomeIcon icon={faMoneyBillWave} /> Your Salary Provided by Government
        </button>
      </div>

      {showSalary && (
        <div className="salary-modal">
          <div className="salary-content">
            <h2>Your Salary Provided by Government</h2>
            <p>Your salary is: <strong>${salary}</strong></p>
            <button onClick={() => setShowSalary(false)} className="close-button">
              Close
            </button>
          </div>
        </div>
      )}

      <div className="nothing2"></div>

      {/* Seller Orders */}
      <div className="topic">
        <p>Farmer Approved Seller Orders to Deliver</p>
      </div>

      <div className="orders-wrapper">
        {sellerOrders.length === 0 ? (
          <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            No approved seller orders available for delivery at this time.
          </p>
        ) : (
          <>
            <div className="orders-container">
              {sellerOrders.slice(0, 4).map((order, index) => (
                <div key={index} className="order-item">
                  <img
                    src={`http://localhost:8070${order.productImage}`}
                    alt={order.item}
                    className="order-image"
                  />
                  <p>{order.item}</p>
                  <p>Quantity: {order.quantity}</p>
                  <p>Pickup: Seller</p>
                  <p>Deliver To: Buyer</p>
                  <button className="cart-button">
                    <FontAwesomeIcon icon={faTruck} /> Accept Delivery
                  </button>
                  <button className="supply-button">
                    <FontAwesomeIcon icon={faInfoCircle} /> More Info
                  </button>
                </div>
              ))}
            </div>
            {sellerOrders.length > 4 && (
              <a href="/sellerorder" className="view-all-button1">
                <FontAwesomeIcon icon={faChevronRight} className="arrow-icon" />
              </a>
            )}
          </>
        )}
      </div>

      <div className="nothing2"></div>

      {/* Farmer Orders */}
      <div className="topic">
        <p>Farmer Approved Orders to Deliver</p>
      </div>

      <div className="orders-wrapper">
        {farmerOrders.length === 0 ? (
          <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            No approved farmer orders available for delivery at this time.
          </p>
        ) : (
          <>
            <div className="orders-container">
              {farmerOrders.slice(0, 4).map((order, index) => (
                <div key={index} className="order-item">
                  <img
                    src={`http://localhost:8070${order.productImage}`}
                    alt={order.item}
                    className="order-image"
                  />
                  <p>{order.item}</p>
                  <p>Quantity: {order.quantity}</p>
                  <p>Pickup: Farmer</p>
                  <p>Deliver To: Buyer</p>
                  <button className="cart-button">
                    <FontAwesomeIcon icon={faTruck} /> Accept Delivery
                  </button>
                  <button className="supply-button">
                    <FontAwesomeIcon icon={faInfoCircle} /> More Info
                  </button>
                </div>
              ))}
            </div>
            {farmerOrders.length > 4 && (
              <a href="/farmerorder" className="view-all-button1">
                <FontAwesomeIcon icon={faChevronRight} className="arrow-icon" />
              </a>
            )}
          </>
        )}
      </div>

      <FooterNew />
    </div>
  );
}

export default RegDeliverymanPage;