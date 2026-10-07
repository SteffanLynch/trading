import type {ReactNode} from 'react';
import Footer from '@theme-original/DocItem/Footer';
import type FooterType from '@theme/DocItem/Footer';
import type {WrapperProps} from '@docusaurus/types';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import LessonExtras from '../../../components/monetisation/LessonExtras';

type Props = WrapperProps<typeof FooterType>;

/** Adds further learning, books, partners and the ad slot beneath every lesson. */
export default function FooterWrapper(props: Props): ReactNode {
  const {metadata} = useDoc();
  return (
    <>
      <LessonExtras permalink={metadata.permalink} />
      <Footer {...props} />
    </>
  );
}
