import React from 'react';
import './Cards.css';
import { getCardColor, getSuitSymbol } from '../../utils/cardUtils';

const Cards = ({ currentCards }) => {
  return (
    <div className="cards">
      {currentCards.map((card, index) => (
        <div key={index} className="card" style={{ color: card ? getCardColor(card.suit) : 'black' }}>
          {card ? `${card.value} ${getSuitSymbol(card.suit)}` : 'Card'}
        </div>
      ))}
    </div>
  );
};

export default Cards;