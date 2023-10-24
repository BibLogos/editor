/// <reference types="vite/client" />

import * as React from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['annot-highlight']: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      ['annot-text']: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}