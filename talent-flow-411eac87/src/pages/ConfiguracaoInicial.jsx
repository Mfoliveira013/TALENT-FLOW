import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Briefcase, Save, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const cargoDescriptions = {
  rh: 'Acesso total a todos os currículos e visibilidade dos recrutamentos para ambos os prédios (Sede NEF e NEF Soluções).',
  assistente_rh: 'Acesso às pastas de currículos e à informação sobre em qual prédio os candidatos recrutados estão sendo alocados.',
  recrutador: 'Acesso para subir e analisar currículos. Não terá visibilidade sobre para qual prédio o candidato recrutado será designado.',
  departamento_pessoal: 'Acesso aos currículos dos candidatos selecionados e aos currículos dos colaboradores desligados.',
  colaborador: 'Acesso básico ao sistema (conforme sua Filial e Setor de Trabalho).'
};

const cargoLabels = {
  rh: 'RH (Recursos Humanos)',
  assistente_rh: 'Assistente de RH',
  recrutador: 'Recrutador',
  departamento_pessoal: 'Departamento Pessoal',
  colaborador: 'Colaborador/Usuário'
};

export default function ConfiguracaoInicial() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    departamento: '',
    filial: '',
    cargo: ''
  });

  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: setores, isLoading: loadingSetores } = useQuery({
    queryKey: ['setores'],
    queryFn: () => base44.entities.Setor.list(),
  });

  const { data: filiais, isLoading: loadingFiliais } = useQuery({
    queryKey: ['filiais'],
    queryFn: () => base44.entities.Filial.list(),
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, full_name: user.full_name || '' }));
    }
  }, [user]);

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      navigate(createPageUrl('Setores'));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserMutation.mutate({ ...formData, setup_completo: true });
  };

  const isFormInvalid = !formData.full_name || !formData.departamento || !formData.filial || !formData.cargo;
  const isLoading = loadingUser || loadingSetores || loadingFiliais;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                <Briefcase className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold">Complete seu Cadastro</CardTitle>
          </div>
          <CardDescription className="text-base">
            Para garantir que você tenha a melhor experiência e o nível de acesso correto, por favor, preencha os campos abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo *</Label>
                  <Input 
                    id="full_name" 
                    value={formData.full_name} 
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setor">Setor de Trabalho *</Label>
                  <Select onValueChange={value => setFormData({...formData, departamento: value})} required>
                    <SelectTrigger id="setor">
                      <SelectValue placeholder="Selecione seu setor" />
                    </SelectTrigger>
                    <SelectContent>
                      {setores?.map(setor => <SelectItem key={setor.id} value={setor.nome}>{setor.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filial">Filial *</Label>
                  <Select onValueChange={value => setFormData({...formData, filial: value})} required>
                    <SelectTrigger id="filial">
                      <SelectValue placeholder="Selecione sua filial" />
                    </SelectTrigger>
                    <SelectContent>
                      {filiais?.map(filial => <SelectItem key={filial.id} value={filial.nome}>{filial.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo">Tipo de Conta / Cargo *</Label>
                  <Select onValueChange={value => setFormData({...formData, cargo: value})} required>
                    <SelectTrigger id="cargo">
                      <SelectValue placeholder="Selecione seu cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(cargoLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.cargo && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-700" />
                  <AlertTitle className="text-blue-800">Acessos e Funcionalidades</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    {cargoDescriptions[formData.cargo]}
                  </AlertDescription>
                </Alert>
              )}
              
              <CardFooter className="p-0 pt-6 flex justify-end">
                <Button type="submit" disabled={isFormInvalid || updateUserMutation.isPending} className="w-full md:w-auto">
                  {updateUserMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar e Acessar Painel
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}