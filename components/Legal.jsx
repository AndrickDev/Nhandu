const CNPJ = process.env.NEXT_PUBLIC_CNPJ || '[CNPJ em registro]';
const EMAIL = process.env.NEXT_PUBLIC_CONTATO_EMAIL || 'contato@nhandu.com.br';

export const legalInfo = { CNPJ, EMAIL };

export default function Legal({ title, updated, children }) {
  return (
    <div className="nh legal">
      <header className="hdr">
        <div className="wrap hdr-in">
          <a className="brand" href="/" aria-label="Nhandu, voltar ao início">
            <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
              {[[32, 16], [16, 32], [32, 32], [48, 32], [32, 48]].map(([x, y]) => <circle key={x + '-' + y} cx={x} cy={y} r="3.2" fill="currentColor" opacity=".28" />)}
              <path d="M16 48V16L48 48V16" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="48" cy="16" r="6.5" fill="#C8431E" />
            </svg>
            Nhandu
          </a>
          <a className="btn btn-line" href="/">Voltar ao site</a>
        </div>
      </header>
      <main className="wrap legal-in">
        <h1 className="h2">{title}</h1>
        <p className="upd">Última atualização: {updated}</p>
        {children}
      </main>
    </div>
  );
}
