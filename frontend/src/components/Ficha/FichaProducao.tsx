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

    {/* COL ESQUERDA: x=0..673 */}
    {/* ROW 1 (y=0..158): NOME */}
    <div className="fp-cell fp-nome">
      <span>{nomeCliente}</span>
    </div>

    {/* ROW 2 (y=158..379): COR | BRANCO */}
    <div className="fp-cell fp-cor">
      <span>{cor}</span>
    </div>
    <div className="fp-cell fp-branco" />

    {/* ROW 3 (y=379..555): MATERIAIS */}
    <div className="fp-cell fp-mat">
      {materiais.map((m, i) => <p key={i}>{m}</p>)}
    </div>

    {/* ROW 4 (y=555..707): DESCRIÇÃO | CAIXINHAS */}
    <div className="fp-cell fp-descricao">
      {/* underline gerado por ::after */}
      <span>DESCRIÇÃO</span>
    </div>
    <div className="fp-cell fp-caixinhas">
      <div className="fp-solidez-col">
        <div className="fp-box" />
        <div className="fp-box" />
        <div className="fp-box" />
      </div>
      <div className="fp-labels-col">
        <span className="fp-solidez-lbl">SOLIDEZ</span>
        <span className="fp-aprov-lbl">APROVAÇÃO</span>
      </div>
    </div>

    {/* COL DIREITA: x=673..981 */}
    {/* ROW 1 (y=0..158): TABELA Nº/HORA/ENTRADA/RETORNO/CONF */}
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

    {/* ROW 2 (y=158..328): NÚMERO GRANDE */}
    <div className="fp-cell fp-numero">
      <span>{numero}</span>
    </div>

    {/* ROW 3 (y=328..555): ESPECIFICAÇÕES */}
    <div className="fp-cell fp-especif">
      <span>{especificacoes}</span>
    </div>

  </div>
)

export default FichaProducao
