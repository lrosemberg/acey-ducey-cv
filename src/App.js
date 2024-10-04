import React, { useState, useEffect } from 'react';
import './App.css';
import Panel from './components/panel/Panel';
import Table from './components/table/Table';
import Cards from './components/cards/Cards';
import winnerGif from './assets/images/winner.gif';
import loserGif from './assets/images/loser.gif';

// Function to create the deck
const createDeck = () => {
  const suits = ['♦', '♠', '♥', '♣'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  let deck = [];
  suits.forEach((suit) => {
    values.forEach((value) => {
      deck.push({ suit, value });
    });
  });
  return deck;
};

function App() {
  const [deck, setDeck] = useState(createDeck());
  const [playedCards, setPlayedCards] = useState([]);
  const [currentCards, setCurrentCards] = useState([null, null, null]);
  const [step, setStep] = useState(0); // Controls the step of flipping the cards
  const [winProbability, setWinProbability] = useState(null);
  const [aceChoice, setAceChoice] = useState(null); // Ace choice: high or low
  const [aceBeingSelected, setAceBeingSelected] = useState(false);
  const [winningCards, setWinningCards] = useState([]);
  const [losingCards, setLosingCards] = useState([]);
  const [gameResult, setGameResult] = useState(null); // 'win', 'lose', or null

  useEffect(() => {
    // Calculate the probability whenever the first two cards are revealed
    if (step === 2) {
      calculateProbability();
      updateWinningLosingCards();
    }
  }, [currentCards, playedCards, step]);

  useEffect(() => {
    // Clear game result after 2 seconds
    if (gameResult) {
      const timer = setTimeout(() => {
        setGameResult(null);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [gameResult]);

  const drawNextCard = () => {
    if (deck.length === 0) return;

    if (step === 3) {
      // Clear the table and start a new round
      setCurrentCards([null, null, null]);
      setStep(0);
      setWinProbability(null);
      setWinningCards([]);
      setLosingCards([]);
      setGameResult(null);
      return;
    }

    const newDeck = [...deck];
    const randomIndex = Math.floor(Math.random() * newDeck.length);
    const drawnCard = newDeck.splice(randomIndex, 1)[0];
    setDeck(newDeck);

    // If the first step reveals an Ace, prompt to choose high or low
    if (step === 0 && drawnCard.value === 'A') {
      setAceBeingSelected(true);
      setCurrentCards([drawnCard, null, null]);
    } else if (step === 1 && drawnCard.value === 'A') {
      // If the second card is an Ace, it's always the highest card
      advanceStep({ ...drawnCard, value: 'A(H)' });
    } else {
      advanceStep(drawnCard);
    }
  };

  const advanceStep = (card) => {
    const newCards = [...currentCards];
    newCards[step] = card;
    setCurrentCards(newCards);
    setPlayedCards([...playedCards, card]);
    setStep((prevStep) => prevStep < 3 ? prevStep + 1 : prevStep);

    // Check for win/lose condition when the third card is drawn
    if (step === 2) {
      checkGameResult([...newCards.slice(0, 2), card]);
    }
  };

  const checkGameResult = (cards) => {
    const [card1, card2, card3] = cards;
    const getValue = (card) => {
      const order = ['A(L)', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A(H)'];
      return order.indexOf(card.value);
    };
    const min = Math.min(getValue(card1), getValue(card2));
    const max = Math.max(getValue(card1), getValue(card2));
    const thirdCardValue = getValue(card3);

    if (thirdCardValue > min && thirdCardValue < max) {
      setGameResult('win');
    } else {
      setGameResult('lose');
    }
  };

  const selectAce = (choice) => {
    setAceChoice(choice);
    const aceCard = { ...currentCards[0], value: `A(${choice === 'high' ? 'H' : 'L'})` };
    advanceStep(aceCard);
    setAceBeingSelected(false);
  };

  const calculateProbability = () => {
    if (currentCards[0] && currentCards[1]) {
      const [card1, card2] = currentCards;
      const getValue = (card) => {
        const order = ['A(L)', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A(H)'];
        return order.indexOf(card.value);
      };
      const min = Math.min(getValue(card1), getValue(card2));
      const max = Math.max(getValue(card1), getValue(card2));

      const remainingCards = deck.length;
      const cardsInRange = deck.filter(
        (card) => getValue(card) > min && getValue(card) < max
      ).length;

      setWinProbability(((cardsInRange / remainingCards) * 100).toFixed(2));
    }
  };

  const updateWinningLosingCards = () => {
    if (currentCards[0] && currentCards[1]) {
      const [card1, card2] = currentCards;
      const getValue = (card) => {
        const order = ['A(L)', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A(H)'];
        return order.indexOf(card.value);
      };
      const min = Math.min(getValue(card1), getValue(card2));
      const max = Math.max(getValue(card1), getValue(card2));

      const winning = deck.filter((card) => getValue(card) > min && getValue(card) < max);
      const losing = deck.filter((card) => getValue(card) <= min || getValue(card) >= max);

      setWinningCards(winning);
      setLosingCards(losing);
    }
  };

  const resetGame = () => {
    const newDeck = createDeck();
    setDeck(newDeck);
    setPlayedCards([]);
    setCurrentCards([null, null, null]);
    setStep(0);
    setWinProbability(null);
    setAceChoice(null);
    setAceBeingSelected(false);
    setWinningCards([]);
    setLosingCards([]);
    setGameResult(null);
  };

  const getCardColor = (suit) => {
    return suit === '♥' || suit === '♦' ? 'red' : 'black';
  };

  const getProbabilityColor = (probability) => {
    if (probability < 33.33) return 'red';
    if (probability < 66.66) return 'orange';
    return 'green';
  };

  const handlePredictions = (predictions) => {
    console.log('Predictions:', predictions);
  };

  return (
    <div className="App">
      <div className="panels-container">
        <div className="side-panels">
          <Panel title="Played Cards" cards={playedCards} getCardColor={getCardColor} />
          <Panel title="Remaining Cards" cards={deck} getCardColor={getCardColor} />
        </div>

        <div className="center-panel">
          <div className="cards-container">
            <div className="table-container">
              <Table onPredictions={handlePredictions} />
            </div>
            <div className="cards-container">
              <Cards 
                currentCards={currentCards}
                getCardColor={getCardColor}
              />
            </div>
            <div className="commands-container">
              {!aceBeingSelected && deck.length > 0 && (
                <button onClick={drawNextCard}>
                  {step === 3 ? 'Start New Round' : 'Flip next card'}
                </button>
              )}
              {aceBeingSelected && (
                <div className="ace-choice-container">
                  <p>Choose whether the Ace of {currentCards[0].suit} is "high" (H) or "low" (L):</p>
                  <button onClick={() => selectAce('low')}>Low (L)</button>
                  <button onClick={() => selectAce('high')}>High (H)</button>
                </div>
              )}
              {winProbability && (
                <p style={{ color: getProbabilityColor(parseFloat(winProbability)) }}>
                  Win probability: {winProbability}%
                </p>
              )} 
            </div>
          </div>
          <div className="footer">
            <button onClick={resetGame}>Reset Game</button>
          </div>
          {gameResult === 'win' && (
            <div className="result-overlay fade-out">
              <img src={winnerGif} alt="Winner" className="winner-gif" />
            </div>
          )}
          {gameResult === 'lose' && (
            <div className="result-overlay fade-out">
              <img src={loserGif} alt="Loser" className="loser-image" />
            </div>
          )}
        </div>

        <div className="side-panels">
          <Panel title="Winning Cards" cards={winningCards} getCardColor={getCardColor} />
          <Panel title="Losing Cards" cards={losingCards} getCardColor={getCardColor} />
        </div>
      </div>
    </div>
  );
}

export default App;