import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import LegalPage, {type LegalSection} from '../components/legal/LegalPage';
import {LEGAL_COMPANY_NUMBER, LEGAL_CONTACT_EMAIL, LEGAL_ENTITY_NAME, LEGAL_JURISDICTION, LEGAL_REGISTERED_OFFICE, SITE_NAME} from '../data/legal';

const sections: LegalSection[] = [
  {
    id: 'operator',
    title: 'About this website and who operates it',
    body: (
      <>
        <p>
          {SITE_NAME} (the “website”) is a trading name of <strong>{LEGAL_ENTITY_NAME}</strong> (the “Company”), a company registered in {LEGAL_JURISDICTION} with company number {LEGAL_COMPANY_NUMBER}. Its registered office is {LEGAL_REGISTERED_OFFICE}.
        </p>
        <p>
          In this disclaimer, “the Company”, “we”, “us” and “our” mean {LEGAL_ENTITY_NAME}, and “user” means anyone who visits or uses the website, its lessons, calculators, simulators, tools or any other content or service it offers (together, the “Content”). By using the website, the user accepts this disclaimer. A user who does not accept it should stop using the website.
        </p>
      </>
    ),
  },
  {
    id: 'not-advice',
    title: 'Not financial advice',
    body: (
      <>
        <p>
          <strong>Nothing on this website is financial, investment, trading, tax, accounting or legal advice, and nothing on it is a personal recommendation.</strong> The Content is general information. It does not take into account the objectives, financial situation, experience or needs of any individual, and it cannot be a substitute for advice from a suitably qualified and authorised professional.
        </p>
        <p>In particular, nothing on the website:</p>
        <ul>
          <li>recommends, endorses or advises for or against buying, selling or holding any financial instrument, currency, commodity, cryptocurrency, derivative or other asset;</li>
          <li>is an offer, solicitation, invitation or inducement to engage in any investment activity, or to open an account or enter a contract with any broker, platform or provider;</li>
          <li>creates an adviser–client, fiduciary, broker–client or any other professional relationship between the Company and any user.</li>
        </ul>
        <p>Every trading and investment decision is made by the user alone, at the user's own risk, after taking independent professional advice where appropriate.</p>
      </>
    ),
  },
  {
    id: 'educational',
    title: 'Educational purposes only',
    body: (
      <>
        <p>
          The lessons, glossary, strategy notes, case studies, diagrams, calculators, simulators and every other part of the Content are provided for <strong>general education and information only</strong>. Learning how markets work, how to size a position or how an order type behaves is not the same as being able to trade profitably, and nothing here promises or implies that it will lead to profit.
        </p>
        <p>Descriptions of strategies, setups, rules and approaches explain how they are described to work. They are not claims that they will work for a particular person, in a particular market or at a particular time.</p>
      </>
    ),
  },
  {
    id: 'risk',
    title: 'Risk warning',
    body: (
      <>
        <p>
          <strong>Trading and investing carry a high level of risk and are not suitable for everyone.</strong> A user can lose some or all of the money put into a trade or an account, and with some leveraged products can lose more than the amount deposited.
        </p>
        <ul>
          <li>
            <strong>Leverage</strong> magnifies losses exactly as much as it magnifies gains. Forex, contracts for difference (CFDs), futures, options and similar products are leveraged. Regulators require providers of these products to state that a high proportion of retail client accounts lose money.
          </li>
          <li>
            <strong>Cryptocurrencies</strong> are highly volatile, are often unregulated and may be difficult or impossible to sell at a fair price.
          </li>
          <li>
            <strong>Past performance is not a reliable indicator of future results.</strong> Markets can and do behave differently from how they have behaved before.
          </li>
          <li>Only money that can be afforded to lose should ever be put at risk. Borrowed money, emergency savings and money needed for essential expenses should never be traded.</li>
          <li>Stop-loss orders and other risk controls do not guarantee that a loss will be limited: prices can gap, markets can close, and orders can fill at worse prices than expected (slippage) or not at all.</li>
          <li>Trading is intended for adults only. Anyone under 18 should not trade.</li>
        </ul>
        <p>Anyone who does not fully understand these risks should seek independent financial advice before trading.</p>
      </>
    ),
  },
  {
    id: 'hypothetical',
    title: 'Hypothetical, simulated and illustrative material',
    body: (
      <>
        <p>
          Much of the Content is hypothetical, simulated or illustrative. This includes worked examples, calculators' default figures, illustrative and schematic charts, diagrams, the practice-market simulators and any case study or example trade.
        </p>
        <ul>
          <li>
            <strong>Illustrative charts and diagrams are constructed to explain an idea. They are not real market data</strong> and do not show what any market did or will do.
          </li>
          <li>
            <strong>Case studies and example trades are selected, and explained with the benefit of hindsight.</strong> They are not representative of typical results, do not show every trade taken, and are not evidence that the same approach will produce similar outcomes.
          </li>
          <li>
            <strong>Simulated and hypothetical results have many inherent limitations.</strong> Unlike real trading, they do not involve financial risk, and no hypothetical result can fully account for the impact of real-world factors such as slippage, spreads, liquidity, costs and emotion. No representation is made that any account will or is likely to achieve profits or losses similar to any figure or result shown.
          </li>
          <li>Simulators simplify how real markets work. Real order execution, liquidity and price behaviour differ and can be materially less favourable.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'tools',
    title: 'Calculators, simulators and interactive tools',
    body: (
      <>
        <p>The calculators, visualisers, simulators and other interactive tools (the “tools”) produce estimates from the numbers a user enters. They are provided to help learning and planning, and are subject to these limitations:</p>
        <ul>
          <li>
            <strong>Results are estimates and may contain errors.</strong> Users must check every figure against their own broker or platform, and against their own records, before relying on it.
          </li>
          <li>
            <strong>Assumptions are built in.</strong> Examples include a standard contract size of 100,000 units per lot, standard pip sizes, rounding down to the smallest lot step, and exchange rates entered by the user. A broker may use different specifications, lot steps, margin rules and conventions, which will change the result.
          </li>
          <li>
            <strong>Costs are excluded unless stated.</strong> Spreads, commissions, swaps and financing, slippage, taxes, currency conversion fees and other charges are not included unless a tool asks for them.
          </li>
          <li>
            <strong>No live market data is used.</strong> Example prices are placeholders. Prices, exchange rates, swap rates, margin requirements and session times must be checked against live and official sources.
          </li>
          <li>Statistical measures such as win rate, expectancy and profit factor describe a set of past results only. They do not predict future performance, and small samples can be misleading.</li>
          <li>Levels such as Fibonacci retracements, extensions and pivot points are reference points that some traders watch. They are not predictions, signals or guarantees that price will react to them.</li>
          <li>Time-zone and market-session information is a convention and may be wrong, for example around clock changes, holidays or unusual market closures.</li>
        </ul>
        <p>The tools are provided “as is” and “as available”, without warranty of any kind.</p>
      </>
    ),
  },
  {
    id: 'accuracy',
    title: 'Accuracy, completeness and updates',
    body: (
      <>
        <p>
          The Company takes reasonable care with the Content but does not warrant that it is accurate, complete, current, reliable or free from errors or omissions. Markets, regulation, broker practices and conventions change, and Content may be out of date, simplified or wrong. Statistics, figures and general statements about markets or market behaviour are simplifications or approximations and have not necessarily been independently verified.
        </p>
        <p>The Company has no obligation to update the Content and may change, suspend or remove any of it at any time without notice.</p>
      </>
    ),
  },
  {
    id: 'liability',
    title: 'No liability',
    body: (
      <>
        <p>
          <strong>
            To the fullest extent permitted by law, the Company and its directors, officers, employees, contractors, agents, affiliates and licensors are not liable, whether in contract, tort (including negligence), breach of statutory duty or otherwise, for any loss or damage of any kind arising out of or in connection with the website or the Content.
          </strong>{' '}
          This includes:
        </p>
        <ul>
          <li>any trading, investment or financial loss, including loss of capital, profits, income, savings or opportunity;</li>
          <li>any decision made or action taken, or not taken, in reliance on the Content or on the result of any tool;</li>
          <li>any inaccuracy, error, omission or delay in the Content, including in any calculation, chart, example or simulation;</li>
          <li>loss of or damage to data, reputation, goodwill or business, and any indirect, incidental, special, consequential or punitive loss, even if it was foreseeable or the Company was told it might occur;</li>
          <li>anything arising from third-party websites, brokers, platforms, products, advertisements or affiliate partners;</li>
          <li>any interruption, unavailability, virus, security incident or technical failure affecting the website.</li>
        </ul>
        <p>
          <strong>Nothing in this disclaimer excludes or limits liability that cannot be excluded or limited under the law of {LEGAL_JURISDICTION}</strong>, including liability for death or personal injury caused by negligence, for fraud or fraudulent misrepresentation, or for any other matter for which it would be unlawful to exclude or limit liability. Nothing in it affects the statutory rights of a user who is a consumer.
        </p>
        <p>Subject to that, and to the extent that any liability of the Company to a user cannot lawfully be excluded, it is limited in total to £100 in respect of all claims arising out of or in connection with the website and the Content.</p>
      </>
    ),
  },
  {
    id: 'responsibility',
    title: 'User responsibility',
    body: (
      <>
        <p>By using the website, the user acknowledges and agrees that:</p>
        <ul>
          <li>the user is solely responsible for their own trading and investment decisions and for the consequences of them;</li>
          <li>the user will carry out their own research and due diligence, and will take independent advice from a suitably qualified and authorised adviser where appropriate;</li>
          <li>the user is responsible for checking that their use of the Content, and any trading or investment activity, is lawful and suitable where they live;</li>
          <li>the user is responsible for the accuracy of any number they enter into a tool, and for checking what a tool produces.</li>
        </ul>
        <p>To the extent permitted by law, the user is responsible for any loss or claim arising from their own misuse of the website or breach of this disclaimer.</p>
      </>
    ),
  },
  {
    id: 'third-parties',
    title: 'Third-party websites, brokers and products',
    body: (
      <>
        <p>
          The website may link to, display or mention third-party websites, brokers, trading platforms, data providers, books, courses, software, advertisers and other products and services. These are operated by others. The Company does not control them, does not endorse them unless it expressly says so, and is not responsible for their content, accuracy, availability, security, pricing or conduct, or for any loss arising from using them.
        </p>
        <p>
          Any dealings with a third party are between the user and that third party and are subject to that party's own terms and risk warnings. Before using any broker or platform, a user should confirm that it is properly authorised and regulated in their country (for example by checking the Financial Conduct Authority's public Register in the United Kingdom), read its terms, and understand its fees, risks and protections. Mention of a brand or product is for illustration or information, not a recommendation.
        </p>
      </>
    ),
  },
  {
    id: 'affiliate',
    title: 'Affiliate links and advertising',
    body: (
      <>
        <p>
          <strong>The website is free to use and is funded by affiliate commissions and advertising.</strong> Some links on the website may be affiliate links, meaning the Company may earn a commission if a user follows the link and then signs up for, or buys, a product or service. The website may also display advertisements, for which the Company is paid.
        </p>
        <p>
          This is a material connection and it may create an incentive to feature, mention or link to certain products. It does not make any product a recommendation, and it does not change the calculations or the educational content. Paid placements and affiliate links are intended to be identified as such. The full explanation is on the <Link to="/how-this-site-is-funded">how this site is funded</Link> page.
        </p>
        <p>Advertisements are created and controlled by advertisers and advertising networks. The Company does not verify every claim in them, and a user relies on any advertisement at their own risk.</p>
      </>
    ),
  },
  {
    id: 'no-offer',
    title: 'Not an offer; availability in different countries',
    body: (
      <>
        <p>
          The website is not directed at, and is not intended for distribution or use by, any person in any country or jurisdiction where doing so would be contrary to local law or regulation, or where it would subject the Company to any registration or licensing requirement. Some jurisdictions restrict or prohibit retail access to, or the promotion of, leveraged products such as forex and CFDs.
        </p>
        <p>
          The Content is not an offer to sell, or a solicitation of an offer to buy, any security, derivative or other financial product in any jurisdiction. Users are responsible for complying with the laws that apply to them, and for finding out whether any product mentioned is available and lawful where they live.
        </p>
      </>
    ),
  },
  {
    id: 'regulatory',
    title: 'Regulatory status',
    body: (
      <>
        <p>
          {LEGAL_ENTITY_NAME} is an educational publisher. It is <strong>not</strong> authorised or regulated by the Financial Conduct Authority or any other financial regulator, and it is not a broker, dealer, investment firm, investment adviser, financial planner, commodity trading adviser, commodity pool operator or exchange. It is not registered with the U.S. Securities and Exchange Commission, the Commodity Futures Trading Commission or the National Futures Association. It does not hold client money or assets, and does not execute or arrange trades.
        </p>
        <p>The protections that apply to regulated financial services, such as the Financial Services Compensation Scheme and the Financial Ombudsman Service in the United Kingdom, do not apply to the use of this website or its Content.</p>
      </>
    ),
  },
  {
    id: 'opinions',
    title: 'Opinions and forward-looking statements',
    body: (
      <>
        <p>
          Some Content expresses opinions, preferences or interpretations of how markets behave. They are general, may be wrong, and may change. Statements about what price “may”, “might”, “can” or “tends to” do describe possibilities or tendencies, not forecasts, and there is no assurance that any of them will occur. The Company has no obligation to update any opinion.
        </p>
      </>
    ),
  },
  {
    id: 'technical',
    title: 'Availability and technical matters',
    body: (
      <>
        <p>
          The Company does not guarantee that the website or any tool will be available, uninterrupted, secure or error-free, or that the website, its servers or any material downloaded from it will be free from viruses or other harmful components. Access may be suspended or withdrawn at any time, and the tools may behave differently across browsers and devices. A user is responsible for their own devices and security.
        </p>
      </>
    ),
  },
  {
    id: 'data',
    title: 'Data, cookies and what is entered into the tools',
    body: (
      <>
        <p>
          The tools work in the user's browser. Preferences such as the account currency, risk level or time zone may be remembered in the browser's own storage on the user's device. The website may also collect usage analytics, which may include the values entered into a tool, to understand and improve the website. Advertising and affiliate partners may use cookies or similar technologies. Users should avoid entering information they do not wish to be recorded, and should never enter passwords, account numbers or other sensitive personal or financial identifiers into any tool.
        </p>
        <p>Any privacy policy or cookie notice published on the website describes how personal data is handled and forms part of how the website operates alongside this disclaimer.</p>
      </>
    ),
  },
  {
    id: 'ip',
    title: 'Intellectual property',
    body: (
      <>
        <p>
          The Content, including its text, diagrams, tools, code, design and branding, is owned by or licensed to the Company and is protected by copyright and other intellectual property rights. It may be viewed and used for personal, non-commercial learning. It may not be copied, reproduced, scraped, republished, sold or used to build a competing product without the Company's written permission. Third-party names and trade marks belong to their owners and their appearance does not imply any association or endorsement.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this disclaimer',
    body: (
      <>
        <p>The Company may revise this disclaimer at any time by posting a new version on this page, with a new “last updated” date. Continued use of the website after a change means the revised disclaimer is accepted. Users should check this page from time to time.</p>
      </>
    ),
  },
  {
    id: 'law',
    title: 'Governing law, jurisdiction and severability',
    body: (
      <>
        <p>
          This disclaimer, and any dispute or claim arising out of or in connection with it or the website (including non-contractual disputes), is governed by the law of {LEGAL_JURISDICTION}. The courts of {LEGAL_JURISDICTION} have non-exclusive jurisdiction, but a user who is a consumer may also be able to bring proceedings in the courts of the part of the United Kingdom, or the country, where they live, and this disclaimer does not remove any mandatory consumer protection that applies to them.
        </p>
        <p>If any part of this disclaimer is found to be invalid or unenforceable, that part is to be read down or removed to the minimum extent necessary and the rest remains in full effect. A failure to enforce any right is not a waiver of it.</p>
      </>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <>
        <p>
          Formal notices and legal enquiries can be sent to {LEGAL_ENTITY_NAME} at its registered office: {LEGAL_REGISTERED_OFFICE}.
          {LEGAL_CONTACT_EMAIL && (
            <>
              {' '}
              Enquiries can also be sent by email to <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
            </>
          )}
        </p>
      </>
    ),
  },
];

const keyPoints: ReactNode[] = [
  <>
    <strong>Nothing here is financial advice.</strong> It is general education, not a recommendation to buy, sell or hold anything.
  </>,
  <>
    <strong>Trading carries a high risk of loss.</strong> Money can be lost quickly, and with some leveraged products more than was put in. Only risk what can be afforded to lose.
  </>,
  <>
    <strong>Examples, charts and simulations are illustrative.</strong> They are not real results and do not predict what markets will do.
  </>,
  <>
    <strong>The calculators give estimates.</strong> Always check them against a broker's own figures before acting.
  </>,
  <>
    <strong>{LEGAL_ENTITY_NAME} is not liable</strong> for losses or problems arising from use of the website, to the fullest extent the law allows.
  </>,
  <>
    <strong>The site is free and funded by affiliate commissions and advertising.</strong> <Link to="/how-this-site-is-funded">Read how it works.</Link>
  </>,
];

export default function DisclaimerPage(): ReactNode {
  return (
    <LegalPage
      path="/disclaimer"
      metaTitle="Disclaimer — Not Financial Advice, Risk Warning & Liability"
      metaDescription="Trading Notes is educational only and not financial advice. Read the full risk warning, liability limits, affiliate and advertising disclosure and company details."
      kicker="Legal"
      title="Disclaimer"
      lede="Trading Notes teaches how markets and trading work. It does not give financial advice, and trading involves real risk. This page sets out exactly what that means, including the limits of the Company's responsibility."
      keyPoints={keyPoints}
      sections={sections}
    />
  );
}
