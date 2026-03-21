import { useState } from "react";
import { useOrders, useUpdateOrder, useDeleteOrder, useCreateOrder } from "@/hooks/use-orders";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertOrderSchema, STATUS_OPTIONS } from "@shared/schema";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { 
  Loader2, Trash2, Search, MessageCircle, Filter, PackageOpen, Edit2, Plus, User, Phone, Package2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const newOrderSchema = insertOrderSchema.extend({
  patientName: z.string().min(2, "Le nom du patient est requis"),
  phoneNumber: z.string().min(8, "Numéro de téléphone invalide"),
  productName: z.string().min(2, "Le nom du produit est requis"),
});
type NewOrderValues = z.infer<typeof newOrderSchema>;

export default function Dashboard() {
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [noteValue, setNoteValue] = useState("");
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  
  const { data: orders, isLoading } = useOrders(statusFilter);
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();
  const createOrder = useCreateOrder();

  const newOrderForm = useForm<NewOrderValues>({
    resolver: zodResolver(newOrderSchema),
    defaultValues: { patientName: "", phoneNumber: "", productName: "", status: "À commander" },
  });

  const handleCreateOrder = (data: NewOrderValues) => {
    createOrder.mutate(data, {
      onSuccess: () => {
        newOrderForm.reset();
        setNewOrderOpen(false);
      }
    });
  };

  const handleSaveNote = (id: number) => {
    updateOrder.mutate({ id, notes: noteValue });
    setEditingNoteId(null);
    setNoteValue("");
  };

  const handleOpenNoteDialog = (id: number, currentNote: string | null | undefined) => {
    setEditingNoteId(id);
    setNoteValue(currentNote ?? "");
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    updateOrder.mutate({ id, status: newStatus as any });
  };

  const handleWhatsAppClick = (patientName: string, phoneNumber: string, productName: string) => {
    const cleanPhone = phoneNumber.replace(/\D/g, ''); 
    const message = `Bonjour ${patientName}, votre produit ${productName} est disponible à la pharmacie.`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const filteredOrders = orders?.filter(order => 
    order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Tableau de Bord</h1>
          <p className="text-slate-500">Gérez les commandes et suivez leur progression.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Rechercher..." 
              className="pl-9 w-full sm:w-[250px] bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white" data-testid="select-status-filter">
              <Filter className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Tous les statuts</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={newOrderOpen} onOpenChange={(open) => { setNewOrderOpen(open); if (!open) newOrderForm.reset(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg shadow-primary/20" data-testid="button-new-order">
                <Plus className="w-4 h-4" />
                Nouvelle commande
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nouvelle commande</DialogTitle>
                <DialogDescription>
                  Enregistrez une nouvelle demande de produit pour un patient.
                </DialogDescription>
              </DialogHeader>
              <Form {...newOrderForm}>
                <form onSubmit={newOrderForm.handleSubmit(handleCreateOrder)} className="space-y-4">
                  <FormField
                    control={newOrderForm.control}
                    name="patientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du Patient</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input placeholder="ex: Jean Dupont" className="pl-9" {...field} data-testid="input-patient-name" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={newOrderForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro de Téléphone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input placeholder="ex: 06 12 34 56 78" className="pl-9" {...field} data-testid="input-phone" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={newOrderForm.control}
                    name="productName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du Produit</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Package2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input placeholder="ex: Doliprane 1000mg" className="pl-9" {...field} data-testid="input-product-name" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="pt-2">
                    <Button type="button" variant="outline" onClick={() => setNewOrderOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" disabled={createOrder.isPending} data-testid="button-submit-order">
                      {createOrder.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</> : "Enregistrer"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !filteredOrders?.length ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-slate-400">
            <PackageOpen className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">Aucune commande trouvée</p>
            <p className="text-sm">Essayez de modifier vos filtres de recherche.</p>
          </div>
        ) : (
          <div className="overflow-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[180px]">Patient</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead className="w-[180px]">Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="group hover:bg-slate-50/50 transition-colors" data-testid={`row-order-${order.id}`}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="text-slate-900">{order.patientName}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{order.phoneNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-sm font-medium border border-slate-200">
                        {order.productName}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {format(new Date(order.createdAt), "d MMM yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Select 
                          defaultValue={order.status} 
                          onValueChange={(val) => handleStatusChange(order.id, val)}
                          disabled={updateOrder.isPending}
                        >
                          <SelectTrigger className="border-0 bg-transparent p-0 h-auto hover:bg-transparent focus:ring-0 shadow-none">
                            <StatusBadge status={order.status} />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((status) => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {order.notes && (
                          <div className="text-xs bg-blue-50 border border-blue-100 rounded p-2 text-blue-700">
                            📝 <span className="font-medium">Note:</span> {order.notes}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Dialog open={editingNoteId === order.id} onOpenChange={(open) => !open && setEditingNoteId(null)}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 hover:border-blue-300"
                              onClick={() => handleOpenNoteDialog(order.id, order.notes)}
                              title="Modifier la note"
                              data-testid={`button-edit-note-${order.id}`}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Modifier la note</DialogTitle>
                              <DialogDescription>
                                Ajoutez ou modifiez une note pour la commande de {order.patientName}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea 
                                value={noteValue}
                                onChange={(e) => setNoteValue(e.target.value)}
                                placeholder="Saisir un commentaire..."
                                className="min-h-[120px]"
                                data-testid="input-note"
                              />
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setEditingNoteId(null)}>
                                Annuler
                              </Button>
                              <Button 
                                onClick={() => handleSaveNote(order.id)}
                                disabled={updateOrder.isPending}
                                data-testid="button-save-note"
                              >
                                {updateOrder.isPending ? "Enregistrement..." : "Enregistrer la note"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {order.status === "Reçu - À prévenir" && (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 hover:border-emerald-300"
                            onClick={() => handleWhatsAppClick(order.patientName, order.phoneNumber, order.productName)}
                            title="Envoyer WhatsApp"
                            data-testid={`button-whatsapp-${order.id}`}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                              data-testid={`button-delete-${order.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. La commande de {order.patientName} sera supprimée définitivement.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteOrder.mutate(order.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
