import { BrowserRouter, Routes, Route } from 'react-router';

function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>{title}</h1>
      <p>Estrutura base criada. Migração das telas com layout original será encaixada sobre este esqueleto.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Placeholder title="Login" />} />
        <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
        <Route path="/almoxarifado" element={<Placeholder title="Almoxarifado" />} />
        <Route path="/preparacao" element={<Placeholder title="Preparação" />} />
        <Route path="/preparacao-lote" element={<Placeholder title="Preparação em Lote" />} />
        <Route path="/producao" element={<Placeholder title="Produção" />} />
        <Route path="/secadora" element={<Placeholder title="Secadora" />} />
        <Route path="/destrinchagem" element={<Placeholder title="Destrinchagem" />} />
        <Route path="/enrolagem" element={<Placeholder title="Enrolagem" />} />
        <Route path="/qualidade" element={<Placeholder title="Qualidade" />} />
        <Route path="/qualidade-malhas" element={<Placeholder title="Qualidade de Malhas" />} />
        <Route path="/laboratorio" element={<Placeholder title="Laboratório" />} />
        <Route path="/pesagem" element={<Placeholder title="Pesagem" />} />
        <Route path="/box4" element={<Placeholder title="Box 4" />} />
        <Route path="/box5" element={<Placeholder title="Box 5" />} />
        <Route path="/box6" element={<Placeholder title="Box 6" />} />
        <Route path="/pcp" element={<Placeholder title="PCP" />} />
        <Route path="/gerenciamento" element={<Placeholder title="Gerenciamento" />} />
        <Route path="/admin" element={<Placeholder title="Admin" />} />
        <Route path="/configuracoes" element={<Placeholder title="Configurações" />} />
        <Route path="/op/:id" element={<Placeholder title="Detalhes da OP" />} />
      </Routes>
    </BrowserRouter>
  );
}
