import React, { useState, useEffect } from 'react';
import './App.css';
import Panel from './components/panel/Panel';
import Table from './components/table/Table';
import Cards from './components/cards/Cards';
import ThemeToggle from './components/theme-toggle/ThemeToggle';
import Header from './components/header/Header';
import winnerGif from './assets/images/winner.gif';
import loserGif from './assets/images/loser.gif';
import { getCardColor, getSuitSymbol } from './utils/cardUtils';

// Function to create the deck
const createDeck = () => {
  const suits = ['D', 'S', 'H', 'C'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  let deck = [];
  suits.forEach((suit) => {
    values.forEach((value) => {
      deck.push({ suit, value });
    });
  });
  return deck;
};

// Function to map prediction class to card object
const mapPredictionToCard = (predClass) => {
  const value = predClass.slice(0, -1);
  const suit = predClass.slice(-1);
  return { value, suit };
};

// Used to determine the position of the cards on the table compared to the step
const POSITION_MAP = [0, 2, 1];

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
  const [predictedCards, setPredictedCards] = useState([null, null, null]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

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

  const drawNextCard = (card, position) => {
    if (deck.length === 0) return;

    if (step === 3) {
      // Clear the table and start a new round
      setCurrentCards([null, null, null]);
      setStep(0);
      setWinProbability(null);
      setWinningCards([]);
      setLosingCards([]);
      setGameResult(null);
    }

    if (position !== POSITION_MAP[step]) return; // Only draw if the card is in the correct position
    if (playedCards.some(playedCard => playedCard.value === card.value && playedCard.suit === card.suit)) return; // Don't draw if the card has already been played

    const newDeck = deck.filter(c => !(c.value === card.value && c.suit === card.suit));
    setDeck(newDeck);

    // If the first step reveals an Ace, prompt to choose high or low
    if (step === 0 && card.value === 'A') {
      setAceBeingSelected(true);
      setCurrentCards([card, null, null]);
    } else if (step === 1 && card.value === 'A') {
      // If it's the second card (index 2, step 1) and it's an Ace, it's always high
      advanceStep(card, 'high');
    } else {
      advanceStep(card);
    }
  };

  const advanceStep = (card, aceValue = null) => {
    const newCards = [...currentCards];
    newCards[POSITION_MAP[step]] = card;
    setCurrentCards(newCards);
    setPlayedCards([...playedCards, card]);
    setStep((prevStep) => prevStep < 3 ? prevStep + 1 : prevStep);

    if (aceValue) {
      setAceChoice(aceValue);
    }

    // Check for win/lose condition when the third card is drawn
    if (step >= 2) {
      checkGameResult(newCards);
    }
  };

  const checkGameResult = (cards) => {
    const [card1, card3, card2] = cards; // Reorder cards to match the new positions
    const getValue = (card) => {
      if (card.value === 'A') {
        if (cards.indexOf(card) === 2) return 14; // Second card (index 2) Ace is always high
        return aceChoice === 'high' ? 14 : 1;
      }
      const order = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      return order.indexOf(card.value) + 2;
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
    advanceStep(currentCards[0], choice);
    setAceBeingSelected(false);
  };

  const calculateProbability = () => {
    if (currentCards[0] && currentCards[2]) {
      const [card1, card2] = [currentCards[0], currentCards[2]];
      const getValue = (card) => {
        if (card.value === 'A') {
          if (card === currentCards[2]) return 14; // Second card Ace is always high
          return aceChoice === 'high' ? 14 : 1;
        }
        const order = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        return order.indexOf(card.value) + 2;
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
    if (currentCards[0] && currentCards[2]) {
      const [card1, card2] = [currentCards[0], currentCards[2]];
      const getValue = (card) => {
        if (card.value === 'A') {
          if (card === currentCards[2]) return 14; // Second card Ace is always high
          return aceChoice === 'high' ? 14 : 1;
        }
        const order = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        return order.indexOf(card.value) + 2;
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
    setPredictedCards([null, null, null]);
  };

  const getProbabilityColor = (probability) => {
    if (probability < 33.33) return 'probability-red';
    if (probability < 66.66) return 'probability-orange';
    return 'probability-green';
  };

  const handlePredictions = (predictions) => {
    console.log('Predictions:', predictions);
    const newPredictedCards = [...predictedCards];

    predictions.forEach((pred, index) => {
      if (!pred) return;

      const card = mapPredictionToCard(pred.class);

      // If the card has not been played yet, can be played
      if (playedCards.some(playedCard => playedCard.value === card.value && playedCard.suit === card.suit)) {
        return;
      }

      newPredictedCards[index] = pred;
      drawNextCard(card, index);
    });

    setPredictedCards(newPredictedCards);
  };



  return (
    <div className="App">
      <Header toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      <div className="panels-container">
        <div className="side-panels">
          <Panel title="Played Cards" cards={playedCards} grouped={false} />
          <Panel title="Remaining Cards" cards={deck} />
        </div>

        <div className="center-panel">
          <div className="cards-container">
            <div className="table-container">
              <Table onPredictions={handlePredictions} />
            </div>
            <div className="cards-container">
              <Cards currentCards={currentCards} />
            </div>
            <div className="commands-container">
              {aceBeingSelected && (
                <div className="ace-choice-container">
                  <p>Choose whether the Ace of <span style={{ color: getCardColor(currentCards[0].suit) }}>{getSuitSymbol(currentCards[0].suit)}</span> is "high" or "low":</p>
                  <button onClick={() => selectAce('low')}>Low</button>
                  <button onClick={() => selectAce('high')}>High</button>
                </div>
              )}
              {winProbability && (
                <div className="win-probability">
                  <span className="win-probability-label">Win probability: </span>
                  <span 
                    className={`win-probability-value ${getProbabilityColor(parseFloat(winProbability))}`}
                  >
                    {winProbability}%
                  </span>
                </div>
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
          <Panel title="Winning Cards" cards={winningCards} />
          <Panel title="Losing Cards" cards={losingCards} />
        </div>
      </div>
    </div>
  );
}

export default App;