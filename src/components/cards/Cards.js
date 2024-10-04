import React from 'react';
import './Cards.css';
const Cards = ({ currentCards, getCardColor }) => {
  return (
    <div className="cards">
      {[currentCards[0], currentCards[2], currentCards[1]].map((card, index) => (
        <div key={index} className="card" style={{ color: card ? getCardColor(card.suit) : 'black' }}>
          {card ? `${card.value} ${card.suit}` : 'Card'}
        </div>
      ))}
    </div>
  );
};

export default Cards;