export default function middleware(req: Request) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return new Response('Autenticação necessária', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Acesso Restrito"',
      },
    });
  }

  try {
    const auth    = authHeader.split(' ')[1];
    const decoded = atob(auth).split(':');
    const user    = decoded[0];
    const pwd     = decoded[1];

    const ADMIN_USER = process.env.AUTH_USER || 'daxgo';
    const ADMIN_PASS = process.env.AUTH_PASS || 'syDPFPPRCT6x';

    if (user === ADMIN_USER && pwd === ADMIN_PASS) {
      return;
    }
  } catch (error) {
    console.error('Erro na decodificação auth:', error);
  }

  return new Response('Credenciais Inválidas', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Acesso Restrito"',
    },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|assets|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|css|js|woff|woff2|ttf|otf)$).*)',
  ],
};