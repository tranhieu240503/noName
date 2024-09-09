// PurchaseScreen.js
import React from 'react';

const PurchaseScreen = ({ items, handleBuy, userAddress }) => {
  return (
    <div>
      <h2>Purchase Items</h2>
      <ul>
        {items.map(item => (
          <li key={item.id}>
            {item.name} - {item.cost} Wei
            {item.status === 'Sold' ? (
              <span> - Sold</span>
            ) : (
              <button onClick={() => handleBuy(item.id)}>Buy</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PurchaseScreen;
