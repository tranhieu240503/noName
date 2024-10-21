import React from "react";
import { useNavigate } from "react-router-dom";

const styles = {
  container: {
    textAlign: 'center',
    padding: '20px',
  },
  header: {
    backgroundColor: '#282c34',
    padding: '20px',
    color: 'white',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px',
  },
  input: {
    display: 'block',
    margin: '10px auto',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    width: '80%',
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
  },
};

const HomeScreen = (props) => {
  const navigate = useNavigate(); // Hook để điều hướng

  const handleSubmit = async () => {
    const { cost, itemName } = props;
    await props.createItem(itemName, cost);
    navigate('/purchase'); // Điều hướng đến màn hình mua sau khi tạo thành công
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Trang Chính</h1>
      </header>
      <main>
        <section style={styles.section}>
          <h2>Tạo sản phẩm</h2>
          <div className="form-group">
            <label htmlFor="cost">Giá (ETH):</label>
            <input
              type="text"
              name="cost"
              id="cost"
              onChange={props.handleInputChange}
              placeholder="Nhập giá (ETH)"
              style={styles.input}
            />
          </div>
          <div className="form-group">
            <label htmlFor="itemName">Tên sản phẩm:</label>
            <input
              type="text"
              name="itemName"
              id="itemName"
              onChange={props.handleInputChange}
              placeholder="Nhập tên sản phẩm"
              style={styles.input}
            />
          </div>
          <button type="button" onClick={handleSubmit} style={styles.button}>
            Tạo 
          </button>
        </section>
      </main>
    </div>
  );
};

export default HomeScreen;
