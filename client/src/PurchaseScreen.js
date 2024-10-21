import React, { useState } from "react";
import PropTypes from "prop-types";

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  header: {
    marginBottom: "20px",
  },
  searchContainer: {
    marginBottom: "20px",
  },
  searchInput: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    width: "100%",
    fontSize: "16px",
  },
  section: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
    padding: "15px",
    width: "calc(33.333% - 20px)", // Three items per row
    transition: "transform 0.2s",
    position: "relative",
  },
  cardHover: {
    transform: "scale(1.05)",
  },
  itemName: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  itemPrice: {
    fontSize: "16px",
    color: "#2c3e50",
    marginBottom: "10px",
  },
  itemId: {
    fontSize: "14px",
    color: "#7f8c8d",
    marginBottom: "10px",
  },
  sold: {
    color: "#e74c3c",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  reviewContainer: {
    marginTop: "15px",
  },
  reviewInput: {
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    width: "100%",
    marginBottom: "10px",
    fontSize: "14px",
  },
  reviewsList: {
    marginTop: "10px",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
  },
  button: {
    padding: "10px",
    backgroundColor: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "background-color 0.3s",
  },
  buttonHover: {
    backgroundColor: "#2980b9",
  },
};

const PurchaseScreen = ({ items, handleBuy, handleReview }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [reviews, setReviews] = useState({});
  const [submittedReviews, setSubmittedReviews] = useState({});

  const filteredItems = items.filter(
    (item) =>
      item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReviewChange = (itemId, value) => {
    setReviews({ ...reviews, [itemId]: value });
  };

  const submitReview = (itemId) => {
    if (reviews[itemId]) {
      handleReview(itemId, reviews[itemId]);
      setSubmittedReviews({
        ...submittedReviews,
        [itemId]: reviews[itemId],
      });
      setReviews({ ...reviews, [itemId]: "" });
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>Mua Sản Phẩm</h2>
      </header>
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
          aria-label="Search products"
        />
      </div>
      <main>
        <section style={styles.section}>
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              style={{
                ...styles.card,
                ...(hoveredIndex === index ? styles.cardHover : {}),
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div style={styles.itemName}>{item.name}</div>
              <div style={styles.itemPrice}>{item.cost} ETH</div>
              <div style={styles.itemId}>ID: {item.id}</div>
              {item.status === "Delivered" ? (
                <>
                  <span style={styles.sold}>Đã hết hàng</span>
                  <div style={styles.reviewContainer}>
                    <h4>Đánh Giá Sản Phẩm:</h4>
                    <textarea
                      placeholder="Nhập đánh giá của bạn..."
                      rows="3"
                      value={reviews[item.id] || ""}
                      onChange={(e) =>
                        handleReviewChange(item.id, e.target.value)
                      }
                      style={styles.reviewInput}
                    />
                    <button
                      onClick={() => submitReview(item.id)}
                      style={styles.button}
                      aria-label={`Send review for ${item.name}`}
                    >
                      Gửi Đánh Giá
                    </button>
                    {submittedReviews[item.id] && (
                      <div style={styles.reviewsList}>
                        <strong>Đánh giá của bạn:</strong> {submittedReviews[item.id]}
                      </div>
                    )}
                  </div>
                </>
              ) : item.status === "Sold" ? (
                <span style={styles.sold}>Đã bán</span>
              ) : (
                <button
                  onClick={() => handleBuy(item.id)}
                  style={styles.button}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor =
                      styles.buttonHover.backgroundColor)
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor =
                      styles.button.backgroundColor)
                  }
                  aria-label={`Buy ${item.name}`}
                >
                  Mua Ngay
                </button>
              )}
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

// Adding PropTypes for better documentation
PurchaseScreen.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      cost: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
    })
  ).isRequired,
  handleBuy: PropTypes.func.isRequired,
  handleReview: PropTypes.func.isRequired,
};

export default PurchaseScreen;
