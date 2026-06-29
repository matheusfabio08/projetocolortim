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
  simMarcado?: boolean
  naoMarcado?: boolean
}

const FichaProducao: React.FC<FichaProducaoProps> = ({
  nomeCliente  = 'NOME CLIENTE',
  cor          = 'COR',
  noPedido     = '',
  hora         = '',
  entrada      = '',
  retorno      = '',
  conf         = '',
  numero       = '11',
  especificacoes = '',
  materiais    = ['ELASTICO PA 13MM : 2M  OP 001', 'RENDA PA 60MM : 1,5M OP 002'],
  descricao    = 'Descrição',
  simMarcado   = false,
  naoMarcado   = false,
}) => (
  <div className="fp">

    {/* 1. ÁREA ESQUERDA SUPERIOR x=1,y=0,w=351,h=380 */}
    <div className="fp__area-esq">
      {/* divisor vertical interno x=352, y=0..380 */}
      <div className="fp__div-v" />
      {/* NOME CLIENTE */}
      <div className="fp__nome"><span>{nomeCliente}</span></div>
      {/* COR */}
      <div className="fp__cor"><span>{cor}</span></div>
    </div>

    {/* 2. MATERIAIS x=1,y=380,w=674,h=176 */}
    <div className="fp__materiais">
      {materiais.map((m, i) => <p key={i}>{m}</p>)}
    </div>

    {/* 3. TABELA DIREITA x=675,y=0,w=305,h=159 */}
    {/* label col x=675 w=139 | valor col x=814 w=166 */}
    <div className="fp__tl fp__r1"><span className="fp__lbl" style={{fontSize:'29px'}}>Nº PEDIDO</span></div>
    <div className="fp__tv fp__r1"><span className="fp__val">{noPedido}</span></div>

    <div className="fp__tl fp__r2"><span className="fp__lbl" style={{fontSize:'24px'}}>HORA</span></div>
    <div className="fp__tv fp__r2"><span className="fp__val">{hora}</span></div>

    <div className="fp__tl fp__r3"><span className="fp__lbl" style={{fontSize:'22px'}}>ENTRADA</span></div>
    <div className="fp__tv fp__r3"><span className="fp__val" style={{fontSize:'26px',paddingRight:'30px'}}>{entrada}</span></div>

    <div className="fp__tl fp__r4"><span className="fp__lbl" style={{fontSize:'22px'}}>RETORNO</span></div>
    <div className="fp__tv fp__r4"><span className="fp__val" style={{fontSize:'25px',paddingRight:'30px'}}>{retorno}</span></div>

    <div className="fp__tl fp__r5"><span className="fp__lbl" style={{fontSize:'23px'}}>CONF.</span></div>
    <div className="fp__tv fp__r5"><span className="fp__val" style={{fontSize:'22px',paddingRight:'55px'}}>{conf}</span></div>

    {/* 4. NÚMERO GRANDE x=675,y=159,w=305,h=170 */}
    <div className="fp__numero"><span>{numero}</span></div>

    {/* 5. AMIDO x=675,y=329,w=305,h=51 */}
    <div className="fp__amido"><span>AMIDO</span></div>

    {/* 6. SIM / NÃO x=675,y=380,w=305,h=50 */}
    <div className="fp__sim-nao">
      {/* checkbox SIM: x=679,y=382,w=42,h=40 */}
      <div className="fp__checkbox fp__checkbox--sim">
        {simMarcado && <span className="fp__check-mark">X</span>}
      </div>
      <span className="fp__sim-label">SIM</span>
      {/* divisor vertical x=871 */}
      <div className="fp__div-sim-nao" />
      {/* checkbox NÃO: x=830,y=382,w=41,h=40 */}
      <div className="fp__checkbox fp__checkbox--nao">
        {naoMarcado && <span className="fp__check-mark">X</span>}
      </div>
      <span className="fp__nao-label">NÃO</span>
    </div>

    {/* 7. ESPECIFICAÇÕES x=675,y=430,w=305,h=126 */}
    <div className="fp__especificacoes">
      {especificacoes && <span>{especificacoes}</span>}
    </div>

    {/* 8. CAIXINHAS SOLIDEZ x=352,y=556,w=49 */}
    <div className="fp__box fp__bs1" />
    <div className="fp__box fp__bs2" />
    <div className="fp__box fp__bs3" />
    <span className="fp__label-solidez">SOLIDEZ</span>

    {/* 9. CAIXINHAS APROVAÇÃO x=352,y=632,w=49 */}
    <div className="fp__box fp__ba1" />
    <div className="fp__box fp__ba2" />
    <div className="fp__box fp__ba3" />
    <span className="fp__label-aprov">APROVAÇÃO</span>

    {/* 10. BORDA DIREITA LABELS x=675,y=556,h=155 */}
    <div className="fp__borda-dir-labels" />

    {/* 11. DESCRIÇÃO label x=1,y=632,w=351,h=76 */}
    <div className="fp__descricao">
      <span>{descricao}</span>
    </div>

  </div>
)

export default FichaProducao
