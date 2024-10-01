import React from 'react';
import './Panel.css';

const Panel = ({ title, cards, getCardColor }) => (
  <div className="panel">
    <h2>{title}</h2>
    <div className="scrollable-list">
      <ul>
        {cards.map((card, index) => (
          <li key={index} style={{ color: getCardColor(card.suit) }}>
            {card.value} {card.suit}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default Panel;