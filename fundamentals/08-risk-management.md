
# What is Risk Management

Risk management is how you protect your trading account from losing too much money. It's the most important skill in trading.

Position sizing controls how much you can lose.
Margin and leverage control whether you’re allowed to place the trade at all.
They exist between you and the broker, not between you and the market.

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

## Notional Value

Imagine you "control" an apartment building worth £100,000. You don't own it. You just have a contract that says: "Any change in the building's value belongs to me."

- If the building value goes to £105,000, you just made £5,000 in "real" cash, even though you never actually had £100,000.
- If the value goes to £95,000, you owe £5,000.

**The £100,000 is the "weight" of your trade.** It's the reason why a tiny 1-pip move—which is a microscopic change in price—actually results in a £10 change in your account.

**Your Profit and Loss is calculated ONLY on the Notional Value (£100,000).**

So when people say:

>“You are controlling £100,000”

They mean this **and only this**:

> **Your profit and loss is calculated *as if* the position were £100,000 in size.**

The "£100,000" is just a notional value. It’s the size of the bet.

The market simply tracks the change in value of that £100,000. If the value goes up 1%, the broker credits your account with £1,000. If it goes down 1%, they take £1,000 from you.

This is why the word *“control”* is misleading.

You are **not controlling money**.

You are **exposed to price movement**.

You are trading **real P/L**, calculated from a **reference size**.

It is not "fake" money; it is **Market Exposure.**

Think of it this way (very literally):

- The market moves in price units
- Your account moves in money units
- The notional value is the **exchange rate between the two**

```
Notional value = Margin × Leverage
```

**Example:**

1. You buy 1.00 Lot (Notional Value: **£100,000**).
2. The price of the Pound goes up by **1%**.
3. **Calculation:** 1% of £100,000 = **£1,000 Profit.**

**Look at what that means for your "real" money:**

- You used **£3,333** to make **£1,000**.
- That is a **30% return** on your deposited money, even though the market only moved **1%**.

If notional value were meaningless:

- Pip values wouldn’t scale
- Lot size wouldn’t matter
- Risk control wouldn’t work

But in reality:

- Change lot size → P/L speed changes
- Change stop → loss amount changes
- Change leverage → margin requirement changes

## Leverage

Leverage is a rule the broker sets that answers this question: “How much of the contract’s notional value must you post as collateral?”

In other words: “How much of my own money do I need to put down to open this trade?” or more simply “How much notional exposure am I allowed per £1 of margin?”

**1:30 leverage** is the typical leverage on major FX pairs

This means:

> To control £30 of contract value, you must provide £1 of margin

Or flipped:

> You must post **~3.33%** of the contract value as margin.

Similar to to lot sizes, it is purely a multiplier.

- Leverage does not increase risk by itself.
- Leverage affects capital efficiency, not loss magnitude.
- Leverage does NOT increase your ability to trade — it increases the broker’s risk that you cannot pay.

Leverage determines:
- Maximum position size you’re allowed to open
- How much free margin you retain
- How much exposure you’re allowed to take for a given amount of your own money.
- Whether you get a **margin call / stop-out** before your stop is hit

This is how people blow accounts (and it's not because of leverage):

They:
- use big lot sizes
- lock too much margin
- leave no breathing room

Then:
- price moves a little
- losses eat their free money
- broker closes the trade early

> Leverage has absolutely nothing to do with your £1,000 risk. The 1:30 leverage does not connect Risk to Margin; it connects Margin to Notional Value.

> Leverage connects margin to notional value.
> Risk connects lot size to stop distance.

If you understand that Profit and Loss is calculated on the £100,000 Notional Value, then you realize that leverage is simply the "permission" to control a massive amount of money with a tiny amount of your own.

Leverage doesn't change how much you *profit* (that’s determined by your lot size), but it changes how much **Free Margin** you have left to survive price fluctuations.

## Margin 

Money the broker locks as a deposit while a trade is open. You don’t lose it when you open the trade. It’s just “held” so you can’t use it for other trades

“How much money is locked while the trade is open?”
“How much of my money must be locked to hold this notional exposure?”

> **The amount of your account balance the broker temporarily locks as collateral while the trade is open.**

Important:

- It is **not a cost**
- It is **not money you lose**
- It is **released when the trade is closed**
- It has **nothing to do with your stop loss**

Margin is derived only from notional value and leverage.

It is the maximum pool your losses are taken from while the trade is open.

> Risk tells you how much you lose if you’re wrong.
> Margin tells you how much pain you can survive before you’re forced out.

### Free Margin

Money still available to absorb losses / open new trades
Free Margin = Equity − Margin

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
> Lot size decides how sensitive your P/L is to price movement.
> Lot size directly determines notional value.

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

## Putting it all together: The Complete Mechanical Chain

- The **lot** = size of the engine
- The **pip** = how far the wheel turns
- The **pip value** = how fast your fuel burns

Bigger engine + same movement = more fuel burned.

Lot size sets exposure.
Exposure sets margin (through leverage).
Lot size also sets risk (through stop distance).
Risk and margin are related only indirectly, via lot size.

Notional value is a measuring stick, not a pile of money.
Margin is a deposit, not a cost.
Risk is a rule, not a mechanism.
Profit and loss are real and come from price movement × notional size.

You are not trading money.
You are trading price movement, and money is calculated from it.

To keep this crystal clear, we are going to use your **£1,000 Risk** and a **20 Pip Stop Loss**. We will follow the money through the four specific "gears" of the machine.

1. YOUR GOAL (The Risk Management)

You want to lose exactly **£1,000** if the market moves **20 pips**.

- **The Math:** £1,000 ÷ 20 pips = **£50.00 per pip.**
- *This is the "Pay Rate" you need your trade to have.*

2. THE CALCULATION (The Lot Size)

On GBP/USD, 1.00 Lot pays roughly **£8.33 per pip** (based on $10/pip divided by a 1.20 exchange rate).

- **The Math:** £50.00 (Needed) ÷ £8.33 (Standard Rate) = **6.00 Lots.**
- *This is the "Knob" you turn in MT5.*

3. THE NOTIONAL VALUE (The Market Exposure)

The market doesn't see your £1,000 risk; it only sees the weight of your 6.00 Lots.

- **The Math:** 6.00 Lots × £100,000 (Standard Contract) = **£600,000.**
- *This is the "Notional Value." It is the total value of the "asset" you are now controlling.*

4. THE LEVERAGE & MARGIN (The Broker's Permission)

The broker sees you are controlling **£600,000**. Because Vantage UK uses **1:30 leverage**, they require you to post **1/30th** of that value as a security deposit.

- **The Math:** £600,000 ÷ 30 = **£20,000.**
- *This is the "Margin." This is the money locked in your account.*

**The Relationship Table:**
| **Component** | **Value** | **The Mathematical Mechanic** |
| --- | --- | --- |
| **Risk** | **£1,000** | Your chosen "Exit Penalty." |
| **Stop Loss** | **20 Pips** | The distance to your exit. |
| **Lot Size** | **6.00 Lots** | The multiplier needed to make 20 pips = £1,000. |
| **Notional Value** | **£600,000** | The actual weight of 6.00 Lots ($6.00 \times 100k$). |
| **Leverage** | **1:30** | The "Divider" the broker uses for your deposit. |
| **Margin** | **£20,000** | The **1/30th** of the Notional Value. |


Risk management isn't exciting, but it's what separates traders who survive from those who blow up their accounts.

---

**Next:** [Trading Psychology](09-trading-psychology.md)

*You have the math and the method; the only thing left that can break this system is you.*