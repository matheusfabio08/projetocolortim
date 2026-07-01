import React from 'react'
import './FichaProducao.css'

// ============================================================
// MEDIDAS EXTRAIDAS DA IMAGEM 4622F910-ACE7-468D-A336-B1F477194AE3.jpg
// Ficha nova — Times New Roman
//
// COLUNAS:
//   ESQ = 393px (40%)  |  CEN = 363px (37%)  |  DIR = 225px (23%)
//
// ESQ:
//   Principal (0→631): cliente topo-esq, cor abaixo, materiais no fim
//   Rodape (631→707 = 76px): linha + "Descrição" centralizado
//
// CEN:
//   Grande vazio (0→606)
//   SOLIDEZ (606→656 = 50px): 4 caixinhas + label
//   APROVACAO (656→707 = 51px): 2 caixinhas + label
//
// DIR:
//   N°PEDIDO: 0→40    (40px)  border-bottom 1px
//   HORA:     40→70   (30px)  border-bottom 1px
//   ENTRADA:  70→98   (28px)  border-bottom 1px
//   RETORNO:  98→126  (28px)  border-bottom 1px
//   CONF/NOME:126→158 (32px)  border-bottom 2px
//   NUMERO:   158→328 (170px) border-bottom 2px
//   AMIDO LBL:328→352 (24px)  border-bottom 1px
//   SIM/NAO:  352→378 (26px)  border-bottom 1px
//   VAZIO:    378→707
//   Sub-col label=120px | valor=105px
// ============================================================

const F  = "'Times New Roman', Times, serif"
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

const H_DIR_PEDIDO    = 40
const H_DIR_HORA      = 30
const H_DIR_ENTRADA   = 28
const H_DIR_RETORNO   = 28
const H_DIR_CONF      = 32
const H_DIR_NUMERO    = 170
const H_DIR_AMIDO_LBL = 24
const H_DIR_AMIDO_OPT = 26
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
        {/* Principal */}
        <div style={{
          height: H_ESQ_PRINCIPAL, flexShrink: 0,
          borderBottom: B, boxSizing: 'border-box',
          paddingTop: 28, paddingLeft: 14, paddingRight: 8,
          display: 'flex', flexDirection: 'column',
        }}>
          {/* CLIENTE */}
          <div style={{ marginBottom: 100 }}>
            <span style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.1, display: 'block', fontFamily: F }}>
              {nomeCliente}
            </span>
          </div>
          {/* COR */}
          <div style={{ marginBottom: 100 }}>
            <span style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.1, display: 'block', fontFamily: F }}>
              {cor}
            </span>
          </div>
          {/* MATERIAIS */}
          <div style={{ marginTop: 'auto' }}>
            {materiais.map((m, i) => (
              <p key={i} style={{
                margin: 0, fontSize: 12, fontWeight: 400,
                lineHeight: 1.8, whiteSpace: 'nowrap', fontFamily: F,
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
          paddingBottom: 10,
        }}>
          <div style={{ width: '60%', height: 1, background: '#000', marginBottom: 5 }} />
          <span style={{ fontSize: 12, fontWeight: 700, fontFamily: F }}>Descrição</span>
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
          padding: '0 16px', gap: 12,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ width: 14, height: 14, border: B1 }} />
            ))}
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', fontFamily: F }}>SOLIDEZ</span>
        </div>

        {/* APROVAÇÃO */}
        <div style={{
          height: H_CEN_APROV, flexShrink: 0,
          boxSizing: 'border-box',
          display: 'flex', alignItems: 'center',
          padding: '0 16px', gap: 12,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[0,1].map(i => (
              <div key={i} style={{ width: 14, height: 14, border: B1 }} />
            ))}
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', fontFamily: F }}>APROVAÇÃO</span>
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
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B1, display: 'flex', alignItems: 'center', padding: '0 6px', fontSize: 10, fontWeight: 700, fontFamily: F }}>Nº PEDIDO</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 6px', fontSize: 10, fontWeight: 700, fontFamily: F }}>{noPedido}</div>
        </div>

        {/* HORA */}
        <div style={{ height: H_DIR_HORA, flexShrink: 0, borderBottom: B1, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B1, display: 'flex', alignItems: 'center', padding: '0 6px', fontSize: 10, fontWeight: 700, fontFamily: F }}>HORA</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 6px', fontSize: 10, fontWeight: 700, fontFamily: F }}>{hora}</div>
        </div>

        {/* ENTRADA */}
        <div style={{ height: H_DIR_ENTRADA, flexShrink: 0, borderBottom: B1, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B1, display: 'flex', alignItems: 'center', padding: '0 6px', fontSize: 10, fontWeight: 700, fontFamily: F }}>ENTRADA</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 6px', fontSize: 10, fontWeight: 700, fontFamily: F }}>{entrada}</div>
        </div>

        {/* RETORNO */}
        <div style={{ height: H_DIR_RETORNO, flexShrink: 0, borderBottom: B1, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B1, display: 'flex', alignItems: 'center', padding: '0 6px', fontSize: 10, fontWeight: 700, fontFamily: F }}>RETORNO</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 6px', fontSize: 10, fontWeight: 700, fontFamily: F }}>{retorno}</div>
        </div>

        {/* CONF / NOME */}
        <div style={{ height: H_DIR_CONF, flexShrink: 0, borderBottom: B, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B1, display: 'flex', alignItems: 'center', padding: '0 6px', fontSize: 10, fontWeight: 700, fontFamily: F }}>CONF.</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', fontSize: 10, fontWeight: 700, fontFamily: F }}>NOME</div>
        </div>

        {/* NÚMERO GRANDE */}
        <div style={{ height: H_DIR_NUMERO, flexShrink: 0, borderBottom: B, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 120, fontWeight: 700, lineHeight: 1, fontFamily: F }}>{numero}</span>
        </div>

        {/* AMIDO label */}
        <div style={{ height: H_DIR_AMIDO_LBL, flexShrink: 0, borderBottom: B1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', fontFamily: F }}>AMIDO</span>
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
