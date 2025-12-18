import Layout from "./Layout.jsx";

import Candidatos from "./Candidatos";

import Upload from "./Upload";

import Agenda from "./Agenda";

import Setores from "./Setores";

import ConfiguracaoInicial from "./ConfiguracaoInicial";

import Equipe from "./Equipe";

import MeuPerfil from "./MeuPerfil";

import Dashboard from "./Dashboard";

import Entrevistados from "./Entrevistados";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Candidatos: Candidatos,
    
    Upload: Upload,
    
    Agenda: Agenda,
    
    Setores: Setores,
    
    ConfiguracaoInicial: ConfiguracaoInicial,
    
    Equipe: Equipe,
    
    MeuPerfil: MeuPerfil,
    
    Dashboard: Dashboard,
    
    Entrevistados: Entrevistados,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Candidatos />} />
                
                
                <Route path="/Candidatos" element={<Candidatos />} />
                
                <Route path="/Upload" element={<Upload />} />
                
                <Route path="/Agenda" element={<Agenda />} />
                
                <Route path="/Setores" element={<Setores />} />
                
                <Route path="/ConfiguracaoInicial" element={<ConfiguracaoInicial />} />
                
                <Route path="/Equipe" element={<Equipe />} />
                
                <Route path="/MeuPerfil" element={<MeuPerfil />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Entrevistados" element={<Entrevistados />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}