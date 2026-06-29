import React from 'react'
import './FichaProducao.css'

interface FichaProducaoProps {
  nomeCliente?: string
  cor?: string
  noPedido?: string
  hora?: string
  entrada?: string
  retorno?: string
  conf?: string
  numero?: string | number
  especificacoes?: string
  materiais?: string[]
  descricao?: string
}

const FichaProducao: React.FC<FichaProducaoProps> = ({
  nomeCliente   = 'NOME CLIENTE',
  cor           = 'COR',
  noPedido      = '',
  hora          = '',
  entrada       = '',
  retorno       = '',
  conf          = '',
  numero        = '11',
  especificacoes = '',
  materiais     = ['ELASTICO PA 13MM : 2M  OP 001', 'RENDA PA 60MM : 1,5M OP 002'],
  descricao     = 'DESCRIÇÃO',
}) => (
  <div className="fp">

    {/* ── NOME CLIENTE  x=0,y=0,w=673,h=379 ── */}
    <div className="fp-nome">
      <span>{nomeCliente}</span>
    </div>

    {/* ── divisor vertical interno x=350, y=0..379 ── */}
    <div className="fp-vline350" />

    {/* ── COR  x=0,y=158,w=350,h=221 (termina em y=379) ── */}
    <div className="fp-cor">
      <span>{cor}</span>
    </div>

    {/* ── MATERIAIS  x=0,y=379,w=673,h=176 ── */}
    <div className="fp-mat">
      {materiais.map((m, i) => <p key={i}>{m}</p>)}
    </div>

    {/* ── TABELA DIREITA  x=673,y=0,w=308,h=158 ── */}
    {/* labels col x=673 w=140 | valores col x=813 w=165 */}
    <div className="fp-tl fp-r1"><span style={{fontSize:'22px'}}>Nº PEDIDO</span></div>
    <div className="fp-tv fp-r1"><span>{noPedido}</span></div>

    <div className="fp-tl fp-r2"><span style={{fontSize:'33px'}}>HORA</span></div>
    <div className="fp-tv fp-r2"><span>{hora}</span></div>

    <div className="fp-tl fp-r3"><span style={{fontSize:'30px'}}>ENTRADA</span></div>
    <div className="fp-tv fp-r3"><span>{entrada}</span></div>

    <div className="fp-tl fp-r4"><span style={{fontSize:'30px'}}>RETORNO</span></div>
    <div className="fp-tv fp-r4"><span>{retorno}</span></div>

    <div className="fp-tl fp-r5"><span style={{fontSize:'30px'}}>CONF.</span></div>
    <div className="fp-tv fp-r5"><span>{conf}</span></div>

    {/* ── NÚMERO GRANDE  x=673,y=158,w=305,h=170 ── */}
    <div className="fp-numero">
      <span>{numero}</span>
    </div>

    {/* ── ESPECIFICAÇÕES  x=673,y=328,w=305,h=227 ── */}
    <div className="fp-especif">
      {especificacoes && <span>{especificacoes}</span>}
    </div>

    {/* ── CAIXINHAS SOLIDEZ  x=350,y=555..631 ── */}
    <div className="fp-box fp-bs1" />
    <div className="fp-box fp-bs2" />
    <div className="fp-box fp-bs3" />
    <span className="fp-solidez-label">SOLIDEZ</span>

    {/* ── CAIXINHAS APROVAÇÃO  x=350,y=632..707 ── */}
    <div className="fp-box fp-ba1" />
    <div className="fp-box fp-ba2" />
    <div className="fp-box fp-ba3" />
    <span className="fp-aprov-label">APROVAÇÃO</span>

    {/* ── LINHA HORIZONTAL y=631, x=0..401 ── */}
    {/* gerada pelo ::before do fp-descricao */}

    {/* ── DESCRIÇÃO  x=0,y=555,w=350,h=152 ── */}
    <div className="fp-descricao">
      <span>{descricao}</span>
    </div>

    {/* ── BORDA DIREITA dos labels x=673,y=555..711 ── */}
    <div className="fp-borda-dir" />

  </div>
)

export default FichaProducao
