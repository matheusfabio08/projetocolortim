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
  materiais?: string[]
}

const X_MID = 673
const X_LBL = 812
const X_DIR = 981
const CX_X  = 127
const CX_W  = 25

const Y_T1  = 37
const Y_T2  = 69
const Y_T3  = 101
const Y_T4  = 133
const Y_T5  = 164
const Y_COR = 334
const Y_AMI = 396
const Y_SN  = 435
const Y_ROD = 561
const Y_S2  = 589
const Y_S3  = 617
const Y_SEP = 637
const Y_A1  = 662
const Y_A2  = 688
const Y_BOT = 713

const B  = '2px solid #000'
const B1 = '1px solid #000'
const FONT = '"Arial Black", "Arial Bold", Arial, sans-serif'

const s = (
  x: number, y: number, w: number, h: number,
  extra: React.CSSProperties = {}
): React.CSSProperties => ({
  position: 'absolute',
  left: x, top: y, width: w, height: h,
  boxSizing: 'border-box',
  overflow: 'hidden',
  ...extra,
})

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

  const tRows = [
    { label: 'Nº PEDIDO', value: noPedido },
    { label: 'HORA',      value: hora      },
    { label: 'ENTRADA',   value: entrada   },
    { label: 'RETORNO',   value: retorno   },
  ]
  const tYs = [0, Y_T1, Y_T2, Y_T3, Y_T4]

  return (
    <div style={{
      position: 'relative',
      width: X_DIR,
      height: Y_BOT,
      border: B,
      background: '#fff',
      fontFamily: FONT,
      boxSizing: 'border-box',
    }}>

      {/* NOME  x=0 y=0 w=673 h=164 */}
      <div style={s(0, 0, X_MID, Y_T5, {
        borderRight: B,
        borderBottom: B,
        display: 'flex',
        alignItems: 'flex-start',
        padding: '12px 10px 0 14px',
      })}>
        <span style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.1 }}>
          {nomeCliente}
        </span>
      </div>

      {/* COR  x=0 y=164 w=673 h=170 */}
      <div style={s(0, Y_T5, X_MID, Y_COR - Y_T5, {
        borderRight: B,
        borderBottom: B,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 14,
      })}>
        <span style={{ fontSize: 52, fontWeight: 900 }}>
          {cor}
        </span>
      </div>

      {/* MATERIAIS  x=0 y=334 w=673 h=227 */}
      <div style={s(0, Y_COR, X_MID, Y_ROD - Y_COR, {
        borderRight: B,
        borderBottom: B1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        padding: '10px 10px 6px 10px',
        gap: 4,
      })}>
        {materiais.map((m, i) => (
          <p key={i} style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 700,
            lineHeight: 1.5,
            whiteSpace: 'nowrap',
          }}>{m}</p>
        ))}
      </div>

      {/* DESCRIÇÃO  x=0 y=561 w=127 h=152 */}
      <div style={s(0, Y_ROD, CX_X, Y_BOT - Y_ROD, {
        borderRight: B1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 8,
      })}>
        <div style={{ width: '80%', height: 1, background: '#000', marginBottom: 4 }} />
        <span style={{ fontSize: 13, fontWeight: 700 }}>Descrição</span>
      </div>

      {/* LINHA VERTICAL direita das caixas */}
      <div style={s(CX_X + CX_W, Y_ROD, 1, Y_BOT - Y_ROD, { background: '#000' })} />

      {/* BORDA DIREITA coluna esquerda no rodapé */}
      <div style={s(X_MID - 1, Y_ROD, 1, Y_BOT - Y_ROD, { background: '#000' })} />

      {/* LINHA H separação SOLIDEZ | APROVAÇÃO */}
      <div style={s(CX_X, Y_SEP, X_MID - CX_X, 1, { background: '#000' })} />

      {/* CAIXAS SOLIDEZ */}
      {([Y_ROD, Y_S2, Y_S3] as number[]).map((yy, i) => {
        const yEnd = [Y_S2, Y_S3, Y_SEP][i]
        return <div key={`s${i}`} style={s(CX_X, yy, CX_W, yEnd - yy, { border: B1 })} />
      })}

      {/* LABEL SOLIDEZ */}
      <div style={s(CX_X + CX_W + 6, Y_ROD + 6, 200, 20, {
        display: 'flex', alignItems: 'center',
      })}>
        <span style={{ fontSize: 13, fontWeight: 900 }}>SOLIDEZ</span>
      </div>

      {/* CAIXAS APROVAÇÃO */}
      {([Y_SEP, Y_A1, Y_A2] as number[]).map((yy, i) => {
        const yEnd = [Y_A1, Y_A2, Y_BOT][i]
        return <div key={`a${i}`} style={s(CX_X, yy, CX_W, yEnd - yy, { border: B1 })} />
      })}

      {/* LABEL APROVAÇÃO */}
      <div style={s(CX_X + CX_W + 6, Y_SEP + 6, 200, 20, {
        display: 'flex', alignItems: 'center',
      })}>
        <span style={{ fontSize: 13, fontWeight: 900 }}>APROVAÇÃO</span>
      </div>

      {/* TABELA DIREITA: 4 rows  x=673 y=0 w=308 h=133 */}
      <div style={s(X_MID, 0, X_DIR - X_MID, Y_T4, { borderLeft: B })}>
        {tRows.map((row, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: 0, top: tYs[i],
            width: X_DIR - X_MID,
            height: tYs[i + 1] - tYs[i],
            display: 'flex',
            borderBottom: B1,
          }}>
            <div style={{
              width: X_LBL - X_MID,
              flexShrink: 0,
              borderRight: B1,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 7,
              fontSize: 13,
              fontWeight: 900,
            }}>{row.label}</div>
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: 7,
              fontSize: 13,
              fontWeight: 900,
              whiteSpace: 'nowrap',
            }}>{row.value}</div>
          </div>
        ))}
      </div>

      {/* ROW CONF. / NOME  x=673 y=133 w=308 h=31 */}
      <div style={s(X_MID, Y_T4, X_DIR - X_MID, Y_T5 - Y_T4, {
        borderLeft: B,
        borderBottom: B,
        display: 'flex',
      })}>
        <div style={{
          width: X_LBL - X_MID,
          flexShrink: 0,
          borderRight: B1,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 7,
          fontSize: 13,
          fontWeight: 900,
        }}>CONF.</div>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 900,
        }}>NOME</div>
      </div>

      {/* NÚMERO GRANDE  x=673 y=164 w=308 h=170 */}
      <div style={s(X_MID, Y_T5, X_DIR - X_MID, Y_COR - Y_T5, {
        borderLeft: B,
        borderBottom: B,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      })}>
        <span style={{ fontSize: 130, fontWeight: 900, lineHeight: 1 }}>
          {numero}
        </span>
      </div>

      {/* AMIDO título  x=673 y=334 w=308 h=62 */}
      <div style={s(X_MID, Y_COR, X_DIR - X_MID, Y_AMI - Y_COR, {
        borderLeft: B,
        borderBottom: B1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      })}>
        <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: '0.12em' }}>AMIDO</span>
      </div>

      {/* SIM / NÃO  x=673 y=396 w=308 h=39 */}
      <div style={s(X_MID, Y_AMI, X_DIR - X_MID, Y_SN - Y_AMI, {
        borderLeft: B,
        borderBottom: B1,
        display: 'flex',
      })}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderRight: B1,
        }}>
          <div style={{ width: 16, height: 16, border: B1, flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 900 }}>SIM</span>
        </div>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}>
          <div style={{ width: 16, height: 16, border: B1, flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 900 }}>NÃO</span>
        </div>
      </div>

      {/* ÁREA VAZIA direita  x=673 y=435 w=308 h=278 */}
      <div style={s(X_MID, Y_SN, X_DIR - X_MID, Y_BOT - Y_SN, {
        borderLeft: B,
      })} />

    </div>
  )
}

export default FichaProducao
