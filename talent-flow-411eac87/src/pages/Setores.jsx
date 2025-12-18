
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import SectorCard from '../components/setores/SectorCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Folder } from 'lucide-react';

const pastasOficiais = ['Administrativo', 'Jurídico', 'Negociação', 'ControlDesk', 'M.I.S'];

export default function Setores() {
  const { data: todosSetores = [], isLoading: loadingSetores } = useQuery({
    queryKey: ['setores'],
    queryFn: () => base44.entities.Setor.list(),
  });

  const { data: candidatos = [], isLoading: loadingCandidatos } = useQuery({
    queryKey: ['candidatos'],
    queryFn: () => base44.entities.Candidato.list(),
  });

  const setoresFiltrados = React.useMemo(() => {
    if (loadingSetores) return [];
    const setoresUnicos = Array.from(new Map(todosSetores.map(item => [item.nome, item])).values());
    return setoresUnicos.filter(setor => pastasOficiais.includes(setor.nome));
  }, [todosSetores, loadingSetores]);

  const curriculumCounts = React.useMemo(() => {
    if (loadingCandidatos) return {};
    return candidatos.reduce((acc, candidato) => {
      const setor = candidato.setor_destino;
      if (setor) {
        acc[setor] = (acc[setor] || 0) + 1;
      }
      return acc;
    }, {});
  }, [candidatos, loadingCandidatos]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Pastas de Currículos</h1>
          <p className="text-slate-600 mt-1">Navegue e gerencie os currículos por área de destino.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {(loadingSetores || loadingCandidatos) ? (
            Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))
          ) : setoresFiltrados.length > 0 ? (
            setoresFiltrados.map(setor => (
              <SectorCard 
                key={setor.id}
                setor={setor}
                curriculumCount={curriculumCounts[setor.nome] || 0}
              />
            ))
          ) : (
             <div className="col-span-full text-center py-16">
                <Folder className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-800">Nenhuma pasta de currículos encontrada</h3>
                <p className="text-slate-500 mt-2">As pastas de currículos aparecerão aqui.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}
