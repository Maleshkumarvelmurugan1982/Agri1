import React, { useState, useEffect } from "react";
import "./RegFarmerPage.css";
import NavbarRegistered from "../../NavbarRegistered/NavbarRegistered";
import FooterNew from "../../Footer/FooterNew";
import RegCategories from "../../AfterRegistered/RegCatoegories/RegCategories";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faShoppingCart, faTruck, faShoppingBag, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
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

  // Fetch farmer data using JWT token from localStorage
  useEffect(() => {
    const fetchFarmerData = async () => {
      try {
        const token = localStorage.getItem("token"); // token saved during login
        if (!token) return;

        const res = await fetch("http://localhost:8070/farmer/userdata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (data.status === "ok") {
          setFarmerId(data.data._id);

          // Fetch applied schemes for this farmer
          const appliedRes = await fetch(`http://localhost:8070/appliedschemes/${data.data._id}`);
          const appliedData = await appliedRes.json();
          setAppliedSchemes(appliedData);
        }
      } catch (err) {
        console.error("Error fetching farmer data:", err);
      }
    };

    fetchFarmerData();
  }, []);

  // Fetch other data: seller orders, farmer orders, delivery posts, schemes
  useEffect(() => {
    const fetchSellerOrders = async () => {
      try {
        const response = await fetch("http://localhost:8070/sellerorder/");
        const data = await response.json();
        setSellerOrders(data);
      } catch (error) {
        console.error("Error fetching seller orders:", error);
      }
    };

    const fetchFarmerOrders = async () => {
      try {
        const response = await fetch("http://localhost:8070/farmerorder/");
        const data = await response.json();
        setFarmerOrders(data);
      } catch (error) {
        console.error("Error fetching farmer orders:", error);
      }
    };

    const fetchDeliveryPosts = async () => {
      try {
        const response = await fetch("http://localhost:8070/deliverypost/");
        const data = await response.json();
        setDeliveryPosts(data);
      } catch (error) {
        console.error("Error fetching delivery posts:", error);
      }
    };

    const fetchSchemes = async () => {
      try {
        const response = await fetch("http://localhost:8070/schemes/");
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

  // Apply for a scheme
  const handleApplyScheme = async (scheme) => {
    if (!appliedSchemes.find((s) => s._id === scheme._id) && farmerId) {
      try {
        const response = await fetch("http://localhost:8070/appliedschemes/", {
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
          {sellerOrders.slice(0, 4).map((order, index) => (
            <div key={index} className="order-item1">
              <img src={order.productImage} alt={order.item} className="order-image" />
              <p>{order.item}</p>
              <p>Quantity: {order.quantity}</p>
              <p>Price: Rs.{order.price}</p>
              <p>Posted Date: {order.postedDate}</p>
              <p>Expires Date: {order.expireDate}</p>
              <button className="cart-button">
                <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
              </button>
              <button className="supply-button">
                <FontAwesomeIcon icon={faTruck} /> Supply
              </button>
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
              <img src={order.productImage} alt={order.item} className="order-image" />
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
              <img src={order.vehicleImage} alt={order.model} className="order-image" />
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
