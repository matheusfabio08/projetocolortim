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

// ═══════════════════════════════════════
// GRID PIXEL-PERFECT ref C4776627 (985x721)
// ═══════════════════════════════════════
// VERTICAIS
const X_MID = 673   // divisória col-esq | col-dir
const X_LBL = 812   // label | valor (tabela direita)
const X_DIR = 981   // borda direita
const CX_X  = 127   // início caixinhas rodapé
const CX_W  = 25    // largura caixinha

// HORIZONTAIS
const Y_T1  = 37    // fim row1 tabela (Nº PEDIDO)
const Y_T2  = 69    // fim row2 (HORA)
const Y_T3  = 101   // fim row3 (ENTRADA)
const Y_T4  = 133   // fim row4 (RETORNO)
const Y_T5  = 164   // fim row5 (CONF./NOME)
const Y_COR = 334   // fim COR / fim NÚMERO
const Y_AMI = 396   // fim título AMIDO
const Y_SN  = 435   // fim SIM/NÃO
const Y_ROD = 561   // início rodapé
const Y_S2  = 589   // caixa SOLIDEZ 2
const Y_S3  = 617   // caixa SOLIDEZ 3
const Y_SEP = 637   // separação SOLIDEZ | APROVAÇÃO (linha grossa)
const Y_A1  = 662   // caixa APROVAÇÃO 1
const Y_A2  = 688   // caixa APROVAÇÃO 2
const Y_BOT = 713   // borda inferior

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
  cor        = '',
  noPedido   = '',
  hora       = '',
  entrada    = '',
  retorno    = '',
  conf       = '',
  numero     = '',
  materiais  = [],
}) => {

  const tRows = [
    { label: 'Nº PEDIDO', value: noPedido },
    { label: 'HORA',      value: hora      },
    { label: 'ENTRADA',   value: entrada   },
    { label: 'RETORNO',   value: retorno   },
  ]
  const tYs = [0, Y_T1, Y_T2, Y_T3, Y_T4]

  return (
    <div style={{ position: 'relative', width: 985, height: 721, background: '#fff', fontFamily: FONT }}>

      {/* ═══════════════════════════════════════════
          COLUNA ESQUERDA  x=0  w=673
      ═══════════════════════════════════════════ */}

      {/* ── NOME: container centralizado, 28px ── */}
      <div style={s(0, 0, X_MID, Y_T5, {
        border: B,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      })}>
        <span style={{ fontSize: 28, fontWeight: 900, fontFamily: FONT }}>
          {nomeCliente}
        </span>
      </div>

      {/* ── COR: container separado, centralizado, 28px ── */}
      <div style={s(0, Y_T5, X_MID, Y_COR - Y_T5, {
        borderLeft: B, borderRight: B, borderBottom: B,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      })}>
        <span style={{ fontSize: 28, fontWeight: 900, fontFamily: FONT }}>
          {cor}
        </span>
      </div>

      {/* ── MATERIAIS ── */}
      <div style={s(0, Y_COR, X_MID, Y_ROD - Y_COR, {
        borderLeft: B, borderRight: B, borderBottom: B,
        padding: '6px 8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
      })}>
        {materiais.map((m, i) => (
          <div key={i} style={{ fontSize: 11, fontFamily: FONT, lineHeight: 1.4 }}>{m}</div>
        ))}
      </div>

      {/* ── DESCRIÇÃO (rodapé esquerdo) ── */}
      <div style={s(0, Y_ROD, CX_X, Y_BOT - Y_ROD, {
        borderLeft: B, borderBottom: B,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 4,
      })}>
        <span style={{ fontSize: 9, fontWeight: 700, fontFamily: FONT }}>Descrição</span>
      </div>

      {/* ── LINHA VERTICAL direita das caixinhas ── */}
      <div style={s(CX_X + CX_W, Y_ROD, 2, Y_BOT - Y_ROD, { background: '#000' })} />

      {/* ── BORDA DIREITA col-esq no rodapé ── */}
      <div style={s(X_MID - 2, Y_ROD, 2, Y_BOT - Y_ROD, { background: '#000' })} />

      {/* ── LINHA H separação SOLIDEZ | APROVAÇÃO (grossa, largura total) ── */}
      <div style={s(CX_X, Y_SEP, X_MID - CX_X, 2, { background: '#000' })} />

      {/* ── CAIXAS SOLIDEZ (3) — linhas só dentro da coluna estreita ── */}
      {([Y_ROD, Y_S2, Y_S3] as number[]).map((yy, i) => {
        const yEnd = [Y_S2, Y_S3, Y_SEP][i]
        return (
          <div key={i} style={s(CX_X, yy, CX_W, yEnd - yy, {
            borderTop: i === 0 ? B : B1,
            borderLeft: B1,
          })} />
        )
      })}

      {/* ── LABEL SOLIDEZ (área limpa sem linhas) ── */}
      <div style={s(CX_X + CX_W, Y_ROD, X_MID - CX_X - CX_W - 2, Y_SEP - Y_ROD, {
        display: 'flex',
        alignItems: 'flex-start',
        paddingTop: 3,
        paddingLeft: 5,
      })}>
        <span style={{ fontSize: 9, fontWeight: 700, fontFamily: FONT }}>SOLIDEZ</span>
      </div>

      {/* ── CAIXAS APROVAÇÃO (3) ── */}
      {([Y_SEP, Y_A1, Y_A2] as number[]).map((yy, i) => {
        const yEnd = [Y_A1, Y_A2, Y_BOT][i]
        return (
          <div key={i} style={s(CX_X, yy + (i === 0 ? 2 : 0), CX_W, yEnd - yy - (i === 0 ? 2 : 0), {
            borderTop: B1,
            borderLeft: B1,
            borderBottom: i === 2 ? B : 'none',
          })} />
        )
      })}

      {/* ── LABEL APROVAÇÃO (área limpa) ── */}
      <div style={s(CX_X + CX_W, Y_SEP + 2, X_MID - CX_X - CX_W - 2, Y_BOT - Y_SEP - 2, {
        display: 'flex',
        alignItems: 'flex-start',
        paddingTop: 3,
        paddingLeft: 5,
      })}>
        <span style={{ fontSize: 9, fontWeight: 700, fontFamily: FONT }}>APROVAÇÃO</span>
      </div>

      {/* ═══════════════════════════════════════════
          COLUNA DIREITA  x=673  w=308
      ═══════════════════════════════════════════ */}

      {/* ── TABELA DIREITA: 4 rows label+valor ── */}
      <div style={s(X_MID, 0, X_DIR - X_MID, Y_T4, { border: B })}>
        {tRows.map((row, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: 0, top: tYs[i], width: '100%', height: tYs[i + 1] - tYs[i],
            borderBottom: i < tRows.length - 1 ? B1 : 'none',
            display: 'flex',
          }}>
            <div style={{
              width: X_LBL - X_MID, borderRight: B1,
              fontSize: 8, fontWeight: 700, fontFamily: FONT,
              display: 'flex', alignItems: 'center', paddingLeft: 4,
            }}>{row.label}</div>
            <div style={{
              flex: 1, fontSize: 9, fontFamily: FONT,
              display: 'flex', alignItems: 'center', paddingLeft: 4,
            }}>{row.value}</div>
          </div>
        ))}
      </div>

      {/* ── ROW CONF./NOME ── */}
      <div style={s(X_MID, Y_T4, X_DIR - X_MID, Y_T5 - Y_T4, {
        borderLeft: B, borderRight: B, borderBottom: B,
        display: 'flex',
      })}>
        <div style={{ width: X_LBL - X_MID, borderRight: B1, fontSize: 8, fontWeight: 700, fontFamily: FONT, display: 'flex', alignItems: 'center', paddingLeft: 4 }}>CONF.</div>
        <div style={{ flex: 1, fontSize: 8, fontWeight: 700, fontFamily: FONT, display: 'flex', alignItems: 'center', paddingLeft: 4 }}>NOME</div>
      </div>

      {/* ── NÚMERO GRANDE ── */}
      <div style={s(X_MID, Y_T5, X_DIR - X_MID, Y_COR - Y_T5, {
        borderLeft: B, borderRight: B, borderBottom: B,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      })}>
        <span style={{ fontSize: 120, fontWeight: 900, fontFamily: FONT, lineHeight: 1 }}>{numero}</span>
      </div>

      {/* ── AMIDO título ── */}
      <div style={s(X_MID, Y_COR, X_DIR - X_MID, Y_AMI - Y_COR, {
        borderLeft: B, borderRight: B, borderBottom: B,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      })}>
        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: FONT }}>AMIDO</span>
      </div>

      {/* ── SIM / NÃO ── */}
      <div style={s(X_MID, Y_AMI, X_DIR - X_MID, Y_SN - Y_AMI, {
        borderLeft: B, borderRight: B, borderBottom: B,
        display: 'flex',
      })}>
        <div style={{ flex: 1, borderRight: B1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 12, border: B1, display: 'inline-block' }} />
          <span style={{ fontSize: 9, fontWeight: 700, fontFamily: FONT }}>SIM</span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 12, border: B1, display: 'inline-block' }} />
          <span style={{ fontSize: 9, fontWeight: 700, fontFamily: FONT }}>NÃO</span>
        </div>
      </div>

      {/* ── ÁREA VAZIA direita ── */}
      <div style={s(X_MID, Y_SN, X_DIR - X_MID, Y_BOT - Y_SN, {
        borderLeft: B, borderRight: B, borderBottom: B,
      })} />

    </div>
  )
}

export default FichaProducao
