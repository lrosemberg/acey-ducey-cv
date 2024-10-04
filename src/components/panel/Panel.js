import React from 'react';
import './Panel.css';
import { getCardColor, getSuitSymbol } from '../../utils/cardUtils';

const Panel = ({ title, cards }) => (
  <div className="panel">
    <h2>{title}</h2>
    <div className="scrollable-list">
      <ul>
        {cards.map((card, index) => (
          <li key={index} style={{ color: getCardColor(card.suit) }}>
            {card.value} {getSuitSymbol(card.suit)}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default Panel;