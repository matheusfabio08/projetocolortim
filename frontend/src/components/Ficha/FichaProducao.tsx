import React from 'react'
import './FichaProducao.css'

// Medidas extraídas por análise pixel-a-pixel da referência 609E192D (986x719px)
// NUNCA alterar esses valores sem nova análise da imagem original
const W   = 981   // largura total
const H   = 707   // altura total
const ESQ = 353   // largura col esquerda
const CEN = 323   // largura col centro  (ESQ+CEN = 676)
const DIR = 305   // largura col direita

// Alturas zonas esquerda+centro
const H_NOME   = 158
const H_COR    = 170
const H_MAT    = 227  // materiais + vazio
const H_ROD    = 152  // rodapé total
const H_SOLID  = 101  // solidez dentro do rodapé
const H_APROV  = 51   // aprovação dentro do rodapé

// Alturas zonas direita
const H_PEDIDO  = 40
const H_HORA    = 32
const H_ENTRADA = 28
const H_RETORNO = 27
const H_CONF    = 31
const H_NUM     = 170
const H_AMIDO   = 51
const H_SIMNO   = 50
const H_VAZIO   = 278

// Divisória label|valor dentro da coluna direita
const W_LABEL = 139
const W_VALOR = 166

const B  = '2px solid #000'
const B1 = '1px solid #000'
const F  = '"Arial Black", "Arial Bold", Arial, sans-serif'

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

  const s = (o: React.CSSProperties): React.CSSProperties => ({ boxSizing: 'border-box', fontFamily: F, ...o })

  return (
    <div style={s({ display:'flex', width:W, border:B, background:'#fff', overflow:'hidden' })}>

      {/* ══ COL ESQUERDA ══ */}
      <div style={s({ width:ESQ, flexShrink:0, borderRight:B, display:'flex', flexDirection:'column' })}>

        {/* NOME */}
        <div style={s({ height:H_NOME, borderBottom:B, flexShrink:0, display:'flex', alignItems:'flex-start', padding:'10px 12px 0' })}>
          <span style={{ fontSize:50, fontWeight:900, lineHeight:1.1 }}>{nomeCliente}</span>
        </div>

        {/* COR */}
        <div style={s({ height:H_COR, borderBottom:B, flexShrink:0, display:'flex', alignItems:'center', padding:'0 12px' })}>
          <span style={{ fontSize:50, fontWeight:900 }}>{cor}</span>
        </div>

        {/* MATERIAIS + VAZIO */}
        <div style={s({ height:H_MAT, borderBottom:B1, flexShrink:0, padding:'10px 12px', display:'flex', flexDirection:'column', gap:2, overflow:'hidden' })}>
          {materiais.map((m,i) => (
            <p key={i} style={{ margin:0, fontSize:13, fontWeight:700, lineHeight:1.7, whiteSpace:'nowrap' }}>{m}</p>
          ))}
        </div>

        {/* RODAPÉ DESCRIÇÃO */}
        <div style={s({ height:H_ROD, flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', paddingBottom:10 })}>
          <div style={{ width:'65%', height:1.5, background:'#000', marginBottom:5 }} />
          <span style={{ fontSize:13, fontWeight:700 }}>Descrição</span>
        </div>

      </div>

      {/* ══ COL CENTRO ══ */}
      <div style={s({ width:CEN, flexShrink:0, borderRight:B, display:'flex', flexDirection:'column' })}>

        {/* CAIXA BRANCA NOME */}
        <div style={s({ height:H_NOME, borderBottom:B, flexShrink:0 })} />

        {/* CAIXA BRANCA COR */}
        <div style={s({ height:H_COR, borderBottom:B, flexShrink:0 })} />

        {/* CAIXA BRANCA MAT */}
        <div style={s({ height:H_MAT, borderBottom:B1, flexShrink:0 })} />

        {/* RODAPÉ SOLIDEZ */}
        <div style={s({ height:H_SOLID, flexShrink:0, borderBottom:B1, display:'flex', alignItems:'center', padding:'0 20px', gap:14 })}>
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            <div style={{ width:18, height:18, border:B1 }} />
            <div style={{ width:18, height:18, border:B1 }} />
            <div style={{ width:18, height:18, border:B1 }} />
          </div>
          <span style={{ fontSize:13, fontWeight:900 }}>SOLIDEZ</span>
        </div>

        {/* RODAPÉ APROVAÇÃO */}
        <div style={s({ height:H_APROV, flexShrink:0, display:'flex', alignItems:'center', padding:'0 20px', gap:14 })}>
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            <div style={{ width:18, height:18, border:B1 }} />
            <div style={{ width:18, height:18, border:B1 }} />
          </div>
          <span style={{ fontSize:13, fontWeight:900 }}>APROVAÇÃO</span>
        </div>

      </div>

      {/* ══ COL DIREITA ══ */}
      <div style={s({ width:DIR, flexShrink:0, display:'flex', flexDirection:'column' })}>

        {/* N° PEDIDO */}
        <div style={s({ height:H_PEDIDO, flexShrink:0, borderBottom:B1, display:'flex' })}>
          <div style={s({ width:W_LABEL, flexShrink:0, borderRight:B1, display:'flex', alignItems:'center', padding:'0 8px', fontSize:12, fontWeight:900 })}>Nº PEDIDO</div>
          <div style={s({ flex:1, display:'flex', alignItems:'center', justifyContent:'flex-end', padding:'0 8px', fontSize:12, fontWeight:900 })}>{noPedido}</div>
        </div>

        {/* HORA */}
        <div style={s({ height:H_HORA, flexShrink:0, borderBottom:B1, display:'flex' })}>
          <div style={s({ width:W_LABEL, flexShrink:0, borderRight:B1, display:'flex', alignItems:'center', padding:'0 8px', fontSize:12, fontWeight:900 })}>HORA</div>
          <div style={s({ flex:1, display:'flex', alignItems:'center', justifyContent:'flex-end', padding:'0 8px', fontSize:12, fontWeight:900 })}>{hora}</div>
        </div>

        {/* ENTRADA */}
        <div style={s({ height:H_ENTRADA, flexShrink:0, borderBottom:B1, display:'flex' })}>
          <div style={s({ width:W_LABEL, flexShrink:0, borderRight:B1, display:'flex', alignItems:'center', padding:'0 8px', fontSize:12, fontWeight:900 })}>ENTRADA</div>
          <div style={s({ flex:1, display:'flex', alignItems:'center', justifyContent:'flex-end', padding:'0 8px', fontSize:12, fontWeight:900 })}>{entrada}</div>
        </div>

        {/* RETORNO */}
        <div style={s({ height:H_RETORNO, flexShrink:0, borderBottom:B1, display:'flex' })}>
          <div style={s({ width:W_LABEL, flexShrink:0, borderRight:B1, display:'flex', alignItems:'center', padding:'0 8px', fontSize:12, fontWeight:900 })}>RETORNO</div>
          <div style={s({ flex:1, display:'flex', alignItems:'center', justifyContent:'flex-end', padding:'0 8px', fontSize:12, fontWeight:900 })}>{retorno}</div>
        </div>

        {/* CONF. / NOME */}
        <div style={s({ height:H_CONF, flexShrink:0, borderBottom:B, display:'flex' })}>
          <div style={s({ width:W_LABEL, flexShrink:0, borderRight:B1, display:'flex', alignItems:'center', padding:'0 8px', fontSize:12, fontWeight:900 })}>CONF.</div>
          <div style={s({ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 8px', fontSize:12, fontWeight:900 })}>NOME</div>
        </div>

        {/* NÚMERO GRANDE */}
        <div style={s({ height:H_NUM, flexShrink:0, borderBottom:B, display:'flex', alignItems:'center', justifyContent:'center' })}>
          <span style={{ fontSize:130, fontWeight:900, lineHeight:1 }}>{numero}</span>
        </div>

        {/* AMIDO */}
        <div style={s({ height:H_AMIDO, flexShrink:0, borderBottom:B1, display:'flex', alignItems:'center', justifyContent:'center' })}>
          <span style={{ fontSize:14, fontWeight:900, letterSpacing:'0.1em' }}>AMIDO</span>
        </div>

        {/* SIM / NÃO */}
        <div style={s({ height:H_SIMNO, flexShrink:0, borderBottom:B1, display:'flex' })}>
          <div style={s({ flex:1, borderRight:B1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 })}>
            <div style={{ width:16, height:16, border:B1, flexShrink:0 }} />
            <span style={{ fontSize:13, fontWeight:900 }}>SIM</span>
          </div>
          <div style={s({ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 })}>
            <div style={{ width:16, height:16, border:B1, flexShrink:0 }} />
            <span style={{ fontSize:13, fontWeight:900 }}>NÃO</span>
          </div>
        </div>

        {/* VAZIO */}
        <div style={{ height:H_VAZIO, flexShrink:0 }} />

      </div>
    </div>
  )
}

export default FichaProducao
