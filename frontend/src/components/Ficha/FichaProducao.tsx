import React from 'react';
import './FichaProducao.css';

interface FichaProducaoProps {
  nomeCliente?: string;
  cor?: string;
  noPedido?: string;
  hora?: string;
  entrada?: string;
  retorno?: string;
  conf?: string;
  numero?: string | number;
  especificacoes?: string;
  materiais?: string[];
  descricao?: string;
  solidez?: boolean[];
  aprovacao?: boolean[];
}

const FichaProducao: React.FC<FichaProducaoProps> = ({
  nomeCliente = 'NOME CLIENTE',
  cor = 'COR',
  noPedido = '',
  hora = '',
  entrada = '',
  retorno = '',
  conf = '',
  numero = '11',
  especificacoes = '',
  materiais = [
    'ELASTICO PA 13MM:2M OP- 01',
    'RENDA PA 60MM: 1,5M OP - 02',
  ],
  descricao = '',
}) => {
  return (
    <div className="ficha">

      {/* NOME CLIENTE */}
      <div className="ficha__nome-cliente">
        <span>{nomeCliente}</span>
      </div>

      {/* Linha vertical x=350 (y=0..379) */}
      <div className="ficha__linha-v-350" />

      {/* COR */}
      <div className="ficha__cor">
        <span>{cor}</span>
      </div>

      {/* MATERIAIS */}
      <div className="ficha__materiais">
        {materiais.map((m, i) => (
          <p key={i}>{m}</p>
        ))}
      </div>

      {/* DESCRIÇÃO */}
      <div className="ficha__descricao">
        <span>{descricao || 'DESCRIÇÃO'}</span>
      </div>

      {/* ÁREA LABELS borda direita */}
      <div className="ficha__labels-area" />

      {/* CAIXINHAS SOLIDEZ */}
      <div className="ficha__box ficha__bs1" />
      <div className="ficha__box ficha__bs2" />
      <div className="ficha__box ficha__bs3" />
      <span className="ficha__label-solidez">SOLIDEZ</span>

      {/* CAIXINHAS APROVAÇÃO */}
      <div className="ficha__box ficha__ba1" />
      <div className="ficha__box ficha__ba2" />
      <span className="ficha__label-aprov">APROVAÇÃO</span>

      {/* TABELA DIREITA */}
      <div className="ficha__tl ficha__r1"><span className="ficha__lbl">Nº PEDIDO</span></div>
      <div className="ficha__tv ficha__r1"><span className="ficha__val">{noPedido}</span></div>

      <div className="ficha__tl ficha__r2"><span className="ficha__lbl">HORA</span></div>
      <div className="ficha__tv ficha__r2"><span className="ficha__val">{hora}</span></div>

      <div className="ficha__tl ficha__r3"><span className="ficha__lbl">ENTRADA</span></div>
      <div className="ficha__tv ficha__r3"><span className="ficha__val">{entrada}</span></div>

      <div className="ficha__tl ficha__r4"><span className="ficha__lbl">RETORNO</span></div>
      <div className="ficha__tv ficha__r4"><span className="ficha__val">{retorno}</span></div>

      <div className="ficha__tl ficha__r5"><span className="ficha__lbl">CONF.</span></div>
      <div className="ficha__tv ficha__r5"><span className="ficha__val">{conf}</span></div>

      {/* NÚMERO GRANDE */}
      <div className="ficha__numero-grande">
        <span>{numero}</span>
      </div>

      {/* ESPECIFICAÇÕES */}
      <div className="ficha__especificacoes">
        <span>{especificacoes || 'ESPECIFICAÇÕES'}</span>
      </div>

    </div>
  );
};

export default FichaProducao;
