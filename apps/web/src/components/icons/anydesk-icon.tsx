import type { SVGProps } from 'react';
import anydeskSvgRaw from '../../../public/anydesk.svg?raw';

const ANYDESK_SVG_INNER = anydeskSvgRaw
  .replace(/^<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '');

interface AnyDeskIconProps
  extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number | string;
}

export function AnyDeskIcon({ size = '1em', ...props }: AnyDeskIconProps) {
  return (
    <svg
      viewBox="0 0 700 700"
      width={size}
      height={size}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: static, locally-owned SVG asset
      dangerouslySetInnerHTML={{ __html: ANYDESK_SVG_INNER }}
    />
  );
}
