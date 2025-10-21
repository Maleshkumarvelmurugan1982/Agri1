import React, { useState, useEffect, useRef } from "react";
import "./RegSellerPage.css";
import NavbarRegistered from "../../NavbarRegistered/NavbarRegistered";
import FooterNew from "../../Footer/FooterNew";
import RegCategories from "../RegCatoegories/RegCategories";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import TypeWriter from "../../AutoWritingText/TypeWriter";

function RegSellerPage() {
  const [sellerOrders, setSellerOrders] = useState([]);
  const [deliveryPosts, setDeliveryPosts] = useState([]);
  const [imageErrors, setImageErrors] = useState({});
  const notifiedOrdersRef = useRef(new Set());

  // Backend URL
  const BACKEND_URL = "http://localhost:8070";

  // Fallback image URLs
  const fallbackProductImage = "https://via.placeholder.com/300x200?text=Product+Image";
  const fallbackVehicleImage = "https://via.placeholder.com/300x200?text=Vehicle+Image";

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // If it starts with /uploads, append to backend URL
    if (imagePath.startsWith('/uploads')) {
      return `${BACKEND_URL}${imagePath}`;
    }
    
    // If it's just a filename, construct the full path
    if (imagePath.startsWith('uploads/')) {
      return `${BACKEND_URL}/${imagePath}`;
    }
    
    // Default case: assume it's in uploads folder
    return `${BACKEND_URL}/uploads/${imagePath}`;
  };

  useEffect(() => {
    const fetchSellerOrders = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/sellerorder`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        console.log("Fetched seller orders:", data); // Debug log

        // Alert seller for approved/disapproved orders they haven't been notified of
        data.forEach((order) => {
          if (
            order.status &&
            !notifiedOrdersRef.current.has(order._id) &&
            (order.status === "approved" || order.status === "disapproved")
          ) {
            window.alert(`Your order for ${order.item} has been ${order.status}!`);
            notifiedOrdersRef.current.add(order._id);
          }
        });

        setSellerOrders(data);
      } catch (error) {
        console.error("Error fetching seller orders:", error);
      }
    };

    const fetchDeliveryPosts = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/deliverypost/`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched delivery posts:", data); // Debug log
        setDeliveryPosts(data);
      } catch (error) {
        console.error("Error fetching delivery posts:", error);
      }
    };

    fetchSellerOrders();
    fetchDeliveryPosts();

    // Optional: Set up polling to check for new orders every 30 seconds
    const interval = setInterval(() => {
      fetchSellerOrders();
      fetchDeliveryPosts();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleImageError = (id, type, originalSrc) => {
    console.error(`Image failed to load for ${type}-${id}:`, originalSrc);
    setImageErrors((prev) => ({ ...prev, [`${type}-${id}`]: true }));
  };

  return (
    <div>
      <NavbarRegistered />
      <div className="nothing"></div>

      <div className="crop-container">
        <img
          src="https://www.atoallinks.com/wp-content/uploads/2020/07/Agriculture-Product-Buying-and-Selling-App-Development.jpg"
          alt="seller-banner"
          className="crop-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/1200x400?text=Seller+Banner";
          }}
        />
      </div>

      <div className="type-writer-container">
        <TypeWriter
          text="Welcome Sellers!"
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

      <div className="nothing2"></div>
      <div className="topic">
        <p>Your Orders</p>
      </div>

      <div className="orders-wrapper">
        <div className="orders-container">
          {sellerOrders.length === 0 ? (
            <p style={{ textAlign: 'center', width: '100%', padding: '20px' }}>
              No orders available at the moment.
            </p>
          ) : (
            sellerOrders.slice(0, 4).map((order, index) => {
              const imageUrl = getImageUrl(order.productImage);
              const displayImage = imageErrors[`order-${order._id || index}`] 
                ? fallbackProductImage 
                : imageUrl || fallbackProductImage;
              
              console.log(`Order ${index} image URL:`, displayImage); // Debug log
              
              return (
                <div key={order._id || index} className="order-item">
                  <img
                    src={displayImage}
                    alt={order.item || "Product"}
                    className="order-image"
                    onError={(e) => {
                      handleImageError(order._id || index, "order", e.target.src);
                      e.target.onerror = null;
                      e.target.src = fallbackProductImage;
                    }}
                    onLoad={() => console.log(`Order image loaded successfully: ${displayImage}`)}
                  />
                  <p><strong>{order.item || "Unknown Item"}</strong></p>
                  {order.quantity && <p>Quantity: {order.quantity}</p>}
                  {order.price && <p>Price: Rs.{order.price}</p>}
                  {order.postedDate && <p>Posted: {order.postedDate}</p>}
                  {order.expireDate && <p>Expires: {order.expireDate}</p>}
                  <p>Status: {order.status || "Pending"}</p>
                </div>
              );
            })
          )}
        </div>
        {sellerOrders.length > 4 && (
          <a href="/sellerorder" className="view-all-button1">
            <FontAwesomeIcon icon={faChevronRight} className="arrow-icon" />
          </a>
        )}
      </div>

      <div className="topic">
        <p>Delivery Services</p>
      </div>

      <div className="orders-wrapper">
        <div className="orders-container">
          {deliveryPosts.length === 0 ? (
            <p style={{ textAlign: 'center', width: '100%', padding: '20px' }}>
              No delivery services available at the moment.
            </p>
          ) : (
            deliveryPosts.slice(0, 4).map((post, index) => {
              const imageUrl = getImageUrl(post.vehicleImage);
              const displayImage = imageErrors[`delivery-${post._id || index}`]
                ? fallbackVehicleImage
                : imageUrl || fallbackVehicleImage;
              
              console.log(`Delivery ${index} image URL:`, displayImage); // Debug log
              
              return (
                <div key={post._id || index} className="order-item">
                  <img
                    src={displayImage}
                    alt={post.model || "Vehicle"}
                    className="order-image"
                    onError={(e) => {
                      handleImageError(post._id || index, "delivery", e.target.src);
                      e.target.onerror = null;
                      e.target.src = fallbackVehicleImage;
                    }}
                    onLoad={() => console.log(`Delivery image loaded successfully: ${displayImage}`)}
                  />
                  <p><strong>{post.model || "Unknown Model"}</strong></p>
                  {post.capacity && <p>Capacity: {post.capacity} kg</p>}
                  {post.price && <p>Price: Rs.{post.price}/km</p>}
                </div>
              );
            })
          )}
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

export default RegSellerPage;