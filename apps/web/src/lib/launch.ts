import type { Connection } from '@/lib/types';

function buildRdpFile(connection: Connection): string {
  const lines = [
    `full address:s:${connection.host}${connection.port ? `:${connection.port}` : ''}`,
  ];
  if (connection.username) lines.push(`username:s:${connection.username}`);
  if (connection.domain) lines.push(`domain:s:${connection.domain}`);
  return lines.join('\n');
}

export function launchConnection(connection: Connection): void {
  switch (connection.type) {
    case 'ANYDESK': {
      window.location.href = `anydesk://${connection.host}`;
      return;
    }
    case 'RUSTDESK': {
      const params = connection.username
        ? `?username=${encodeURIComponent(connection.username)}`
        : '';
      window.location.href = `rustdesk://${connection.host}${params}`;
      return;
    }
    case 'RDP': {
      const blob = new Blob([buildRdpFile(connection)], {
        type: 'application/rdp',
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${connection.label}.rdp`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return;
    }
  }
}
