import {useEffect, type ReactNode} from 'react';
import Content from '@theme-original/NotFound/Content';
import type ContentType from '@theme/NotFound/Content';
import type {WrapperProps} from '@docusaurus/types';
import {reportNotFound} from '../../../analytics';
import {BASE_URL} from '../../../analytics/context';
import {analyticsPagePath} from '../../../utils/analytics/routes';

type Props = WrapperProps<typeof ContentType>;

/** Marks the page as a missing one for analytics and reports it, so broken inbound links show up. */
export default function ContentWrapper(props: Props): ReactNode {
  useEffect(() => {
    reportNotFound(analyticsPagePath(window.location.pathname, BASE_URL));
  }, []);
  return (
    <>
      <span hidden data-analytics-not-found="" />
      <Content {...props} />
    </>
  );
}
