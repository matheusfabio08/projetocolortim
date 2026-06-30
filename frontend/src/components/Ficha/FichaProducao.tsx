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
  return (
    <div style={{
      display: 'flex',
      width: 981,
      border: B,
      background: '#fff',
      fontFamily: FONT,
      boxSizing: 'border-box',
    }}>

      {/* ══ COLUNA ESQUERDA (673px) ══ */}
      <div style={{
        width: 673,
        flexShrink: 0,
        borderRight: B,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}>

        {/* NOME CLIENTE */}
        <div style={{
          borderBottom: B,
          padding: '12px 14px',
          minHeight: 100,
          display: 'flex',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.1 }}>
            {nomeCliente}
          </span>
        </div>

        {/* COR — sem sub-divisão */}
        <div style={{
          borderBottom: B,
          minHeight: 170,
          display: 'flex',
          alignItems: 'center',
          padding: '10px 14px',
        }}>
          <span style={{ fontSize: 52, fontWeight: 900 }}>
            {cor}
          </span>
        </div>

        {/* MATERIAIS */}
        <div style={{
          borderBottom: B1,
          flex: 1,
          minHeight: 120,
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>
          {materiais.map((m, i) => (
            <p key={i} style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.6,
              whiteSpace: 'nowrap',
            }}>{m}</p>
          ))}
        </div>

        {/* RODAPÉ: DESCRIÇÃO + SOLIDEZ/APROVAÇÃO */}
        <div style={{ display: 'flex', minHeight: 152 }}>

          {/* DESCRIÇÃO */}
          <div style={{
            width: 127,
            flexShrink: 0,
            borderRight: B1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingBottom: 8,
          }}>
            <div style={{ width: '80%', height: 1, background: '#000', marginBottom: 4 }} />
            <span style={{ fontSize: 13, fontWeight: 700 }}>Descrição</span>
          </div>

          {/* SOLIDEZ + APROVAÇÃO */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
            padding: '10px 16px',
          }}>
            {/* SOLIDEZ */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ width: 16, height: 16, border: B1 }} />
                <div style={{ width: 16, height: 16, border: B1 }} />
                <div style={{ width: 16, height: 16, border: B1 }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 900 }}>SOLIDEZ</span>
            </div>
            {/* Divisória */}
            <div style={{ height: 1, background: '#000', marginBottom: 8 }} />
            {/* APROVAÇÃO */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ width: 16, height: 16, border: B1 }} />
                <div style={{ width: 16, height: 16, border: B1 }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 900 }}>APROVAÇÃO</span>
            </div>
          </div>

        </div>
      </div>

      {/* ══ COLUNA DIREITA (308px) ══ */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}>

        {/* TABELA INFO: Nº PEDIDO / HORA / ENTRADA / RETORNO */}
        {[
          { label: 'Nº PEDIDO', value: noPedido },
          { label: 'HORA',      value: hora      },
          { label: 'ENTRADA',   value: entrada   },
          { label: 'RETORNO',   value: retorno   },
        ].map((row, i) => (
          <div key={i} style={{
            display: 'flex',
            borderBottom: B1,
          }}>
            <div style={{
              flex: '0 0 55%',
              borderRight: B1,
              padding: '6px 8px',
              fontSize: 13,
              fontWeight: 900,
            }}>{row.label}</div>
            <div style={{
              flex: 1,
              padding: '6px 8px',
              fontSize: 13,
              fontWeight: 900,
              textAlign: 'right',
              whiteSpace: 'nowrap',
            }}>{row.value}</div>
          </div>
        ))}

        {/* CONF. / NOME */}
        <div style={{
          display: 'flex',
          borderBottom: B,
        }}>
          <div style={{
            flex: '0 0 55%',
            borderRight: B1,
            padding: '6px 8px',
            fontSize: 13,
            fontWeight: 900,
          }}>CONF.</div>
          <div style={{
            flex: 1,
            padding: '6px 8px',
            fontSize: 13,
            fontWeight: 900,
            textAlign: 'center',
          }}>NOME</div>
        </div>

        {/* NÚMERO GRANDE */}
        <div style={{
          borderBottom: B,
          minHeight: 170,
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
          borderBottom: B1,
          padding: '10px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: '0.12em' }}>AMIDO</span>
        </div>

        {/* SIM / NÃO */}
        <div style={{
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
            padding: '8px 0',
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
            padding: '8px 0',
          }}>
            <div style={{ width: 16, height: 16, border: B1, flexShrink: 0 }} />
            <span style={{ fontSize: 14, fontWeight: 900 }}>NÃO</span>
          </div>
        </div>

        {/* ÁREA VAZIA */}
        <div style={{ flex: 1, minHeight: 80 }} />

      </div>
    </div>
  )
}

export default FichaProducao
