import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Edit, X, Sun, Moon, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function MeuPerfil() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', cargo: '' });

  const { data: user, isLoading } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  useEffect(() => {
    if (user) {
      setFormData({ full_name: user.full_name || '', cargo: user.cargo || '' });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setIsEditing(false);
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };
  
  const handleThemeChange = (isDark) => {
    updateMutation.mutate({ tema: isDark ? 'escuro' : 'claro' });
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Meu Perfil</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas informações pessoais e configurações.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Estes são seus dados no sistema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input id="full_name" value={formData.full_name} disabled={!isEditing} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email} disabled />
              </div>
              <div>
                <Label htmlFor="cargo">Cargo</Label>
                <Input id="cargo" value={formData.cargo} disabled={!isEditing} onChange={e => setFormData({...formData, cargo: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="setor">Setor</Label>
                <Input id="setor" value={user?.setor_interno} disabled />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {isEditing ? (
                <>
                  <Button variant="ghost" onClick={() => setIsEditing(false)}><X className="mr-2 h-4 w-4"/>Cancelar</Button>
                  <Button onClick={handleSave} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                    Salvar
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4"/>Editar</Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
            <CardDescription>Personalize sua experiência no sistema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Tema Escuro</Label>
                  <p className="text-sm text-muted-foreground">Ative para uma experiência visual com cores escuras.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Sun className="h-5 w-5" />
                    <Switch checked={user?.tema === 'escuro'} onCheckedChange={handleThemeChange} />
                    <Moon className="h-5 w-5" />
                </div>
            </div>
             <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Alterar Senha</Label>
                  <p className="text-sm text-muted-foreground">Para alterar sua senha, utilize a opção "Esqueci minha senha" na tela de login.</p>
                </div>
                <Button variant="outline" disabled>Segurança</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}