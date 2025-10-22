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
    const fetchOrders = async () => {
      try {
        setLoading(true);

        // Fetch seller orders
        const sellerResponse = await axios.get("http://localhost:8070/sellerorder/");
        const approvedSellerOrders = (sellerResponse.data ?? [])
          .filter(order => order.farmerApproved === true || order.status === "approved")
          .map(order => ({
            ...order,
            acceptedByDeliveryman: order.acceptedByDeliveryman || false,
          }));
        setSellerOrders(approvedSellerOrders);

        // Fetch farmer orders
        const farmerResponse = await axios.get("http://localhost:8070/farmerorder/");
        const approvedFarmerOrders = (farmerResponse.data ?? [])
          .filter(order => order.farmerApproved === true || order.status === "approved")
          .map(order => ({
            ...order,
            acceptedByDeliveryman: order.acceptedByDeliveryman || false,
          }));
        setFarmerOrders(approvedFarmerOrders);

        // Fetch salary
        if (deliverymanId) {
          const salaryResponse = await axios.get(`http://localhost:8070/salary/${deliverymanId}`);
          setSalary(salaryResponse.data.salary ?? 0);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setSellerOrders([]);
        setFarmerOrders([]);
        setSalary(0);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [deliverymanId]);

  // Handle deliveryman accepting order
  const handleAcceptDelivery = async (orderId, type) => {
    try {
      // Optimistic frontend update
      if (type === "seller") {
        setSellerOrders(prev =>
          prev.map(order =>
            order._id === orderId ? { ...order, acceptedByDeliveryman: true } : order
          )
        );
        // Persist in backend
        await axios.put(`http://localhost:8070/sellerorder/${orderId}/accept`, { deliverymanId });
      } else {
        setFarmerOrders(prev =>
          prev.map(order =>
            order._id === orderId ? { ...order, acceptedByDeliveryman: true } : order
          )
        );
        // Persist in backend
        await axios.put(`http://localhost:8070/farmerorder/${orderId}/accept`, { deliverymanId });
      }
    } catch (err) {
      console.error("Error accepting delivery:", err);
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading...</p>;
  }

  // Render orders
  const renderOrders = (orders, type) => (
    <>
      <div className="orders-container">
        {orders.slice(0, 4).map((order, index) => (
          <div key={index} className="order-item">
            <img
              src={`http://localhost:8070${order.productImage}`}
              alt={order.item}
              className="order-image"
            />
            <p>{order.item}</p>
            <p>Quantity: {order.quantity}</p>
            <p>Pickup: {type === "seller" ? "Seller" : "Farmer"}</p>
            <p>Deliver To: Buyer</p>
            <button
              className="cart-button"
              onClick={() => handleAcceptDelivery(order._id, type)}
              disabled={order.acceptedByDeliveryman}
            >
              <FontAwesomeIcon icon={faTruck} />{" "}
              {order.acceptedByDeliveryman ? "You Approved Delivery" : "Accept Delivery"}
            </button>
            <button className="supply-button">
              <FontAwesomeIcon icon={faInfoCircle} /> More Info
            </button>
          </div>
        ))}
      </div>
      {orders.length > 4 && (
        <a href={`/${type}order`} className="view-all-button1">
          <FontAwesomeIcon icon={faChevronRight} className="arrow-icon" />
        </a>
      )}
    </>
  );

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
          textStyle={{ fontFamily: "Gill Sans", fontSize: "60px" }}
        />
      </div>

      <div className="categories-container">
        <div className="categories-div">
          <RegCategories />
        </div>
      </div>

      {/* Salary Section */}
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
      <div className="orders-wrapper">{renderOrders(sellerOrders, "seller")}</div>

      <div className="nothing2"></div>

      {/* Farmer Orders */}
      <div className="topic">
        <p>Farmer Approved Orders to Deliver</p>
      </div>
      <div className="orders-wrapper">{renderOrders(farmerOrders, "farmer")}</div>

      <FooterNew />
    </div>
  );
}

export default RegDeliverymanPage;
