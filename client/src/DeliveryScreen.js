import React from 'react';
import Web3 from 'web3';

function DeliveryScreen({ items, handleDeliver, userAddress }) {
  const web3 = new Web3(); // Initialize Web3 instance

  return (
      <div>
          <h2>Deliver Items</h2>
          {items.map(item => (
              <div key={item.id}>
                  <p>Name: {item.name}</p>
                  <p>Cost: {web3.utils.fromWei(item.cost, 'ether')} ETH</p>
                  <button onClick={() => handleDeliver(item.id)} disabled={item.status === 'Delivered'}>
                      {item.status === 'Delivered' ? 'Delivered' : 'Deliver'}
                  </button>
              </div>
          ))}
      </div>
  );
}

export default DeliveryScreen;
