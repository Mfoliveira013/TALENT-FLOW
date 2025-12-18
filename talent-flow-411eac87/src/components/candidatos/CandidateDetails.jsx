
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Edit, Trash2, Save, XCircle, Loader2, Lightbulb, CalendarPlus } from "lucide-react";

const setoresCargos = {
  "M.I.S": ["Analista de Sistemas", "Desenvolvedor de Software", "Suporte Técnico"],
  "ControlDesk": ["Analista de Controle", "Assistente de Monitoramento", "Operador de Sistema"],
  "Administrativo": ["Auxiliar Administrativo", "Assistente Administrativo", "Recepcionista", "Assistente Financeiro", "Assistente de RH", "Estagiário Administrativo"],
  "Jurídico": ["Advogado Bacharel", "Assistente Jurídico", "Advogado OAB", "Advogado Júnior", "Advogado Pleno", "Advogado Sênior"],
  "Negociação": ["Negociador", "Estágio Nível Médio", "Estágio Nível Superior", "Líder de Equipe"]
};

export default function CandidateDetails({ candidato, onClose, onDelete }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(candidato);

  const { data: currentUser } = useQuery({
      queryKey: ['currentUser'],
      queryFn: () => base44.auth.me()
  });

  useEffect(() => {
    setEditedData(candidato);
    setIsEditing(false);
  }, [candidato]);

  const { data: setoresDestino = [] } = useQuery({
    queryKey: ['setores'],
    queryFn: () => base44.entities.Setor.list(),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Candidato.update(candidato.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidatos'] });
      setIsEditing(false);
      onClose();
    },
  });

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSave = () => {
    // Garante que o cargo pretendido seja o mesmo que o sugerido/editado
    const dataToSave = { ...editedData, cargo_pretendido: editedData.cargo_sugerido };
    updateMutation.mutate(dataToSave);
  };
  
  const handleDelete = () => {
    if (window.confirm(`Deseja realmente excluir o currículo de ${candidato.nome_completo}?`)) {
        onDelete();
    }
  }

  const cargosDisponiveis = editedData.setor_destino ? setoresCargos[editedData.setor_destino] || [] : [];

  const canSchedule = currentUser?.role === 'admin' || currentUser?.setor_interno === 'Recursos Humanos';

  return (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">{editedData.nome_completo}</h2>
        
        {editedData.compatibilidade && (
            <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                <Lightbulb className="h-4 w-4 text-blue-700" />
                <AlertTitle className="font-bold">Análise da IA</AlertTitle>
                <AlertDescription>
                    Baseado no currículo, sugerimos o setor e cargo abaixo.
                </AlertDescription>
                <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold">Compatibilidade</span>
                        <span className="text-xs font-bold">{editedData.compatibilidade}%</span>
                    </div>
                    <Progress value={editedData.compatibilidade} className="h-2"/>
                </div>
            </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="nome_completo">Nome Completo</Label>
                <Input id="nome_completo" value={editedData.nome_completo} onChange={(e) => handleInputChange('nome_completo', e.target.value)} disabled={!isEditing} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={editedData.email} onChange={(e) => handleInputChange('email', e.target.value)} disabled={!isEditing} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" value={editedData.telefone || ''} onChange={(e) => handleInputChange('telefone', e.target.value)} disabled={!isEditing} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="setor_destino">Setor Destino (Pasta)</Label>
                <Select value={editedData.setor_destino || ''} onValueChange={(value) => handleInputChange('setor_destino', value)} disabled={!isEditing}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione a pasta de destino" />
                    </SelectTrigger>
                    <SelectContent>
                    {setoresDestino.map(setor => (
                        <SelectItem key={setor.id} value={setor.nome}>{setor.nome}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label htmlFor="cargo_sugerido">Cargo Pretendido / Sugerido</Label>
                <Select value={editedData.cargo_sugerido || ''} onValueChange={(value) => handleInputChange('cargo_sugerido', value)} disabled={!isEditing || cargosDisponiveis.length === 0}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent>
                    {cargosDisponiveis.map(cargo => (
                        <SelectItem key={cargo} value={cargo}>{cargo}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="observacoes">Resumo / Observações</Label>
            <Textarea id="observacoes" value={editedData.observacoes || ''} onChange={(e) => handleInputChange('observacoes', e.target.value)} rows={8} disabled={!isEditing} className="whitespace-pre-wrap" />
        </div>
        
        <div className="flex justify-between items-center gap-3 pt-4 border-t">
             {isEditing ? (
                <div className="flex justify-end w-full gap-3">
                    <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={updateMutation.isPending}>
                        <XCircle className="w-4 h-4 mr-2" /> Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Salvar Alterações
                    </Button>
                </div>
             ) : (
                <>
                    {canSchedule && (
                        <Button asChild className="bg-blue-600 hover:bg-blue-700">
                          <Link to={createPageUrl(`Agenda?candidato_id=${candidato.id}`)}>
                            <CalendarPlus className="w-4 h-4 mr-2" />
                            Currículo analisado — Agendar Entrevista
                          </Link>
                        </Button>
                    )}
                    <div className="flex gap-3 ml-auto">
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="w-4 h-4 mr-2" /> Excluir
                        </Button>
                        <Button variant="outline" onClick={() => window.open(candidato.curriculo_url, '_blank')}>
                            Ver Currículo
                        </Button>
                        <Button onClick={() => setIsEditing(true)}>
                            <Edit className="w-4 h-4 mr-2" /> Editar
                        </Button>
                    </div>
                </>
             )}
        </div>
    </div>
  );
}
