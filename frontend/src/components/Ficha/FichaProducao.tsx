import React from 'react'
import './FichaProducao.css'

// ============================================================
// MEDIDAS EXTRAIDAS POR ANALISE PIXEL-A-PIXEL DA REFERENCIA
// 609E192D-A37E-4DF1-88FE-8A399B2D6581.jpg (986x719px)
// NAO ALTERAR SEM NOVA ANALISE DA IMAGEM ORIGINAL
// ============================================================
//
// COLUNAS  (bordas V fortes: x=0, 353, 676, 981)
//   ESQ = 353px  |  CEN = 323px  |  DIR = 305px
//
// ESQ: 1 celula principal (y=0→631) + rodape (y=631→707=76px)
//   Nao ha divisorias internas de NOME/COR na ESQ!
//   Textos posicionados por padding:
//     NOME comeca em y≈35 (padding-top)
//     COR comeca em y≈217 (espaço entre NOME e COR = 152px)
//     MAT comeca em y≈384
//
// CEN: 4 celulas empilhadas
//   Caixa 1: y=0→379   (379px) — branca, sem conteudo
//   Caixa 2: y=379→555 (176px) — branca, sem conteudo
//   SOLIDEZ: y=555→656 (101px)
//   APROV:   y=656→707 ( 51px)
//
// DIR: celulas com alturas exatas
//   N°PEDIDO: y=0→40    (40px)  border-bottom: 1px
//   HORA:     y=40→72   (32px)  border-bottom: 1px
//   ENTRADA:  y=72→100  (28px)  border-bottom: 1px
//   RETORNO:  y=100→127 (27px)  border-bottom: 1px
//   CONF/NOM: y=127→158 (31px)  border-bottom: 2px
//   NUMERO:   y=158→328 (170px) border-bottom: 2px
//   AMIDO:    y=328→379 (51px)  border-bottom: 1px
//   SIM/NAO:  y=379→429 (50px)  border-bottom: 1px
//   VAZIO:    y=429→707 (278px)
//   Sub-col: label=139px | valor=166px
// ============================================================

const F = '"Arial Black", "Arial Bold", Arial, sans-serif'
const B  = '2px solid #000'
const B1 = '1px solid #000'

// Larguras de coluna
const W_ESQ = 353
const W_CEN = 323
const W_DIR = 305
const W_LBL = 139  // sub-col label na DIR
const W_VAL = 166  // sub-col valor na DIR

// Alturas ESQ
const H_ESQ_PRINCIPAL = 631
const H_ESQ_RODAPE    = 76

// Alturas CEN
const H_CEN_BRANCA1 = 379
const H_CEN_BRANCA2 = 176
const H_CEN_SOLIDEZ = 101
const H_CEN_APROV   = 51

// Alturas DIR
const H_DIR_PEDIDO  = 40
const H_DIR_HORA    = 32
const H_DIR_ENTRADA = 28
const H_DIR_RETORNO = 27
const H_DIR_CONF    = 31
const H_DIR_NUMERO  = 170
const H_DIR_AMIDO   = 51
const H_DIR_SIMNO   = 50
const H_DIR_VAZIO   = 278

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
      height: H_ESQ_PRINCIPAL + H_ESQ_RODAPE,
      border: B,
      background: '#fff',
      fontFamily: F,
      boxSizing: 'border-box',
      overflow: 'hidden',
      flexShrink: 0,
    }}>

      {/* ══════════════════════════════
           COL ESQUERDA (353px)
          ══════════════════════════════ */}
      <div style={{
        width: W_ESQ,
        height: H_ESQ_PRINCIPAL + H_ESQ_RODAPE,
        flexShrink: 0,
        borderRight: B,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* CELULA PRINCIPAL (0→631) — SEM divisorias internas */}
        <div style={{
          width: '100%',
          height: H_ESQ_PRINCIPAL,
          flexShrink: 0,
          borderBottom: B,
          boxSizing: 'border-box',
          paddingTop: 35,
          paddingLeft: 14,
          paddingRight: 8,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* NOME — posicao topo */}
          <div style={{ marginBottom: 122 }}>
            <span style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, display: 'block' }}>
              {nomeCliente}
            </span>
          </div>

          {/* COR */}
          <div style={{ marginBottom: 137 }}>
            <span style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, display: 'block' }}>
              {cor}
            </span>
          </div>

          {/* MATERIAIS */}
          <div>
            {materiais.map((m, i) => (
              <p key={i} style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 700,
                lineHeight: 1.7,
                whiteSpace: 'nowrap',
              }}>{m}</p>
            ))}
          </div>
        </div>

        {/* RODAPE (631→707 = 76px) */}
        <div style={{
          width: '100%',
          height: H_ESQ_RODAPE,
          flexShrink: 0,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 10,
        }}>
          <div style={{ width: '65%', height: 1.5, background: '#000', marginBottom: 5 }} />
          <span style={{ fontSize: 13, fontWeight: 700 }}>Descrição</span>
        </div>

      </div>

      {/* ══════════════════════════════
           COL CENTRO (323px)
          ══════════════════════════════ */}
      <div style={{
        width: W_CEN,
        height: H_ESQ_PRINCIPAL + H_ESQ_RODAPE,
        flexShrink: 0,
        borderRight: B,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Caixa branca 1 (0→379) */}
        <div style={{ height: H_CEN_BRANCA1, flexShrink: 0, borderBottom: B }} />

        {/* Caixa branca 2 (379→555) */}
        <div style={{ height: H_CEN_BRANCA2, flexShrink: 0, borderBottom: B1 }} />

        {/* SOLIDEZ (555→656) */}
        <div style={{
          height: H_CEN_SOLIDEZ,
          flexShrink: 0,
          borderBottom: B1,
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 14,
          boxSizing: 'border-box',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ width: 18, height: 18, border: B1 }} />
            <div style={{ width: 18, height: 18, border: B1 }} />
            <div style={{ width: 18, height: 18, border: B1 }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 900 }}>SOLIDEZ</span>
        </div>

        {/* APROVACAO (656→707) */}
        <div style={{
          height: H_CEN_APROV,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 14,
          boxSizing: 'border-box',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ width: 18, height: 18, border: B1 }} />
            <div style={{ width: 18, height: 18, border: B1 }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 900 }}>APROVAÇÃO</span>
        </div>

      </div>

      {/* ══════════════════════════════
           COL DIREITA (305px)
          ══════════════════════════════ */}
      <div style={{
        width: W_DIR,
        flexShrink: 0,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* N° PEDIDO (40px) */}
        <div style={{ height: H_DIR_PEDIDO, flexShrink: 0, borderBottom: B1, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B1, display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: 12, fontWeight: 900, fontFamily: F }}>Nº PEDIDO</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 8px', fontSize: 12, fontWeight: 900, fontFamily: F }}>{noPedido}</div>
        </div>

        {/* HORA (32px) */}
        <div style={{ height: H_DIR_HORA, flexShrink: 0, borderBottom: B1, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B1, display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: 12, fontWeight: 900, fontFamily: F }}>HORA</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 8px', fontSize: 12, fontWeight: 900, fontFamily: F }}>{hora}</div>
        </div>

        {/* ENTRADA (28px) */}
        <div style={{ height: H_DIR_ENTRADA, flexShrink: 0, borderBottom: B1, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B1, display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: 12, fontWeight: 900, fontFamily: F }}>ENTRADA</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 8px', fontSize: 12, fontWeight: 900, fontFamily: F }}>{entrada}</div>
        </div>

        {/* RETORNO (27px) */}
        <div style={{ height: H_DIR_RETORNO, flexShrink: 0, borderBottom: B1, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B1, display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: 12, fontWeight: 900, fontFamily: F }}>RETORNO</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 8px', fontSize: 12, fontWeight: 900, fontFamily: F }}>{retorno}</div>
        </div>

        {/* CONF / NOME (31px) — borda FORTE */}
        <div style={{ height: H_DIR_CONF, flexShrink: 0, borderBottom: B, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B1, display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: 12, fontWeight: 900, fontFamily: F }}>CONF.</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px', fontSize: 12, fontWeight: 900, fontFamily: F }}>NOME</div>
        </div>

        {/* NUMERO GRANDE (170px) — borda FORTE */}
        <div style={{ height: H_DIR_NUMERO, flexShrink: 0, borderBottom: B, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 130, fontWeight: 900, lineHeight: 1, fontFamily: F }}>{numero}</span>
        </div>

        {/* AMIDO (51px) */}
        <div style={{ height: H_DIR_AMIDO, flexShrink: 0, borderBottom: B1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: '0.1em', fontFamily: F }}>AMIDO</span>
        </div>

        {/* SIM / NAO (50px) */}
        <div style={{ height: H_DIR_SIMNO, flexShrink: 0, borderBottom: B1, display: 'flex' }}>
          <div style={{ flex: 1, borderRight: B1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <div style={{ width: 16, height: 16, border: B1, flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 900, fontFamily: F }}>SIM</span>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <div style={{ width: 16, height: 16, border: B1, flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 900, fontFamily: F }}>NÃO</span>
          </div>
        </div>

        {/* VAZIO (278px) */}
        <div style={{ height: H_DIR_VAZIO, flexShrink: 0 }} />

      </div>
    </div>
  )
}

export default FichaProducao
