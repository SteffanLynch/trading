import type {ReactNode} from 'react';
import ToolPage, {toolPageStyles} from '../../components/calculators/ToolPage';
import TradingSessionClock from '../../components/calculators/TradingSessionClock';
import {SESSIONS, sessionUtcHours} from '../../utils/calculators/sessions';

// Fixed reference dates keep the prerendered table deterministic: one in northern winter, one in summer.
const WINTER = '2026-01-15';
const SUMMER = '2026-07-15';

export default function Page(): ReactNode {
  return (
    <ToolPage
      slug="trading-session-clock"
      lead="Which forex sessions are open right now? See Sydney, Tokyo, London and New York on a live 24-hour timeline in your own time zone, with overlaps highlighted and daylight saving handled for you."
      meaning={
        <>
          <p>
            The forex market runs around the clock on weekdays, passing from one financial centre to the next. Each “session” is when a major centre’s banks and traders are at their desks. Activity and liquidity tend to rise when
            sessions <strong>overlap</strong>, especially London with New York, and to be quieter when only one is open.
          </p>
          <p>
            Session hours are conventions rather than official exchange hours, so treat the clock as a guide to when the market is typically busy. The market closes for the weekend on Friday at 17:00 New York time and reopens on Sunday
            at 17:00.
          </p>
        </>
      }
      formula={['Each session opens and closes at local business hours in its city', 'Local hours are converted to your time zone using the IANA time-zone database', 'Daylight-saving changes in each country are applied automatically']}
      example={
        <p>
          In winter, London (08:00–17:00 GMT) and New York (08:00–17:00 EST, which is 13:00–22:00 GMT) overlap from 13:00 to 17:00 GMT. In the weeks when the US has moved its clocks but the UK has not (mid-March and late October to early
          November), that overlap is an hour longer, because New York opens at 12:00 GMT.
        </p>
      }
      extra={
        <>
          <h2>Session hours in UTC</h2>
          <p>The same hours expressed in UTC, in winter and in summer. They shift because each country changes its clocks on different dates.</p>
          <table className={toolPageStyles.dataTable}>
            <thead>
              <tr>
                <th scope="col">Session</th>
                <th scope="col">Local hours</th>
                <th scope="col">UTC (northern winter)</th>
                <th scope="col">UTC (northern summer)</th>
              </tr>
            </thead>
            <tbody>
              {SESSIONS.map((session) => {
                const winter = sessionUtcHours(session, WINTER);
                const summer = sessionUtcHours(session, SUMMER);
                return (
                  <tr key={session.id}>
                    <td>{session.name}</td>
                    <td>
                      {String(session.open).padStart(2, '0')}:00–{String(session.close).padStart(2, '0')}:00
                    </td>
                    <td>
                      {winter.open}–{winter.close}
                    </td>
                    <td>
                      {summer.open}–{summer.close}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      }
      faqs={[
        {q: 'What are the forex trading sessions?', a: 'The four main sessions are Sydney, Tokyo, London and New York. Together they keep the market open 24 hours a day from Sunday evening to Friday evening New York time.'},
        {q: 'What is the best time to trade forex?', a: 'There is no single best time. Many traders favour the London and New York overlap for its higher liquidity and tighter spreads, while others prefer the quieter Asian session for ranging conditions. It depends on your pair and your strategy.'},
        {q: 'Does the clock handle daylight saving?', a: 'Yes. Each session is defined by its city’s local hours and converted using the time-zone database, so it changes automatically when the US, UK or Australia move their clocks.'},
        {q: 'Why are all sessions closed at the weekend?', a: 'The retail forex market closes on Friday at 17:00 New York time and reopens on Sunday at 17:00. Sunday’s reopening is when Sydney’s session effectively begins the week.'},
      ]}
      learn={[
        {label: 'Timeframes', to: '/library/fundamentals/timeframes'},
        {label: 'Market fundamentals', to: '/library/fundamentals/market-fundamentals'},
        {label: 'Trading rules', to: '/library/strategy/rules'},
      ]}>
      <TradingSessionClock />
    </ToolPage>
  );
}
