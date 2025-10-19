import React, { useState, useEffect } from "react";
import "./RegFarmerPage.css";
import NavbarRegistered from "../../NavbarRegistered/NavbarRegistered";
import FooterNew from "../../Footer/FooterNew";
import RegCategories from "../../AfterRegistered/RegCatoegories/RegCategories";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faShoppingCart, faTruck, faShoppingBag, faInfoCircle, faThumbsUp, faThumbsDown } from "@fortawesome/free-solid-svg-icons";
import TypeWriter from "../../AutoWritingText/TypeWriter";

function FarmerPage() {
  const [farmerId, setFarmerId] = useState("");
  const [sellerOrders, setSellerOrders] = useState([]);
  const [farmerOrders, setFarmerOrders] = useState([]);
  const [deliveryPosts, setDeliveryPosts] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [appliedSchemes, setAppliedSchemes] = useState([]);
  const [showSchemes, setShowSchemes] = useState(false);
  const [showAppliedSchemes, setShowAppliedSchemes] = useState(false);

  const BASE_URL = "http://localhost:8070";

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/150?text=No+Image';
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE_URL}${imagePath}`;
  };

  // Fetch farmer data
  useEffect(() => {
    const fetchFarmerData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${BASE_URL}/farmer/userdata`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (data.status === "ok") {
          setFarmerId(data.data._id);

          const appliedRes = await fetch(`${BASE_URL}/appliedschemes/${data.data._id}`);
          const appliedData = await appliedRes.json();
          setAppliedSchemes(appliedData);
        }
      } catch (err) {
        console.error("Error fetching farmer data:", err);
      }
    };
    fetchFarmerData();
  }, []);

  // Fetch other data
  useEffect(() => {
    const fetchSellerOrders = async () => {
      try {
        const response = await fetch(`${BASE_URL}/sellerorder/`);
        const data = await response.json();
        setSellerOrders(data);
      } catch (error) {
        console.error("Error fetching seller orders:", error);
      }
    };

    const fetchFarmerOrders = async () => {
      try {
        const response = await fetch(`${BASE_URL}/farmerorder/`);
        const data = await response.json();
        setFarmerOrders(data);
      } catch (error) {
        console.error("Error fetching farmer orders:", error);
      }
    };

    const fetchDeliveryPosts = async () => {
      try {
        const response = await fetch(`${BASE_URL}/deliverypost/`);
        const data = await response.json();
        setDeliveryPosts(data);
      } catch (error) {
        console.error("Error fetching delivery posts:", error);
      }
    };

    const fetchSchemes = async () => {
      try {
        const response = await fetch(`${BASE_URL}/schemes/`);
        const data = await response.json();
        setSchemes(data);
      } catch (error) {
        console.error("Error fetching schemes:", error);
      }
    };

    fetchSellerOrders();
    fetchFarmerOrders();
    fetchDeliveryPosts();
    fetchSchemes();
  }, []);

  // Apply for scheme
  const handleApplyScheme = async (scheme) => {
    if (!appliedSchemes.find((s) => s._id === scheme._id) && farmerId) {
      try {
        const response = await fetch(`${BASE_URL}/appliedschemes/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: farmerId, schemeId: scheme._id }),
        });
        if (response.ok) {
          setAppliedSchemes([...appliedSchemes, scheme]);
          alert(`You applied for "${scheme.name}"!`);
        } else {
          alert("Failed to apply scheme");
        }
      } catch (error) {
        console.error("Error applying scheme:", error);
      }
    }
  };

  // Approve or Disapprove Seller Order
  const handleOrderStatus = async (orderId, newStatus) => {
    try {
      // Find the order
      const order = sellerOrders.find(o => o._id === orderId);
      
      if (!order) {
        alert("Order not found");
        return;
      }

      // Update order status (backend will handle quantity reduction)
      const res = await fetch(`${BASE_URL}/sellerorder/update/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.status || "Failed to update order");
        return;
      }
      
      const data = await res.json();
      
      // Update sellerOrders in state
      setSellerOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status: newStatus } : o
        )
      );
      
      alert(`Order ${newStatus} successfully!`);
    } catch (err) {
      console.error("Error updating order:", err);
      alert("Error updating order. Please try again.");
    }
  };

  // Function to get color based on status
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "green";
      case "disapproved":
        return "red";
      case "pending":
      default:
        return "orange";
    }
  };

  return (
    <div>
      <NavbarRegistered />

      {/* Hero Section */}
      <div className="crop-container">
        <img
          src="https://www.abers-tourisme.com/assets/uploads/sites/8/2022/12/vente-legumes.jpg"
          alt="farmers"
          className="crop-image"
        />
        <div className="type-writer-overlay">
          <TypeWriter
            text="Welcome Farmers!"
            loop={false}
            textStyle={{
              fontFamily: "Gill Sans",
              fontSize: "60px",
              color: "white",
              textShadow: "2px 2px 6px rgba(0,0,0,0.6)",
            }}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="categories-container">
        <div className="categories-div">
          <RegCategories />
        </div>
      </div>

      {/* Schemes Buttons */}
      <div className="topic">
        <p>Government Schemes</p>
        <div className="scheme-buttons-container">
          <button
            className="view-schemes-btn"
            onClick={() => {
              setShowSchemes(!showSchemes);
              setShowAppliedSchemes(false);
            }}
          >
            View Schemes
          </button>
          <button
            className="applied-schemes-btn"
            onClick={() => {
              setShowAppliedSchemes(!showAppliedSchemes);
              setShowSchemes(false);
            }}
          >
            Applied Schemes
          </button>
        </div>
      </div>

      {/* Schemes List */}
      {showSchemes && (
        <div className="schemes-wrapper">
          {schemes.length > 0 ? (
            schemes.map((scheme) => (
              <div key={scheme._id} className="scheme-item">
                <p className="scheme-title">{scheme.name}</p>
                <button className="apply-button" onClick={() => handleApplyScheme(scheme)}>Apply</button>
              </div>
            ))
          ) : (
            <p>No schemes available right now.</p>
          )}
        </div>
      )}

      {/* Applied Schemes List */}
      {showAppliedSchemes && (
        <div className="schemes-wrapper">
          {appliedSchemes.length > 0 ? (
            appliedSchemes.map((scheme) => (
              <div key={scheme._id} className="scheme-item">
                <p className="scheme-title">{scheme.name}</p>
              </div>
            ))
          ) : (
            <p>You haven't applied for any schemes yet.</p>
          )}
        </div>
      )}

      {/* Seller Orders */}
      <div className="topic">
        <p>Seller's Orders</p>
      </div>
      <div className="orders-wrapper">
        <div className="orders-container">
          {sellerOrders.slice(0, 4).map((order) => (
            <div key={order._id} className="order-item1">
              <img 
                src={getImageUrl(order.productImage)} 
                alt={order.item} 
                className="order-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                }}
              />
              <p>{order.item}</p>
              <p>Quantity: {order.quantity}</p>
              <p>Price: Rs.{order.price}</p>
              <p>District: {order.district}</p>
              <p>Company: {order.company}</p>
              <p>Mobile: {order.mobile}</p>
              <p>Posted Date: {order.postedDate}</p>
              <p>Expires Date: {order.expireDate}</p>
              <p>
                Status:{" "}
                <b style={{ color: getStatusColor(order.status) }}>
                  {order.status ? order.status.toUpperCase() : "PENDING"}
                </b>
              </p>
              <div className="order-buttons">
                <button className="approve-btn" onClick={() => handleOrderStatus(order._id, "approved")}>
                  <FontAwesomeIcon icon={faThumbsUp} /> Approve
                </button>
                <button className="disapprove-btn" onClick={() => handleOrderStatus(order._id, "disapproved")}>
                  <FontAwesomeIcon icon={faThumbsDown} /> Disapprove
                </button>
              </div>
            </div>
          ))}
        </div>
        {sellerOrders.length > 4 && (
          <a href="/sellerorder" className="view-all-button">
            <FontAwesomeIcon icon={faChevronRight} className="arrow-icon" />
          </a>
        )}
      </div>

      {/* Farmer Orders */}
      <div className="topic">
        <p>Farmer's Orders</p>
      </div>
      <div className="orders-wrapper">
        <div className="orders-container">
          {farmerOrders.slice(0, 4).map((order, index) => (
            <div key={index} className="order-item">
              <img 
                src={getImageUrl(order.productImage)} 
                alt={order.item} 
                className="order-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                }}
              />
              <p>{order.item}</p>
              <p>Quantity: {order.quantity}</p>
              <p>Price: Rs.{order.price}</p>
              <p>Posted Date: {order.postedDate}</p>
              <p>Expires Date: {order.expireDate}</p>
              <button className="cart-button">
                <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
              </button>
              <button className="supply-button">
                <FontAwesomeIcon icon={faShoppingBag} /> Buy Now
              </button>
            </div>
          ))}
        </div>
        {farmerOrders.length > 4 && (
          <a href="/farmerorder" className="view-all-button1">
            <FontAwesomeIcon icon={faChevronRight} className="arrow-icon" />
          </a>
        )}
      </div>

      {/* Delivery Services */}
      <div className="topic">
        <p>Delivery Services</p>
      </div>
      <div className="orders-wrapper">
        <div className="orders-container">
          {deliveryPosts.slice(0, 4).map((order, index) => (
            <div key={index} className="order-item">
              <img 
                src={getImageUrl(order.vehicleImage)} 
                alt={order.model} 
                className="order-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                }}
              />
              <p>{order.model}</p>
              <p>Capacity: {order.capacity} kg</p>
              <p>Price: Rs.{order.price}/km</p>
              <p>Posted Date: {order.postedDate}</p>
              <button className="cart-button">
                <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
              </button>
              <button className="supply-button">
                <FontAwesomeIcon icon={faInfoCircle} /> More Details
              </button>
            </div>
          ))}
        </div>
        {deliveryPosts.length > 4 && (
          <a href="/deliverypost" className="view-all-button1">
            <FontAwesomeIcon icon={faChevronRight} className="arrow-icon" />
          </a>
        )}
      </div>

      <FooterNew />
    </div>
  );
}

export default FarmerPage;