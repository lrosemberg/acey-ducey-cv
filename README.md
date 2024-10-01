# Acey Ducey

This is a simple game of Acey Ducey built with React.


## Game Rules

Acey Ducey is a simple card game where the player bets on whether a third card will fall between two dealt cards. Here's how it works:

1. The dealer (computer) deals two cards face up.

2. You (the player) have three options:
   - Bet: If you think the next card will fall between the two dealt cards.
   - Pass: If you don't want to bet on this round.
   - Quit: End the game.

3. If you choose to bet:
   - You can bet any amount up to your current balance.
   - If the third card falls between the two dealt cards, you win the amount you bet.
   - If the third card doesn't fall between, you lose your bet.
   - If the third card matches either of the dealt cards, you lose your bet.

4. Special cases:
   - If the two dealt cards are consecutive (e.g., 5 and 6), it's impossible for a card to fall between them. It's best to pass in this situation.
   - If the two dealt cards are the same, it's also impossible for a card to fall between them.

5. The game continues until:
   - You run out of money (lose all your balance).
   - You choose to quit.

6. Ace choice: 
   - If an Ace is dealt as the first card, you can choose to bet on whether the next card will be higher or lower.
   - If and Ace is the second or third card, its value is fixed to 1.

Remember, the key to winning is to carefully consider the probability of a card falling between the two dealt cards before placing your bet. Good luck!

## How to play

1. Clone the repository
2. Run `npm install`
3. Run `npm start`

## Next steps

- Start using a CV model to read the cards.


