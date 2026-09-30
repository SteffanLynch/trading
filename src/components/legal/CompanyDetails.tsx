import {LEGAL_COMPANY_NUMBER, LEGAL_CONTACT_EMAIL, LEGAL_ENTITY_NAME, LEGAL_JURISDICTION, LEGAL_REGISTERED_OFFICE, SITE_NAME} from '../../data/legal';
import styles from './legal.module.css';

/** The company behind the site, as it must appear under UK trading-disclosure rules. */
export default function CompanyDetails() {
  return (
    <dl className={styles.company}>
      <div>
        <dt>Trading name</dt>
        <dd>{SITE_NAME}</dd>
      </div>
      <div>
        <dt>Operated by</dt>
        <dd>{LEGAL_ENTITY_NAME}</dd>
      </div>
      <div>
        <dt>Registered in</dt>
        <dd>{LEGAL_JURISDICTION}</dd>
      </div>
      <div>
        <dt>Company number</dt>
        <dd>{LEGAL_COMPANY_NUMBER}</dd>
      </div>
      <div>
        <dt>Registered office</dt>
        <dd>{LEGAL_REGISTERED_OFFICE}</dd>
      </div>
      {LEGAL_CONTACT_EMAIL && (
        <div>
          <dt>Email</dt>
          <dd>
            <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>
          </dd>
        </div>
      )}
    </dl>
  );
}
