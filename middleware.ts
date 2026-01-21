export default function middleware(req: Request) {
  const authHeader = req.headers.get('authorization');

  // 1. Verifica se o header de autorização existe
  if (!authHeader) {
    return new Response('Autenticação necessária', {
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
      // Continua com a requisição (não retorna nada para passar adiante)
      return;
    }
  } catch (error) {
    console.error('Erro na decodificação auth:', error);
  }

  // 4. Retorno caso as credenciais estejam incorretas
  return new Response('Credenciais Inválidas', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Acesso Restrito"',
    },
  });
}

// O Matcher protege todas as rotas exceto arquivos estáticos
export const config = {
  matcher: [
    /*
     * Match all request paths except for static files:
     * - Arquivos com extensões comuns (js, css, png, jpg, etc)
     * - favicon e robots.txt
     */
    '/((?!_next/static|_next/image|assets|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|css|js|woff|woff2|ttf|otf)$).*)',
  ],
};