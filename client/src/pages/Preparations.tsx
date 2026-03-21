import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPreparationSchema, PREP_STATUS_OPTIONS, STAFF_OPTIONS, type Preparation, type InsertPreparation } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, FlaskConical } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  "En attente": "bg-yellow-100 text-yellow-800",
  "En cours": "bg-blue-100 text-blue-800",
  "Prête": "bg-green-100 text-green-800",
  "Livrée": "bg-slate-100 text-slate-700",
};

export default function Preparations() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPrep, setEditPrep] = useState<Preparation | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: preparations = [], isLoading } = useQuery<Preparation[]>({
    queryKey: ["/api/preparations"],
  });

  const form = useForm<InsertPreparation>({
    resolver: zodResolver(insertPreparationSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      patientName: "",
      preparationType: "",
      description: "",
      preparedBy: "",
      status: "En attente",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertPreparation) => apiRequest("POST", "/api/preparations", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preparations"] });
      toast({ title: "Préparation ajoutée avec succès" });
      setDialogOpen(false);
      form.reset();
    },
    onError: () => toast({ title: "Erreur lors de l'ajout", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertPreparation> }) =>
      apiRequest("PATCH", `/api/preparations/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preparations"] });
      toast({ title: "Préparation mise à jour" });
      setDialogOpen(false);
      setEditPrep(null);
      form.reset();
    },
    onError: () => toast({ title: "Erreur lors de la mise à jour", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/preparations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preparations"] });
      toast({ title: "Préparation supprimée" });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Erreur lors de la suppression", variant: "destructive" }),
  });

  function openAdd() {
    setEditPrep(null);
    form.reset({
      date: new Date().toISOString().split("T")[0],
      patientName: "",
      preparationType: "",
      description: "",
      preparedBy: "",
      status: "En attente",
      notes: "",
    });
    setDialogOpen(true);
  }

  function openEdit(prep: Preparation) {
    setEditPrep(prep);
    form.reset({
      date: prep.date,
      patientName: prep.patientName,
      preparationType: prep.preparationType,
      description: prep.description ?? "",
      preparedBy: prep.preparedBy,
      status: prep.status,
      notes: prep.notes ?? "",
    });
    setDialogOpen(true);
  }

  function onSubmit(data: InsertPreparation) {
    if (editPrep) {
      updateMutation.mutate({ id: editPrep.id, data });
    } else {
      createMutation.mutate(data);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <FlaskConical className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Préparations Pharmaceutiques</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Gérez et suivez les préparations pharmaceutiques préparées pour les patients.
            </p>
          </div>
        </div>
        <Button onClick={openAdd} data-testid="button-add-preparation" className="gap-2">
          <Plus className="w-4 h-4" />
          Ajouter une préparation
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Chargement...</div>
        ) : preparations.length === 0 ? (
          <div className="p-12 text-center">
            <FlaskConical className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucune préparation enregistrée</p>
            <p className="text-slate-400 text-sm mt-1">Cliquez sur "Ajouter une préparation" pour commencer.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead className="font-semibold text-slate-700">Date</TableHead>
                <TableHead className="font-semibold text-slate-700">Patient</TableHead>
                <TableHead className="font-semibold text-slate-700">Type</TableHead>
                <TableHead className="font-semibold text-slate-700">Description</TableHead>
                <TableHead className="font-semibold text-slate-700">Préparé par</TableHead>
                <TableHead className="font-semibold text-slate-700">Statut</TableHead>
                <TableHead className="font-semibold text-slate-700">Notes</TableHead>
                <TableHead className="font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {preparations.map((prep) => (
                <TableRow key={prep.id} data-testid={`row-preparation-${prep.id}`} className="hover:bg-slate-50/50">
                  <TableCell className="text-sm text-slate-600">{prep.date}</TableCell>
                  <TableCell className="font-medium text-slate-900">{prep.patientName}</TableCell>
                  <TableCell className="text-sm text-slate-700">{prep.preparationType}</TableCell>
                  <TableCell className="text-sm text-slate-500 max-w-[180px] truncate">{prep.description ?? "—"}</TableCell>
                  <TableCell className="text-sm text-slate-700">{prep.preparedBy}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[prep.status] ?? "bg-slate-100 text-slate-700"}`}>
                      {prep.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500 max-w-[150px] truncate">{prep.notes ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(prep)}
                        data-testid={`button-edit-preparation-${prep.id}`}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-primary"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(prep.id)}
                        data-testid={`button-delete-preparation-${prep.id}`}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditPrep(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editPrep ? "Modifier la préparation" : "Ajouter une préparation"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" data-testid="input-prep-date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="patientName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du patient</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du patient" data-testid="input-prep-patient" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="preparationType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de préparation</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Pommade, Gélule..." data-testid="input-prep-type" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description de la préparation..." data-testid="input-prep-description" rows={2} {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="preparedBy" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Préparé par</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-prep-by">
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STAFF_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-prep-status">
                          <SelectValue placeholder="Statut..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PREP_STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notes supplémentaires..." data-testid="input-prep-notes" rows={2} {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                <Button
                  type="submit"
                  data-testid="button-submit-preparation"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editPrep ? "Mettre à jour" : "Enregistrer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={(v) => { if (!v) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette préparation ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId !== null && deleteMutation.mutate(deleteId)}
              className="bg-red-500 hover:bg-red-600"
              data-testid="button-confirm-delete-preparation"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
