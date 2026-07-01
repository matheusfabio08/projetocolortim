import React from 'react'
import './FichaProducao.css'

// ============================================================
// MEDIDAS EXTRAIDAS DA IMAGEM 4622F910 + ajuste 56ADE942
// Fonte: Cambria Bold
// COLUNAS: ESQ=393px | CEN=363px | DIR=225px
// ============================================================

const F  = "Cambria, 'Book Antiqua', Palatino, serif"
const B  = '2px solid #000'
const B1 = '1px solid #000'

const W_ESQ = 393
const W_CEN = 363
const W_DIR = 225
const W_LBL = 120

const H_TOTAL         = 707
const H_ESQ_PRINCIPAL = 631
const H_ESQ_RODAPE    = 76

const H_CEN_VAZIO   = 606
const H_CEN_SOLIDEZ = 50
const H_CEN_APROV   = 51

const H_DIR_PEDIDO    = 44
const H_DIR_HORA      = 34
const H_DIR_ENTRADA   = 32
const H_DIR_RETORNO   = 32
const H_DIR_CONF      = 36
const H_DIR_NUMERO    = 170
const H_DIR_AMIDO_LBL = 26
const H_DIR_AMIDO_OPT = 30
const H_DIR_VAZIO     = H_TOTAL - H_DIR_PEDIDO - H_DIR_HORA - H_DIR_ENTRADA - H_DIR_RETORNO - H_DIR_CONF - H_DIR_NUMERO - H_DIR_AMIDO_LBL - H_DIR_AMIDO_OPT

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
      width: W_ESQ + W_CEN + W_DIR,
      height: H_TOTAL,
      border: B,
      background: '#fff',
      fontFamily: F,
      boxSizing: 'border-box',
      overflow: 'hidden',
      flexShrink: 0,
    }}>

      {/* ══ COL ESQUERDA ══ */}
      <div style={{
        width: W_ESQ, height: H_TOTAL, flexShrink: 0,
        borderRight: B, boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          height: H_ESQ_PRINCIPAL, flexShrink: 0,
          borderBottom: B, boxSizing: 'border-box',
          paddingTop: 24, paddingLeft: 18, paddingRight: 10,
          display: 'flex', flexDirection: 'column',
        }}>
          {/* CLIENTE */}
          <div style={{ marginBottom: 90 }}>
            <span style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.1, display: 'block', fontFamily: F }}>
              {nomeCliente}
            </span>
          </div>
          {/* COR */}
          <div style={{ marginBottom: 90 }}>
            <span style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.1, display: 'block', fontFamily: F }}>
              {cor}
            </span>
          </div>
          {/* MATERIAIS */}
          <div style={{ marginTop: 'auto' }}>
            {materiais.map((m, i) => (
              <p key={i} style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 400,
                lineHeight: 1.9,
                whiteSpace: 'nowrap',
                fontFamily: F,
              }}>{m}</p>
            ))}
          </div>
        </div>
        {/* Rodapé */}
        <div style={{
          height: H_ESQ_RODAPE, flexShrink: 0,
          boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'flex-end',
          paddingBottom: 12,
        }}>
          <div style={{ width: '55%', height: 1, background: '#000', marginBottom: 6 }} />
          <span style={{ fontSize: 11, fontWeight: 700, fontFamily: F }}>Descrição</span>
        </div>
      </div>

      {/* ══ COL CENTRO ══ */}
      <div style={{
        width: W_CEN, height: H_TOTAL, flexShrink: 0,
        borderRight: B, boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ height: H_CEN_VAZIO, flexShrink: 0, borderBottom: B1 }} />

        {/* SOLIDEZ */}
        <div style={{
          height: H_CEN_SOLIDEZ, flexShrink: 0,
          borderBottom: B1, boxSizing: 'border-box',
          display: 'flex', alignItems: 'center',
          padding: '0 14px', gap: 10,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ width: 13, height: 13, border: B1 }} />
            ))}
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', fontFamily: F }}>SOLIDEZ</span>
        </div>

        {/* APROVAÇÃO */}
        <div style={{
          height: H_CEN_APROV, flexShrink: 0,
          boxSizing: 'border-box',
          display: 'flex', alignItems: 'center',
          padding: '0 14px', gap: 10,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[0,1].map(i => (
              <div key={i} style={{ width: 13, height: 13, border: B1 }} />
            ))}
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', fontFamily: F }}>APROVAÇÃO</span>
        </div>
      </div>

      {/* ══ COL DIREITA ══ */}
      <div style={{
        width: W_DIR, flexShrink: 0,
        boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Nº PEDIDO */}
        <div style={{ height: H_DIR_PEDIDO, flexShrink: 0, borderBottom: B1, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B1, display: 'flex', alignItems: 'center', padding: '0 7px', fontSize: 10, fontWeight: 700, fontFamily: F }}>Nº PEDIDO</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 7px', fontSize: 10, fontWeight: 700, fontFamily: F }}>{noPedido}</div>
        </div>

        {/* HORA */}
        <div style={{ height: H_DIR_HORA, flexShrink: 0, borderBottom: B1, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B1, display: 'flex', alignItems: 'center', padding: '0 7px', fontSize: 10, fontWeight: 700, fontFamily: F }}>HORA</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 7px', fontSize: 10, fontWeight: 700, fontFamily: F }}>{hora}</div>
        </div>

        {/* ENTRADA */}
        <div style={{ height: H_DIR_ENTRADA, flexShrink: 0, borderBottom: B1, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B1, display: 'flex', alignItems: 'center', padding: '0 7px', fontSize: 10, fontWeight: 700, fontFamily: F }}>ENTRADA</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 7px', fontSize: 10, fontWeight: 700, fontFamily: F }}>{entrada}</div>
        </div>

        {/* RETORNO */}
        <div style={{ height: H_DIR_RETORNO, flexShrink: 0, borderBottom: B1, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B1, display: 'flex', alignItems: 'center', padding: '0 7px', fontSize: 10, fontWeight: 700, fontFamily: F }}>RETORNO</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 7px', fontSize: 10, fontWeight: 700, fontFamily: F }}>{retorno}</div>
        </div>

        {/* CONF / NOME */}
        <div style={{ height: H_DIR_CONF, flexShrink: 0, borderBottom: B, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B1, display: 'flex', alignItems: 'center', padding: '0 7px', fontSize: 10, fontWeight: 700, fontFamily: F }}>CONF.</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 7px', fontSize: 10, fontWeight: 700, fontFamily: F }}>NOME</div>
        </div>

        {/* NÚMERO GRANDE */}
        <div style={{ height: H_DIR_NUMERO, flexShrink: 0, borderBottom: B, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 130, fontWeight: 700, lineHeight: 1, fontFamily: F }}>{numero}</span>
        </div>

        {/* AMIDO label */}
        <div style={{ height: H_DIR_AMIDO_LBL, flexShrink: 0, borderBottom: B1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', fontFamily: F }}>AMIDO</span>
        </div>

        {/* SIM / NÃO */}
        <div style={{ height: H_DIR_AMIDO_OPT, flexShrink: 0, borderBottom: B1, display: 'flex' }}>
          <div style={{ flex: 1, borderRight: B1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <div style={{ width: 13, height: 13, border: B1, flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: F }}>SIM</span>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <div style={{ width: 13, height: 13, border: B1, flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: F }}>NÃO</span>
          </div>
        </div>

        {/* VAZIO */}
        <div style={{ height: H_DIR_VAZIO, flexShrink: 0 }} />

      </div>
    </div>
  )
}

export default FichaProducao
