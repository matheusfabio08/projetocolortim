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
  nomeCliente = 'NOME CLIENTE',
  cor         = 'COR',
  noPedido    = '',
  hora        = '',
  entrada     = '',
  retorno     = '',
  conf        = '',
  numero      = '11',
  especificacoes = '',
  materiais   = ['ELASTICO PA 13MM:2M OP- 01', 'RENDA PA 60MM: 1,5M OP - 02'],
  descricao   = '',
}) => (
  <div className="fp">

    {/* ── COLUNA ESQUERDA SUPERIOR: NOME CLIENTE (x=0,y=0,w=673,h=379) */}
    {/* border-right em x=673 e border-bottom em y=379 — SEM linha interna */}
    <div className="fp__nome">
      <span>{nomeCliente}</span>
    </div>

    {/* Linha vertical x=350 de y=0 até y=379 — divide NOME/COR da área branca */}
    <div className="fp__v350" />

    {/* COR: centralizado na sub-área x=0..350, y=158..328 */}
    <div className="fp__cor">
      <span>{cor}</span>
    </div>

    {/* ── MATERIAIS: x=0, y=379, w=673, h=176 */}
    <div className="fp__materiais">
      {materiais.map((m, i) => <p key={i}>{m}</p>)}
    </div>

    {/* ── RODAPÉ ESQUERDO: DESCRIÇÃO x=0,y=555,w=350,h=156 */}
    <div className="fp__descricao">
      <span>{descricao || 'DESCRIÇÃO'}</span>
    </div>

    {/* ── RODAPÉ DIREITO: borda direita da área de labels */}
    <div className="fp__labels-borda" />

    {/* SOLIDEZ — 3 caixinhas (x=350, w=48) */}
    <div className="fp__box fp__bs1" />
    <div className="fp__box fp__bs2" />
    <div className="fp__box fp__bs3" />
    <span className="fp__label-solidez">SOLIDEZ</span>

    {/* APROVAÇÃO — 2 caixinhas */}
    <div className="fp__box fp__ba1" />
    <div className="fp__box fp__ba2" />
    <span className="fp__label-aprov">APROVAÇÃO</span>

    {/* ── COLUNA DIREITA: TABELA INFO (x=673..978) */}
    {/* Nº PEDIDO — y=0, h=40 */}
    <div className="fp__tl fp__r1"><span className="fp__lbl">Nº PEDIDO</span></div>
    <div className="fp__tv fp__r1"><span className="fp__val">{noPedido}</span></div>

    {/* HORA — y=40, h=32 */}
    <div className="fp__tl fp__r2"><span className="fp__lbl">HORA</span></div>
    <div className="fp__tv fp__r2"><span className="fp__val">{hora}</span></div>

    {/* ENTRADA — y=72, h=28 */}
    <div className="fp__tl fp__r3"><span className="fp__lbl">ENTRADA</span></div>
    <div className="fp__tv fp__r3"><span className="fp__val">{entrada}</span></div>

    {/* RETORNO — y=100, h=27 */}
    <div className="fp__tl fp__r4"><span className="fp__lbl">RETORNO</span></div>
    <div className="fp__tv fp__r4"><span className="fp__val">{retorno}</span></div>

    {/* CONF. — y=127, h=31 */}
    <div className="fp__tl fp__r5"><span className="fp__lbl">CONF.</span></div>
    <div className="fp__tv fp__r5"><span className="fp__val">{conf}</span></div>

    {/* NÚMERO GRANDE — x=673, y=158, w=305, h=170 */}
    <div className="fp__numero">
      <span>{numero}</span>
    </div>

    {/* ESPECIFICAÇÕES — x=673, y=328, w=305, h=227 */}
    <div className="fp__especificacoes">
      <span>{especificacoes || 'ESPECIFICAÇÕES'}</span>
    </div>

    {/* ÁREA VAZIA DIREITA — x=673, y=555, w=305, h=156 */}
    <div className="fp__vazio-d" />

  </div>
)

export default FichaProducao
