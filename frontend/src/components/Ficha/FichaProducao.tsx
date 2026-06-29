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
  materiais     = ['ELASTICO PA 13MM:2M OP- 01', 'RENDA PA 60MM: 1,5M OP - 02'],
  descricao     = 'DESCRIÇÃO',
}) => (
  <div className="fp">

    {/* ── ÁREA ESQUERDA SUPERIOR x=0,y=0,w=673,h=379 ── */}
    <div className="fp__area-topo">

      {/* Linha vertical interna x=350, y=0..379 */}
      <div className="fp__v350" />

      {/* NOME CLIENTE: top-left, pad-left 18, pad-top 34 */}
      <div className="fp__nome">
        <span>{nomeCliente}</span>
      </div>

      {/* COR: centralizado em x=0..350, y=158..379 */}
      <div className="fp__cor">
        <span>{cor}</span>
      </div>

    </div>

    {/* ── MATERIAIS x=0,y=379,w=673,h=176 ── */}
    <div className="fp__materiais">
      {materiais.map((m, i) => <p key={i}>{m}</p>)}
    </div>

    {/* ── RODAPÉ ESQUERDO x=0,y=555,w=350,h=156 ── */}
    <div className="fp__rodape-esq">
      {/* linha interna y=631 (x=0..400) — renderizada pela borda das caixinhas */}
      <div className="fp__descricao-label">
        <span>{descricao}</span>
      </div>
    </div>

    {/* ── CAIXINHAS SOLIDEZ x=350,w=48 ── */}
    <div className="fp__box fp__bs1" />
    <div className="fp__box fp__bs2" />
    <div className="fp__box fp__bs3" />
    <span className="fp__label-solidez">SOLIDEZ</span>

    {/* ── CAIXINHAS APROVAÇÃO x=350,w=48 ── */}
    <div className="fp__box fp__ba1" />
    <div className="fp__box fp__ba2" />
    <span className="fp__label-aprov">APROVAÇÃO</span>

    {/* ── BORDA DIREITA DA ÁREA DE LABELS x=673,y=555,h=156 ── */}
    <div className="fp__labels-borda" />

    {/* ── TABELA DIREITA x=673..978, y=0..158 ── */}
    <div className="fp__tl fp__r1"><span className="fp__lbl fp__lbl--sm">Nº PEDIDO</span></div>
    <div className="fp__tv fp__r1"><span className="fp__val">{noPedido}</span></div>

    <div className="fp__tl fp__r2"><span className="fp__lbl">HORA</span></div>
    <div className="fp__tv fp__r2"><span className="fp__val">{hora}</span></div>

    <div className="fp__tl fp__r3"><span className="fp__lbl">ENTRADA</span></div>
    <div className="fp__tv fp__r3"><span className="fp__val">{entrada}</span></div>

    <div className="fp__tl fp__r4"><span className="fp__lbl">RETORNO</span></div>
    <div className="fp__tv fp__r4"><span className="fp__val">{retorno}</span></div>

    <div className="fp__tl fp__r5"><span className="fp__lbl">CONF.</span></div>
    <div className="fp__tv fp__r5"><span className="fp__val">{conf}</span></div>

    {/* ── NÚMERO GRANDE x=673,y=158,w=305,h=170 ── */}
    <div className="fp__numero">
      <span>{numero}</span>
    </div>

    {/* ── ESPECIFICAÇÕES x=673,y=328,w=305,h=227 ── */}
    <div className="fp__especificacoes">
      <span>{especificacoes || 'ESPECIFICAÇÕES'}</span>
    </div>

  </div>
)

export default FichaProducao
