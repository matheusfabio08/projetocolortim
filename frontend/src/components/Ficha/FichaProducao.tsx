import React from 'react'
import './FichaProducao.css'

// ============================================================
// REANALISE PIXEL-A-PIXEL v3 — imagem 4622F910-ACE7-468D-A336-B1F477194AE3.jpg
// Dimensoes referencia: ~986x719px
//
// COLUNAS (bordas V: x=0, 393, 756, 981)
//   ESQ = 393px | CEN = 363px | DIR = 225px
//
// ESQ:
//   Principal y=0..631 (631px)
//     cliente: paddingTop=22, fontSize=44, marginBottom=28
//     cor:     fontSize=44,   marginBottom=auto (push materiais pro fundo)
//     materiais: fontSize=11, alinhado ao fundo da celula principal
//   Rodape y=631..707 (76px): linha + Descricao
//
// CEN:
//   Vazio y=0..607 (607px)
//   SOLIDEZ y=607..657 (50px): 4 caixas 12x12 + label
//   APROV   y=657..707 (50px): 2 caixas 12x12 + label
//
// DIR (sub-col label=118px | valor=107px):
//   N°PEDIDO  y=0..26    (26px)
//   HORA      y=26..50   (24px)
//   ENTRADA   y=50..74   (24px)
//   RETORNO   y=74..98   (24px)
//   CONF/NOME y=98..124  (26px) borda FORTE
//   NUMERO    y=124..330 (206px) borda FORTE — numero ocupa ~90% altura
//   AMIDO LBL y=330..352 (22px)
//   SIM/NAO   y=352..380 (28px)
//   VAZIO     y=380..707 (327px)
// ============================================================

const F  = "Cambria, 'Book Antiqua', Palatino, serif"
const B  = '2px solid #000'
const B1 = '1px solid #000'

const W_ESQ = 393
const W_CEN = 363
const W_DIR = 225
const W_LBL = 118

const H_TOTAL         = 707
const H_ESQ_PRINCIPAL = 631
const H_ESQ_RODAPE    = 76

const H_CEN_VAZIO   = 607
const H_CEN_SOLIDEZ = 50
const H_CEN_APROV   = 50

const H_DIR_PEDIDO    = 26
const H_DIR_HORA      = 24
const H_DIR_ENTRADA   = 24
const H_DIR_RETORNO   = 24
const H_DIR_CONF      = 26
const H_DIR_NUMERO    = 206
const H_DIR_AMIDO_LBL = 22
const H_DIR_AMIDO_OPT = 28
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
          height: H_ESQ_PRINCIPAL,
          flexShrink: 0,
          borderBottom: B,
          boxSizing: 'border-box',
          paddingTop: 22,
          paddingLeft: 16,
          paddingRight: 8,
          paddingBottom: 10,
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* CLIENTE */}
          <span style={{
            fontSize: 44,
            fontWeight: 700,
            lineHeight: 1.1,
            display: 'block',
            fontFamily: F,
            marginBottom: 28,
          }}>
            {nomeCliente}
          </span>

          {/* COR */}
          <span style={{
            fontSize: 44,
            fontWeight: 700,
            lineHeight: 1.1,
            display: 'block',
            fontFamily: F,
          }}>
            {cor}
          </span>

          {/* MATERIAIS — empurrados pro fundo */}
          <div style={{ marginTop: 'auto' }}>
            {materiais.map((m, i) => (
              <p key={i} style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 400,
                lineHeight: 1.85,
                whiteSpace: 'nowrap',
                fontFamily: F,
              }}>{m}</p>
            ))}
          </div>
        </div>

        {/* Rodapé Descrição */}
        <div style={{
          height: H_ESQ_RODAPE,
          flexShrink: 0,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 12,
        }}>
          <div style={{ width: '55%', height: 1, background: '#000', marginBottom: 5 }} />
          <span style={{ fontSize: 11, fontWeight: 700, fontFamily: F }}>Descrição</span>
        </div>
      </div>

      {/* ══ COL CENTRO ══ */}
      <div style={{
        width: W_CEN,
        height: H_TOTAL,
        flexShrink: 0,
        borderRight: B,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Grande vazio */}
        <div style={{ height: H_CEN_VAZIO, flexShrink: 0, borderBottom: B1 }} />

        {/* SOLIDEZ */}
        <div style={{
          height: H_CEN_SOLIDEZ,
          flexShrink: 0,
          borderBottom: B1,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: 10,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ width: 12, height: 12, border: B1 }} />
            ))}
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.03em', fontFamily: F }}>SOLIDEZ</span>
        </div>

        {/* APROVAÇÃO */}
        <div style={{
          height: H_CEN_APROV,
          flexShrink: 0,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: 10,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[0,1].map(i => (
              <div key={i} style={{ width: 12, height: 12, border: B1 }} />
            ))}
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.03em', fontFamily: F }}>APROVAÇÃO</span>
        </div>
      </div>

      {/* ══ COL DIREITA ══ */}
      <div style={{
        width: W_DIR,
        flexShrink: 0,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Nº PEDIDO */}
        <div style={{ height: H_DIR_PEDIDO, flexShrink: 0, borderBottom: B1, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B1, display: 'flex', alignItems: 'center', padding: '0 5px', fontSize: 9, fontWeight: 700, fontFamily: F }}>Nº PEDIDO</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 5px', fontSize: 9, fontWeight: 700, fontFamily: F }}>{noPedido}</div>
        </div>

        {/* HORA */}
        <div style={{ height: H_DIR_HORA, flexShrink: 0, borderBottom: B1, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B1, display: 'flex', alignItems: 'center', padding: '0 5px', fontSize: 9, fontWeight: 700, fontFamily: F }}>HORA</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 5px', fontSize: 9, fontWeight: 700, fontFamily: F }}>{hora}</div>
        </div>

        {/* ENTRADA */}
        <div style={{ height: H_DIR_ENTRADA, flexShrink: 0, borderBottom: B1, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B1, display: 'flex', alignItems: 'center', padding: '0 5px', fontSize: 9, fontWeight: 700, fontFamily: F }}>ENTRADA</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 5px', fontSize: 9, fontWeight: 700, fontFamily: F }}>{entrada}</div>
        </div>

        {/* RETORNO */}
        <div style={{ height: H_DIR_RETORNO, flexShrink: 0, borderBottom: B1, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B1, display: 'flex', alignItems: 'center', padding: '0 5px', fontSize: 9, fontWeight: 700, fontFamily: F }}>RETORNO</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 5px', fontSize: 9, fontWeight: 700, fontFamily: F }}>{retorno}</div>
        </div>

        {/* CONF / NOME */}
        <div style={{ height: H_DIR_CONF, flexShrink: 0, borderBottom: B, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B1, display: 'flex', alignItems: 'center', padding: '0 5px', fontSize: 9, fontWeight: 700, fontFamily: F }}>CONF.</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', fontSize: 9, fontWeight: 700, fontFamily: F }}>NOME</div>
        </div>

        {/* NÚMERO GRANDE — ocupa 206px, fonte ~150px para preencher ~90% */}
        <div style={{ height: H_DIR_NUMERO, flexShrink: 0, borderBottom: B, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <span style={{ fontSize: 150, fontWeight: 700, lineHeight: 1, fontFamily: F }}>{numero}</span>
        </div>

        {/* AMIDO label */}
        <div style={{ height: H_DIR_AMIDO_LBL, flexShrink: 0, borderBottom: B1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', fontFamily: F }}>AMIDO</span>
        </div>

        {/* SIM / NÃO */}
        <div style={{ height: H_DIR_AMIDO_OPT, flexShrink: 0, borderBottom: B1, display: 'flex' }}>
          <div style={{ flex: 1, borderRight: B1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <div style={{ width: 11, height: 11, border: B1, flexShrink: 0 }} />
            <span style={{ fontSize: 9, fontWeight: 700, fontFamily: F }}>SIM</span>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <div style={{ width: 11, height: 11, border: B1, flexShrink: 0 }} />
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
