import React from 'react';
import './Panel.css';
import { getCardColor, getSuitSymbol } from '../../utils/cardUtils';

const Panel = ({ title, cards, grouped = true }) => {
  const renderGroupedCards = () => {
    const groupedCards = cards.reduce((acc, card) => {
      if (!acc[card.value]) {
        acc[card.value] = [];
      }
      acc[card.value].push(card);
      return acc;
    }, {});

    const cardOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    return (
      <ul className="grouped-cards">
        {cardOrder.map(value => (
          <li key={value} className={`card-group ${!groupedCards[value] ? 'disabled' : ''}`}>
            <span className="card-value" style={{ opacity: groupedCards[value] && groupedCards[value].length > 0 ? 1 : 0.1 }}>
              {value}
              <span className="card-value-count">({groupedCards[value] ? groupedCards[value].length : 0})</span>
            </span>
            <div className="card-suits">
              {['D', 'S', 'H', 'C'].map((suit, index) => (
                <span
                  key={index}
                  className="card-suit"
                  style={{ color: getCardColor(suit), opacity: groupedCards[value] && groupedCards[value].some(card => card.suit === suit) ? 1 : 0.1 }}
                >
                  {getSuitSymbol(suit)}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const renderUngroupedCards = () => {
    return (
      <ul className="ungrouped-cards">
        {cards.slice().reverse().map((card, index) => (
          <li key={index} className="card-item">
            <span className="card-value">{card.value}</span>
            <span
              className="card-suit"
              style={{ color: getCardColor(card.suit) }}
            >
              {getSuitSymbol(card.suit)}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="panel">
      <h2>{title} <span className="card-count">({cards.length})</span></h2>
      <div className="scrollable-list">
        {grouped ? renderGroupedCards() : renderUngroupedCards()}
      </div>
    </div>
  );
};

export default Panel;