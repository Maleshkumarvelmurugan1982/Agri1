import React, { useState, useEffect } from "react";
import "./OrderPage.css";
import { useLocation, useNavigate } from "react-router-dom";

function OrderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const [formData, setFormData] = useState({
    productImage: queryParams.get("image") || "",
    productName: queryParams.get("item") || "",
    quantity: "",
    price: "",
    district: "",
    company: "",
    mobile: "",
    email: "",
    address: "",
    expireDate: "",
  });

  const [unitPrice, setUnitPrice] = useState(0);
  const [availableQuantity, setAvailableQuantity] = useState(0);
  const [quantityError, setQuantityError] = useState("");
  const [productId, setProductId] = useState("");
  const [farmerId, setFarmerId] = useState(""); // Farmer who owns the product
  const [sellerId, setSellerId] = useState(""); // ✅ Add sellerId state (logged-in seller)
  const [isSubmitting, setIsSubmitting] = useState(false);

  const BASE_URL = "http://localhost:8070";

  // ✅ STEP 1: Get logged-in seller's ID from token
  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          console.error("No token found - user not logged in");
          alert("Please log in to place an order");
          navigate("/login"); // Redirect to login if no token
          return;
        }

        const res = await fetch(`${BASE_URL}/seller/userdata`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        
        if (data.status === "ok" && data.data) {
          setSellerId(data.data._id);
          console.log("✅ Logged-in Seller ID:", data.data._id);
          
          // Pre-fill form with seller's data
          setFormData(prev => ({
            ...prev,
            email: data.data.email || prev.email,
            district: data.data.district || prev.district,
            mobile: data.data.mobile || prev.mobile,
          }));
        } else {
          console.error("Failed to fetch seller data:", data);
          alert("Failed to load user data. Please log in again.");
          navigate("/login");
        }
      } catch (err) {
        console.error("Error fetching seller data:", err);
        alert("Error loading user data. Please try again.");
      }
    };

    fetchSellerData();
  }, [navigate]);

  // ✅ STEP 2: Fetch product details and farmerId
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    const priceFromUrl = params.get("price");
    console.log("Price from URL:", priceFromUrl);
    
    if (priceFromUrl) {
      setUnitPrice(Number(priceFromUrl));
      console.log("Unit price set from URL:", Number(priceFromUrl));
    }
    
    const productNameFromUrl = params.get("item");
    console.log("Product name from URL:", productNameFromUrl);
    
    if (productNameFromUrl) {
      fetch(`${BASE_URL}/product/name/${productNameFromUrl}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Product not found");
          }
          return response.json();
        })
        .then((product) => {
          console.log("Fetched product:", product);
          
          if (product) {
            if (product.price) setUnitPrice(Number(product.price));
            if (product.quantity) setAvailableQuantity(Number(product.quantity));
            if (product._id) setProductId(product._id);
            
            // ✅ CRITICAL: Get farmerId from product
            if (product.farmerId) {
              // If farmerId is populated (object), get the _id
              const farmerIdValue = typeof product.farmerId === 'object' 
                ? product.farmerId._id 
                : product.farmerId;
              setFarmerId(farmerIdValue);
              console.log("✅ Farmer ID from product:", farmerIdValue);
            } else if (product.userId) {
              // Some schemas use userId instead of farmerId
              const userIdValue = typeof product.userId === 'object' 
                ? product.userId._id 
                : product.userId;
              setFarmerId(userIdValue);
              console.log("✅ Farmer ID (from userId):", userIdValue);
            } else {
              console.warn("⚠️ No farmerId found in product");
            }
            
            console.log("Unit price set from API:", Number(product.price));
            console.log("Available quantity:", Number(product.quantity));
          }
        })
        .catch((error) => {
          console.error("Error fetching product:", error);
          alert("Failed to load product details. Please try again.");
        });
    }
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "quantity") {
      const quantity = Number(value) || 0;
      
      if (quantity > availableQuantity) {
        setQuantityError(`Only ${availableQuantity} kg available in stock!`);
      } else {
        setQuantityError("");
      }
      
      const totalPrice = quantity * unitPrice;
      
      console.log("Quantity:", quantity, "Unit Price:", unitPrice, "Total:", totalPrice);
      
      setFormData((prevFormData) => ({
        ...prevFormData,
        quantity: value,
        price: totalPrice > 0 ? totalPrice.toFixed(2) : "",
      }));
      return;
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (quantityError) {
      alert("Please enter a valid quantity within available stock!");
      return;
    }

    if (!formData.quantity || !formData.district || !formData.company || 
        !formData.mobile || !formData.email || !formData.address || !formData.expireDate) {
      alert("Please fill in all required fields!");
      return;
    }

    // ✅ Validate sellerId
    if (!sellerId) {
      alert("User session expired. Please log in again.");
      console.error("Missing sellerId - user not logged in");
      navigate("/login");
      return;
    }

    // ✅ Validate farmerId
    if (!farmerId) {
      alert("Product owner information is missing. Please try again or contact support.");
      console.error("Missing farmerId - cannot create order");
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ Create the order with BOTH sellerId and farmerId
      const orderData = {
        name: formData.company,
        item: formData.productName,
        productImage: formData.productImage,
        category: "vegetable",
        quantity: Number(formData.quantity),
        price: Number(formData.price),
        district: formData.district,
        company: formData.company,
        mobile: formData.mobile,
        email: formData.email,
        address: formData.address,
        postedDate: new Date().toISOString().split('T')[0],
        expireDate: formData.expireDate,
        status: "pending",
        sellerId: sellerId, // ✅ CRITICAL: Seller placing the order
        farmerId: farmerId, // ✅ CRITICAL: Farmer who owns the product
      };

      console.log("📦 Submitting order with data:", orderData);
      console.log("   Seller ID:", sellerId);
      console.log("   Farmer ID:", farmerId);

      // Submit order to backend
      const orderResponse = await fetch(`${BASE_URL}/sellerorder/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const orderResult = await orderResponse.json();
      console.log("Order response:", orderResult);

      if (!orderResponse.ok) {
        throw new Error(orderResult.message || orderResult.error || "Failed to create order");
      }

      console.log("✅ Order created successfully:", orderResult);

      alert("Order placed successfully! Waiting for farmer approval.");
      
      // Navigate to seller page
      navigate("/regseller");
      
    } catch (error) {
      console.error("❌ Error submitting order:", error);
      alert(`Failed to place order: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h3>Place New Order</h3>
      <form onSubmit={handleSubmit}>
        {formData.productImage && (
          <div className="image-preview">
            <img 
              src={`${BASE_URL}${formData.productImage}`} 
              alt="Product"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/200?text=No+Image';
              }}
            />
          </div>
        )}

        {formData.productName && (
          <>
            <div className="input-field-container">
              <p>Product Name</p>
            </div>
            <div className="category-display">
              <h4>{formData.productName}</h4>
            </div>
          </>
        )}

        {unitPrice > 0 && (
          <>
            <div className="input-field-container">
              <p>Unit Price (Rs. per kg)</p>
            </div>
            <div className="category-display">
              <h4>Rs. {unitPrice.toFixed(2)}</h4>
            </div>
          </>
        )}

        {availableQuantity > 0 && (
          <>
            <div className="input-field-container">
              <p>Available Stock</p>
            </div>
            <div className="category-display">
              <h4>{availableQuantity} kg</h4>
            </div>
          </>
        )}

        <div className="input-field-container">
          <p>Quantity (kg) <span className="required">*</span></p>
        </div>
        <input
          type="number"
          name="quantity"
          placeholder="Enter Quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="0.1"
          step="0.1"
          max={availableQuantity}
          className={quantityError ? "input-error" : ""}
          required
        />
        {quantityError && (
          <div className="error-message">
            <p>{quantityError}</p>
          </div>
        )}

        <div className="input-field-container">
          <p>Total Price (Rs.)</p>
        </div>
        <input
          type="text"
          name="price"
          placeholder="Total Price"
          value={formData.price}
          readOnly
          className="readonly-field"
        />

        <div className="input-field-container">
          <p>District <span className="required">*</span></p>
        </div>
        <input
          type="text"
          name="district"
          placeholder="District"
          value={formData.district}
          onChange={handleChange}
          required
        />

        <div className="input-field-container">
          <p>Company <span className="required">*</span></p>
        </div>
        <input
          type="text"
          name="company"
          placeholder="Company"
          value={formData.company}
          onChange={handleChange}
          required
        />

        <div className="input-field-container">
          <p>Contact Number <span className="required">*</span></p>
        </div>
        <input
          type="text"
          name="mobile"
          placeholder="Mobile"
          value={formData.mobile}
          onChange={handleChange}
          pattern="[0-9]{10}"
          title="Please enter a valid 10-digit mobile number"
          required
        />

        <div className="input-field-container">
          <p>Email Address <span className="required">*</span></p>
        </div>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <div className="input-field-container">
          <p>Living Address <span className="required">*</span></p>
        </div>
        <textarea
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          rows="3"
          required
        ></textarea>

        <div className="input-field-container">
          <p>Set Order Expire Date <span className="required">*</span></p>
        </div>
        <input
          type="date"
          name="expireDate"
          placeholder="Expire Date"
          value={formData.expireDate}
          onChange={handleChange}
          min={new Date().toISOString().split('T')[0]}
          required
        />

        <button type="submit" disabled={isSubmitting || quantityError || !sellerId}>
          {isSubmitting ? "Placing Order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
}

export default OrderPage