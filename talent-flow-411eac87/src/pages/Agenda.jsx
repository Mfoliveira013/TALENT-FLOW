
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import CalendarView from "../components/agenda/CalendarView";
import InterviewForm from "../components/agenda/InterviewForm";
import InterviewList from "../components/agenda/InterviewList";

export default function Agenda() {
  const [showForm, setShowForm] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [preselectedCandidatoId, setPreselectedCandidatoId] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const candidatoId = urlParams.get('candidato_id');
    if (candidatoId) {
      setPreselectedCandidatoId(candidatoId);
      setShowForm(true);
    }
  }, []);

  const { data: entrevistas = [], isLoading: loadingEntrevistas } = useQuery({
    queryKey: ['entrevistas'],
    queryFn: () => base44.entities.Entrevista.list('-data_hora'),
    initialData: [],
  });

  const { data: candidatos = [] } = useQuery({
    queryKey: ['candidatos'],
    queryFn: () => base44.entities.Candidato.list(),
    initialData: [],
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const updateCandidateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Candidato.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidatos'] });
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Entrevista.create(data),
    onSuccess: async (newEntrevista) => {
      queryClient.invalidateQueries({ queryKey: ['entrevistas'] });
      
      // Mudar status do candidato para "Entrevista Agendada"
      updateCandidateStatusMutation.mutate({ id: newEntrevista.candidato_id, status: 'Entrevista Agendada' });

      // Send reminder email
      const candidato = candidatos.find(c => c.id === newEntrevista.candidato_id);
      if (candidato) {
        await base44.integrations.Core.SendEmail({
          to: candidato.email,
          subject: `Entrevista Agendada - ${format(new Date(newEntrevista.data_hora), "dd/MM/yyyy 'às' HH:mm")}`,
          body: `Olá ${candidato.nome_completo},\n\nSua entrevista foi agendada!\n\nData: ${format(new Date(newEntrevista.data_hora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}\nTipo: ${newEntrevista.local_tipo}\nLocal/Link: ${newEntrevista.local_detalhes}\nRecrutador: ${newEntrevista.recrutador_nome}\n\nAguardamos você!\n\nAtenciosamente,\nEquipe BTNEF`
        });
      }
      
      setShowForm(false);
      setSelectedInterview(null);
      setPreselectedCandidatoId(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Entrevista.update(id, data),
    onSuccess: (updatedEntrevista) => {
      queryClient.invalidateQueries({ queryKey: ['entrevistas'] });

      // Mover candidato para "Entrevistados" se a entrevista foi realizada
      if (updatedEntrevista.status === 'realizada') {
        updateCandidateStatusMutation.mutate({ id: updatedEntrevista.candidato_id, status: 'Entrevistado' });
      }

      setShowForm(false);
      setSelectedInterview(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Entrevista.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrevistas'] });
      setShowForm(false);
      setSelectedInterview(null);
    },
  });

  const handleSubmit = (data) => {
    const entrevistaData = {
      ...data,
      recrutador_email: user?.email,
      recrutador_nome: user?.full_name,
    };

    if (selectedInterview) {
      updateMutation.mutate({ 
        id: selectedInterview.id, 
        data: entrevistaData 
      });
    } else {
      createMutation.mutate(entrevistaData);
    }
  };

  const handleEdit = (entrevista) => {
    setSelectedInterview(entrevista);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta entrevista?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Agenda de Entrevistas</h1>
            <p className="text-slate-600 mt-1">
              Gerencie e acompanhe todas as entrevistas agendadas
            </p>
          </div>
          <Button 
            onClick={() => {
              setSelectedInterview(null);
              setPreselectedCandidatoId(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Entrevista
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CalendarView 
              entrevistas={entrevistas}
              isLoading={loadingEntrevistas}
              onSelectInterview={handleEdit}
            />
          </div>
          <div>
            <InterviewList
              entrevistas={entrevistas}
              isLoading={loadingEntrevistas}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>

        {/* Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedInterview ? 'Editar Entrevista' : 'Nova Entrevista'}
              </DialogTitle>
            </DialogHeader>
            <InterviewForm
              interview={selectedInterview}
              candidatos={candidatos}
              preselectedCandidatoId={preselectedCandidatoId}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setSelectedInterview(null);
                setPreselectedCandidatoId(null);
              }}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
