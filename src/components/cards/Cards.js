import React from 'react';
import './Cards.css';
import { getCardColor, getSuitSymbol } from '../../utils/cardUtils';
import cardLogo from '../../assets/images/card-logo.png';

const Cards = ({ currentCards }) => {
  return (
    <div className="cards">
      {currentCards.map((card, index) => (
        <div key={index} className="card">
          {card ? (
            <>
              {card.value}{' '}
              <span style={{ color: getCardColor(card.suit) }}>
                {getSuitSymbol(card.suit)}
              </span>
            </>
          ) : (
            <img src={cardLogo} alt="Card Logo" style={{ width: '50%' }} />
          )}
        </div>
      ))}
    </div>
  );
};

export default Cards;