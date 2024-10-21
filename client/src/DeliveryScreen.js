import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

function DeliveryScreen({ items, handleDeliver, userAddress, itemManager }) {
  let web3;
  const [web3Error, setWeb3Error] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      web3 = new Web3(window.ethereum);
    } else {
      setWeb3Error('Vui lòng cài đặt MetaMask để sử dụng tính năng này.');
    }
  }, []);

  useEffect(() => {
    const storedRatings = JSON.parse(localStorage.getItem('ratings')) || {};
    const storedComments = JSON.parse(localStorage.getItem('comments')) || {};
    setRatings(storedRatings);
    setComments(storedComments);
  }, []);

  useEffect(() => {
    localStorage.setItem('ratings', JSON.stringify(ratings));
    localStorage.setItem('comments', JSON.stringify(comments));
  }, [ratings, comments]);

  const handleRating = async (itemId, rating, comment) => {
    if (!ratings[itemId]) {
      const newCommentList = comments[itemId] ? [...comments[itemId], comment] : [comment];
      
      setRatings(prevRatings => ({
        ...prevRatings,
        [itemId]: rating,
      }));

      setComments(prevComments => ({
        ...prevComments,
        [itemId]: newCommentList,
      }));

      try {
        await itemManager.methods.rateItem(itemId, rating).send({ from: userAddress });
        setFeedbackMessage('Đánh giá thành công!');
      } catch (error) {
        console.error(error);
        setFeedbackMessage('Đã có lỗi xảy ra khi gửi đánh giá.');
      }

      setTimeout(() => setFeedbackMessage(''), 3000);
    }
  };

  const handleDeliverItem = async (itemId) => {
    try {
      await handleDeliver(itemId);
      setFeedbackMessage('Sản phẩm đã được giao thành công!');
      setTimeout(() => setFeedbackMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setFeedbackMessage('Đã có lỗi xảy ra khi giao hàng.');
      setTimeout(() => setFeedbackMessage(''), 3000);
    }
  };

  return (
    <div style={styles.container}>
      {web3Error && <p style={styles.error}>{web3Error}</p>}
      {feedbackMessage && <p style={styles.feedback}>{feedbackMessage}</p>}
      <h2 style={styles.title}>Giao sản phẩm</h2>
      {items.length > 0 ? (
        <div style={styles.itemsContainer}>
          {items
            .filter(item => item.status === 'Sold' || item.status === 'Delivered')
            .map(item => (
              <div key={item.id} style={styles.itemContainer}>
                <div style={styles.itemContent}>
                  <h3 style={styles.itemTitle}>{item.name}</h3>
                  <p style={styles.itemCost}>{item.cost} ETH</p>
                  <p style={styles.itemStatus}>Trạng thái: {item.status}</p>
                  {item.deliveryDate && <p style={styles.itemDate}>Ngày giao: {item.deliveryDate}</p>}
                </div>
                <button 
                  onClick={() => handleDeliverItem(item.id)} 
                  disabled={item.status === 'Delivered'}
                  style={{ 
                    ...styles.button, 
                    backgroundColor: item.status === 'Delivered' ? '#6c757d' : '#007bff' 
                  }}
                >
                  {item.status === 'Delivered' ? 'Đã giao' : 'Giao'}
                </button>
                {item.status === 'Delivered' && 
                  userAddress && item.creatorAddress && 
                  web3.utils.toChecksumAddress(userAddress) !== web3.utils.toChecksumAddress(item.creatorAddress) && (
                  <div style={styles.ratingContainer}>
                    <p style={styles.ratingTitle}>Đánh giá sản phẩm:</p>
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button 
                        key={rating} 
                        onClick={() => handleRating(item.id, rating, prompt('Nhập nhận xét của bạn:'))} 
                        style={styles.ratingButton}
                      >
                        {rating} sao
                      </button>
                    ))}
                    {ratings[item.id] && (
                      <div>
                        <p>Đánh giá của bạn: {ratings[item.id]} sao</p>
                        {comments[item.id] && (
                          <div>
                            <p>Nhận xét:</p>
                            <ul>
                              {comments[item.id].map((comment, index) => (
                                <li key={index}>{comment}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
      ) : (
        <p>Không có sản phẩm nào để giao.</p>
      )}
    </div>
  );
}

// Các style cho DeliveryScreen
const styles = {
  container: {
    padding: '20px',
  },
  error: {
    color: 'red',
  },
  feedback: {
    color: 'green',
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
  },
  itemsContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  itemContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: '18px',
  },
  itemCost: {
    fontSize: '16px',
  },
  itemStatus: {
    fontSize: '14px',
  },
  itemDate: {
    fontSize: '14px',
  },
  button: {
    padding: '10px 15px',
    border: 'none',
    color: '#fff',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  ratingContainer: {
    marginTop: '10px',
  },
  ratingTitle: {
    fontSize: '16px',
    marginBottom: '5px',
  },
  ratingButton: {
    marginRight: '5px',
    padding: '5px 10px',
    cursor: 'pointer',
  },
};

export default DeliveryScreen;
