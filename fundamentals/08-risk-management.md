
# What is Risk Management

Risk management is how you protect your trading account from losing too much money. It's the most important skill in trading.

**Why traders fail:**
1. Poor psychology (emotions, discipline)
2. Poor risk management

You can have a winning strategy, but without proper risk management, a few bad trades can wipe out your account. Risk management keeps you in the game long enough for your edge to play out.

---

## Risk to Reward (R:R)

How much you're willing to risk compared to how much you could gain. Written as a ratio.

**Examples:**
- 1:2 R:R = Risking $100 to potentially make $200
- 1:3 R:R = Risking $100 to potentially make $300

**The higher the reward, the better.** A higher reward ratio means you can be wrong more often and still be profitable.

### Why R:R Matters

| Risk:Reward | Win Rate Needed to Break Even |
|-------------|-------------------------------|
| 1:1 | 50% |
| 1:2 | 33% |
| 1:3 | 25% |
| 1:4 | 20% |

With a 1:3 R:R, you only need to win 1 out of every 4 trades to break even. Win 2 out of 4 and you're profitable.

**Profitability = Win Rate × Average Risk to Reward**

You can have a low win rate and still make money if your winners are bigger than your losers.

### The Minimum Standard

**The minimum risk to reward ratio you should take is 1:2, ideally 1:3.**

Anything less than 1:2 means you need to win more than half your trades just to break even - and that's hard to do consistently.

---

## Stop Loss

A stop loss is an order that automatically closes your trade at a set price to limit your loss.

**Where to place it:** Your stop loss should be placed just beyond the point where your trade idea is proven wrong.

- If you're buying at support, your stop goes just below that support level
- If you're selling at resistance, your stop goes just above that resistance level

If price hits your stop, it means your analysis was wrong - and that's okay. The stop protected you from a bigger loss.

### The Non-Negotiable Rule

**You must always have a stop loss. This is non-negotiable.**

Trading without a stop loss is gambling. One bad trade can destroy weeks or months of gains. A stop loss defines your maximum risk before you enter the trade.

You can get away without a take profit (though it's recommended). But a stop loss? Always. Every single trade.

---

## Take Profit

A take profit is an order that automatically closes your trade at a set price to lock in your gains.

**Where to place it:** At a logical target where price is likely to reverse or stall:
- The next support/resistance level
- A previous high/low
- A measured move target (like the height of a pattern)

**Why use one:** It removes emotion from the exit. Without a take profit, you might hold too long and watch your profit disappear, or exit too early out of fear.

---

# The Maths of Trading

You don't need to be good at maths to trade, but you need to understand these basics.

## Pips

A pip is the smallest standard price movement in forex. For most currency pairs, it's the fourth decimal place.

**Example:** If EUR/USD moves from 1.1000 to 1.1001, that's a 1 pip move.

Pips are how you measure:
- How far price has moved
- The size of your stop loss and take profit
- Your profit or loss on a trade

*Note: In other markets (stocks, crypto, futures), the equivalent is called "points" or "ticks."*

### Fixed Value-Per-Pip
There is a fixed reference money-per-pip at 1.00 lot, defined per instrument × broker. 

This is not optional — it’s how the market converts price movement into money. We do not need to calculate this manually, but we must conceptually know that it exists and where it comes from.

> It answers the question:
> “If price moves by 1 pip and I am trading 1.00 lot, how much money changes?”
> “How much money is gained or lost when price moves by 1 pip on this contract size for this broker and instrument”

- A lot tells you HOW BIG the contract is
- Value-per-pip (or pip value) tells you HOW FAST money changes when price moves

- Defined by **instrument × broker**
- Shown in MT5 specs (via tick value / contract size)
- **Does NOT depend on your lot size**
- Fixed unless you change instrument or broker

Example (GBPUSD on most brokers):

- Reference money-per-pip at 1.00 lot = **£10**

This is the **constant**.

## Position Sizes

This is important psychologically.

Markets work in:

- Contracts
- Units
- Price movement

So you must:

1. Decide risk value amount
2. Decide stop distance
3. Choose the contract size (lot) that converts price movement into that risk value amount

> Fundamentally, we are not trading money. We are trading price movement (on a contract).

Position sizing in trading is purely the calculation of "how much" we are trading, according to predefined risk. 

So if we want to risk only 1% of our total account balance, how much money is that? What value of money are we risking?

```
Risk Value Amount = Account Balance x (risk % / 100)
```

So if my account balance is £1000, and I only want to risk 1%, I'm only willing to lose £10 value.

> So then the ultimate question becomes:
> “If price moves against me from entry to stop, how "big" must my trade be so that the total money lost is only £100?”

It goes like this:

1. I choose **how much I’m willing to lose**
2. I choose **where I’m proven wrong (stop loss)**
3. That tells me **£ per pip**
4. I set the knob of my trade that sets **£ per pip**

And the question of "how big must my trade be" or "the knob" is our core, underlying main mission...

## Contracts

Before we move to lots, we have to understand contract sizes.

**Contract size** answers this question:

> “If I trade **1.00 lot**, how many units does that represent?”

This is defined by:

- The market
- The broker (e.g. **Vantage**)
- Enforced by the platform (e.g. **MetaTrader 5**)

You do **not** choose this.

You do **not** change this.

The contract size never changes per instrument, per broker.

It is part of the instrument’s DNA.

In physics, you'd call it a physical constant.

## Lots

**What is a lot?**

A lot is a multiplier. That's all.
It’s a multiplier applied to a fixed contract size.

A lot is a ratio you adjust and scale to match your account size and risk according to a fixed quantity - contract sizes.

When thinking about lots in relation to pips, you have to say: “I am NOT calculating risk-per-pip from lot size. I am SCALING a known price-per-pip down to match my risk-per-pip”

A “full contract size” is the definition of the instrument.
A “lot” is how much of that contract you choose to trade.

> Lot size controls how expensive each pip is.

**“Full contract” and “1.00 lot” are the same thing**

> Fundamentally, a lot (size), answers the question:
> *“How many multiples (or fractions) of the contract size am I trading?”*
> “If price moves by 1 pip on my trade, how much money changes?”
> “What lot size scales the reference money-per-pip at 1.00 lot down to £X per pip for my trade?”

For example, let's say we know:
- Risk = £100
- Stop loss = 50 pips

Target £/pip = Risk Amount ÷ Stop (pips)

Now we ask a different question:

> “What lot size gives me £2 per pip?”

That’s all lot size does.

It **sets risk value amount pip of movement** for our trade.

> **FUNDAMENTALLY, THIS IS WHAT WE MEAN BY "RISK PER TRADE"**
> CALCULATING OUR LOT SIZE IS WHAT IT ALL BOILS DOWN TO. 

You **never** decide lot size first.

You decide **risk (amount) first**, and lot size is just the *result*.

**Standard lot sizes in forex:**
| Lot Type | Size | Value per Pip (approx) |
|----------|------|------------------------|
| Standard | 100,000 units | $10 per pip |
| Mini | 10,000 units | $1 per pip |
| Micro | 1,000 units | $0.10 per pip |

The larger your lot size, the more money you make or lose for each pip of movement.

## Risk Per Trade

**The rule: Risk no more than 1-2% of your account per trade.**

This is the most important number in risk management.

**Why 1%?**
- If you lose 10 trades in a row (it happens), you've lost 10% of your account - painful but recoverable
- If you risk 10% per trade and lose 10 in a row, you've lost your entire account

### So how do you calculate lot size?

In this light, every trade has only 4 for important inputs:

1. **Account balance** (the total value of your account)
2. **Risk %** (percentage of your account you're willing to risk - typically 1%)
3. **Stop-loss distance** (The number of pips (for Forex) or points (for Indices/Gold) between your entry and your stop loss)
4. **Value of 1 pip per lot** ()

That’s it. Nothing else matters when it comes to managing risk when trading.

```
Lot size =
Risk amount ÷ (Stop loss in pips × Pip value per lot)
```

```
Lot Size =
Money You Are Willing To Lose
÷
(Stop Loss In Pips × Money You Lose Per Pip)
```
```
Lot Size =
Risk Amount
÷
(Stop Loss (pips) × Pip Value of 1.00 Lot)
```
```
Contract Size Multiplier =
Money I am willing to lose
÷
(Number of pips price can move against me × Money lost per pip on 1 full contract)
```

If your stop loss gets hit, you lose exactly $100 (1% of your account). No more, no less.

---

## Summary

| Rule | Why |
|------|-----|
| Always use a stop loss | Defines your maximum risk, protects your account |
| Risk 1-2% per trade maximum | Keeps you in the game after losing streaks |
| Minimum 1:2 risk to reward | Allows profitability even with lower win rates |
| Calculate position size based on stop loss | Ensures consistent risk across all trades |

## Think of it like this (no trading terms)

- The **lot** = size of the engine
- The **pip** = how far the wheel turns
- The **pip value** = how fast your fuel burns

Bigger engine + same movement = more fuel burned.

Risk management isn't exciting, but it's what separates traders who survive from those who blow up their accounts.

---

**Next:** [Trading Psychology](09-trading-psychology.md)

*You have the math and the method; the only thing left that can break this system is you.*