
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  ArrowLeft
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import CandidateCard from "../components/candidatos/CandidateCard";
import CandidateDetails from "../components/candidatos/CandidateDetails";

const setoresCargos = {
  "M.I.S": ["Analista de Sistemas", "Desenvolvedor de Software", "Suporte Técnico"],
  "ControlDesk": ["Analista de Controle", "Assistente de Monitoramento", "Operador de Sistema"],
  "Administrativo": ["Auxiliar Administrativo", "Assistente Administrativo", "Recepcionista", "Assistente Financeiro", "Assistente de RH", "Estagiário Administrativo"],
  "Jurídico": ["Advogado Bacharel", "Assistente Jurídico", "Advogado OAB", "Advogado Júnior", "Advogado Pleno", "Advogado Sênior"],
  "Negociação": ["Negociador", "Estágio Nível Médio", "Estágio Nível Superior", "Líder de Equipe"]
};

const setorLabels = {
  Administrativo: "Administrativo",
  Jurídico: "Jurídico",
  Negociação: "Negociação",
  ControlDesk: "ControlDesk",
};

const statusLabels = {
  "Em análise": "Em análise",
  Aprovado: "Aprovado",
  Reprovado: "Reprovado",
  Contratado: "Contratado"
};

export default function Candidatos() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [setorFilter, setSetorFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [cargoFilter, setCargoFilter] = useState("todos");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [pageMode, setPageMode] = useState('candidatos'); // 'candidatos' or 'entrevistados'

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const setor = params.get('setor_destino');
    const status = params.get('status');

    if (setor && setorLabels[setor]) {
      setSetorFilter(setor);
      setCurrentFolder(setor);
    } else {
      setCurrentFolder(null);
      setSetorFilter("todos");
    }

    if (status === 'Entrevistado') {
      setStatusFilter(status);
      setPageMode('entrevistados');
    } else {
      setStatusFilter("todos");
      setPageMode('candidatos');
    }
  }, [location.search]);

  const queryClient = useQueryClient();

  const { data: candidatos = [], isLoading } = useQuery({
    queryKey: ['candidatos'],
    queryFn: () => base44.entities.Candidato.list('-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Candidato.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidatos'] });
      setShowDetails(false);
    },
  });

  const filteredCandidatos = candidatos.filter(candidato => {
    const matchesSearch = candidato.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidato.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSetor = setorFilter === "todos" || candidato.setor_destino === setorFilter;
    const matchesStatus = statusFilter === "todos" || candidato.status === statusFilter;
    const matchesCargo = cargoFilter === "todos" || candidato.cargo_pretendido === cargoFilter;
    return matchesSearch && matchesSetor && matchesStatus && matchesCargo;
  });

  const handleViewDetails = (candidato) => {
    setSelectedCandidate(candidato);
    setShowDetails(true);
  };

  const cargosDisponiveis = React.useMemo(() => {
    if (setorFilter && setorFilter !== 'todos' && setoresCargos[setorFilter]) {
        return setoresCargos[setorFilter];
    }
    return [];
  }, [setorFilter]);

  useEffect(() => {
    // Reset cargo filter if setor changes and the selected cargo is not in the new list
    if (cargoFilter !== 'todos' && !cargosDisponiveis.includes(cargoFilter)) {
        setCargoFilter('todos');
    }
  }, [setorFilter, cargosDisponiveis, cargoFilter]);


  const getPageTitle = () => {
    if (pageMode === 'entrevistados') {
      return currentFolder ? `Entrevistados: ${currentFolder}` : "Candidatos Entrevistados";
    }
    return currentFolder ? `Pasta: ${currentFolder}` : "Candidatos";
  };
  
  const getPageDescription = () => {
     if (pageMode === 'entrevistados') {
      return `Gerencie os candidatos entrevistados da pasta ${currentFolder || 'geral'}`;
    }
    return currentFolder
      ? `Gerencie os candidatos da pasta ${currentFolder}`
      : "Gerencie todos os candidatos do banco de talentos";
  }

  const getBackButtonUrl = () => {
    return pageMode === 'entrevistados' ? createPageUrl("Entrevistados") : createPageUrl("Setores");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            {currentFolder && (
              <Button variant="ghost" onClick={() => navigate(getBackButtonUrl())} className="mb-2 -ml-4 text-slate-600 hover:text-slate-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Pastas
              </Button>
            )}
            <h1 className="text-3xl font-bold text-slate-900">
              {getPageTitle()}
            </h1>
            <p className="text-slate-600 mt-1">
              {getPageDescription()}
            </p>
          </div>
          <Link to={createPageUrl("Upload")}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Adicionar Novo
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative md:col-span-2 lg:col-span-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={setorFilter} onValueChange={setSetorFilter} disabled={!!currentFolder}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Setores</SelectItem>
                  {Object.entries(setorLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={cargoFilter} onValueChange={setCargoFilter} disabled={setorFilter === 'todos'}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Cargos</SelectItem>
                  {cargosDisponiveis.map((cargo) => (
                    <SelectItem key={cargo} value={cargo}>{cargo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Filter className="w-4 h-4" />
          <span>
            Exibindo {filteredCandidatos.length} de {candidatos.length} candidatos
          </span>
        </div>

        {/* Candidates Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="border-none shadow-lg">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-48 mb-4" />
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-4 w-40" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCandidatos.length === 0 ? (
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Nenhum candidato encontrado
              </h3>
              <p className="text-slate-500">
                Tente ajustar os filtros ou adicione novos candidatos
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidatos.map((candidato) => (
              <CandidateCard
                key={candidato.id}
                candidato={candidato}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {/* Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Candidato</DialogTitle>
            </DialogHeader>
            {selectedCandidate && (
              <CandidateDetails
                candidato={selectedCandidate}
                onClose={() => setShowDetails(false)}
                onDelete={() => deleteMutation.mutate(selectedCandidate.id)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
