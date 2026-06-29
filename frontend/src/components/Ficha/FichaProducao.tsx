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
}

const FichaProducao: React.FC<FichaProducaoProps> = ({
  nomeCliente   = 'NOME',
  cor           = 'COR',
  noPedido      = '',
  hora          = '',
  entrada       = '',
  retorno       = '',
  conf          = '',
  numero        = '06',
  especificacoes = 'ESPECIFICAÇÕES',
  materiais     = [],
}) => (
  <div className="fp">

    {/* NOME  x=0,y=0,w=673,h=158 */}
    <div className="fp-cell fp-nome">
      <span>{nomeCliente}</span>
    </div>

    {/* COR  x=0,y=158,w=350,h=221 */}
    <div className="fp-cell fp-cor">
      <span>{cor}</span>
    </div>

    {/* BRANCO  x=350,y=158,w=323,h=221 */}
    <div className="fp-cell fp-branco" />

    {/* MATERIAIS  x=0,y=379,w=673,h=176 */}
    <div className="fp-cell fp-mat">
      {materiais.map((m, i) => <p key={i}>{m}</p>)}
    </div>

    {/* DESCRIÇÃO  x=0,y=555,w=350,h=152 */}
    <div className="fp-cell fp-descricao">
      <span>DESCRIÇÃO</span>
    </div>

    {/*
      CAIXINHAS  x=350,y=555,w=323,h=152
      Layout da referência (05C9D2AB):
        [□] SOLIDEZ      ← 3 caixas, label na 1ª
        [□]
        [□]
        [□] APROVAÇÃO   ← 3 caixas, label na 4ª (contínuo)
        [□]
        [□]
    */}
    <div className="fp-cell fp-caixinhas">
      {/* Coluna esquerda: 6 caixas empilhadas (3+3) */}
      <div className="fp-boxes-col">
        <div className="fp-box" />
        <div className="fp-box" />
        <div className="fp-box fp-box-gap" />
        <div className="fp-box" />
        <div className="fp-box" />
        <div className="fp-box" />
      </div>
      {/* Coluna direita: labels alinhados com 1ª e 4ª caixa */}
      <div className="fp-labels-col">
        <span className="fp-solidez-lbl">SOLIDEZ</span>
        <span className="fp-aprov-lbl">APROVAÇÃO</span>
      </div>
    </div>

    {/* TABELA  x=673,y=0,w=308,h=158 */}
    <div className="fp-tabela">
      <div className="fp-tr">
        <div className="fp-tl">Nº PEDIDO</div>
        <div className="fp-tv">{noPedido}</div>
      </div>
      <div className="fp-tr">
        <div className="fp-tl">HORA</div>
        <div className="fp-tv">{hora}</div>
      </div>
      <div className="fp-tr">
        <div className="fp-tl">ENTRADA</div>
        <div className="fp-tv">{entrada}</div>
      </div>
      <div className="fp-tr">
        <div className="fp-tl">RETORNO</div>
        <div className="fp-tv">{retorno}</div>
      </div>
      <div className="fp-tr fp-tr-last">
        <div className="fp-tl">CONF.</div>
        <div className="fp-tv">{conf}</div>
      </div>
    </div>

    {/* NÚMERO GRANDE  x=673,y=158,w=308,h=170 */}
    <div className="fp-cell fp-numero">
      <span>{numero}</span>
    </div>

    {/* ESPECIFICAÇÕES  x=673,y=328,w=308,h=379 */}
    <div className="fp-cell fp-especif">
      <span>{especificacoes}</span>
    </div>

  </div>
)

export default FichaProducao
