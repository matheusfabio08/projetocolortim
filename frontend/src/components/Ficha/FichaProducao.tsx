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

// Proporções extraídas pixel-perfect da imagem de referência 609E192D (986x719px)
// Bordas V: 0, 353, 676, 981  → col-A=353px, col-B=323px, col-C=305px
// Bordas H: 0,158,328,555,707 → NOME=158, COR=170, MAT=227, RODAPE=152
const W_COL_A = 353
const W_COL_B = 323
const W_COL_C = 305

const H_NOME   = 158
const H_COR    = 170
const H_MAT    = 227
const H_RODAPE = 152

const H_ROW   = [40, 32, 28, 27, 31]
const H_NUM   = 170
const H_AMIDO = 51
const H_SIMN  = 50

const B  = '2px solid #000'
const B1 = '1px solid #000'
const FONT = '"Arial Black", "Arial Bold", Arial, sans-serif'

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
  const tabelaRows = [
    { label: 'Nº PEDIDO', value: noPedido },
    { label: 'HORA',      value: hora      },
    { label: 'ENTRADA',   value: entrada   },
    { label: 'RETORNO',   value: retorno   },
    { label: 'CONF.',     value: conf      },
  ]

  return (
    <div style={{
      display: 'flex',
      width: W_COL_A + W_COL_B + W_COL_C,
      border: B,
      background: '#fff',
      fontFamily: FONT,
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>

      {/* ══ COLUNAS ESQUERDA (A+B) ══ */}
      <div style={{
        width: W_COL_A + W_COL_B,
        flexShrink: 0,
        borderRight: B,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}>

        {/* NOME: col-A texto + col-B caixa branca */}
        <div style={{
          height: H_NOME,
          borderBottom: B,
          display: 'flex',
          flexShrink: 0,
        }}>
          <div style={{
            width: W_COL_A,
            flexShrink: 0,
            borderRight: B1,
            display: 'flex',
            alignItems: 'flex-start',
            padding: '12px 14px 0',
          }}>
            <span style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.1 }}>
              {nomeCliente}
            </span>
          </div>
          <div style={{ flex: 1, background: '#fff' }} />
        </div>

        {/* COR: col-A texto + col-B caixa branca */}
        <div style={{
          height: H_COR,
          borderBottom: B,
          display: 'flex',
          flexShrink: 0,
        }}>
          <div style={{
            width: W_COL_A,
            flexShrink: 0,
            borderRight: B1,
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
          }}>
            <span style={{ fontSize: 52, fontWeight: 900 }}>
              {cor}
            </span>
          </div>
          <div style={{ flex: 1, background: '#fff' }} />
        </div>

        {/* MATERIAIS: largura total, sem sub-divisória */}
        <div style={{
          height: H_MAT,
          borderBottom: B1,
          flexShrink: 0,
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflow: 'hidden',
        }}>
          {materiais.map((m, i) => (
            <p key={i} style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.7,
              whiteSpace: 'nowrap',
            }}>{m}</p>
          ))}
        </div>

        {/* RODAPÉ: DESCRIÇÃO (col-A) + SOLIDEZ/APROVAÇÃO (col-B) */}
        <div style={{
          height: H_RODAPE,
          flexShrink: 0,
          display: 'flex',
        }}>
          <div style={{
            width: W_COL_A,
            flexShrink: 0,
            borderRight: B1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingBottom: 10,
          }}>
            <div style={{ width: '70%', height: 1.5, background: '#000', marginBottom: 5 }} />
            <span style={{ fontSize: 13, fontWeight: 700 }}>Descrição</span>
          </div>

          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
            padding: '12px 18px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ width: 16, height: 16, border: B1 }} />
                <div style={{ width: 16, height: 16, border: B1 }} />
                <div style={{ width: 16, height: 16, border: B1 }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 900 }}>SOLIDEZ</span>
            </div>
            <div style={{ height: 1, background: '#000', margin: '4px 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ width: 16, height: 16, border: B1 }} />
                <div style={{ width: 16, height: 16, border: B1 }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 900 }}>APROVAÇÃO</span>
            </div>
          </div>
        </div>

      </div>

      {/* ══ COLUNA DIREITA (C) ══ */}
      <div style={{
        width: W_COL_C,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}>

        {/* TABELA INFO: 5 linhas com alturas exatas */}
        {tabelaRows.map((row, i) => (
          <div key={i} style={{
            height: H_ROW[i],
            flexShrink: 0,
            display: 'flex',
            borderBottom: i < 4 ? B1 : B,
          }}>
            <div style={{
              flex: '0 0 55%',
              borderRight: B1,
              display: 'flex',
              alignItems: 'center',
              padding: '0 8px',
              fontSize: 12,
              fontWeight: 900,
            }}>{row.label}</div>
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: i === 4 ? 'center' : 'flex-end',
              padding: '0 8px',
              fontSize: 12,
              fontWeight: 900,
              whiteSpace: 'nowrap',
            }}>{i === 4 ? 'NOME' : row.value}</div>
          </div>
        ))}

        {/* NÚMERO GRANDE */}
        <div style={{
          height: H_NUM,
          flexShrink: 0,
          borderBottom: B,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: 130, fontWeight: 900, lineHeight: 1 }}>
            {numero}
          </span>
        </div>

        {/* AMIDO */}
        <div style={{
          height: H_AMIDO,
          flexShrink: 0,
          borderBottom: B1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: '0.12em' }}>AMIDO</span>
        </div>

        {/* SIM / NÃO */}
        <div style={{
          height: H_SIMN,
          flexShrink: 0,
          borderBottom: B1,
          display: 'flex',
        }}>
          <div style={{
            flex: 1,
            borderRight: B1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
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

        {/* ÁREA VAZIA */}
        <div style={{ flex: 1 }} />

      </div>
    </div>
  )
}

export default FichaProducao
