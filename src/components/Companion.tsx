'use client';

import { ReflectaCompanion, CompanionExpression, CompanionProps } from './mascot/ReflectaCompanion';

export type { CompanionExpression, CompanionProps };

export function Companion(props: CompanionProps) {
  return <ReflectaCompanion {...props} />;
}

export default Companion;
