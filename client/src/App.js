import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import HomeScreen from './HomeScreen';
import PurchaseScreen from './PurchaseScreen';
import DeliveryScreen from './DeliveryScreen';
import axios from 'axios';
import ItemManagerContracts from './contracts/ItemManager.json';
import ItemContract from './contracts/Item.json';
import getWeb3 from './getWeb3';
import './App.css';
import blockies from 'ethereum-blockies';
import { ref, set, onValue } from 'firebase/database';
import { database } from './firebaseConfig'; // Import database từ firebaseConfig

class App extends Component {
  state = {
    loaded: false,
    items: [],
    cost: '',
    itemName: '',
    redirectToPurchase: false,
    userAddress: '',
    avatarUrl: '',
    accounts: [],
    web3: null,
    reviews: {},
  ratings: {},
  currentReview: '',
  currentRating: 0,
    itemManager: null
  };

  connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const userAddress = accounts[0];
        const avatarUrl = blockies.create({ seed: userAddress }).toDataURL();
        this.setState({ userAddress, avatarUrl });
      } catch (error) {
        console.error('Error connecting MetaMask:', error);
      }
    } else {
      alert('MetaMask is not installed.');
    }
  };

  listenToPaymentEvent = () => {
    if (this.state.itemManager) {
      this.state.itemManager.events.SupplyChainStep().on("data", async (evt) => {
        let itemObject = await this.state.itemManager.methods.items(evt.returnValues._itemIndex).call();
        alert("Item " + itemObject._identifier + " was paid, deliver it now");
      });
    }
  };

  loadItems = () => {
    try {
      const itemsRef = ref(database, 'items/');
      onValue(itemsRef, (snapshot) => {
        const data = snapshot.val();
        const itemsArray = [];
        if (data) {
          for (let id in data) {
            itemsArray.push({ id, ...data[id] });
          }
        }
        this.setState({ items: itemsArray });
      }, (error) => {
        console.error('Error loading data from Firebase:', error);
      });
    } catch (error) {
      console.error('Error loading data from Firebase:', error);
    }
  };

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({ [name]: value });
  };

  saveItemToDatabase = (itemId, itemData) => {
    const itemRef = ref(database, 'items/' + itemId);
    set(itemRef, itemData);
  };

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      this.setState({ accounts, web3 });
  
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = ItemManagerContracts.networks[networkId];
      const itemManager = new web3.eth.Contract(
        ItemManagerContracts.abi,
        deployedNetwork && deployedNetwork.address
      );
  
      this.setState({ itemManager, loaded: true });
      this.connectMetaMask();
      this.loadItems();
      this.listenToPaymentEvent(); // Gọi hàm để lắng nghe sự kiện thanh toán
    } catch (error) {
      console.error('Lỗi khi tải Web3, tài khoản hoặc hợp đồng:', error);
    }
  };
  

  handleSubmit = async () => {
    const { cost, itemName, accounts, itemManager, web3 } = this.state;
  
    try {
      if (!itemManager) {
        throw new Error('Hợp đồng không được khởi tạo.');
      }
  
      if (!accounts || accounts.length === 0) {
        throw new Error('Không tìm thấy tài khoản nào.');
      }
  
      if (!cost || !itemName) {
        throw new Error('Tên item và giá không được để trống.');
      }
  
      if (!web3 || !web3.utils) {
        throw new Error('web3 chưa được khởi tạo.');
      }
  
      const costInWei = web3.utils.toWei(cost.toString(), 'wei'); // Convert cost to Wei
  
      const result = await itemManager.methods.createItem(itemName, costInWei).send({ from: accounts[0] });
  
      console.log('Transaction result:', result); // Log the result for debugging
  
      const toAddress = result.to; // Use the 'to' address from the result
  
      if (!toAddress) {
        throw new Error('Không tìm thấy địa chỉ trong kết quả giao dịch.');
      }
  
      alert(`Gửi ${costInWei} Wei đến ${toAddress}`);
  
      const itemData = {
        name: itemName,
        cost: cost,
        fromAddress: accounts[0],
        toAddress: toAddress,
        hash: result.transactionHash,
        status: 'Create'
      };
  
      const itemRef = ref(database, 'items/' + result.transactionHash);
      await set(itemRef, itemData);
  
      console.log('Item đã được thêm vào Firebase Realtime Database với ID:', result.transactionHash);
      this.loadItems();
    } catch (error) {
      console.error('Lỗi khi thêm item:', error.message);
      alert(`Lỗi khi thêm item: ${error.message}`);
    }
  };
  
  
  
  
  handleBuy = async (itemIndex) => {
    const { items, userAddress, itemManager, web3 } = this.state;
  
    if (!itemManager || !web3 || !userAddress) {
      alert('Vui lòng đảm bảo rằng MetaMask đã kết nối và bạn đang chọn đúng mạng lưới.');
      return;
    }
  
    const item = items.find(i => i.id === itemIndex);
    if (!item) {
      alert('Sản phẩm không tìm thấy');
      return;
    }
  
    // Chuyển đổi địa chỉ thành định dạng checksum để đảm bảo so sánh chính xác
    const currentUserAddress = web3.utils.toChecksumAddress(userAddress);
    const creatorAddress = web3.utils.toChecksumAddress(item.fromAddress);
  
    // Kiểm tra nếu tài khoản mua là tài khoản tạo sản phẩm
    if (creatorAddress === currentUserAddress) {
      alert('Bạn không thể mua sản phẩm của chính mình.');
      return;
    }
  
    // Kiểm tra nếu sản phẩm đã được bán
    if (item.status === 'Sold') {
      alert('Sản phẩm này đã được bán.');
      return;
    }
  
    try {
      const itemCostInWei = web3.utils.toWei(item.cost.toString(), 'ether');
      console.log('Giá sản phẩm (Wei):', itemCostInWei);
  
      if (!itemCostInWei || itemCostInWei <= 0) {
        throw new Error('Giá sản phẩm không xác định hoặc không hợp lệ.');
      }
  
      const networkId = await web3.eth.net.getId();
      if (parseInt(networkId, 10) !== 5777) {
        alert(`Vui lòng kết nối đến đúng mạng lưới (Ganache). ID mạng hiện tại: ${networkId}`);
        return;
      }
  
      // Gửi giao dịch mua hàng
      const result = await itemManager.methods.triggerPayment(itemIndex).send({
        from: currentUserAddress,
        value: itemCostInWei,
        gas: 500000,
        gasPrice: web3.utils.toWei('20', 'gwei')
      });
  
      alert('Mua sản phẩm thành công!');
  
      const updatedItem = {
        ...item,
        status: 'Sold',
        buyer: currentUserAddress,
        hash: result.transactionHash
      };
  
      this.saveItemToDatabase(item.id, updatedItem);
      this.loadItems();
    } catch (error) {
      console.error('Lỗi khi mua sản phẩm:', error);
      alert(`Lỗi khi xử lý giao dịch: ${error.message}`);
    }
  };  
  
  handleDelivery = async (itemIndex) => {
    const { items, userAddress, web3, itemManager } = this.state;
  
    const item = items.find(i => i.id === itemIndex);
    if (!item) {
      alert('Sản phẩm không tìm thấy');
      return;
    }
  
    // Chuyển đổi địa chỉ thành định dạng checksum để đảm bảo so sánh chính xác
    const currentUserAddress = web3.utils.toChecksumAddress(userAddress);
    const creatorAddress = web3.utils.toChecksumAddress(item.fromAddress);
  
    // Kiểm tra nếu tài khoản hiện tại là chủ sở hữu sản phẩm
    if (creatorAddress !== currentUserAddress) {
      alert('Chỉ người tạo ra sản phẩm này mới có thể giao hàng.');
      return;
    }
  
    try {
      // Gửi giao dịch giao hàng
      const result = await itemManager.methods.triggerDelivery(itemIndex).send({
        from: currentUserAddress
      });
  
      alert('Giao hàng thành công.');
  
      const updatedItem = {
        ...item,
        status: 'Delivered',
        hash: result.transactionHash
      };
  
      this.saveItemToDatabase(item.id, updatedItem);
      this.loadItems();
    } catch (error) {
      console.error('Lỗi khi giao hàng:', error);
      alert('Lỗi khi giao hàng: ' + error.message);
    }
  }; 
  
  handleReviewChange = (event) => {
    this.setState({ currentReview: event.target.value });
  };
  
  handleRatingChange = (event) => {
    this.setState({ currentRating: event.target.value });
  };
  
  // Hàm để lưu đánh giá sản phẩm
// Hàm để lưu đánh giá sản phẩm
handleReview = async (itemIndex, review) => {
  const { reviews, items } = this.state;

  if (!review) return alert("Vui lòng nhập nhận xét");

  // Cập nhật reviews trong state
  const updatedReviews = { ...reviews, [itemIndex]: [...(reviews[itemIndex] || []), review] };
  this.setState({ reviews: updatedReviews });

  // Tìm sản phẩm và giữ nguyên các thông tin khác
  const updatedItems = items.map(item =>
    item.id === itemIndex ? { ...item, reviews: updatedReviews[itemIndex] } : item
  );
  this.setState({ items: updatedItems });

  // Lưu vào Firebase, giữ nguyên các thông tin hiện có của sản phẩm
  const itemRef = ref(database, 'items/' + itemIndex);
  const itemToUpdate = items.find(item => item.id === itemIndex);
  await set(itemRef, { ...itemToUpdate, reviews: updatedReviews[itemIndex] });
};

// Hàm để lưu đánh giá số sao sản phẩm
handleRating = async (itemIndex) => {
  const { currentRating, ratings, items } = this.state;

  if (currentRating === 0) return alert("Vui lòng nhập số sao hợp lệ");

  const updatedRatings = { ...ratings, [itemIndex]: currentRating };
  this.setState({ ratings: updatedRatings, currentRating: 0 });

  // Cập nhật thông tin rating trong state mà giữ nguyên thông tin khác của sản phẩm
  const updatedItems = items.map(item =>
    item.id === itemIndex ? { ...item, rating: updatedRatings[itemIndex] } : item
  );
  this.setState({ items: updatedItems });

  // Lưu vào Firebase, giữ nguyên các thông tin hiện có của sản phẩm
  const itemRef = ref(database, 'items/' + itemIndex);
  const itemToUpdate = items.find(item => item.id === itemIndex);
  await set(itemRef, { ...itemToUpdate, rating: updatedRatings[itemIndex] });
};


  render() {
    const { redirectToPurchase, userAddress, avatarUrl } = this.state;

    if (!this.state.loaded) {
      return <div>Loading web3, accounts, and contract...</div>;
    }

    return (
      <Router>
        <div className="App">
          <header className="header">
            <nav>
              <Link to="/">Home</Link> | 
              <Link to="/purchase">Purchase Item</Link> | 
              <Link to="/delivery">Deliver Item</Link>
            </nav>
            <div className="wallet-info">
              <img src={avatarUrl} alt="avatar" style={{ borderRadius: '50%', width: '40px' }} />
              <span>{userAddress}</span>
            </div>
            <h1>My Supply Chain</h1>
          </header>
          <main className="main-content">
            <Routes>
              <Route 
                path="/" 
                element={
                  <HomeScreen 
                    cost={this.state.cost}
                    itemName={this.state.itemName}
                    handleInputChange={this.handleInputChange}
                    createItem={this.handleSubmit}
                  />
                } 
              />
              <Route 
                path="/purchase" 
                element={
                  <PurchaseScreen 
                    items={this.state.items}
                    handleBuy={this.handleBuy}
                    handleReview={this.handleReview}
                    userAddress={this.state.userAddress}
                  />
                } 
              />
              <Route 
                path="/delivery" 
                element={
                  <DeliveryScreen 
                    items={this.state.items}
                    handleDeliver={this.handleDelivery}
                    userAddress={this.state.userAddress}
                  />
                } 
              />
            </Routes>
            {redirectToPurchase && <Navigate to="/purchase" />}
          </main>
        </div>
      </Router>
    );
  }
}

export default App;