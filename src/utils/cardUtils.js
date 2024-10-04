  const getCardColor = (suit) => {
    return suit === 'H' || suit === 'D' ? 'red' : 'black';
  };

  const getSuitSymbol = (suit) => {
    const suitMap = { 'C': '♣', 'D': '♦', 'H': '♥', 'S': '♠' };
    return suitMap[suit];
  };

  export { getCardColor, getSuitSymbol };