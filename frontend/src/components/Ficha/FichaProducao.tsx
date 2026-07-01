import React from 'react'
import './FichaProducao.css'

const F  = "Cambria, 'Book Antiqua', Georgia, serif"
const B  = '1px solid #000'
const B2 = '2px solid #000'

// === DIMENSOES TOTAIS (meia folha A4 paisagem) ===
const W_TOTAL = 955
const H_TOTAL = 540

// === COLUNAS ===
// Original: ESQ ocupa ~37%, CEN ~35%, DIR ~28%
const W_ESQ = 360
const W_CEN = 310
const W_DIR = W_TOTAL - W_ESQ - W_CEN  // 285

// Sub-colunas DIR (label ~52% | valor ~48%)
const W_LBL = Math.round(W_DIR * 0.52)  // ~148

// === ALTURAS COL ESQ ===
const H_ESQ_MAIN   = 435  // celula principal
const H_ESQ_FOOTER = H_TOTAL - H_ESQ_MAIN  // 105 rodape Descricao
const HALF = Math.floor(H_ESQ_MAIN / 2)  // 217 cada metade

// === ALTURAS COL CENTRO ===
// Linha SOLIDEZ deve aparecer acima do footer da ESQ
const H_CEN_VAZIO   = 395
const H_CEN_SOLIDEZ = 72
const H_CEN_APROV   = H_TOTAL - H_CEN_VAZIO - H_CEN_SOLIDEZ  // 73

// === ALTURAS COL DIREITA ===
// Tabela superior: celulas menores
const H_DIR_PEDIDO    = 24
const H_DIR_HORA      = 22
const H_DIR_ENTRADA   = 22
const H_DIR_RETORNO   = 22
const H_DIR_CONF      = 24
const H_DIR_TABELA    = H_DIR_PEDIDO + H_DIR_HORA + H_DIR_ENTRADA + H_DIR_RETORNO + H_DIR_CONF  // 114
// Numero grande: ocupa bloco generoso
const H_DIR_NUMERO    = 210
// AMIDO: fino, logo abaixo do numero
const H_DIR_AMIDO_LBL = 20
const H_DIR_AMIDO_OPT = 26
const H_DIR_VAZIO     = H_TOTAL - H_DIR_TABELA - H_DIR_NUMERO - H_DIR_AMIDO_LBL - H_DIR_AMIDO_OPT  // 170

interface FichaProducaoProps {
  nomeCliente?: string
  cor?: string
  noPedido?: string
  hora?: string
  entrada?: string
  retorno?: string
  numero?: string | number
  materiais?: string[]
}

const FichaProducao: React.FC<FichaProducaoProps> = ({
  nomeCliente = '',
  cor         = '',
  noPedido    = '',
  hora        = '',
  entrada     = '',
  retorno     = '',
  numero      = '',
  materiais   = [],
}) => {
  return (
    <div style={{
      display: 'flex',
      width: W_TOTAL,
      height: H_TOTAL,
      border: B2,
      background: '#fff',
      fontFamily: F,
      boxSizing: 'border-box',
      overflow: 'hidden',
      flexShrink: 0,
    }}>

      {/* ================================================
           COL ESQUERDA
          ================================================ */}
      <div style={{
        width: W_ESQ,
        height: H_TOTAL,
        flexShrink: 0,
        borderRight: B,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Celula principal */}
        <div style={{
          height: H_ESQ_MAIN,
          flexShrink: 0,
          borderBottom: B,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        }}>

          {/* METADE SUPERIOR: CLIENTE centralizado */}
          <div style={{
            height: HALF,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 10,
            paddingRight: 6,
          }}>
            <span style={{
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.1,
              fontFamily: F,
            }}>
              {nomeCliente}
            </span>
          </div>

          {/* METADE INFERIOR: COR no centro-superior + materiais no fundo */}
          <div style={{
            height: HALF,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            paddingLeft: 10,
            paddingRight: 6,
          }}>

            {/* COR: centro da zona superior (45% da metade) */}
            <div style={{
              height: Math.floor(HALF * 0.46),
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
            }}>
              <span style={{
                fontSize: 52,
                fontWeight: 700,
                lineHeight: 1.1,
                fontFamily: F,
              }}>
                {cor}
              </span>
            </div>

            {/* MATERIAIS: afastados da cor, colados ao fundo */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              paddingBottom: 10,
            }}>
              {materiais.map((m, i) => (
                <p key={i} style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 400,
                  lineHeight: 1.7,
                  whiteSpace: 'nowrap',
                  fontFamily: F,
                }}>{m}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Rodape Descricao — sem linha, apenas texto centralizado */}
        <div style={{
          height: H_ESQ_FOOTER,
          flexShrink: 0,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, fontFamily: F }}>Descrição</span>
        </div>
      </div>

      {/* ================================================
           COL CENTRO
          ================================================ */}
      <div style={{
        width: W_CEN,
        height: H_TOTAL,
        flexShrink: 0,
        borderRight: B,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Area vazia (desenho) */}
        <div style={{ height: H_CEN_VAZIO, flexShrink: 0, borderBottom: B }} />

        {/* SOLIDEZ */}
        <div style={{
          height: H_CEN_SOLIDEZ,
          flexShrink: 0,
          borderBottom: B,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 8,
          gap: 8,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ width: 13, height: 13, border: B }} />
            ))}
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, fontFamily: F, letterSpacing: '0.05em' }}>SOLIDEZ</span>
        </div>

        {/* APROVACAO */}
        <div style={{
          height: H_CEN_APROV,
          flexShrink: 0,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 8,
          gap: 8,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 }}>
            {[0,1].map(i => (
              <div key={i} style={{ width: 13, height: 13, border: B }} />
            ))}
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, fontFamily: F, letterSpacing: '0.05em' }}>APROVAÇÃO</span>
        </div>
      </div>

      {/* ================================================
           COL DIREITA
          ================================================ */}
      <div style={{
        width: W_DIR,
        flexShrink: 0,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Nº PEDIDO */}
        <div style={{ height: H_DIR_PEDIDO, flexShrink: 0, borderBottom: B, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, fontFamily: F }}>Nº PEDIDO</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, fontFamily: F }}>{noPedido}</div>
        </div>

        {/* HORA */}
        <div style={{ height: H_DIR_HORA, flexShrink: 0, borderBottom: B, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, fontFamily: F }}>HORA</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, fontFamily: F }}>{hora}</div>
        </div>

        {/* ENTRADA */}
        <div style={{ height: H_DIR_ENTRADA, flexShrink: 0, borderBottom: B, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, fontFamily: F }}>ENTRADA</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, fontFamily: F }}>{entrada}</div>
        </div>

        {/* RETORNO */}
        <div style={{ height: H_DIR_RETORNO, flexShrink: 0, borderBottom: B, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, fontFamily: F }}>RETORNO</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, fontFamily: F }}>{retorno}</div>
        </div>

        {/* CONF / NOME */}
        <div style={{ height: H_DIR_CONF, flexShrink: 0, borderBottom: B2, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, fontFamily: F }}>CONF.</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, fontFamily: F }}>NOME</div>
        </div>

        {/* NUMERO GRANDE */}
        <div style={{ height: H_DIR_NUMERO, flexShrink: 0, borderBottom: B2, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <span style={{ fontSize: 150, fontWeight: 700, lineHeight: 1, fontFamily: F }}>{numero}</span>
        </div>

        {/* AMIDO label */}
        <div style={{ height: H_DIR_AMIDO_LBL, flexShrink: 0, borderBottom: B, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', fontFamily: F }}>AMIDO</span>
        </div>

        {/* SIM / NAO */}
        <div style={{ height: H_DIR_AMIDO_OPT, flexShrink: 0, borderBottom: B, display: 'flex' }}>
          <div style={{ flex: 1, borderRight: B, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <div style={{ width: 12, height: 12, border: B, flexShrink: 0 }} />
            <span style={{ fontSize: 9, fontWeight: 700, fontFamily: F }}>SIM</span>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <div style={{ width: 12, height: 12, border: B, flexShrink: 0 }} />
            <span style={{ fontSize: 9, fontWeight: 700, fontFamily: F }}>NÃO</span>
          </div>
        </div>

        {/* VAZIO */}
        <div style={{ height: H_DIR_VAZIO, flexShrink: 0 }} />

      </div>
    </div>
  )
}

export default FichaProducao
