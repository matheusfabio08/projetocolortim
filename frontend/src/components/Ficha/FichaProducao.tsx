import React from 'react'
import './FichaProducao.css'

const F  = "Cambria, 'Book Antiqua', Georgia, serif"
const B  = '2px solid #000'
const B1 = '1px solid #000'

const W_TOTAL = 955
const H_TOTAL = 540

const W_ESQ = 353
const W_CEN = 335
const W_DIR = W_TOTAL - W_ESQ - W_CEN

const W_LBL = Math.round(W_DIR * 0.55)

// Celula principal ESQ: altura total menos rodape (110)
const H_ESQ_MAIN   = 430
const H_ESQ_FOOTER = H_TOTAL - H_ESQ_MAIN // 110

// Cada metade onde cliente e cor ficam centrados
const HALF = Math.floor(H_ESQ_MAIN / 2) // 215

// Zona dos materiais: espaco restante abaixo da cor ate o fim da celula
// Materiais ficam na segunda metade, porem afastados da cor (proximo ao fundo)
const H_MAT_ZONE = HALF  // reutilizada abaixo

// COL CENTRO: vazio menor para a linha nao cair em cima da caixa do footer
const H_CEN_VAZIO   = 400  // era 430, sobe 30px
const H_CEN_SOLIDEZ = 55
const H_CEN_APROV   = H_TOTAL - H_CEN_VAZIO - H_CEN_SOLIDEZ

const H_DIR_PEDIDO    = 30
const H_DIR_HORA      = 26
const H_DIR_ENTRADA   = 26
const H_DIR_RETORNO   = 26
const H_DIR_CONF      = 28
const H_DIR_NUMERO    = 180
const H_DIR_AMIDO_LBL = 22
const H_DIR_AMIDO_OPT = 30
const H_DIR_VAZIO     = H_TOTAL - H_DIR_PEDIDO - H_DIR_HORA - H_DIR_ENTRADA
  - H_DIR_RETORNO - H_DIR_CONF - H_DIR_NUMERO - H_DIR_AMIDO_LBL - H_DIR_AMIDO_OPT

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
      border: B,
      background: '#fff',
      fontFamily: F,
      boxSizing: 'border-box',
      overflow: 'hidden',
      flexShrink: 0,
    }}>

      {/* === COL ESQUERDA === */}
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

          {/* METADE SUPERIOR: cliente centralizado verticalmente */}
          <div style={{
            height: HALF,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 14,
            paddingRight: 8,
          }}>
            <span style={{
              fontSize: 48,
              fontWeight: 700,
              lineHeight: 1.15,
              fontFamily: F,
            }}>
              {nomeCliente}
            </span>
          </div>

          {/* METADE INFERIOR: cor no topo da metade + materiais no fundo */}
          <div style={{
            height: HALF,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            paddingLeft: 14,
            paddingRight: 8,
          }}>

            {/* Cor: centralizada verticalmente na parte superior da metade (top 30%) */}
            <div style={{
              flex: '0 0 auto',
              height: Math.floor(HALF * 0.45),
              display: 'flex',
              alignItems: 'center',
            }}>
              <span style={{
                fontSize: 48,
                fontWeight: 700,
                lineHeight: 1.15,
                fontFamily: F,
              }}>
                {cor}
              </span>
            </div>

            {/* Materiais: afastados da cor, alinhados ao fundo da metade */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              paddingBottom: 12,
            }}>
              {materiais.map((m, i) => (
                <p key={i} style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 400,
                  lineHeight: 1.8,
                  whiteSpace: 'nowrap',
                  fontFamily: F,
                }}>{m}</p>
              ))}
            </div>

          </div>
        </div>

        {/* Rodape Descricao */}
        <div style={{
          height: H_ESQ_FOOTER,
          flexShrink: 0,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 14,
        }}>
          <div style={{ width: '55%', height: 1, background: '#000', marginBottom: 6 }} />
          <span style={{ fontSize: 12, fontWeight: 700, fontFamily: F }}>Descrição</span>
        </div>
      </div>

      {/* === COL CENTRO === */}
      <div style={{
        width: W_CEN,
        height: H_TOTAL,
        flexShrink: 0,
        borderRight: B,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Vazio reduzido para a linha subir */}
        <div style={{ height: H_CEN_VAZIO, flexShrink: 0, borderBottom: B1 }} />

        {/* SOLIDEZ */}
        <div style={{
          height: H_CEN_SOLIDEZ,
          flexShrink: 0,
          borderBottom: B1,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          gap: 12,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[0,1,2,3].map(i => <div key={i} style={{ width: 14, height: 14, border: B1 }} />)}
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, fontFamily: F }}>SOLIDEZ</span>
        </div>

        {/* APROVACAO */}
        <div style={{
          height: H_CEN_APROV,
          flexShrink: 0,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          gap: 12,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[0,1].map(i => <div key={i} style={{ width: 14, height: 14, border: B1 }} />)}
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, fontFamily: F }}>APROVAÇÃO</span>
        </div>
      </div>

      {/* === COL DIREITA === */}
      <div style={{
        width: W_DIR,
        flexShrink: 0,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ height: H_DIR_PEDIDO, flexShrink: 0, borderBottom: B1, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, fontFamily: F }}>Nº PEDIDO</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, fontFamily: F }}>{noPedido}</div>
        </div>
        <div style={{ height: H_DIR_HORA, flexShrink: 0, borderBottom: B1, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, fontFamily: F }}>HORA</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, fontFamily: F }}>{hora}</div>
        </div>
        <div style={{ height: H_DIR_ENTRADA, flexShrink: 0, borderBottom: B1, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, fontFamily: F }}>ENTRADA</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, fontFamily: F }}>{entrada}</div>
        </div>
        <div style={{ height: H_DIR_RETORNO, flexShrink: 0, borderBottom: B1, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, fontFamily: F }}>RETORNO</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, fontFamily: F }}>{retorno}</div>
        </div>
        <div style={{ height: H_DIR_CONF, flexShrink: 0, borderBottom: B, display: 'flex' }}>
          <div style={{ width: W_LBL, flexShrink: 0, borderRight: B1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, fontFamily: F }}>CONF.</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, fontFamily: F }}>NOME</div>
        </div>
        <div style={{ height: H_DIR_NUMERO, flexShrink: 0, borderBottom: B, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <span style={{ fontSize: 140, fontWeight: 700, lineHeight: 1, fontFamily: F }}>{numero}</span>
        </div>
        <div style={{ height: H_DIR_AMIDO_LBL, flexShrink: 0, borderBottom: B1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', fontFamily: F }}>AMIDO</span>
        </div>
        <div style={{ height: H_DIR_AMIDO_OPT, flexShrink: 0, borderBottom: B1, display: 'flex' }}>
          <div style={{ flex: 1, borderRight: B1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <div style={{ width: 14, height: 14, border: B1, flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: F }}>SIM</span>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <div style={{ width: 14, height: 14, border: B1, flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: F }}>NÃO</span>
          </div>
        </div>
        <div style={{ height: H_DIR_VAZIO, flexShrink: 0 }} />
      </div>

    </div>
  )
}

export default FichaProducao
