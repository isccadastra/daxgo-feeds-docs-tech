// @ts-ignore
// @ts-nocheck
import { NextRequest, NextResponse } from '@vercel/edge';

export function middleware(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  // 1. Verifica se o header de autorização existe
  if (!authHeader) {
    return new NextResponse('Autenticação necessária', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Acesso Restrito"',
      },
    });
  }

  try {
    // 2. Decodifica as credenciais (Basic Auth)
    const auth = authHeader.split(' ')[1];
    const decoded = atob(auth).split(':');
    const user = decoded[0];
    const pwd = decoded[1];

    // 3. Validação (Recomendado usar process.env para segurança)
    const ADMIN_USER = process.env.AUTH_USER || 'admin';
    const ADMIN_PASS = process.env.AUTH_PASS || 'admin';

    if (user === ADMIN_USER && pwd === ADMIN_PASS) {
      return NextResponse.next();
    }
  } catch (error) {
    console.error('Erro na decodificação auth:', error);
  }

  // 4. Retorno caso as credenciais estejam incorretas
  return new NextResponse('Credenciais Inválidas', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Acesso Restrito"',
    },
  });
}

// O Matcher garante que o Docusaurus não bloqueie assets vitais
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};