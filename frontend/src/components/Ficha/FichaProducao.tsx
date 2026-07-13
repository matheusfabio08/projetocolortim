import React from 'react'
import './FichaProducao.css'

const F  = "Cambria, 'Book Antiqua', Georgia, serif"
const B  = '1px solid #000'
const B2 = '2px solid #000'

// === DIMENSOES TOTAIS (meia folha A4 paisagem) ===
const W_TOTAL = 955
const H_TOTAL = 540

// === COLUNAS ===
const W_ESQ = 360
const W_CEN = 310
const W_DIR = W_TOTAL - W_ESQ - W_CEN  // 285

// Sub-colunas DIR (label ~52% | valor ~48%)
const W_LBL = Math.round(W_DIR * 0.52)  // ~148

// === ALTURAS COL ESQ ===
const H_ESQ_MAIN   = 435
const H_ESQ_FOOTER = H_TOTAL - H_ESQ_MAIN  // 105

// === ALTURAS COL CENTRO ===
const H_CEN_VAZIO       = 340
const H_CEN_GOMA_HEADER = 28
const H_CEN_GOMA_OPTS   = 28
const H_CEN_APROV_HDR   = 28

// === ALTURAS COL DIREITA ===
const H_DIR_PEDIDO    = 24
const H_DIR_HORA      = 22
const H_DIR_ENTRADA   = 22
const H_DIR_RETORNO   = 22
const H_DIR_CONF      = 24
const H_DIR_TABELA    = H_DIR_PEDIDO + H_DIR_HORA + H_DIR_ENTRADA + H_DIR_RETORNO + H_DIR_CONF
const H_DIR_NUMERO    = 196
const H_DIR_REPROCESSO = 26
const H_DIR_SOLIDEZ    = 26
const H_DIR_RESTO      = H_TOTAL - H_DIR_TABELA - H_DIR_NUMERO - H_DIR_REPROCESSO - H_DIR_SOLIDEZ

interface FichaProducaoProps {
  nomeCliente?: string
  cor?: string
  noPedido?: string
  hora?: string
  entrada?: string
  retorno?: string
  conf?: string
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
  conf        = '',
  numero      = '',
  materiais   = [],
}) => {

  const aprovRows = 3

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

        {/* Celula principal: empresa + cor + material centralizados */}
        <div style={{
          height: H_ESQ_MAIN,
          flexShrink: 0,
          borderBottom: B,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingLeft: 10,
          paddingRight: 6,
          gap: 0,
        }}>

          {/* NOME EMPRESA */}
          <span style={{
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1.15,
            fontFamily: F,
          }}>
            {nomeCliente}
          </span>

          {/* COR */}
          <span style={{
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1.15,
            fontFamily: F,
          }}>
            {cor}
          </span>

          {/* MATERIAIS — logo abaixo da cor */}
          <div style={{
            marginTop: 10,
            display: 'flex',
            flexDirection: 'column',
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

        {/* Rodape */}
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

        {/* Area vazia (desenho/amostra) */}
        <div style={{ height: H_CEN_VAZIO, flexShrink: 0, borderBottom: B }} />

        {/* PRESENÇA DE GOMA? — header */}
        <div style={{
          height: H_CEN_GOMA_HEADER,
          flexShrink: 0,
          borderBottom: B,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 10,
          gap: 10,
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, fontFamily: F, letterSpacing: '0.05em' }}>
            PRESENÇA DE GOMA?
          </span>
        </div>

        {/* SIM / NÃO */}
        <div style={{
          height: H_CEN_GOMA_OPTS,
          flexShrink: 0,
          borderBottom: B,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 10,
          gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: F }}>SIM</span>
            <div style={{ width: 13, height: 13, border: B, flexShrink: 0 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: F }}>NÃO</span>
            <div style={{ width: 13, height: 13, border: B, flexShrink: 0 }} />
          </div>
        </div>

        {/* APROVAÇÃO E DATA DE SAÍDA — header */}
        <div style={{
          height: H_CEN_APROV_HDR,
          flexShrink: 0,
          borderBottom: B,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, fontFamily: F, letterSpacing: '0.05em' }}>
            APROVAÇÃO E DATA DE SAÍDA
          </span>
        </div>

        {/* Sub-linhas de aprovação */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {Array.from({ length: aprovRows }).map((_, i) => (
            <div key={i} style={{
              flex: 1,
              borderBottom: i < aprovRows - 1 ? B : 'none',
              display: 'flex',
            }}>
              <div style={{ width: 60, borderRight: B, flexShrink: 0 }} />
              <div style={{ flex: 1 }} />
            </div>
          ))}
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

        {/* CONF. */}
        <div style={{ height: H_DIR_CONF, flexShrink: 0, borderBottom: B2, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, fontFamily: F }}>CONF.</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, fontFamily: F }}>{conf}</div>
        </div>

        {/* NUMERO GRANDE */}
        <div style={{ height: H_DIR_NUMERO, flexShrink: 0, borderBottom: B2, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <span style={{ fontSize: 148, fontWeight: 700, lineHeight: 1, fontFamily: F }}>{numero}</span>
        </div>

        {/* REPROCESSO */}
        <div style={{
          height: H_DIR_REPROCESSO,
          flexShrink: 0,
          borderBottom: B,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', fontFamily: F }}>REPROCESSO</span>
        </div>

        {/* SOLIDEZ */}
        <div style={{
          height: H_DIR_SOLIDEZ,
          flexShrink: 0,
          borderBottom: B,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', fontFamily: F }}>SOLIDEZ</span>
        </div>

        {H_DIR_RESTO > 0 && (
          <div style={{ height: H_DIR_RESTO, flexShrink: 0 }} />
        )}
      </div>
    </div>
  )
}

export default FichaProducao
